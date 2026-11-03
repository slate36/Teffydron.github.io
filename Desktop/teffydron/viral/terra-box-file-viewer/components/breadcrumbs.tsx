import Link from 'next/link'
import { ChevronRight, House } from 'lucide-react'

export function folderHref(path: string) {
  return path === '/' ? '/videoteca' : `/videoteca?dir=${encodeURIComponent(path)}`
}

export function Breadcrumbs({ dir }: { dir: string }) {
  const parts = dir.split('/').filter(Boolean)

  return (
    <nav aria-label="Ruta de carpetas" className="overflow-x-auto">
      <ol className="flex items-center gap-1 text-sm whitespace-nowrap">
        <li>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md px-2 py-1 font-medium text-muted-foreground hover:bg-background hover:text-foreground"
            aria-current={parts.length === 0 ? 'page' : undefined}
          >
            <House className="size-4" aria-hidden="true" />
            Inicio
          </Link>
        </li>
        {parts.map((part, i) => {
          const path = '/' + parts.slice(0, i + 1).join('/')
          const isLast = i === parts.length - 1
          return (
            <li key={path} className="flex items-center gap-1">
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
              <Link
                href={folderHref(path)}
                aria-current={isLast ? 'page' : undefined}
                className={
                  isLast
                    ? 'rounded-md px-2 py-1 font-medium text-foreground'
                    : 'rounded-md px-2 py-1 text-muted-foreground hover:bg-background hover:text-foreground'
                }
              >
                {part === '__vps__' ? 'En VPS' : part}
              </Link>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
