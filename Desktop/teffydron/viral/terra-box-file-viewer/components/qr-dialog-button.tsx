'use client'

import { useRef, useState } from 'react'
import { QrCode, X } from 'lucide-react'
import { QrCard } from '@/components/qr-card'
import { cn } from '@/lib/utils'

export function absoluteUrl(href: string) {
  const base = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
  return new URL(href, base).toString()
}

export function QrDialogButton({
  href,
  title,
  kind,
  className,
}: {
  href: string
  title: string
  kind: 'video' | 'folder'
  className?: string
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [url, setUrl] = useState<string | null>(null)
  const cardTitle = title.replace(/\.[a-z0-9]{2,4}$/i, '')

  function open() {
    const fullUrl = absoluteUrl(href)
    setUrl(fullUrl)
    if (dialogRef.current) {
      dialogRef.current.showModal()
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label={`Generar QR de ${title}`}
        className={cn(
          'flex size-8 items-center justify-center rounded-md bg-background/90 text-primary shadow-sm ring-1 ring-border backdrop-blur transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          className,
        )}
      >
        <QrCode className="size-4" aria-hidden="true" />
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => {
          setUrl(null)
          dialogRef.current?.close()
        }}
        onClick={(e) => {
          if (e.target === dialogRef.current) {
            dialogRef.current?.close()
            setUrl(null)
          }
        }}
        className="m-auto w-[min(26rem,calc(100vw-2rem))] rounded-2xl border bg-background p-0 text-foreground shadow-xl backdrop:bg-primary/40 backdrop:backdrop-blur-sm"
        aria-label={`Código QR de ${title}`}
      >
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="font-serif text-lg font-bold">Tarjeta QR</h2>
              <p className="truncate text-sm text-muted-foreground" title={title}>
                {kind === 'video' ? 'Video' : 'Carpeta'}: {title}
              </p>
            </div>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Cerrar"
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </div>
          {url && (
            <QrCard
              key={url}
              initialUrl={url}
              initialTitle={cardTitle}
              initialSubtitle={
                kind === 'video' ? 'Escanea para ver el video' : 'Escanea para ver los videos'
              }
            />
          )}
        </div>
      </dialog>
    </>
  )
}
