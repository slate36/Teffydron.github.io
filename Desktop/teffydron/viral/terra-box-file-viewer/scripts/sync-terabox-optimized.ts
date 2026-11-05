import { createWriteStream } from 'node:fs'
import { mkdir, readdir, rename, rm, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { Readable, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { folderConfig, videoCache, videoSyncState } from '../lib/db/schema'
import { optimizeMp4FastStart } from '../lib/mp4-faststart'
import {
  VIDEO_CACHE_LIMIT_BYTES,
  getVideoCacheDirectory,
  getVideoCachePath,
} from '../lib/video-cache'
import { getVpsSharedStorageBytes, withVpsSharedStorageLock } from '../lib/vps-library'
import { listFiles, fetchFileStream, type TeraboxFile } from '../lib/terabox'

const STATE_ID = 'terabox'
const CACHE_LIMIT_BYTES = VIDEO_CACHE_LIMIT_BYTES
const TEMP_SUFFIX = '.partial'

// Optimization: Reduce log noise by caching console.log
const consoleLog = console.log
const consoleError = console.error

function safeRemotePath(value: string) {
  return value.startsWith('/') && !value.includes('\0') &&
    !value.split('/').some((part) => part === '.' || part === '..')
}

async function findVisibleVideos() {
  const hiddenRows = await db
    .select({ path: folderConfig.path })
    .from(folderConfig)
    .where(eq(folderConfig.visible, false))
  const hiddenPaths = new Set(hiddenRows.map((row) => row.path))
  const directories = ['/']
  const visited = new Set<string>()
  const videos = new Map<string, TeraboxFile>()

  while (directories.length > 0) {
    const directory = directories.pop()!
    if (visited.has(directory)) continue
    visited.add(directory)

    const files = await listFiles(directory)
    for (const file of files) {
      if (!safeRemotePath(file.path)) {
        consoleError(`[video-sync] Ignoring invalid TeraBox path: ${file.path}`)
        continue
      }

      if (file.isDir) {
        if (directory !== '/' || !hiddenPaths.has(file.path)) directories.push(file.path)
      } else if (file.category === 1 && file.size >= 0) {
        videos.set(file.path, file)
      }
    }

    if (directories.length <= 1) { // Only log at root level to reduce noise
      consoleLog(`[video-sync] Scanned ${directory}: ${files.length} entries`)
    }
  }

  return [...videos.values()].sort((a, b) => a.path.localeCompare(b.path))
}

async function getCachedBytes() {
  const rows = await db
    .select({ path: videoCache.path })
    .from(videoCache)

  let total = 0
  for (const row of rows) {
    try {
      total += (await stat(getVideoCachePath(row.path))).size
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
        await db.update(videoCache)
          .set({
            status: 'error',
            error: 'El archivo local no existe.',
            updatedAt: new Date(),
          })
          .where(eq(videoCache.path, row.path))
        continue
      }
      throw error
    }
  }
  return total
}

async function hasCompleteCachedVideo(
  file: TeraboxFile,
  cached: { size: number; modifiedAt: Date } | undefined,
) {
  if (!cached || cached.size !== file.size || cached.modifiedAt.getTime() !== file.modifiedAt) {
    return false
  }

  try {
    return (await stat(getVideoCachePath(file.path))).size === file.size
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return false
    throw error
  }
}

async function removePartialDownloads(directory: string) {
  await mkdir(directory, { recursive: true })
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const entryPath = join(directory, entry.name)
    if (entry.isDirectory()) {
      await removePartialDownloads(entryPath)
    } else if (entry.isFile() && entry.name.endsWith(TEMP_SUFFIX)) {
      await rm(entryPath)
      consoleLog(`[video-sync] Removed interrupted download ${entry.name}`)
    }
  }
}

