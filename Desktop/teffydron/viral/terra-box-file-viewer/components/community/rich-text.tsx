import Link from 'next/link'
import { Fragment } from 'react'

const TOKEN_RE = /(#[\p{L}\p{N}_]{2,40}|@[a-zA-Z0-9_.]{2,30}|https?:\/\/[^\s]+)/gu

export function RichText({ text, className }: { text: string; className?: string }) {
  const parts = text.split(TOKEN_RE)

  return (
    <p className={className}>
      {parts.map((part, i) => {
        if (part.startsWith('#') && part.length > 2) {
          return (
            <Link key={i} href={`/comunidad?tag=${encodeURIComponent(part.slice(1).toLowerCase())}`} className="font-medium text-primary hover:underline">
              {part}
            </Link>
          )
        }
        if (part.startsWith('@') && part.length > 2) {
          return (
            <Link key={i} href={`/u/${encodeURIComponent(part.slice(1).toLowerCase())}`} className="font-medium text-accent-foreground underline decoration-accent decoration-2 underline-offset-2 hover:decoration-primary">
              {part}
            </Link>
          )
        }
        if (/^https?:\/\//.test(part)) {
          return (
            <a key={i} href={part} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary underline underline-offset-2">
              {part}
            </a>
          )
        }
        return <Fragment key={i}>{part}</Fragment>
      })}
    </p>
  )
}
