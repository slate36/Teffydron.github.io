import 'server-only'
import { stat } from 'node:fs/promises'
import { eq, inArray, isNotNull, or, sql } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { folderConfig, user, videoCache, videoSyncState } from '@/lib/db/schema'
import { getVideoCachePath } from '@/lib/video-cache'
import { getViewer } from '@/lib/viewer'

export type FolderConfig = typeof folderConfig.$inferSelect

/** Redirects to /dashboard if the viewer is not an admin. */
export async function requireAdmin() {
  const viewer = await getViewer()
  if (!viewer) redirect('/ingresar')

  const [row] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, viewer.id))
    .limit(1)

  if (row?.role !== 'admin') redirect('/dashboard')
  return viewer
}

export async function viewerIsAdmin() {
  const viewer = await getViewer()
  if (!viewer) return false

  const [row] = await db
    .select({ role: user.role })
    .from(user)
    .where(eq(user.id, viewer.id))
    .limit(1)

  return row?.role === 'admin'
}

export async function getFolderConfigs(): Promise<FolderConfig[]> {
  return db.select().from(folderConfig).orderBy(folderConfig.sortOrder, folderConfig.path)
}

export async function getHiddenFolderPaths(): Promise<Set<string>> {
  const configs = await db
    .select({ path: folderConfig.path, visible: folderConfig.visible })
    .from(folderConfig)

  // Only paths explicitly marked as hidden
  const hidden = new Set(
    configs.filter((c) => !c.visible).map((c) => c.path)
  )
  return hidden
}

export async function isPathHidden(path: string): Promise<boolean> {
  const normalizedPath = `/${path.split('/').filter(Boolean).join('/')}`
  if (normalizedPath === '/') return false

  const hiddenPaths = await db
    .select({ path: folderConfig.path })
    .from(folderConfig)
    .where(eq(folderConfig.visible, false))

  return hiddenPaths.some(({ path: hiddenPath }) => {
    const normalizedHiddenPath = `/${hiddenPath.split('/').filter(Boolean).join('/')}`
    return normalizedPath === normalizedHiddenPath ||
      normalizedPath.startsWith(`${normalizedHiddenPath}/`)
  })
}

export async function getCachedVideoPaths(
  videos: Array<{ path: string; size: number; modifiedAt: number }>,
): Promise<Set<string>> {
  if (videos.length === 0) return new Set()

  const expectedByPath = new Map(videos.map((video) => [video.path, video]))
  const available = await Promise.all(Array.from(expectedByPath.entries()).map(async ([path, expected]) => {
    try {
      const file = await stat(getVideoCachePath(path))
      return file.size === expected.size ? path : null
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        return null
      }
      throw error
    }

    return null
  }))

  return new Set(available.filter((path): path is string => path !== null))
}

export async function getVideoSyncOverview() {
  const [runs, cacheRows, attention, downloading, queued] = await Promise.all([
    db.select().from(videoSyncState).where(eq(videoSyncState.id, 'terabox')).limit(1),
    db.select({
      path: videoCache.path,
      size: videoCache.size,
      downloadedAt: videoCache.downloadedAt,
      updatedAt: videoCache.updatedAt,
    }).from(videoCache),
    db.select({
      count: sql<number>`count(*)`,
    }).from(videoCache).where(or(
      inArray(videoCache.status, ['error', 'skipped']),
      isNotNull(videoCache.error),
    )),
    db.select({ path: videoCache.path })
      .from(videoCache)
      .where(eq(videoCache.status, 'downloading')),
    db.select({ path: videoCache.path })
      .from(videoCache)
      .where(eq(videoCache.status, 'queued')),
  ])

  const cachedFiles = await Promise.all(cacheRows.map(async (video) => {
    try {
      const file = await stat(getVideoCachePath(video.path))
      return { ...video, size: file.size }
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
      throw error
    }
  }))
  const downloadedVideos = cachedFiles
    .filter((video): video is NonNullable<typeof video> => video !== null)
    .sort((a, b) => (b.downloadedAt ?? b.updatedAt).getTime() - (a.downloadedAt ?? a.updatedAt).getTime())
    .map((video) => ({
      path: video.path,
      name: video.path.split('/').pop() ?? video.path,
      size: video.size,
    }))
  const cachedPathSet = new Set(downloadedVideos.map((video) => video.path))
  const activeDownloads = downloading.filter((video) => !cachedPathSet.has(video.path))
  const pendingDownloads = queued.filter((video) => !cachedPathSet.has(video.path))

  const isRunning = runs[0]?.status === 'running'
  const syncQueue = isRunning
    ? [
        ...activeDownloads.map((video) => ({
          name: video.path.split('/').pop() ?? video.path,
          status: 'downloading' as const,
        })),
        ...pendingDownloads.map((video) => ({
          name: video.path.split('/').pop() ?? video.path,
          status: 'queued' as const,
        })),
      ]
    : []

  let downloadingBytes = 0
  for (const video of activeDownloads) {
    try {
      downloadingBytes += (await stat(`${getVideoCachePath(video.path)}.partial`)).size
    } catch (error) {
      if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
    }
  }

  return {
    lastRun: runs[0] ?? null,
    cachedCount: downloadedVideos.length,
    cachedBytes: downloadedVideos.reduce((total, video) => total + video.size, 0),
    attentionCount: Number(attention[0]?.count ?? 0),
    downloadingCount: activeDownloads.length,
    downloadingBytes,
    syncQueue,
    downloadedVideos: downloadedVideos.map(({ name, size }) => ({ name, size })),
  }
}