async function downloadVideo(file: TeraboxFile, availableBytes: number) {
  const destination = getVideoCachePath(file.path)
  const temporary = `${destination}${TEMP_SUFFIX}`
  await mkdir(dirname(destination), { recursive: true })

  const upstream = await fetchFileStream(file.path, null)
  if (!upstream.body) throw new Error('TeraBox devolvió una respuesta sin contenido.')

  let downloadedBytes = 0
  const enforceLimit = new Transform({
    transform(chunk: Buffer, _encoding, callback) {
      downloadedBytes += chunk.length
      if (downloadedBytes > availableBytes) {
        callback(new Error('La descarga superó el espacio disponible de la caché.'))
        return
      }
      callback(null, chunk)
    },
  })

  try {
    await pipeline(
      Readable.fromWeb(upstream.body as import('node:stream/web').ReadableStream<Uint8Array>),
      enforceLimit,
      createWriteStream(temporary, { flags: 'w', mode: 0o640 }),
    )
    if (/\.(mp4|m4v|mov)$/i.test(file.path) && await optimizeMp4FastStart(temporary)) {
      consoleLog(`[video-sync] Moved MP4 index to its start: ${file.path}`)
    }
    await rename(temporary, destination)
    return (await stat(destination)).size
  } catch (error) {
    await rm(temporary, { force: true })
    throw error
  }
}

