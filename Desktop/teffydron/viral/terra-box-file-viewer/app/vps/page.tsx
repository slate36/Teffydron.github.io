import type { Metadata } from 'next'
import { AlertCircle, Download } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { InvalidLink } from '@/components/invalid-link'
import { Button } from '@/components/ui/button'
import { ShareMenu } from '@/components/share-menu'
import { getViewer } from '@/lib/viewer'
import { getVpsLibraryFile } from '@/lib/vps-library'

export const metadata: Metadata = { title: 'Video local · TefyDron' }

export default async function VpsVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ path?: string | string[]; userId?: string | string[] }>
}) {
  const viewer = await getViewer()
  const params = await searchParams
  const path = Array.isArray(params.path) ? params.path[0] : params.path
  const userIdParam = Array.isArray(params.userId) ? params.userId[0] : params.userId
  const userId = userIdParam ?? viewer?.id ?? undefined
  if (!path) return <InvalidLink />

  const file = await getVpsLibraryFile(path, true, userId).catch(() => null)
  if (!file?.mime.startsWith('video/')) return <InvalidLink />

  const query = new URLSearchParams({ path, userId: userId ?? '' })
  const streamUrl = `/api/library/file?${query}`
  const downloadUrl = `/api/library/file?${query}&dl=1`

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title={file.name.replace(/\.[^.]+$/, '')} subtitle="Video disponible en el almacenamiento local del VPS" />
      <main className="mx-auto flex max-w-5xl flex-col gap-3 px-3 py-4 sm:px-4 sm:py-6">
        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300">
          <span aria-hidden="true">⚡</span>
          <span>Este video se reproduce desde el VPS.</span>
        </div>
        <div className="overflow-hidden rounded-2xl border-2 border-accent bg-black shadow-lg aspect-video w-full">
          <video src={streamUrl} controls playsInline preload="metadata" className="w-full h-full object-cover">
            Tu navegador no puede reproducir este video.
          </video>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground">
            <AlertCircle className="size-4 sm:size-5 shrink-0 mt-0.5 text-accent" aria-hidden="true" />
            <p className="text-xs sm:text-base leading-none sm:leading-tight">
              Si el video no reproduce en el navegador, podés descargarlo.
            </p>
          </div>
          <Button size="lg" render={<a href={downloadUrl} /> } nativeButton={false} className="w-full sm:w-auto">
            <Download className="size-5" aria-hidden="true" />
            Descargar video
          </Button>
        </div>
        <ShareMenu
          url={`http://195.26.250.106/vps?path=${encodeURIComponent(path)}&userId=${encodeURIComponent(userId ?? '')}`}
          title={file.name}
          className="w-full sm:w-auto"
        />
      </main>
    </div>
  )
}
