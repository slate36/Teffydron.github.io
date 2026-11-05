import 'server-only'
import { createHash } from 'node:crypto'

export type NewsLang = 'es' | 'en' | 'pt'

export type NewsItem = {
  id: string
  title: string
  summary: string
  url: string
  source: string
  imageUrl: string | null
  publishedAt: Date
  lang: NewsLang
}

// ── RSS feeds ────────────────────────────────────────────────────────────────

const FEEDS = [
  {
    url: 'https://news.google.com/rss/search?q=polo+horse+championship+when%3A30d&hl=en-US&gl=US&ceid=US:en',
    sourceLang: 'en' as NewsLang,
    label: 'Google News',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22polo+argentino%22+when%3A30d&hl=es-AR&gl=AR&ceid=AR:es',
    sourceLang: 'es' as NewsLang,
    label: 'Google News AR',
  },
  {
    url: 'https://news.google.com/rss/search?q=%22polo+argentino%22+when%3A30d&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    sourceLang: 'pt' as NewsLang,
    label: 'Google News BR',
  },
]

// ── RSS parser (no external dependency) ─────────────────────────────────────

const DESCRIPTION_ENTITIES: Record<string, string> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  nbsp: ' ',
  quot: '"',
}

function decodeEntities(value: string) {
  let decoded = value

  for (let pass = 0; pass < 3; pass++) {
    const next = decoded.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, name: string) => {
      if (name[0] === '#') {
        const code = name[1].toLowerCase() === 'x'
          ? Number.parseInt(name.slice(2), 16)
          : Number.parseInt(name.slice(1), 10)
        return Number.isInteger(code) && code >= 0 && code <= 0x10ffff
          ? String.fromCodePoint(code)
          : entity
      }
      return DESCRIPTION_ENTITIES[name.toLowerCase()] ?? entity
    })
    if (next === decoded) break
    decoded = next
  }

  return decoded
}

function extractText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i'))
    ?? xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
  return m ? decodeEntities(m[1].trim()) : ''
}

function extractImage(itemXml: string): string | null {
  // media:content or media:thumbnail
  const media = itemXml.match(/<media:(?:content|thumbnail)[^>]*url="([^"]+)"[^>]*\/?>/i)
  if (media) return media[1]
  // enclosure
  const enc = itemXml.match(/<enclosure[^>]*url="([^"]+)"[^>]*type="image[^"]*"/i)
  if (enc) return enc[1]
  // og:image in description
  const og = itemXml.match(/https?:\/\/[^\s"'<>]*\.(?:jpg|jpeg|png|webp)(?:\?[^\s"'<>]*)?/i)
  if (og) return og[0]
  return null
}

function cleanSummary(description: string, title: string, source: string) {
  let summary = description
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const normalize = (value: string) =>
    value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim()
  const normalizedSummary = normalize(summary)
  const normalizedTitle = normalize(title)

  if (normalizedSummary.startsWith(normalizedTitle)) {
    summary = summary.slice(title.length).replace(/^[\s:|–—-]+/, '').trim()
  }

  if (source && normalize(summary).endsWith(normalize(source))) {
    summary = summary.slice(0, summary.length - source.length).trim()
  }

  summary = summary.replace(/^[\s:|–—-]+|[\s:|–—-]+$/g, '').trim()
  return normalize(summary) === normalize(title) || normalize(summary) === normalize(source)
    ? ''
    : summary
}

function parseItems(xml: string, sourceLang: NewsLang, sourceLabel: string): NewsItem[] {
  const itemMatches = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? []
  return itemMatches.slice(0, 15).map((item) => {
    const title = extractText(item, 'title').replace(/ - [^-]+$/, '').trim()
    const url = extractText(item, 'link') || extractText(item, 'guid')
    const source = extractText(item, 'source') || sourceLabel
    const summary = cleanSummary(extractText(item, 'description'), title, source)
      .slice(0, 300)

    const pubDate = extractText(item, 'pubDate')
    const imageUrl = extractImage(item)

    return {
      id: createHash('sha256').update(url).digest('hex').slice(0, 20),
      title,
      summary,
      url,
      source,
      imageUrl,
      publishedAt: pubDate ? new Date(pubDate) : new Date(),
      lang: sourceLang,
    }
  }).filter((item) => item.title && item.url)
}

function canonicalizeUrl(value: string) {
  try {
    const url = new URL(value)
    url.hash = ''

    for (const key of [...url.searchParams.keys()]) {
      if (
        key.toLowerCase().startsWith('utm_') ||
        ['oc', 'fbclid', 'gclid'].includes(key.toLowerCase())
      ) {
        url.searchParams.delete(key)
      }
    }

    url.searchParams.sort()
    return url.toString().replace(/\/$/, '')
  } catch {
    return value.trim()
  }
}

const TITLE_STOP_WORDS = new Set([
  'about', 'after', 'and', 'are', 'com', 'con', 'del', 'desde', 'dos', 'for',
  'from', 'have', 'into', 'las', 'los', 'mais', 'mas', 'not', 'que', 'sobre',
  'the', 'their', 'this', 'una', 'uno', 'was', 'with', 'para', 'por', 'polo',
  'les', 'des', 'de', 'da', 'do', 'el', 'en', 'la', 'os', 'as', 'un',
  'a', 'e', 'o', 'y',
])

function titleTokens(title: string) {
  return new Set(
    title
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .split(/[^\p{L}\p{N}]+/u)
      .filter((token) => token.length > 2 && !TITLE_STOP_WORDS.has(token)),
  )
}

function sameStoryByTitle(a: NewsItem, b: NewsItem) {
  const tokensA = titleTokens(a.title)
  const tokensB = titleTokens(b.title)
  const shared = [...tokensA].filter((token) => tokensB.has(token)).length
  if (shared < 3) return false

  const smallerCount = Math.min(tokensA.size, tokensB.size)
  if (shared / smallerCount < 0.35) return false

  const timeDifference = Math.abs(a.publishedAt.getTime() - b.publishedAt.getTime())
  return Number.isFinite(timeDifference) && timeDifference <= 14 * 24 * 60 * 60 * 1000
}

function removeDuplicateStories(items: NewsItem[]) {
  const sorted = [...items].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime())
  const seenUrls = new Set<string>()
  const unique: NewsItem[] = []

  for (const item of sorted) {
    const url = canonicalizeUrl(item.url)
    if (seenUrls.has(url)) continue
    seenUrls.add(url)
    if (unique.some((existing) => sameStoryByTitle(existing, item))) continue
    unique.push(item)
  }

  return unique
}

