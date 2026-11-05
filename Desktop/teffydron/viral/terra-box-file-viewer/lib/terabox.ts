import 'server-only'

const BASE_URL = 'https://www.terabox.com'
const APP_ID = '250528'
const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

export type TeraboxFile = {
  fsId: string
  name: string
  path: string
  size: number
  isDir: boolean
  modifiedAt: number
  category: number
  thumbnail: string | null
}

export class TeraboxError extends Error {
  constructor(
    message: string,
    public code: 'missing_cookie' | 'auth' | 'request',
  ) {
    super(message)
  }
}

type RawFile = {
  fs_id: number | string
  server_filename: string
  path: string
  size: number
  isdir: number
  server_mtime: number
  category: number
  thumbs?: { url1?: string; url2?: string; url3?: string }
}

function getCookie() {
  const ndus = process.env.TERABOX_NDUS?.trim()
  if (!ndus) {
    throw new TeraboxError(
      'Falta la variable de entorno TERABOX_NDUS.',
      'missing_cookie',
    )
  }
  return ndus.startsWith('ndus=') ? ndus : `ndus=${ndus}`
}

function headers(cookie: string) {
  return {
    Cookie: cookie,
    'User-Agent': USER_AGENT,
    Accept: 'application/json, text/plain, */*',
    Referer: `${BASE_URL}/main`,
  }
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getJsToken(cookie: string) {
  if (cachedToken && cachedToken.expiresAt > Date.now()) return cachedToken.value

  const res = await fetch(`${BASE_URL}/main?category=all`, {
    headers: { ...headers(cookie), Accept: 'text/html' },
    cache: 'no-store',
    redirect: 'follow',
  })
  const html = await res.text()
  const match = html.match(/fn%28%22([^%]+)%22%29/)
  if (!match) {
    throw new TeraboxError(
      'No se pudo iniciar sesión en TeraBox. Revisa que la cookie ndus sea válida.',
      'auth',
    )
  }

  cachedToken = { value: match[1], expiresAt: Date.now() + 30 * 60 * 1000 }
  return match[1]
}

const dlinkCache = new Map<string, { url: string; expiresAt: number }>()

export async function getDownloadLink(path: string) {
  const cached = dlinkCache.get(path)
  if (cached && cached.expiresAt > Date.now()) return cached.url

  const cookie = getCookie()
  const jsToken = await getJsToken(cookie)
  const params = new URLSearchParams({
    app_id: APP_ID,
    web: '1',
    channel: 'dubox',
    clienttype: '0',
    jsToken,
    dlink: '1',
    target: JSON.stringify([path]),
  })
  const res = await fetch(`${BASE_URL}/api/filemetas?${params}`, {
    headers: headers(cookie),
    cache: 'no-store',
  })
  const data = (await res.json()) as { errno: number; info?: { dlink?: string }[] }
  const url = data.info?.[0]?.dlink
  if (data.errno !== 0 || !url) {
    throw new TeraboxError(`No se pudo obtener el video (error ${data.errno}).`, 'request')
  }

  dlinkCache.set(path, { url, expiresAt: Date.now() + 60 * 60 * 1000 })
  return url
}

export async function fetchFileStream(path: string, range: string | null) {
  const url = await getDownloadLink(path)
  const cookie = getCookie()
  const res = await fetch(url, {
    headers: {
      Cookie: cookie,
      'User-Agent': USER_AGENT,
      ...(range ? { Range: range } : {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    dlinkCache.delete(path)
    throw new TeraboxError(`TeraBox respondió con ${res.status} al leer el video.`, 'request')
  }
  return res
}

export async function listFiles(dir: string): Promise<TeraboxFile[]> {
  const cookie = getCookie()
  const jsToken = await getJsToken(cookie)
  const all: RawFile[] = []

  for (let page = 1; page <= 20; page++) {
    const params = new URLSearchParams({
      app_id: APP_ID,
      web: '1',
      channel: 'dubox',
      clienttype: '0',
      jsToken,
      dir,
      order: 'name',
      desc: '0',
      num: '500',
      page: String(page),
      showempty: '0',
    })

    const res = await fetch(`${BASE_URL}/api/list?${params}`, {
      headers: headers(cookie),
      cache: 'no-store',
    })
    if (!res.ok) {
      throw new TeraboxError(`TeraBox respondió con ${res.status}.`, 'request')
    }

    const data = (await res.json()) as { errno: number; list?: RawFile[] }
    if (data.errno !== 0) {
      cachedToken = null
      const authError = [-6, 4000023, 450016].includes(data.errno)
      throw new TeraboxError(
        authError
          ? 'Tu sesión de TeraBox expiró. Actualiza la cookie ndus.'
          : `TeraBox devolvió el error ${data.errno}.`,
        authError ? 'auth' : 'request',
      )
    }

    const list = data.list ?? []
    all.push(...list)
    if (list.length < 500) break
  }

  return all
    .map((f) => ({
      fsId: String(f.fs_id),
      name: f.server_filename,
      path: f.path,
      size: f.size,
      isDir: f.isdir === 1,
      modifiedAt: f.server_mtime * 1000,
      category: f.category,
      thumbnail: f.thumbs?.url3 ?? f.thumbs?.url2 ?? f.thumbs?.url1 ?? null,
    }))
    .sort((a, b) => Number(b.isDir) - Number(a.isDir) || a.name.localeCompare(b.name))
}
