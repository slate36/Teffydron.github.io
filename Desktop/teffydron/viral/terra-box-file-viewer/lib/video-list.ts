import type { TeraboxFile } from '@/lib/terabox'

export type VideoListEntry = TeraboxFile & { cachedOnVps: boolean }

function duplicateKey(file: VideoListEntry) {
  return `${file.name.normalize('NFKC').trim().toLocaleLowerCase('es')}::${file.size}`
}

export function preferCachedVideoDuplicates<T extends VideoListEntry>(files: T[]) {
  const cachedByKey = new Map<string, T>()

  for (const file of files) {
    if (file.isDir || file.category !== 1 || !file.cachedOnVps) continue

    const key = duplicateKey(file)
    const existing = cachedByKey.get(key)
    if (!existing || file.path.localeCompare(existing.path) < 0) {
      cachedByKey.set(key, file)
    }
  }

  if (cachedByKey.size === 0) return files

  return files.filter((file) => {
    if (file.isDir || file.category !== 1) return true

    const preferred = cachedByKey.get(duplicateKey(file))
    return !preferred || file.path === preferred.path
  })
}
