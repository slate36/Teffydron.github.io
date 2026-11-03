'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  FileArchive,
  FileAudio,
  FileImage,
  FileText,
  FileVideo,
  File as FileIcon,
  Folder,
  FolderOpen,
  LayoutGrid,
  List,
  Mail,
  MoreHorizontal,
  Phone,
  Search,
  Share2,
  Sparkles,
  Trash2,
  LoaderCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { TeraboxFile } from '@/lib/terabox'
import { folderHref } from '@/components/breadcrumbs'
import { cn } from '@/lib/utils'
import { QrDialogButton } from '@/components/qr-dialog-button'
import { VpsCacheIndicator } from '@/components/vps-cache-indicator'

type BrowserFile = TeraboxFile & { shareHref: string | null; cachedOnVps: boolean; directHref?: string | null }

const CATEGORY_ICONS: Record<number, LucideIcon> = {
  1: FileVideo,
  2: FileAudio,
  3: FileImage,
  4: FileText,
  5: FileArchive,
  7: FileArchive,
}

function iconFor(file: TeraboxFile) {
  return file.isDir ? Folder : (CATEGORY_ICONS[file.category] ?? FileIcon)
}

function FolderDroneCard() {
  return (
    <div className="relative size-full overflow-hidden bg-[radial-gradient(circle_at_top,#f2df9d_0%,#d9b95d_18%,#295651_48%,#0f1f1b_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%,rgba(0,0,0,0.28))]" />
      <svg viewBox="0 0 220 220" className="relative h-full w-full p-6" aria-hidden="true">
        <g fill="none" strokeLinecap="round" strokeLinejoin="round">
          <g stroke="rgba(255,255,255,0.78)" strokeWidth="4">
            <line x1="42" y1="52" x2="68" y2="78" />
            <line x1="178" y1="52" x2="152" y2="78" />
            <line x1="42" y1="168" x2="68" y2="142" />
            <line x1="178" y1="168" x2="152" y2="142" />
          </g>
          <g fill="rgba(13,27,25,0.82)" stroke="rgba(255,255,255,0.7)" strokeWidth="3">
            <circle cx="54" cy="52" r="12" />
            <circle cx="166" cy="52" r="12" />
            <circle cx="54" cy="168" r="12" />
            <circle cx="166" cy="168" r="12" />
          </g>
          <g fill="rgba(17,34,31,0.92)" stroke="rgba(255,255,255,0.8)" strokeWidth="3">
            <rect x="72" y="55" width="76" height="42" rx="16" />
            <rect x="90" y="96" width="40" height="31" rx="10" />
            <path d="M111 96V136" />
            <path d="M72 74H52" />
            <path d="M148 74H168" />
            <path d="M72 146H52" />
            <path d="M148 146H168" />
          </g>
        </g>
      </svg>
      <div className="absolute inset-x-3 bottom-3 flex items-center justify-between text-[10px] font-medium uppercase tracking-[0.2em] text-white/75">
        <span>Drone</span>
        <span>folder</span>
      </div>
    </div>
  )
}

