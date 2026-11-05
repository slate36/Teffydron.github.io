import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { Readable } from 'node:stream'
import { fetchFileStream } from '@/lib/terabox'
import { verifyPath } from '@/lib/share'
import { getVideoCachePath } from '@/lib/video-cache'
import { isPathHidden } from '@/lib/admin'

export const maxDuration = 300

const MIME: Record<string, string> = {
  mp4: 'video/mp4',
  m4v: 'video/mp4',
  mov: 'video/quicktime',
  webm: 'video/webm',
  mkv: 'video/x-matroska',
}

function contentType(path: string) {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return MIME[ext] ?? 'video/mp4'
}

function parseRange(range: string | null, size: number) {
  if (!range) return { start: 0, end: size - 1, partial: false }

  const match = /^bytes=(\d*)-(\d*)$/.exec(range)
  if (!match || size === 0 || (!match[1] && !match[2])) return null

  let start: number
  let end: number
  if (!match[1]) {
    const suffixLength = Number(match[2])
    if (!Number.isSafeInteger(suffixLength) || suffixLength <= 0) return null
    start = Math.max(size - suffixLength, 0)
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] ? Number(match[2]) : size - 1
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start >= size || start > end) {
      return null
    }
    end = Math.min(end, size - 1)
  }

  return { start, end, partial: true }
}

async function getCachedResponse(
  path: string,
  request: Request,
  name: string,
): Promise<Response | null> {
  const cachePath = getVideoCachePath(path)
  let size: number

  try {
    size = (await stat(cachePath)).size
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') return null
    throw error
  }

  const range = parseRange(request.headers.get('range'), size)
  if (!range) {
    return new Response(null, {
      status: 416,
      headers: { 'Content-Range': `bytes */${size}`, 'Accept-Ranges': 'bytes' },
    })
  }

  const headers = new Headers({
    'Content-Type': contentType(name),
    'Accept-Ranges': 'bytes',
    'Content-Length': String(range.end - range.start + 1),
    'Cache-Control': 'private, max-age=3600',
    'X-Accel-Buffering': 'no',
  })
  if (range.partial) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`)
  if (new URL(request.url).searchParams.has('dl')) {
    headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`)
  }

  const body = size === 0
    ? null
    : Readable.toWeb(createReadStream(cachePath, {
        start: range.start,
        end: range.end,
      })) as unknown as BodyInit
  return new Response(body, { status: range.partial ? 206 : 200, headers })
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get('p') ?? undefined
  const sig = searchParams.get('s') ?? undefined

  if (!path || !verifyPath('video', path, sig)) {
    return new Response('Enlace inválido', { status: 403 })
  }
  if (await isPathHidden(path)) {
    return new Response('No encontrado', { status: 404 })
  }

  try {
    const videoPath = path
    const name = videoPath.split('/').pop() ?? 'video'
    const cachedResponse = await getCachedResponse(videoPath, request, name)
    if (cachedResponse) return cachedResponse

    const upstream = await fetchFileStream(videoPath, request.headers.get('range'))

    const headers = new Headers({
      'Content-Type': contentType(name),
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, max-age=3600',
      'X-Accel-Buffering': 'no',
    })
    for (const key of ['content-length', 'content-range']) {
      const value = upstream.headers.get(key)
      if (value) headers.set(key, value)
    }
    if (searchParams.get('dl')) {
      headers.set('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(name)}`)
    }

    return new Response(upstream.body, { status: upstream.status, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error al leer el video.'
    return new Response(message, { status: 502 })
  }
}
