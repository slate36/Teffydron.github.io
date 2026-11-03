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
      <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
          <span aria-hidden="true">⚡</span>
          <span>Este video se reproduce desde el VPS.</span>
        </div>
        <div className="overflow-hidden rounded-2xl border-2 border-accent bg-black shadow-lg">
          <video src={streamUrl} controls playsInline preload="metadata" className="aspect-video w-full">
            Tu navegador no puede reproducir este video.
          </video>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <AlertCircle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />
            <p>Si el video no reproduce en el navegador, podés descargarlo.</p>
          </div>
          <Button size="lg" render={<a href={downloadUrl} /> } nativeButton={false}>
            <Download aria-hidden="true" />
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