function formatSize(bytes: number) {
  if (!bytes) return '—'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const dateFormatter = new Intl.DateTimeFormat('es', { dateStyle: 'medium' })

function fileHref(file: BrowserFile) {
  if (file.isDir) return folderHref(file.path)
  if (file.directHref) return file.directHref
  if (file.shareHref) return file.shareHref
  const parent = file.path.slice(0, file.path.lastIndexOf('/')) || '/'
  return `https://www.terabox.com/main?category=all&path=${encodeURIComponent(parent)}`
}

function ShareMenu({
  file,
  className,
}: {
  file: BrowserFile
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const relativeLink = file.directHref || file.shareHref || fileHref(file)
  const link = typeof window !== 'undefined'
    ? `${window.location.origin}${relativeLink.startsWith('/') ? relativeLink : '/' + relativeLink}`
    : relativeLink

  const shareWhatsApp = () => {
    const url = encodeURIComponent(link)
    window.open(`https://wa.me/?text=${url}`, '_blank')
    setOpen(false)
  }

  const shareInstagram = () => {
    window.open(`https://instagram.com/share?url=${encodeURIComponent(link)}`, '_blank')
    setOpen(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setOpen(false)
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = link
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setOpen(false)
    }
  }

  return (
    <div className="relative inline-block">
      <Button
        size="sm"
        variant="outline"
        className={cn('h-8 w-8 p-0', className)}
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation()
          setOpen(!open)
        }}
        aria-label="Compartir"
      >
        <Share2 className="size-4" />
      </Button>
      {open && (
        <div
          className="absolute right-0 mt-2 w-48 rounded-xl border border-white/20 bg-[#164532]/95 backdrop-blur-md shadow-2xl p-2 text-white z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center gap-2 px-3 py-2 text-xs text-[#c5a059]/70 uppercase tracking-wider border-b border-white/10 mb-2">
            <span>Compartir</span>
          </div>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-white hover:bg-white/10 py-2 px-3 flex items-center gap-2"
            onClick={shareWhatsApp}
          >
            <Phone className="size-4 text-green-500 mr-2" /> WhatsApp
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-white hover:bg-white/10 py-2 px-3 flex items-center gap-2"
            onClick={shareInstagram}
          >
            <Mail className="size-4 text-[#e1306c] mr-2" /> Instagram
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-white hover:bg-white/10 py-2 px-3 flex items-center gap-2"
            onClick={copyLink}
          >
            <Share2 className="size-4 text-[#c5a059] mr-2" /> Copiar enlace
          </Button>
        </div>
      )}
    </div>
  )
}

function ItemLink({
  file,
  className,
  children,
}: {
  file: BrowserFile
  className: string
  children: React.ReactNode
}) {
  if (file.isDir || file.shareHref || file.directHref) {
    return (
      <Link href={fileHref(file)} className={className}>
        {children}
      </Link>
    )
  }
  return (
    <a href={fileHref(file)} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  )
}

