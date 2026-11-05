import 'server-only'
import { createHash } from 'node:crypto'
import { stat } from 'node:fs/promises'
import { extname, join } from 'node:path'

export const VIDEO_CACHE_LIMIT_BYTES = 70 * 1024 ** 3

export function getVideoCacheDirectory() {
  return process.env.VIDEO_CACHE_DIR || join(process.cwd(), 'video-cache')
}

export function getVideoCachePath(teraboxPath: string) {
  if (!teraboxPath.startsWith('/') || teraboxPath.includes('\0')) {
    throw new Error('Ruta de video de TeraBox no válida.')
  }

  const extension = extname(teraboxPath).toLowerCase()
  const safeExtension = /^\.[a-z0-9]{1,8}$/.test(extension) ? extension : ''
  const id = createHash('sha256').update(teraboxPath).digest('hex')

  return join(/*turbopackIgnore: true*/ getVideoCacheDirectory(), `${id}${safeExtension}`)
}

export async function getCachedVideoSize(teraboxPath: string) {
  try {
    return (await stat(getVideoCachePath(teraboxPath))).size
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }
}
