import { createReadStream } from 'node:fs'
import { Readable } from 'node:stream'
import { getVpsLibraryFile } from '@/lib/vps-library'

function parseRange(value: string | null, size: number) {
  if (!value) return { start: 0, end: size - 1, partial: false }
  const match = /^bytes=(\d*)-(\d*)$/.exec(value)
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

async function respond(request: Request, headOnly = false) {
  const params = new URL(request.url).searchParams
  const path = params.get('path')
  const userId = params.get('userId') ?? undefined
  if (!path) return new Response('Falta la ruta del archivo.', { status: 400 })

  try {
    const file = await getVpsLibraryFile(path, true, userId)
    const range = parseRange(request.headers.get('range'), file.size)
    if (!range) {
      return new Response(null, {
        status: 416,
        headers: { 'Content-Range': `bytes */${file.size}`, 'Accept-Ranges': 'bytes' },
      })
    }

    const headers = new Headers({
      'Content-Type': file.mime,
      'Accept-Ranges': 'bytes',
      'Content-Length': String(Math.max(0, range.end - range.start + 1)),
      'Cache-Control': 'public, max-age=3600',
      'X-Accel-Buffering': 'no',
      'X-Content-Type-Options': 'nosniff',
      'Content-Disposition': params.has('dl')
        ? `attachment; filename*=UTF-8''${encodeURIComponent(file.name)}`
        : `inline; filename*=UTF-8''${encodeURIComponent(file.name)}`,
    })
    if (range.partial) headers.set('Content-Range', `bytes ${range.start}-${range.end}/${file.size}`)
    if (headOnly || file.size === 0) {
      return new Response(null, { status: range.partial ? 206 : 200, headers })
    }

    const body = Readable.toWeb(createReadStream(file.fullPath, {
      start: range.start,
      end: range.end,
    })) as unknown as BodyInit
    return new Response(body, { status: range.partial ? 206 : 200, headers })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo leer el archivo.'
    return new Response(message, { status: 404 })
  }
}

export async function GET(request: Request) {
  return respond(request)
}

export async function HEAD(request: Request) {
  return respond(request, true)
}
