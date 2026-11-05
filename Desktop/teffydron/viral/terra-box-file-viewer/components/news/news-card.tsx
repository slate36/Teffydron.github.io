import { ExternalLink } from 'lucide-react'
import type { NewsItem } from '@/lib/news'

function timeAgoNews(date: Date): string {
  const diff = Date.now() - date.getTime()
  const h = Math.floor(diff / 3_600_000)
  const d = Math.floor(diff / 86_400_000)
  if (h < 1) return 'Hace menos de 1h'
  if (h < 24) return `Hace ${h}h`
  if (d === 1) return 'Ayer'
  if (d < 7) return `Hace ${d} días`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export function NewsCard({ item, featured = false }: { item: NewsItem; featured?: boolean }) {
  if (featured) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer nofollow"
        className="group relative flex min-h-[320px] flex-col justify-end overflow-hidden rounded-2xl border border-border bg-card shadow-md transition-shadow hover:shadow-xl"
      >
        {/* Background image */}
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/60" />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col gap-2 p-6">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-bold text-accent-foreground uppercase tracking-wide">
              Destacada
            </span>
            <span className="text-xs text-white/70">{item.source}</span>
          </div>
          <h2 className="font-serif text-xl font-bold leading-snug text-white text-balance md:text-2xl">
            {item.title}
          </h2>
          {item.summary && (
            <p className="line-clamp-2 text-sm text-white/80">{item.summary}</p>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-white/60">{timeAgoNews(item.publishedAt)}</span>
            <span className="flex items-center gap-1 text-xs font-medium text-accent">
              Leer más <ExternalLink className="size-3" />
            </span>
          </div>
        </div>
      </a>
    )
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
    >
      {/* Image */}
      {item.imageUrl && (
        <div className="aspect-video overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.imageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      {!item.imageUrl && (
        <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
          <span className="text-4xl opacity-30">🐎</span>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.source}</p>
        <h3 className="font-serif text-base font-bold leading-snug text-balance group-hover:text-primary transition-colors line-clamp-3">
          {item.title}
        </h3>
        {item.summary && (
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.summary}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xs text-muted-foreground">{timeAgoNews(item.publishedAt)}</span>
          <ExternalLink className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </a>
  )
}
