import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { POST_KINDS } from '@/lib/community'
import { cn } from '@/lib/utils'

export function FeedFilters({ kind, q, tag, mention }: { kind?: string; q?: string; tag?: string; mention?: string }) {
  const chip = (active: boolean) =>
    cn(
      'rounded-full border px-3 py-1 text-sm transition-colors',
      active ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-primary',
    )

  return (
    <div className="flex flex-col gap-3">
      <form action="/comunidad" role="search" className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <label htmlFor="q" className="sr-only">
          Buscar publicaciones
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Buscar revistas, sitios, torneos..."
          className="h-10 w-full rounded-md border border-input bg-card pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {kind && <input type="hidden" name="kind" value={kind} />}
      </form>

      <nav aria-label="Filtrar por tipo" className="flex flex-wrap gap-2">
        <Link href="/comunidad" className={chip(!kind)}>
          Todo
        </Link>
        {POST_KINDS.map((k) => (
          <Link key={k.value} href={`/comunidad?kind=${k.value}`} className={chip(kind === k.value)}>
            {k.label}
          </Link>
        ))}
      </nav>

      {(tag || mention || q) && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Filtrando:</span>
          {tag && <span className="font-semibold text-primary">#{tag}</span>}
          {mention && <span className="font-semibold">@{mention}</span>}
          {q && <span className="font-semibold">{`"${q}"`}</span>}
          <Link href="/comunidad" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <X className="size-3.5" aria-hidden="true" />
            Limpiar
          </Link>
        </div>
      )}
    </div>
  )
}
