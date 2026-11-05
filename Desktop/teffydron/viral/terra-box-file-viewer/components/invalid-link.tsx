import { QrCode } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

export function InvalidLink() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Enlace no válido" subtitle="Este código QR no corresponde a ningún video." />
      <main className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-16 text-center">
        <QrCode className="size-10 text-primary" aria-hidden="true" />
        <p className="text-pretty text-muted-foreground">
          Vuelve a escanear la tarjeta o pide una nueva a quien te la entregó.
        </p>
      </main>
    </div>
  )
}
