import { getVideoSyncOverview, requireAdmin } from '@/lib/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  await requireAdmin()
  const sync = await getVideoSyncOverview()

  return Response.json(
    {
      downloadingCount: sync.downloadingCount,
      downloadingBytes: sync.downloadingBytes,
      cachedBytes: sync.cachedBytes,
      queue: sync.syncQueue,
      downloaded: sync.downloadedVideos,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
