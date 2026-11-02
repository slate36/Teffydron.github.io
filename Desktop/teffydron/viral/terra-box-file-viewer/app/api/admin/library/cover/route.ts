import { NextResponse } from 'next/server'
import { getViewer } from '@/lib/viewer'
import {
  getVpsLibrarySnapshot,
  withVpsLibraryWriteLock,
  withVpsSharedStorageLock,
  writeVpsLibraryCover,
} from '@/lib/vps-library'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(request: Request) {
  const viewer = await getViewer()
  if (!viewer) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })
  const params = new URL(request.url).searchParams
  const folder = params.get('folder') ?? ''
  const name = params.get('name') ?? ''
  const userId = params.get('userId') ?? viewer.id

  try {
    await withVpsLibraryWriteLock(async () => {
      await withVpsSharedStorageLock(async () => {
        const { limitBytes, usedBytes } = await getVpsLibrarySnapshot(userId)
        const availableBytes = limitBytes - usedBytes
        if (availableBytes <= 0) throw new Error('Se alcanzó el límite compartido de almacenamiento de 70 GB.')
        await writeVpsLibraryCover(request, folder, name, Math.min(availableBytes, 10 * 1024 ** 2), userId)
      })
    })
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No se pudo guardar la portada.'
    const status = /límite|espacio disponible/i.test(message) ? 413 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
