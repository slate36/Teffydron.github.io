'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Folder,
  FolderOpen,
  ImagePlus,
  LoaderCircle,
  Pencil,
  Upload,
  Trash2,
  Search,
  Film,
  Music,
  Image as ImageIcon,
  File,
  Clipboard,
  Copy,
  Download,
  ArrowLeft,
  MoreHorizontal,
  Zap,
  Scissors,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getCurrentUserId } from '@/app/actions/admin'

type FolderItem = { path: string; name: string }
type FileItem = { path: string; name: string; size: number; folder: string; modifiedAt: number }
type Snapshot = { folders: FolderItem[]; files: FileItem[]; usedBytes: number; limitBytes: number }
type ClipboardItem = { path: string; name: string; action: 'move' | 'copy' }

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() ?? ''
  if (['mp4', 'mov', 'webm', 'mkv', 'm4v'].includes(ext)) return <Film className="size-5 text-primary" />
  if (['mp3', 'm4a', 'aac', 'wav', 'ogg'].includes(ext)) return <Music className="size-5 text-primary" />
  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return <ImageIcon className="size-5 text-primary" />
  return <File className="size-5 text-muted-foreground" />
}

async function readResponse(response: Response) {
  const result = await response.json() as { error?: string }
  if (!response.ok) throw new Error(result.error ?? 'No se pudo completar la operación.')
  return result
}

