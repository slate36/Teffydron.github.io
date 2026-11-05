import 'server-only'
import { createHmac, timingSafeEqual } from 'node:crypto'

export type ShareKind = 'video' | 'folder'

function secret() {
  const value = process.env.QR_SECRET || process.env.TERABOX_NDUS
  if (!value) throw new Error('No hay secreto para firmar los enlaces QR.')
  return value
}

export function signPath(kind: ShareKind, path: string) {
  return createHmac('sha256', secret())
    .update(`${kind}:${path}`)
    .digest('base64url')
    .slice(0, 16)
}

export function verifyPath(kind: ShareKind, path: string | undefined, sig: string | undefined) {
  if (!path || !sig || !path.startsWith('/')) return false
  const expected = Buffer.from(signPath(kind, path))
  const provided = Buffer.from(sig)
  return expected.length === provided.length && timingSafeEqual(expected, provided)
}

export function shareHref(kind: ShareKind, path: string) {
  const params = new URLSearchParams({ p: path, s: signPath(kind, path) })
  return `/${kind === 'video' ? 'v' : 'c'}?${params}`
}

export function streamHref(path: string, download = false) {
  const params = new URLSearchParams({ p: path, s: signPath('video', path) })
  if (download) params.set('dl', '1')
  return `/api/stream?${params}`
}

export function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}
