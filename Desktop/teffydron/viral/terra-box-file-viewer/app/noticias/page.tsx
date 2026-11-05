import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Newspaper } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { NewsCard } from '@/components/news/news-card'
import { LangSwitcher } from '@/components/news/lang-switcher'
import { RefreshIndicator } from '@/components/news/refresh-indicator'
import { getNews, type NewsLang } from '@/lib/news'

export const revalidate = 1800 // Refresh every 30 minutes

export const metadata: Metadata = {
  title: 'Noticias de Polo | TefyDron',
  description: 'Las últimas noticias del polo mundial. Actualizadas automáticamente en español, inglés y portugués.',
}

const LANG_LABELS: Record<NewsLang, string> = {
  es: 'Español',
  en: 'English',
  pt: 'Português',
}

function isValidLang(lang: string | undefined): lang is NewsLang {
  return lang === 'es' || lang === 'en' || lang === 'pt'
}

async function NewsFeed({ lang }: { lang: NewsLang }) {
  const items = await getNews(lang)

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <Newspaper className="size-12 text-muted-foreground/40" />
        <p className="text-muted-foreground">No se pudieron cargar las noticias. Intentá de nuevo en unos minutos.</p>
      </div>
    )
  }

  const [featured, ...rest] = items

  return (
    <div className="flex flex-col gap-8">
      {/* Featured */}
      <section aria-labelledby="featured-title">
        <h2 id="featured-title" className="sr-only">Noticia destacada</h2>
        <NewsCard item={featured} featured />
      </section>

      {/* Grid */}
      <section aria-labelledby="all-title">
        <h2 id="all-title" className="mb-4 font-serif text-xl font-bold flex items-center gap-2">
          <Newspaper className="size-5 text-primary" aria-hidden="true" />
          Todas las noticias
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((item) => (
            <NewsCard key={item.id} item={item} />
          ))}
        </div>
      </section>
    </div>
  )
}

export default async function NoticiasPage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string }>
}) {
  const { lang: rawLang } = await searchParams
  const lang: NewsLang = isValidLang(rawLang) ? rawLang : 'es'

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        title="Noticias de Polo"
        subtitle="Las últimas noticias del polo mundial, actualizadas automáticamente."
      />

      <main className="mx-auto max-w-7xl px-4 py-8 flex flex-col gap-6">

        {/* Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Suspense>
            <RefreshIndicator />
          </Suspense>
          <Suspense>
            <LangSwitcher current={lang} />
          </Suspense>
        </div>

        {/* News feed */}
        <Suspense
          key={lang}
          fallback={
            <div className="flex flex-col gap-5">
              <div className="h-80 animate-pulse rounded-2xl bg-muted" />
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-64 animate-pulse rounded-xl bg-muted" />
                ))}
              </div>
            </div>
          }
        >
          <NewsFeed lang={lang} />
        </Suspense>

      </main>
    </div>
  )
}