async function syncVideos() {
  const startedAt = new Date()
  await removePartialDownloads(getVideoCacheDirectory())

  // Optimization: Create single database query for cached videos
  const cachedRows = await db.select({
    path: videoCache.path,
    size: videoCache.size,
    modifiedAt: videoCache.modifiedAt,
    status: videoCache.status,
    downloadedAt: videoCache.downloadedAt,
    error: videoCache.error,
  }).from(videoCache)

  const cachedByPath = new Map(cachedRows.map((video) => [video.path, video]))
  const existingCachedPaths = new Set(cachedByPath.keys())

  const totals: { scanned: number; downloaded: number; failed: number; skipped: number; cachedBytes: number } = {
    scanned: 0,
    downloaded: 0,
    failed: 0,
    skipped: 0,
    cachedBytes: await getCachedBytes(),
  }

  // Single database operation to set sync state to running
  await db.insert(videoSyncState).values({
    id: STATE_ID,
    status: 'running',
    startedAt,
    scanned: 0,
    downloaded: 0,
    failed: 0,
    skipped: 0,
    cachedBytes: totals.cachedBytes,
    limitBytes: CACHE_LIMIT_BYTES,
  }).onConflictDoUpdate({
    target: videoSyncState.id,
    set: {
      status: 'running',
      startedAt,
      finishedAt: null,
      scanned: 0,
      downloaded: 0,
      failed: 0,
      skipped: 0,
      cachedBytes: totals.cachedBytes,
      limitBytes: CACHE_LIMIT_BYTES,
      error: null,
    },
  })

  try {
    const videos = await findVisibleVideos()
    totals.scanned = videos.length
    const sharedBytes = await getVpsSharedStorageBytes()
    consoleLog(`[video-sync] Found ${videos.length} visible videos; shared storage is ${sharedBytes}/${CACHE_LIMIT_BYTES} bytes`) // Reduced log noise

    // Optimized processing loop with batch operations
    for (const file of videos) {
      const current = cachedByPath.get(file.path)
      const cachedPath = getVideoCachePath(file.path)

      // Check if video is already cached
      let existingSize = -1
      try {
        existingSize = (await stat(cachedPath)).size
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
      }

      const isCached = existingSize === file.size && await hasCompleteCachedVideo(file, current)

      if (isCached) {
        if (current?.status !== 'downloaded') {
          await db.update(videoCache).set({
            status: 'downloaded',
            error: null,
            downloadedAt: current?.downloadedAt ?? new Date(),
            updatedAt: new Date(),
          }).where(eq(videoCache.path, file.path))
        }
        continue
      }

      // Check storage limits
      // Track original size for comparison
      const oldSize = existingSize >= 0 ? existingSize : 0

      const sharedUsedBytes = await getVpsSharedStorageBytes()
      if (file.size > CACHE_LIMIT_BYTES - sharedUsedBytes) {
        totals.skipped++
        await db.insert(videoCache).values({
          path: file.path,
          size: oldSize,
          modifiedAt: new Date(file.modifiedAt),
          status: 'skipped',
          error: 'Se alcanzó el límite de 70 GB de almacenamiento.',
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: videoCache.path,
          set: {
            size: oldSize,
            modifiedAt: new Date(file.modifiedAt),
            status: 'skipped',
            error: 'Se alcanzó el límite de 70 GB de almacenamiento.',
            updatedAt: new Date(),
          },
        })
        continue
      }

      // Mark as downloading
      await db.insert(videoCache).values({
        path: file.path,
        size: file.size,
        modifiedAt: new Date(file.modifiedAt),
        status: 'downloading',
        error: null,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: videoCache.path,
        set: {
          size: file.size,
          modifiedAt: new Date(file.modifiedAt),
          status: 'downloading',
          error: null,
          updatedAt: new Date(),
        },
      })

      try {
        const downloadedSize = await withVpsSharedStorageLock(async () => {
          const currentAvailableBytes = CACHE_LIMIT_BYTES - await getVpsSharedStorageBytes()
          if (file.size > currentAvailableBytes) return null
          return downloadVideo(file, currentAvailableBytes)
        })

        if (downloadedSize === null) {
          totals.skipped++
          await db.update(videoCache).set({
            status: 'skipped',
            error: 'Se alcanzó el límite compartido de 70 GB de almacenamiento.',
            updatedAt: new Date(),
          }).where(eq(videoCache.path, file.path))
          continue
        }

        totals.cachedBytes += downloadedSize - oldSize
        totals.downloaded++
        totals.downloaded++
        await db.update(videoCache).set({
          size: downloadedSize,
          status: 'downloaded',
          error: null,
          downloadedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(videoCache.path, file.path))
        consoleLog(`[video-sync] Downloaded ${file.path} (${downloadedSize} bytes)`)
      } catch (error) {
        totals.failed++
        const message = error instanceof Error ? error.message : String(error)
        await db.update(videoCache).set({
          size: existingSize >= 0 ? existingSize : file.size,
          status: 'error',
          error: message.slice(0, 500),
          updatedAt: new Date(),
        }).where(eq(videoCache.path, file.path))
        consoleError(`[video-sync] Failed ${file.path}: ${message}`)
      }
    }

    const state = totals.failed > 0 ? 'error' : totals.skipped > 0 ? 'partial' : 'complete'
    const summary = totals.failed > 0
      ? `${totals.failed} video(s) failed to download.`
      : totals.skipped > 0
        ? `${totals.skipped} video(s) skipped because the 70 GB cache limit was reached.`
        : null

    // Single database operation to update final state
    await db.update(videoSyncState).set({
      status: state,
      finishedAt: new Date(),
      scanned: totals.scanned,
      downloaded: totals.downloaded,
      failed: totals.failed,
      skipped: totals.skipped,
      cachedBytes: totals.cachedBytes,
      error: summary,
    }).where(eq(videoSyncState.id, STATE_ID))

    consoleLog(`[video-sync] Finished: ${JSON.stringify({ ...totals, status: state })}`)
    if (totals.failed > 0) process.exitCode = 1
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await db.update(videoSyncState).set({
      status: 'error',
      finishedAt: new Date(),
      scanned: totals.scanned,
      downloaded: totals.downloaded,
      failed: totals.failed + 1,
      skipped: totals.skipped,
      cachedBytes: totals.cachedBytes,
      error: message.slice(0, 500),
    }).where(eq(videoSyncState.id, STATE_ID))
    consoleError(`[video-sync] Synchronization aborted: ${message}`)
    process.exitCode = 1
  }
}

void syncVideos()