export function VpsLibraryManager() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null)
  const [selectedFolder, setSelectedFolder] = useState('')
  const [currentPath, setCurrentPath] = useState('')
  const [newFolderName, setNewFolderName] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState('')
  const [uploadStatus, setUploadStatus] = useState<Record<string, { progress: number; status: 'pending' | 'uploading' | 'done' | 'error' }>>({})
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [clipboard, setClipboard] = useState<ClipboardItem[]>([])
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  async function refresh() {
    const userId = await getCurrentUserId()
    const query = new URLSearchParams({ userId: userId ?? '' })
    const response = await fetch(`/api/admin/library?${query}`, { cache: 'no-store' })
    const next = await readResponse(response) as Snapshot
    setSnapshot(next)
  }

  useEffect(() => {
    void refresh().catch((cause: unknown) => {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar la biblioteca.')
    })
  }, [])
  function parentPath(path: string) {
    const parts = path.split('/').filter(Boolean)
    parts.pop()
    return parts.join('/')
  }

  async function mutate(body: Record<string, string>) {
    const userId = await getCurrentUserId()
    setBusy(true)
    setError('')
    setNotice('')
    try {
      await readResponse(await fetch('/api/admin/library', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...body, userId: userId ?? '' }),
      }))
      await refresh()
      setNotice('Cambios guardados.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la biblioteca.')
    } finally {
      setBusy(false)
    }
  }

  async function deleteFile(path: string) {
    const userId = await getCurrentUserId()
    if (!window.confirm('¿Eliminar este archivo definitivamente?')) return
    setBusy(true)
    setError('')
    try {
      await readResponse(await fetch(`/api/admin/library?path=${encodeURIComponent(path)}&userId=${encodeURIComponent(userId ?? '')}`, {
        method: 'DELETE',
      }))
      await refresh()
      setNotice('Archivo eliminado.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo eliminar el archivo.')
    } finally {
      setBusy(false)
    }
  }

  async function pasteClipboard() {
    const userId = await getCurrentUserId()
    setBusy(true)
    setError('')
    try {
      for (const item of clipboard) {
        const query = new URLSearchParams({
          path: item.path,
          destination: currentPath,
          userId: userId ?? '',
        })
        if (item.action === 'copy') {
          await readResponse(await fetch('/api/admin/library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'copy-file', ...query }),
          }))
        } else {
          await readResponse(await fetch('/api/admin/library', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'move-file', ...query }),
          }))
        }
      }
      setClipboard([])
      await refresh()
      setNotice('Archivos pegados.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo pegar los archivos.')
    } finally {
      setBusy(false)
    }
  }

  async function uploadFiles(files: FileList | File[]) {
    const userId = await getCurrentUserId()
    const list = Array.from(files)
    if (!list.length) return
    setError('')
    setNotice('')
    setBusy(true)

    const initialStatus: Record<string, { progress: number; status: 'pending' | 'uploading' | 'done' | 'error' }> = {}
    for (const f of list) {
      initialStatus[f.name] = { progress: 0, status: 'pending' }
    }
    setUploadStatus(initialStatus)

    for (let index = 0; index < list.length; index++) {
      const file = list[index]
      setUploading(`Subiendo ${index + 1} de ${list.length}: ${file.name}`)

      setUploadStatus((prev) => ({ ...prev, [file.name]: { progress: 0, status: 'uploading' } }))

      try {
        const query = new URLSearchParams({ folder: currentPath, name: file.name, userId: userId ?? '' })
        const url = `/api/admin/library/upload?${query}`

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhr.open('POST', url, true)
          xhr.setRequestHeader('Content-Type', 'application/octet-stream')

          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 100)
              setUploadStatus((prev) => ({ ...prev, [file.name]: { progress: percent, status: 'uploading' as const } }))
            }
          }

          xhr.onload = () => {
            setUploadStatus((prev) => ({ ...prev, [file.name]: { progress: 100, status: 'done' as const } }))
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              const body = xhr.responseText
              setUploadStatus((prev) => ({ ...prev, [file.name]: { progress: 0, status: 'error' as const } }))
              reject(new Error(body || `Error ${xhr.status} subiendo ${file.name}`))
            }
          }

          xhr.onerror = () => {
            setUploadStatus((prev) => ({ ...prev, [file.name]: { progress: 0, status: 'error' as const } }))
            reject(new Error(`Error de red subiendo ${file.name}`))
          }

          xhr.ontimeout = () => {
            setUploadStatus((prev) => ({ ...prev, [file.name]: { progress: 0, status: 'error' as const } }))
            reject(new Error(`Tiempo agotado subiendo ${file.name}`))
          }

          xhr.send(file)
        })
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : `No se pudo subir ${file.name}.`)
        setUploading('')
        setBusy(false)
        await refresh().catch(() => undefined)
        return
      }
    }

    setUploading('')
    setBusy(false)
    setNotice(`${list.length} archivo(s) subido(s).`)
    // Mantener barras visibles un momento para que se vea el estado 'Listo'
    setTimeout(() => {
      setUploadStatus({})
      setSelectedFiles([])
    }, 1500)
    try {
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Los archivos subieron, pero no se pudo actualizar la lista.')
    }
  }

  async function uploadCover(folder: string, file: File | undefined) {
    const userId = await getCurrentUserId()
    if (!file) return
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const query = new URLSearchParams({ folder, name: file.name, userId: userId ?? '' })
      await readResponse(await fetch(`/api/admin/library/cover?${query}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: file,
      }))
      await refresh()
      setNotice('Portada de carpeta actualizada.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la portada.')
    } finally {
      setBusy(false)
    }
  }

  function moveFile(path: string, destination: string) {
    void mutate({ action: 'move-file', path, destination })
  }

  function renameFile(path: string, currentName: string) {
    const name = window.prompt('Nuevo nombre del archivo:', currentName)
    if (name?.trim()) void mutate({ action: 'rename-file', path, name })
  }

  function handleContextMenu(event: React.MouseEvent, file: FileItem) {
    event.preventDefault()
    setContextMenu({ x: event.clientX, y: event.clientY, file })
  }

  function handleDrop(event: React.DragEvent, destination: string) {
    event.preventDefault()
    const path = event.dataTransfer.getData('text/vps-library-file')
    if (path) moveFile(path, destination)
  }

  const folders = snapshot?.folders ?? []
  const files = snapshot?.files ?? []

  const currentFolders = folders.filter((folder) => parentPath(folder.path) === currentPath)
  const currentFiles = currentPath === ''
    ? files.filter((file) => file.folder === '')
    : files.filter((file) => file.folder === currentPath)

  // Archivos de caché de TeraBox (solo visibles en la raíz)
  const cachedFiles = currentPath === ''
    ? files.filter((file) => file.folder === 'Caché de TeraBox')
    : []

  const filteredFiles = currentFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.folder.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredFolders = currentFolders.filter((folder) =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
  const filteredCached = cachedFiles.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const canPaste = clipboard.length > 0

  function closeContextMenu() {
    setContextMenu(null)
  }

  useEffect(() => {
    function handleClick() {
      setContextMenu(null)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="flex flex-col gap-6" onContextMenu={closeContextMenu}>
      {/* Navegación */}
      <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setCurrentPath(parentPath(currentPath))
            setContextMenu(null)
          }}
          disabled={!currentPath}
        >
          <ArrowLeft className="size-4 mr-2" /> Volver
        </Button>
        <span className="text-sm sm:text-base font-medium text-muted-foreground truncate max-w-[60%] sm:max-w-none">
          {currentPath ? `En: ${currentPath.split('/').pop()}` : 'Biblioteca raíz'}
        </span>
      </div>

      {/* Espacio usado */}
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-primary">Espacio de almacenamiento</h2>
          </div>
          <div className="text-right sm:text-right">
            <p className="text-2xl sm:text-3xl font-bold text-primary">{formatBytes(snapshot?.usedBytes ?? 0)}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">de {formatBytes(snapshot?.limitBytes ?? 70 * 1024 ** 3)}</p>
          </div>
        </div>
        <div className="w-full h-3 sm:h-4 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((snapshot?.usedBytes ?? 0) / (snapshot?.limitBytes ?? 70 * 1024 ** 3)) * 100}%` }}
          />
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 sm:size-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar videos, imágenes o archivos..."
          className="h-10 sm:h-12 pl-10 sm:pl-12 text-base"
        />
      </div>

      {/* Subir archivos */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files)
        }}
        className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 sm:p-10 text-center hover:bg-primary/10 transition-colors"
      >
        <Upload className="size-10 sm:size-12 mx-auto text-primary mb-2 sm:mb-3" />
        <h3 className="text-xl sm:text-2xl font-semibold">Subir archivos</h3>
        <p className="text-sm sm:text-base text-muted-foreground">Arrastrá archivos aquí o hacé clic para seleccionar</p>
        {selectedFiles.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs sm:text-sm text-primary/80 font-medium mb-2">
              {selectedFiles.length} archivo(s) seleccionado(s)
            </p>
            <div className="flex flex-wrap gap-2 max-w-full overflow-hidden">
              {selectedFiles.map((file) => (
                <div key={file.name} className="flex items-center gap-1 bg-primary/10 rounded-lg px-3 py-1.5 text-xs sm:text-sm text-primary-foreground truncate max-w-[200px]">
                  <span className="mr-1">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFiles((prev) => prev.filter((f) => f.name !== file.name))
                    }}
                    className="p-1 hover:text-primary-foreground/70"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <Button
              size="lg"
              variant="default"
              className="w-full sm:w-auto mt-2 px-6"
              onClick={() => void uploadFiles(selectedFiles)}
            >
              <Upload className="size-5 mr-2" />
              Subir archivos
            </Button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto">
          <label
            className="flex items-center justify-center gap-2 w-full sm:w-auto flex-1 px-6 sm:px-8 py-3 sm:py-2 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors cursor-pointer font-semibold text-sm sm:text-base"
            onClick={() => fileInput.current?.click()}
          >
            <Upload className="size-5 sm:size-6" />
            {uploading || 'Seleccionar archivos'}
          </label>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="video/*,image/*,audio/*"
            className="hidden"
            onChange={(event) => {
              const files = event.currentTarget.files
              if (files) {
                setSelectedFiles(Array.from(files))
              }
              event.currentTarget.value = ''
            }}
          />
          <select
            value={currentPath}
            onChange={(event) => setCurrentPath(event.target.value)}
            className="w-full sm:w-auto h-12 px-4 rounded-xl border bg-background text-base min-w-[120px] sm:min-w-64"
          >
            {folders.map((folder) => (
              <option key={folder.path || 'root'} value={folder.path}>
                {folder.path ? `${folder.name} — ${folder.path}` : folder.name}
              </option>
            ))}
          </select>
        </div>
        {Object.keys(uploadStatus).length > 0 && (
          <div className="w-full space-y-3 mt-4 border border-primary/20 rounded-xl bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-3 text-xs sm:text-sm text-primary/70 font-medium">
              <Upload className="size-4" />
              <span>Progreso de subida</span>
            </div>
            {Object.entries(uploadStatus).map(([name, status]) => (
              <div key={name} className="flex flex-col gap-1">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="truncate max-w-[50%] text-muted-foreground">{name}</span>
                  <span className={cn(
                    'font-medium',
                    status.status === 'done' ? 'text-emerald-600' : status.status === 'error' ? 'text-destructive' : 'text-primary',
                  )}>
                    {status.status === 'done' ? '✓ Listo' : status.status === 'error' ? '✗ Error' : `${status.progress}%`}
                  </span>
                </div>
                <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden border border-white/30">
                  <div
                    className={cn(
                      'h-full transition-all duration-200',
                      status.status === 'done' ? 'bg-emerald-600' : status.status === 'error' ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-accent',
                    )}
                    style={{ width: `${status.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
        {uploading && Object.keys(uploadStatus).length === 0 && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mt-4">
            <LoaderCircle className="size-4 animate-spin" />
            {uploading}
          </div>
        )}
      </div>

      {/* Carpetas - Doble click para entrar */}
      {filteredFolders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FolderOpen className="size-6 text-primary" />
            Carpetas ({filteredFolders.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFolders.map((folder) => (
              <div
                key={folder.path || 'root'}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, folder.path)}
                onDoubleClick={() => {
                  setCurrentPath(folder.path)
                  setContextMenu(null)
                }}
                onContextMenu={(e) => {
                  e.preventDefault()
                  setContextMenu({ x: e.clientX, y: e.clientY, file: null as unknown as FileItem })
                }}
                className={cn(
                  'rounded-2xl border-2 bg-card p-6 transition-all hover:shadow-lg hover:border-primary/40 cursor-pointer group',
                  currentPath === folder.path ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                )}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <FolderOpen className="size-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-base truncate">{folder.name}</p>
                    <p className="text-sm text-muted-foreground">{folder.path || 'Raíz'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="default"
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      setCurrentPath(folder.path)
                      setContextMenu(null)
                    }}
                  >
                    Abrir carpeta
                  </Button>
                  {folder.path && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      disabled={busy}
                      onClick={(e) => {
                        e.stopPropagation()
                        const name = window.prompt('Nuevo nombre de la carpeta:', folder.name)
                        if (name?.trim()) void mutate({ action: 'rename-folder', path: folder.path, name })
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Archivos - Doble click para abrir, click derecho para menú */}
      <div>
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Folder className="size-6 text-primary" />
          Archivos ({filteredFiles.length})
        </h3>
        {filteredFiles.length ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => (
              <div
                key={file.path}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/vps-library-file', file.path)}
                onDoubleClick={() => {
                  const userId = getCurrentUserId()
                  void userId.then((uid) => {
                    window.open(`/api/library/file?path=${encodeURIComponent(file.path)}&userId=${encodeURIComponent(uid ?? '')}`, '_blank')
                  })
                  setContextMenu(null)
                }}
                onContextMenu={(event) => handleContextMenu(event, file)}
                onDrop={(event) => handleDrop(event, currentPath)}
                onDragOver={(event) => event.preventDefault()}
                className="group relative rounded-2xl border-2 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/40 cursor-grab"
                title="Doble click para abrir · Click derecho para más opciones"
              >
                <div className="aspect-video bg-muted/30 flex items-center justify-center p-4">
                  {getFileIcon(file.name)}
                </div>

                <div className="p-4">
                  <p className="font-semibold text-base truncate mb-1">{file.name}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate max-w-32">{file.folder || 'Raíz'}</span>
                    <span className="font-medium">{formatBytes(file.size)}</span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    disabled={busy}
                    onClick={() => renameFile(file.path, file.name)}
                    title="Renombrar archivo"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed p-12 text-center">
            <Folder className="size-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-lg text-muted-foreground">
              {snapshot ? 'No hay archivos aún. Subí videos, imágenes o audios para comenzar.' : 'Cargando biblioteca…'}
            </p>
          </div>
        )}
      </div>

      {/* Caché de TeraBox - Videos descargados en el VPS */}
      {currentPath === '' && filteredCached.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Zap className="size-6 text-amber-600" />
            Caché de TeraBox ({filteredCached.length})
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Videos descargados en el almacenamiento local del VPS. Arrastra a una carpeta o usa el menú para moverlos a tu biblioteca permanente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredCached.map((file) => (
              <div
                key={file.path}
                draggable
                onDragStart={(event) => event.dataTransfer.setData('text/vps-library-file', file.path)}
                onDoubleClick={() => {
                  const userId = getCurrentUserId()
                  void userId.then((uid) => {
                    window.open(`/api/library/file?path=${encodeURIComponent(file.path)}&userId=${encodeURIComponent(uid ?? '')}`, '_blank')
                  })
                  setContextMenu(null)
                }}
                onContextMenu={(event) => handleContextMenu(event, file)}
                onDrop={(event) => handleDrop(event, '')}
                onDragOver={(event) => event.preventDefault()}
                className="group relative rounded-2xl border-2 bg-amber-50/30 overflow-hidden transition-all hover:shadow-lg hover:border-amber-500/50 cursor-grab"
                title="Video en caché de TeraBox · Arrastra a una carpeta para moverlo a tu biblioteca"
              >
              <div className="aspect-video bg-amber-200/30 relative overflow-hidden flex items-center justify-center">
                  <div className="text-amber-600">
                    <Film className="size-12" />
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-semibold text-base truncate mb-1">{file.name}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate max-w-32">Caché de TeraBox</span>
                    <span className="font-medium text-amber-700">{formatBytes(file.size)}</span>
                  </div>
                </div>

                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-8 w-8 p-0"
                    disabled={busy}
                    onClick={() => renameFile(file.path, file.name)}
                    title="Renombrar archivo"
                  >
                    <Pencil className="size-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {canPaste && (
        <div className="rounded-2xl border-2 border-accent bg-accent/5 p-4 flex items-center gap-3">
          <Clipboard className="size-5 text-accent" />
          <span className="text-sm">{clipboard.length} archivo(s) en el portapapeles</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => pasteClipboard()}
            disabled={busy}
          >
            Pegar aquí
          </Button>
        </div>
      )}

      {/* Crear carpeta */}
      <form
        className="flex flex-col gap-4 rounded-2xl border-2 bg-card p-4 sm:p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!newFolderName.trim()) return
          void mutate({ action: 'create-folder', parent: currentPath, name: newFolderName })
          setNewFolderName('')
        }}
      >
        <h3 className="text-lg font-semibold">Crear nueva carpeta</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            placeholder={`Nombre de la carpeta (dentro de ${currentPath ? currentPath.split('/').pop() : 'raíz'})`}
            className="flex-1 h-12 sm:h-auto text-base"
            maxLength={120}
          />
          <Button type="submit" disabled={busy || !newFolderName.trim()} className="w-full sm:w-auto h-12 px-8 text-base">
            Crear carpeta
          </Button>
        </div>
      </form>

      {/* Menú contextual */}
      {contextMenu && (
        <div
          className="fixed z-50 rounded-xl border border-white/20 bg-[#164532]/95 backdrop-blur-md shadow-2xl p-2 text-white min-w-[180px] max-w-[90vw]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 300) }}
          onMouseDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          {contextMenu.file && (
            <>
              <div className="px-3 py-1.5 text-xs text-[#c5a059]/70 uppercase tracking-wider font-semibold truncate">
                {contextMenu.file.name}
              </div>
              <Button
                variant="ghost"
                className="w-full text-left text-sm text-white hover:bg-white/10 py-2"
                onClick={() => {
                  const userId = getCurrentUserId()
                  void userId.then((uid) => {
                    window.open(`/api/library/file?path=${encodeURIComponent(contextMenu.file!.path)}&userId=${encodeURIComponent(uid ?? '')}`, '_blank')
                  })
                  setContextMenu(null)
                }}
              >
                <Film className="size-4 mr-2" /> Abrir
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-sm text-white hover:bg-white/10 py-2"
                onClick={() => {
                  setClipboard([{ path: contextMenu.file!.path, name: contextMenu.file!.name, action: 'move' }])
                  setContextMenu(null)
                  setNotice('Archivo cortado.')
                }}
              >
                <Scissors className="size-4 mr-2" /> Cortar
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-sm text-white hover:bg-white/10 py-2"
                onClick={() => {
                  setClipboard([{ path: contextMenu.file!.path, name: contextMenu.file!.name, action: 'copy' }])
                  setContextMenu(null)
                  setNotice('Archivo copiado.')
                }}
              >
                <Copy className="size-4 mr-2" /> Copiar
              </Button>
              {canPaste && (
                <Button
                  variant="ghost"
                  className="w-full text-left text-sm text-white hover:bg-white/10 py-2"
                  onClick={() => {
                    void pasteClipboard()
                    setContextMenu(null)
                  }}
                >
                  <Clipboard className="size-4 mr-2" /> Pegar aquí
                </Button>
              )}
              <Button
                variant="ghost"
                className="w-full text-left text-sm text-white hover:bg-white/10 py-2"
                onClick={() => {
                  renameFile(contextMenu.file!.path, contextMenu.file!.name)
                  setContextMenu(null)
                }}
              >
                <Pencil className="size-4 mr-2" /> Renombrar
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-sm text-white hover:bg-white/10 py-2 text-destructive"
                onClick={() => {
                  deleteFile(contextMenu.file!.path)
                  setContextMenu(null)
                }}
              >
                <Trash2 className="size-4 mr-2" /> Eliminar
              </Button>
              <Button
                variant="ghost"
                className="w-full text-left text-sm text-white hover:bg-white/10 py-2"
                onClick={() => {
                  const userId = getCurrentUserId()
                  void userId.then((uid) => {
                    window.open(`/api/library/file?path=${encodeURIComponent(contextMenu.file!.path)}&userId=${encodeURIComponent(uid ?? '')}`, '_blank')
                  })
                  setContextMenu(null)
                }}
              >
                <Download className="size-4 mr-2" /> Descargar
              </Button>
            </>
          )}
        </div>
      )}

      {/* Mensajes de estado */}
      {error && <p role="alert" className="rounded-2xl bg-destructive/10 border border-destructive/20 px-6 py-4 text-base text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-2xl bg-primary/10 border border-primary/20 px-6 py-4 text-base">{notice}</p>}
      {busy && <span className="sr-only" aria-live="polite">Guardando cambios…</span>}
    </div>
  )
}