export function FileBrowser({ files }: { files: BrowserFile[] }) {
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [filterMode, setFilterMode] = useState<'all' | 'vps' | 'videos' | 'folders'>('all')
  const [vpsHighlight, setVpsHighlight] = useState(false)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)

  async function deleteFile(path: string, name: string) {
    if (!window.confirm(`¿Eliminar "${name}" definitivamente?`)) return
    setDeletingFile(path)
    try {
      const response = await fetch(`/api/admin/library?path=${encodeURIComponent(path)}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error ?? 'No se pudo eliminar el archivo.')
      }
      window.location.reload()
    } catch (error) {
      setDeletingFile(null)
      alert(error instanceof Error ? error.message : 'No se pudo eliminar el archivo.')
    }
  }

  // Listen for the interactive drone jump event
  useEffect(() => {
    const handleJump = () => {
      setFilterMode('vps')
      setVpsHighlight(true)
      setTimeout(() => setVpsHighlight(false), 3800)
    }

    if (typeof window !== 'undefined') {
      if (window.location.hash === '#videoteca-vps') {
        handleJump()
      }
      window.addEventListener('teffydron:jump-to-vps', handleJump)
      return () => window.removeEventListener('teffydron:jump-to-vps', handleJump)
    }
  }, [])

  const vpsCount = useMemo(() => {
    return files.filter(
      (f) => f.cachedOnVps || f.path.startsWith('/__vps__') || f.directHref?.includes('/vps'),
    ).length
  }, [files])

  const videoCount = useMemo(() => files.filter((f) => !f.isDir && f.category === 1).length, [files])
  const folderCount = useMemo(() => files.filter((f) => f.isDir).length, [files])

  const filtered = useMemo(() => {
    let result = files

    if (filterMode === 'vps') {
      result = result.filter(
        (f) => f.cachedOnVps || f.path.startsWith('/__vps__') || f.directHref?.includes('/vps'),
      )
    } else if (filterMode === 'videos') {
      result = result.filter((f) => !f.isDir && f.category === 1)
    } else if (filterMode === 'folders') {
      result = result.filter((f) => f.isDir)
    }

    const q = query.trim().toLowerCase()
    return q ? result.filter((f) => f.name.toLowerCase().includes(q)) : result
  }, [files, filterMode, query])

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-2xl transition-all duration-700',
        vpsHighlight && 'p-3 ring-2 ring-[#d9b95d] shadow-[0_0_35px_rgba(217,185,93,0.3)] bg-[#d9b95d]/5',
      )}
      aria-label="Contenido de la carpeta"
    >
      {/* Filter Tabs & Quick Mode Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
        <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filtro de archivos">
          <button
            type="button"
            role="tab"
            aria-selected={filterMode === 'all'}
            onClick={() => setFilterMode('all')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
              filterMode === 'all'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <span>Todos</span>
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] tabular-nums">
              {files.length}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterMode === 'vps'}
            onClick={() => setFilterMode('vps')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
              filterMode === 'vps'
                ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-sm ring-1 ring-emerald-400'
                : 'border border-emerald-500/30 bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-950/40',
            )}
          >
            <Zap className="h-3.5 w-3.5 text-[#d9b95d]" />
            <span>VPS Actualizado</span>
            <span
              className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] tabular-nums font-bold',
                filterMode === 'vps' ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-300',
              )}
            >
              {vpsCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterMode === 'videos'}
            onClick={() => setFilterMode('videos')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
              filterMode === 'videos'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <FileVideo className="h-3.5 w-3.5" />
            <span>Videos</span>
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] tabular-nums">
              {videoCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={filterMode === 'folders'}
            onClick={() => setFilterMode('folders')}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
              filterMode === 'folders'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Folder className="h-3.5 w-3.5" />
            <span>Carpetas</span>
            <span className="rounded-full bg-background/20 px-1.5 py-0.2 text-[10px] tabular-nums">
              {folderCount}
            </span>
          </button>
        </div>

        <Link
          href="/?dir=%2F__vps__"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-[#d9b95d]"
        >
          <span>Biblioteca completa del VPS</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* VPS Highlight / Notice Banner */}
      {(filterMode === 'vps' || vpsHighlight) && (
        <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/35 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent p-3.5 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 text-emerald-800 dark:text-emerald-200">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              <Zap className="h-3.5 w-3.5 fill-current" />
            </span>
            <p className="leading-snug">
              <strong>Videos en almacenamiento local del VPS:</strong> listos para reproducción instantánea y descarga en alta velocidad sin cortes.
            </p>
          </div>
          {vpsHighlight && (
            <span className="inline-flex items-center gap-1 self-start rounded-full bg-[#d9b95d]/20 px-2.5 py-0.5 text-[11px] font-bold text-[#d9b95d] sm:self-auto">
              <Sparkles className="h-3 w-3" />
              ¡Llegaste desde el dron!
            </span>
          )}
        </div>
      )}

      {/* Search and View Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <label htmlFor="search" className="sr-only">
            Buscar en esta carpeta
          </label>
          <input
            id="search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en esta carpeta"
            className="h-9 w-full rounded-md border bg-background pr-3 pl-9 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <p className="text-sm text-muted-foreground">
            {filtered.length} {filtered.length === 1 ? 'elemento' : 'elementos'}
          </p>
          <div className="flex rounded-md border bg-background p-0.5" role="group" aria-label="Vista">
            {(
              [
                ['grid', LayoutGrid, 'Cuadrícula'],
                ['list', List, 'Lista'],
              ] as const
            ).map(([value, Icon, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setView(value)}
                aria-pressed={view === value}
                aria-label={label}
                className={cn(
                  'flex size-8 items-center justify-center rounded text-muted-foreground transition-colors',
                  view === value && 'bg-primary text-primary-foreground',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-background py-16 text-center">
          {filterMode === 'vps' ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                <Zap className="h-6 w-6" />
              </div>
              <div className="max-w-md">
                <p className="font-medium text-foreground">No hay copias cacheadas en esta carpeta</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Los videos de esta carpeta aún no se han sincronizado al VPS, o están en la biblioteca directa.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link
                  href="/?dir=%2F__vps__"
                  className="rounded-full bg-[#d9b95d] px-4 py-1.5 text-xs font-bold text-[#10211d] transition-transform hover:scale-105"
                >
                  Ver Biblioteca exclusiva del VPS
                </Link>
                <button
                  type="button"
                  onClick={() => setFilterMode('all')}
                  className="rounded-full border px-4 py-1.5 text-xs font-medium hover:bg-muted"
                >
                  Ver todos los archivos
                </button>
              </div>
            </>
          ) : (
            <>
              <FolderOpen className="size-8 text-muted-foreground" aria-hidden="true" />
              <p className="font-medium">
                {files.length === 0 ? 'Esta carpeta está vacía' : 'No hay resultados'}
              </p>
            </>
          )}
        </div>
      ) : view === 'grid' ? (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {filtered.map((file) => {
            const Icon = iconFor(file)
            return (
              <li key={file.fsId} className="relative group">
                {!file.isDir && !file.shareHref && (
                  <QrDialogButton
                    href={file.directHref || fileHref(file)}
                    title={file.name}
                    kind='video'
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
                {file.shareHref && (
                  <QrDialogButton
                    href={file.shareHref}
                    title={file.name}
                    kind='video'
                    className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
                <ItemLink
                  file={file}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  <div className="relative flex aspect-square items-center justify-center bg-muted/60">
                    {file.isDir ? (
                      <FolderDroneCard />
                    ) : file.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={file.thumbnail}
                        alt=""
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        className="size-full object-cover"
                      />
                    ) : (
                      <Icon
                        className={cn(
                          'size-12',
                          file.isDir ? 'fill-primary/15 text-primary' : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                    )}
                    {file.cachedOnVps && (
                      <VpsCacheIndicator className="absolute top-2 left-2 z-10" />
                    )}
                  </div>
                  <div className="flex flex-col gap-2 p-3">
                    <span className="truncate text-sm font-medium" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {file.isDir ? 'Carpeta' : formatSize(file.size)}
                    </span>
                    {!file.isDir && (
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <ShareMenu
                          file={file}
                          className="flex-1 py-1.5 text-xs text-[#c5a059] hover:bg-white/10 hover:text-white border border-white/10 rounded flex items-center justify-center gap-1"
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          className="h-8 px-2 text-xs"
                          disabled={deletingFile === file.path}
                          onClick={(e) => {
                            e.stopPropagation()
                            void deleteFile(file.path, file.name)
                          }}
                        >
                          {deletingFile === file.path ? (
                            <LoaderCircle className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </ItemLink>
              </li>
            )
          })}
        </ul>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-background">
          <ul className="divide-y">
            {filtered.map((file) => {
              const Icon = iconFor(file)
              return (
                <li key={file.fsId} className="flex items-center gap-2 pr-3">
                  <ItemLink
                    file={file}
                    className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3 hover:bg-muted/60 focus-visible:bg-muted/60 focus-visible:outline-none"
                  >
                    {file.isDir ? (
                      <div className="relative h-11 w-11 overflow-hidden rounded-lg border border-white/10 bg-muted/60">
                        <FolderDroneCard />
                      </div>
                    ) : (
                      <Icon
                        className={cn(
                          'size-5 shrink-0',
                          file.isDir ? 'fill-primary/15 text-primary' : 'text-muted-foreground',
                        )}
                        aria-hidden="true"
                      />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">
                      {file.name}
                      {file.cachedOnVps && <VpsCacheIndicator />}
                    </span>
                    <span className="hidden w-28 text-right text-sm text-muted-foreground sm:block">
                      {dateFormatter.format(file.modifiedAt)}
                    </span>
                    <span className="w-20 text-right text-sm text-muted-foreground tabular-nums">
                      {file.isDir ? '—' : formatSize(file.size)}
                    </span>
                  </ItemLink>
                  {file.shareHref ? (
                    <QrDialogButton
                      href={file.shareHref}
                      title={file.name}
                      kind={file.isDir ? 'folder' : 'video'}
                    />
                  ) : !file.isDir && (
                    <QrDialogButton
                      href={file.directHref || fileHref(file)}
                      title={file.name}
                      kind='video'
                    />
                  )}
                  {!file.isDir && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 px-2 text-xs"
                      disabled={deletingFile === file.path}
                      onClick={(e) => {
                        e.stopPropagation()
                        void deleteFile(file.path, file.name)
                      }}
                    >
                      {deletingFile === file.path ? (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-4" />
                      )}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
