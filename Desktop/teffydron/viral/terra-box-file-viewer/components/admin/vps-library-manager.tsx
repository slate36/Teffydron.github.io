'use client'

import { useEffect, useRef, useState } from 'react'
import { Folder, FolderOpen, ImagePlus, LoaderCircle, Pencil, Upload, Trash2, Search, Film, Music, Image as ImageIcon, File } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { getCurrentUserId } from '@/app/actions/admin'

type FolderItem = { path: string; name: string }
type FileItem = { path: string; name: string; size: number; folder: string; modifiedAt: number }
type Snapshot = { folders: FolderItem[]; files: FileItem[]; usedBytes: number; limitBytes: number }

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(0)} MB`
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`
}

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase()
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
  const [newFolderName, setNewFolderName] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
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

  async function uploadFiles(files: FileList | File[]) {
    const userId = await getCurrentUserId()
    const list = Array.from(files)
    if (!list.length) return
    setError('')
    setNotice('')
    for (let index = 0; index < list.length; index++) {
      const file = list[index]
      setUploading(`Subiendo ${index + 1} de ${list.length}: ${file.name}`)
      try {
        const query = new URLSearchParams({ folder: selectedFolder, name: file.name, userId: userId ?? '' })
        await readResponse(await fetch(`/api/admin/library/upload?${query}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/octet-stream' },
          body: file,
        }))
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : `No se pudo subir ${file.name}.`)
        setUploading('')
        await refresh().catch(() => undefined)
        return
      }
    }
    setUploading('')
    setNotice(`${list.length} archivo(s) subido(s).`)
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

  function handleDrop(event: React.DragEvent, destination: string) {
    event.preventDefault()
    const path = event.dataTransfer.getData('text/vps-library-file')
    if (path) moveFile(path, destination)
  }

  const folders = snapshot?.folders ?? []
  const files = snapshot?.files ?? []
  
  // Filtrar archivos por búsqueda
  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.folder.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  // Filtrar carpetas por búsqueda
  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Espacio usado - Grande y claro */}
      <div className="rounded-2xl border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">Espacio de almacenamiento</h2>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary">{formatBytes(snapshot?.usedBytes ?? 0)}</p>
            <p className="text-sm text-muted-foreground">de {formatBytes(snapshot?.limitBytes ?? 70 * 1024 ** 3)}</p>
          </div>
        </div>
        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${((snapshot?.usedBytes ?? 0) / (snapshot?.limitBytes ?? 70 * 1024 ** 3)) * 100}%` }}
          />
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar videos, imágenes o archivos..."
          className="h-12 pl-12 text-lg"
        />
      </div>

      {/* Subir archivos - Grande y visible */}
      <div
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          if (event.dataTransfer.files.length) void uploadFiles(event.dataTransfer.files)
        }}
        className="flex flex-col gap-4 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 p-8 text-center hover:bg-primary/10 transition-colors"
      >
        <Upload className="size-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Subir archivos</h3>
        <p className="text-muted-foreground">Arrastrá archivos aquí o hacé clic para seleccionar</p>
        <div className="flex items-center justify-center gap-4">
          <label className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-white font-semibold hover:bg-primary/90 transition-colors cursor-pointer">
            <Upload className="size-5" />
            {uploading || 'Seleccionar archivos'}
          </label>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="video/*,image/*,audio/*"
            className="sr-only"
            onChange={(event) => {
              if (event.currentTarget.files) void uploadFiles(event.currentTarget.files)
              event.currentTarget.value = ''
            }}
          />
          <select
            value={selectedFolder}
            onChange={(event) => setSelectedFolder(event.target.value)}
            className="h-12 px-4 rounded-xl border bg-background text-base min-w-64"
          >
            {folders.map((folder) => (
              <option key={folder.path || 'root'} value={folder.path}>
                {folder.path ? `${folder.name} — ${folder.path}` : folder.name}
              </option>
            ))}
          </select>
        </div>
        {uploading && (
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" />
            {uploading}
          </div>
        )}
      </div>

      {/* Carpetas - Vista de cuadrícula grande */}
      {filteredFolders.length > 0 && (
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FolderOpen className="size-6 text-primary" />
            Carpetas ({filteredFolders.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredFolders.map((folder) => (
              <div
                key={folder.path || 'root'}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => handleDrop(event, folder.path)}
                className={cn(
                  'rounded-2xl border-2 bg-card p-6 transition-all hover:shadow-lg hover:border-primary/40 cursor-pointer',
                  folder.path === selectedFolder ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
                )}
                onClick={() => setSelectedFolder(folder.path)}
              >
                <div className="flex flex-col items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-4">
                    <FolderOpen className="size-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-base">{folder.name}</p>
                    <p className="text-sm text-muted-foreground">{folder.path || 'Raíz'}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedFolder(folder.path)
                    }}
                  >
                    Subir aquí
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

      {/* Archivos - Vista de galería grande con miniaturas */}
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
                className="group relative rounded-2xl border-2 bg-card overflow-hidden transition-all hover:shadow-lg hover:border-primary/40 cursor-grab"
                title="Arrastrá este archivo a una carpeta para moverlo"
              >
                {/* Miniatura/Icono grande */}
                <div className="aspect-video bg-muted/30 flex items-center justify-center p-4">
                  {getFileIcon(file.name)}
                </div>
                
                {/* Información del archivo */}
                <div className="p-4">
                  <p className="font-semibold text-base truncate mb-1">{file.name}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="truncate max-w-32">{file.folder || 'Raíz'}</span>
                    <span className="font-medium">{formatBytes(file.size)}</span>
                  </div>
                </div>

                {/* Botones de acción */}
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

      {/* Crear carpeta - Grande y claro */}
      <form
        className="flex flex-col gap-4 rounded-2xl border-2 bg-card p-6"
        onSubmit={(event) => {
          event.preventDefault()
          if (!newFolderName.trim()) return
          void mutate({ action: 'create-folder', parent: selectedFolder, name: newFolderName })
          setNewFolderName('')
        }}
      >
        <h3 className="text-lg font-semibold">Crear nueva carpeta</h3>
        <div className="flex gap-3">
          <Input
            value={newFolderName}
            onChange={(event) => setNewFolderName(event.target.value)}
            placeholder={`Nombre de la carpeta (dentro de ${folders.find((folder) => folder.path === selectedFolder)?.name ?? 'raíz'})`}
            className="flex-1 h-12 text-base"
            maxLength={120}
          />
          <Button type="submit" disabled={busy || !newFolderName.trim()} className="h-12 px-8 text-base">
            Crear carpeta
          </Button>
        </div>
      </form>

      {/* Mensajes de estado */}
      {error && <p role="alert" className="rounded-2xl bg-destructive/10 border border-destructive/20 px-6 py-4 text-base text-destructive">{error}</p>}
      {notice && <p role="status" className="rounded-2xl bg-primary/10 border border-primary/20 px-6 py-4 text-base">{notice}</p>}
      {busy && <span className="sr-only" aria-live="polite">Guardando cambios…</span>}
    </div>
  )
}