// ── Fetch all feeds ──────────────────────────────────────────────────────────

async function fetchFeed(feed: typeof FEEDS[0]): Promise<NewsItem[]> {
  try {
    const res = await fetch(feed.url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; TefyDronBot/1.0)' },
      next: { revalidate: 1800 }, // 30 min cache
    })
    if (!res.ok) return []
    const xml = await res.text()
    return parseItems(xml, feed.sourceLang, feed.label)
  } catch {
    return []
  }
}

// ── DeepL translation ────────────────────────────────────────────────────────

const DEEPL_TARGET: Record<NewsLang, string> = {
  es: 'ES',
  en: 'EN-US',
  pt: 'PT-BR',
}

async function translateTexts(texts: string[], targetLang: NewsLang): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return texts // No key → return original

  try {
    const body = new URLSearchParams()
    texts.forEach((t) => body.append('text', t))
    body.append('target_lang', DEEPL_TARGET[targetLang])

    const res = await fetch('https://api-free.deepl.com/v2/translate', {
      method: 'POST',
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
      next: { revalidate: 86400 }, // cache translations 24h
    })
    if (!res.ok) return texts
    const data = (await res.json()) as { translations: { text: string }[] }
    return data.translations.map((t) => t.text)
  } catch {
    return texts
  }
}

// ── Translate news items ─────────────────────────────────────────────────────

async function translateItems(items: NewsItem[], targetLang: NewsLang): Promise<NewsItem[]> {
  // Only translate items that aren't already in target language
  const needsTranslation = items.filter((item) => item.lang !== targetLang)
  if (needsTranslation.length === 0) return items

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return items

  // Batch: translate titles and summaries together
  const titles = needsTranslation.map((i) => i.title)
  const summaries = needsTranslation.map((i) => i.summary)

  const [translatedTitles, translatedSummaries] = await Promise.all([
    translateTexts(titles, targetLang),
    translateTexts(summaries, targetLang),
  ])

  const translationMap = new Map(
    needsTranslation.map((item, i) => [
      item.id,
      { title: translatedTitles[i], summary: translatedSummaries[i] },
    ])
  )

  return items.map((item) => {
    const t = translationMap.get(item.id)
    if (!t) return item
    return { ...item, title: t.title, summary: t.summary }
  })
}

// ── Public API ───────────────────────────────────────────────────────────────

export async function getNews(lang: NewsLang = 'es'): Promise<NewsItem[]> {
  const results = await Promise.all(FEEDS.map(fetchFeed))
  const all = results.flat()

  const unique = removeDuplicateStories(all)

  // Translate to target language
  return translateItems(unique, lang)
}
