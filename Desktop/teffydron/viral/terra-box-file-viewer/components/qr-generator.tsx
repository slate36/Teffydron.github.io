'use client'

import { useState } from 'react'
import { FolderInput } from 'lucide-react'
import { QrCard } from '@/components/qr-card'
import { absoluteUrl } from '@/components/qr-dialog-button'
import { Button } from '@/components/ui/button'

export function QrGenerator({ folderHref, folderName }: { folderHref: string; folderName: string }) {
  const [preset, setPreset] = useState<{ url: string; title: string } | null>(null)

  return (
    <section
      aria-labelledby="qr-generator-title"
      className="flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-sm"
    >
      <div className="flex flex-col gap-1">
        <h2 id="qr-generator-title" className="font-serif text-xl font-bold">
          Generador de QR
        </h2>
        <p className="text-sm text-pretty text-muted-foreground">
          Usa el botón QR de cada video o carpeta, o crea una tarjeta con cualquier enlace.
        </p>
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => setPreset({ url: absoluteUrl(folderHref), title: folderName })}
      >
        <FolderInput aria-hidden="true" />
        Usar la carpeta actual
      </Button>

      <QrCard
        key={preset?.url ?? 'empty'}
        initialUrl={preset?.url ?? ''}
        initialTitle={preset?.title ?? 'Club de Polo'}
        initialSubtitle={preset ? 'Escanea para ver los videos' : 'Escanea para ver el video'}
        editableUrl
      />
    </section>
  )
}
