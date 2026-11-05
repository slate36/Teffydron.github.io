import { copyFile, lstat, open, rename, rm, stat } from 'node:fs/promises'
import { db } from '../lib/db'
import { videoCache } from '../lib/db/schema'
import { getVideoCachePath } from '../lib/video-cache'
import { optimizeMp4FastStart } from '../lib/mp4-faststart'

async function exists(path: string) {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return false
    throw error
  }
}

async function optimizeCachedVideo(path: string, expectedSize: number) {
  const source = getVideoCachePath(path)
  const temporary = `${source}.faststart.partial`
  const backup = `${source}.faststart.backup`

  if (await exists(backup)) {
    if (!(await exists(source))) {
      await rename(backup, source)
    } else {
      const [current, saved] = await Promise.all([stat(source), stat(backup)])
      if (current.size !== saved.size) {
        throw new Error(`Existe una copia de recuperación para ${path}; requiere revisión manual.`)
      }
      await rm(backup)
    }
  }

  let original
  try {
    original = await stat(source)
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return 'missing'
    throw error
  }

  if (original.size !== expectedSize) return 'size-mismatch'
  await rm(temporary, { force: true })

  try {
    await copyFile(source, temporary)
    const changed = await optimizeMp4FastStart(temporary)
    if (!changed) return 'unchanged'

    const optimized = await stat(temporary)
    if (optimized.size !== original.size) {
      throw new Error(`El tamaño de ${path} cambió al optimizar el índice MP4.`)
    }

    const file = await open(temporary, 'r+')
    try {
      await file.chmod(original.mode & 0o777)
      await file.sync()
    } finally {
      await file.close()
    }

    await rename(source, backup)
    try {
      await rename(temporary, source)
    } catch (error) {
      await rename(backup, source)
      throw error
    }
    await rm(backup)
    return 'optimized'
  } finally {
    await rm(temporary, { force: true })
  }
}

async function main() {
  const beforePath = process.argv.slice(2).find((argument) => argument.startsWith('/'))
  const rows = await db.select({
    path: videoCache.path,
    size: videoCache.size,
    status: videoCache.status,
  }).from(videoCache)
  const candidates = rows.filter((video) =>
    video.status === 'downloaded' &&
    (!beforePath || video.path.localeCompare(beforePath) < 0) &&
    /\.(mp4|m4v|mov)$/i.test(video.path)
  )
  let optimized = 0

  for (const video of candidates) {
    const result = await optimizeCachedVideo(video.path, video.size)
    if (result === 'optimized') {
      optimized++
      console.log(`[mp4-faststart] Optimized ${video.path}`)
    } else if (result === 'size-mismatch') {
      console.warn(`[mp4-faststart] Skipped stale cache entry ${video.path}`)
    } else if (result === 'missing') {
      continue
    }
  }

  console.log(`[mp4-faststart] Eligible videos: ${candidates.length}.`)
  console.log(`[mp4-faststart] Finished: ${optimized} video(s) optimized.`)
}

main().catch((error) => {
  console.error('[mp4-faststart] Optimization failed:', error)
  process.exitCode = 1
})
