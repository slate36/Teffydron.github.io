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

type SyncTotals = {
  scanned: number
  downloaded: number
  failed: number
  skipped: number
  cachedBytes: number
}

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
        console.error(`[video-sync] Ignoring invalid TeraBox path: ${file.path}`)
        continue
      }

      if (file.isDir) {
        if (directory !== '/' || !hiddenPaths.has(file.path)) directories.push(file.path)
      } else if (file.category === 1 && file.size >= 0) {
        videos.set(file.path, file)
      }
    }

    console.log(`[video-sync] Scanned ${directory}: ${files.length} entries`)
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
      console.log(`[video-sync] Removed interrupted download ${entry.name}`)
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
      console.log(`[video-sync] Moved MP4 index to its start: ${file.path}`)
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
  const totals: SyncTotals = {
    scanned: 0,
    downloaded: 0,
    failed: 0,
    skipped: 0,
    cachedBytes: await getCachedBytes(),
  }

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
    console.log(`[video-sync] Found ${videos.length} visible videos; shared storage is ${sharedBytes}/${CACHE_LIMIT_BYTES} bytes`)

    const cachedRows = await db.select({
      path: videoCache.path,
      size: videoCache.size,
      modifiedAt: videoCache.modifiedAt,
      status: videoCache.status,
      downloadedAt: videoCache.downloadedAt,
    }).from(videoCache)
    const cachedByPath = new Map(cachedRows.map((video) => [video.path, video]))

    for (const file of videos) {
      const current = cachedByPath.get(file.path)
      if (await hasCompleteCachedVideo(file, current)) {
        await db.update(videoCache).set({
          status: 'downloaded',
          error: null,
          downloadedAt: current?.downloadedAt ?? new Date(),
          updatedAt: new Date(),
        }).where(eq(videoCache.path, file.path))
        continue
      }

      await db.insert(videoCache).values({
        path: file.path,
        size: file.size,
        modifiedAt: new Date(file.modifiedAt),
        status: 'queued',
        error: null,
        updatedAt: new Date(),
      }).onConflictDoUpdate({
        target: videoCache.path,
        set: {
          size: file.size,
          modifiedAt: new Date(file.modifiedAt),
          status: 'queued',
          error: null,
          updatedAt: new Date(),
        },
      })
    }

    for (const file of videos) {
      const current = await db.select().from(videoCache)
        .where(eq(videoCache.path, file.path))
        .limit(1)
      const currentVideo = current[0]
      const cachedPath = getVideoCachePath(file.path)
      let existingSize = -1
      try {
        existingSize = (await stat(cachedPath)).size
      } catch (error) {
        if (!(error instanceof Error && 'code' in error && error.code === 'ENOENT')) throw error
      }

      if (existingSize === file.size && await hasCompleteCachedVideo(file, currentVideo)) {
        if (currentVideo?.status !== 'downloaded') {
          await db.update(videoCache).set({
            status: 'downloaded',
            error: null,
            downloadedAt: currentVideo?.downloadedAt ?? new Date(),
            updatedAt: new Date(),
          }).where(eq(videoCache.path, file.path))
        }
        continue
      }

      const sharedUsedBytes = await getVpsSharedStorageBytes()
      if (file.size > CACHE_LIMIT_BYTES - sharedUsedBytes) {
        totals.skipped++
        await db.insert(videoCache).values({
          path: file.path,
          size: existingSize >= 0 ? existingSize : file.size,
          modifiedAt: new Date(file.modifiedAt),
          status: 'skipped',
          error: 'Se alcanzó el límite de 70 GB de almacenamiento.',
          updatedAt: new Date(),
        }).onConflictDoUpdate({
          target: videoCache.path,
          set: {
            size: existingSize >= 0 ? existingSize : file.size,
            modifiedAt: new Date(file.modifiedAt),
            status: 'skipped',
            error: 'Se alcanzó el límite de 70 GB de almacenamiento.',
            updatedAt: new Date(),
          },
        })
        continue
      }

      const oldSize = existingSize >= 0 ? existingSize : 0
      const availableBytes = CACHE_LIMIT_BYTES - sharedUsedBytes
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
        await db.update(videoCache).set({
          size: downloadedSize,
          status: 'downloaded',
          error: null,
          downloadedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(videoCache.path, file.path))
        console.log(`[video-sync] Downloaded ${file.path} (${downloadedSize} bytes)`)
      } catch (error) {
        totals.failed++
        const message = error instanceof Error ? error.message : String(error)
        await db.update(videoCache).set({
          size: existingSize >= 0 ? existingSize : file.size,
          status: 'error',
          error: message.slice(0, 500),
          updatedAt: new Date(),
        }).where(eq(videoCache.path, file.path))
        console.error(`[video-sync] Failed ${file.path}: ${message}`)
      }
    }

    const state = totals.failed > 0 ? 'error' : totals.skipped > 0 ? 'partial' : 'complete'
    const summary = totals.failed > 0
      ? `${totals.failed} video(s) failed to download.`
      : totals.skipped > 0
        ? `${totals.skipped} video(s) skipped because the 70 GB cache limit was reached.`
        : null
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

    console.log(`[video-sync] Finished: ${JSON.stringify({ ...totals, status: state })}`)
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
    console.error(`[video-sync] Synchronization aborted: ${message}`)
    process.exitCode = 1
  }
}

void syncVideos()
