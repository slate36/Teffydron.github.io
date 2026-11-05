export const POST_KINDS = [
  { value: 'revista', label: 'Revista' },
  { value: 'sitio', label: 'Sitio web' },
  { value: 'enlace', label: 'Enlace' },
  { value: 'evento', label: 'Torneo / Evento' },
  { value: 'mencion', label: 'Mención' },
] as const

export type PostKind = (typeof POST_KINDS)[number]['value']

export function kindLabel(kind: string) {
  return POST_KINDS.find((k) => k.value === kind)?.label ?? 'Enlace'
}

const TAG_RE = /#([\p{L}\p{N}_]{2,40})/gu
const MENTION_RE = /@([a-z0-9_.]{2,30})/gi

export function extractTags(text: string) {
  return [...new Set([...text.matchAll(TAG_RE)].map((m) => m[1].toLowerCase()))].slice(0, 15)
}

export function extractMentions(text: string) {
  return [...new Set([...text.matchAll(MENTION_RE)].map((m) => m[1].toLowerCase()))].slice(0, 15)
}

export function normalizeHandle(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_.]/g, '')
    .slice(0, 30)
}

export function safeUrl(value: string | null | undefined) {
  if (!value) return null
  try {
    const url = new URL(value.trim())
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.toString() : null
  } catch {
    return null
  }
}

export function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function timeAgo(date: Date) {
  const s = Math.round((Date.now() - date.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' })
  if (s < 60) return rtf.format(-s, 'second')
  if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute')
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour')
  if (s < 2592000) return rtf.format(-Math.round(s / 86400), 'day')
  return date.toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' })
}
