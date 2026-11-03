import type { Metadata } from 'next'
import { AlertCircle, Download } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { InvalidLink } from '@/components/invalid-link'
import { Button } from '@/components/ui/button'
import { ShareMenu } from '@/components/share-menu'
import { firstParam, streamHref, verifyPath } from '@/lib/share'
import { getCachedVideoSize } from '@/lib/video-cache'
import { isPathHidden } from '@/lib/admin'
import { VpsCacheIndicator } from '@/components/vps-cache-indicator'

export const metadata: Metadata = { title: 'Video · Polo' }

function displayName(path: string) {
  return (path.split('/').pop() ?? path).replace(/\.[a-z0-9]{2,4}$/i, '')
}

export default async function VideoPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string | string[]; s?: string | string[] }>
}) {
  const params = await searchParams
  const path = firstParam(params.p)
  const sig = firstParam(params.s)

  if (!verifyPath('video', path, sig) || await isPathHidden(path!)) return <InvalidLink />

  const name = displayName(path!)
  const streamUrl = streamHref(path!)
  const downloadUrl = streamHref(path!, true)
  const cachedVideoSize = await getCachedVideoSize(path!)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        title={name}
        subtitle={cachedVideoSize === null ? 'Video del partido' : 'Video del partido · disponible localmente en el VPS'}
      />
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        {cachedVideoSize !== null && (
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
            <VpsCacheIndicator />
            <span>Este video se reproduce desde el almacenamiento local del servidor.</span>
          </div>
        )}
        <div className="overflow-hidden rounded-2xl border-2 border-accent bg-black shadow-lg">
          <video
            src={streamUrl}
            controls
            playsInline
            preload="metadata"
            className="aspect-video w-full"
          >
            Tu navegador no puede reproducir este video.
          </video>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-accent" aria-hidden="true" />
            <p>
              Si el video no reproduce, TeraBox podría estar bloqueando el streaming. Usa el botón de descarga.
            </p>
          </div>
          <Button size="lg" render={<a href={downloadUrl} />} nativeButton={false}>
            <Download aria-hidden="true" />
            Descargar video
          </Button>
        </div>
        <ShareMenu
          url={`http://195.26.250.106/v?p=${encodeURIComponent(path!)}&s=${sig}`}
          title={name}
          className="w-full sm:w-auto"
        />
      </main>
    </div>
  )
}
