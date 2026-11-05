import 'server-only'
import { open, type FileHandle } from 'node:fs/promises'

type Atom = {
  type: string
  offset: number
  size: number
  headerSize: number
}

async function readAt(file: FileHandle, position: number, length: number) {
  const buffer = Buffer.alloc(length)
  let bytesRead = 0

  while (bytesRead < length) {
    const result = await file.read(buffer, bytesRead, length - bytesRead, position + bytesRead)
    if (result.bytesRead === 0) throw new Error('MP4 incompleto: no se pudo leer un bloque.')
    bytesRead += result.bytesRead
  }

  return buffer
}

async function writeAt(file: FileHandle, buffer: Buffer, position: number) {
  let bytesWritten = 0

  while (bytesWritten < buffer.length) {
    const result = await file.write(buffer, bytesWritten, buffer.length - bytesWritten, position + bytesWritten)
    if (result.bytesWritten === 0) throw new Error('No se pudo escribir el índice MP4.')
    bytesWritten += result.bytesWritten
  }
}

async function getTopLevelAtoms(file: FileHandle, fileSize: number) {
  const atoms: Atom[] = []
  let offset = 0

  while (offset + 8 <= fileSize) {
    const header = await readAt(file, offset, Math.min(16, fileSize - offset))
    const size32 = header.readUInt32BE(0)
    const type = header.toString('ascii', 4, 8)
    let size: number
    let headerSize = 8

    if (size32 === 1) {
      if (header.length < 16) throw new Error('MP4 inválido: falta el encabezado extendido.')
      const extendedSize = header.readBigUInt64BE(8)
      if (extendedSize > BigInt(Number.MAX_SAFE_INTEGER)) {
        throw new Error('MP4 demasiado grande para optimizarlo de forma segura.')
      }
      size = Number(extendedSize)
      headerSize = 16
    } else {
      size = size32 === 0 ? fileSize - offset : size32
    }

    if (size < headerSize || offset + size > fileSize) {
      throw new Error('MP4 inválido: el tamaño de un bloque no coincide con el archivo.')
    }

    atoms.push({ type, offset, size, headerSize })
    offset += size
  }

  if (offset !== fileSize) throw new Error('MP4 inválido: hay bytes fuera de sus bloques.')
  return atoms
}

function freeHeader(size: number) {
  if (size >= 8 && size <= 0xffffffff) {
    const header = Buffer.alloc(8)
    header.writeUInt32BE(size, 0)
    header.write('free', 4, 'ascii')
    return header
  }

  if (size > 0xffffffff) {
    const header = Buffer.alloc(16)
    header.writeUInt32BE(1, 0)
    header.write('free', 4, 'ascii')
    header.writeBigUInt64BE(BigInt(size), 8)
    return header
  }

  throw new Error('No queda espacio suficiente para conservar el bloque MP4.')
}

async function writeFreeAtom(file: FileHandle, offset: number, size: number) {
  const header = freeHeader(size)
  await writeAt(file, header, offset)

  const zeros = Buffer.alloc(64 * 1024)
  let position = offset + header.length
  const end = offset + size
  while (position < end) {
    const length = Math.min(zeros.length, end - position)
    await writeAt(file, zeros.subarray(0, length), position)
    position += length
  }
}

export async function optimizeMp4FastStart(filePath: string) {
  const file = await open(filePath, 'r+')

  try {
    const fileSize = (await file.stat()).size
    const atoms = await getTopLevelAtoms(file, fileSize)
    const moovIndex = atoms.findIndex((atom) => atom.type === 'moov')
    const mdatIndex = atoms.findIndex((atom) => atom.type === 'mdat')

    if (moovIndex < 0 || mdatIndex < 0 || moovIndex < mdatIndex) return false

    const mdat = atoms[mdatIndex]
    const reserve = atoms[mdatIndex - 1]
    const moov = atoms[moovIndex]
    if (reserve?.type !== 'free' || reserve.offset + reserve.size !== mdat.offset) return false
    if (reserve.size - moov.size < 8) return false

    const moovBytes = await readAt(file, moov.offset, moov.size)
    // Keep the reserve's total size unchanged so mdat and its chunk offsets stay valid.
    await writeAt(file, moovBytes, reserve.offset)
    await writeFreeAtom(file, reserve.offset + moov.size, reserve.size - moov.size)
    await writeFreeAtom(file, moov.offset, moov.size)
    await file.sync()

    const optimizedAtoms = await getTopLevelAtoms(file, fileSize)
    const optimizedMoov = optimizedAtoms.find((atom) => atom.type === 'moov')
    const optimizedMdat = optimizedAtoms.find((atom) => atom.type === 'mdat')
    if (!optimizedMoov || !optimizedMdat || optimizedMoov.offset > optimizedMdat.offset) {
      throw new Error('No se pudo verificar el índice rápido del MP4.')
    }

    return true
  } finally {
    await file.close()
  }
}
