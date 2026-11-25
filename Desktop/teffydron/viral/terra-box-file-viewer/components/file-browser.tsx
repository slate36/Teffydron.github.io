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
    <div className="relative size-full overflow-hidden bg-gradient-to-b from-[#081c13] via-[#0f2b1d] to-[#05140d] select-none">
      {/* Sutil halo cenital dorado */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_48%,rgba(197,160,89,0.14)_0%,transparent_68%)] pointer-events-none" />

      {/* Silueta ecuestre de polo ultra estilizada y esbelta */}
      <svg
        viewBox="0 0 200 200"
        className="relative h-full w-full p-2.5 sm:p-3.5 transition-transform duration-500 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          {/* Oro champán metálico refinado */}
          <linearGradient id="poloGoldRefined" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdf3dc" />
            <stop offset="35%" stopColor="#e2bf72" />
            <stop offset="70%" stopColor="#c89f4b" />
            <stop offset="100%" stopColor="#8a6721" />
          </linearGradient>

          {/* Sombra suave de volumen */}
          <filter id="poloEliteShadow" x="-15%" y="-15%" width="130%" height="130%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#000000" floodOpacity="0.7" />
          </filter>
        </defs>

        {/* Marco perimetral fino y sofisticado */}
        <rect
          x="11"
          y="11"
          width="178"
          height="178"
          rx="14"
          fill="none"
          stroke="#c5a059"
          strokeWidth="0.65"
          strokeOpacity="0.22"
          strokeDasharray="3 3"
        />
        <circle
          cx="100"
          cy="98"
          r="66"
          fill="none"
          stroke="#c5a059"
          strokeWidth="0.5"
          strokeOpacity="0.15"
        />

        {/* SILUETA DE POLO ESBELTA Y DINÁMICA */}
        <g fill="url(#poloGoldRefined)" filter="url(#poloEliteShadow)">
          {/* Caballo de polo: Purasangre esbelto y aerodinámico en pleno galope */}
          <path d="
            M 132 82
            C 134 80, 138 78, 145 76
            C 152 74, 158 75, 162 78
            C 164 80, 162 82, 158 83
            C 152 84, 147 84, 142 88
            C 137 92, 134 97, 132 102
            C 128 107, 122 108, 115 107
            C 106 105, 96 104, 86 107
            C 77 110, 70 113, 62 111
            C 57 109, 56 104, 60 99
            C 64 93, 72 89, 81 87
            C 93 85, 105 87, 114 84
            C 121 82, 127 77, 131 71
            C 133 68, 136 67, 138 70
            C 140 73, 136 78, 132 82
            Z
          " />

          {/* Cabeza estilizada y perfil fino */}
          <path d="
            M 145 76
            C 150 73, 156 74, 161 77
            C 163 79, 161 81, 157 82
            C 151 83, 146 83, 142 86
            Z
          " />
          {/* Orejas alertas */}
          <path d="M 143 75 L 145 68 L 148 76 Z" />
          <path d="M 147 76 L 149 70 L 151 77 Z" />

          {/* Cola ondulada en el viento */}
          <path d="
            M 60 101
            C 52 103, 40 108, 30 117
            C 37 114, 48 109, 58 107
            Z
          " />

          {/* Pata delantera extendida al frente (fina y en plena zancada) */}
          <path d="
            M 132 101
            C 139 108, 151 116, 166 122
            C 169 123, 168 124, 165 124
            C 150 119, 138 111, 129 104
            Z
          " />
          <polygon points="166,122 170,123 169,125 165,124" />

          {/* Pata delantera recogida en suspensión */}
          <path d="
            M 128 104
            C 131 111, 132 119, 128 126
            C 126 128, 123 127, 124 124
            C 126 118, 126 111, 125 106
            Z
          " />
          <polygon points="127,125 129,128 126,129 124,126" />

          {/* Pata trasera extendida en impulso */}
          <path d="
            M 64 109
            C 56 118, 44 128, 28 135
            C 26 136, 26 135, 28 133
            C 43 126, 54 116, 62 107
            Z
          " />
          <polygon points="28,135 25,137 26,138 29,136" />

          {/* Pata trasera recogida */}
          <path d="
            M 72 108
            C 68 116, 63 125, 58 134
            C 57 135, 55 134, 56 132
            C 61 124, 65 115, 69 108
            Z
          " />
          <polygon points="58,134 56,137 54,136 57,133" />

          {/* JINETE DE POLO (Silueta atlética y aerodinámica) */}
          {/* Casco con visera fina */}
          <ellipse cx="106" cy="67" rx="4.5" ry="4" />
          <path d="M 109 68 L 115 69 L 110 71 Z" />

          {/* Torso esbelto inclinado hacia adelante */}
          <path d="
            M 103 70
            C 106 71, 110 73, 112 78
            C 114 83, 112 89, 108 94
            C 105 97, 100 99, 97 97
            C 95 93, 96 85, 98 79
            C 99 74, 101 70, 103 70
            Z
          " />

          {/* Pierna en estribo con bota de polo */}
          <path d="
            M 103 94
            C 104 100, 107 106, 110 111
            C 111 113, 109 114, 107 113
            C 104 108, 101 101, 100 96
            Z
          " />
          <path d="M 108 111 L 113 112 L 109 114 Z" />

          {/* Brazo izquierdo llevando las riendas */}
          <path d="
            M 107 76
            C 113 79, 120 84, 125 87
            L 123 89
            C 118 86, 112 81, 106 78
            Z
          " />
          <path d="M 124 88 C 131 90, 140 92, 148 94" fill="none" stroke="#e2bf72" strokeWidth="0.75" />

          {/* Brazo derecho alzando el taco de polo hacia atrás */}
          <path d="
            M 102 74
            C 97 71, 89 68, 83 66
            L 84 64
            C 90 66, 98 70, 103 73
            Z
          " />

          {/* Vara del taco de polo (Fina, recta y esbelta) */}
          <line x1="84" y1="65" x2="52" y2="28" stroke="#fdf3dc" strokeWidth="1.2" strokeLinecap="round" />
          {/* Cabeza del taco de polo */}
          <g transform="translate(52, 28) rotate(40)">
            <rect x="-7" y="-2" width="14" height="4" rx="1.5" fill="#c89f4b" stroke="#fdf3dc" strokeWidth="0.35" />
          </g>

          {/* Bocha de polo en el césped */}
          <circle cx="174" cy="128" r="3" fill="#ffffff" />
          <circle cx="180" cy="128" r="1.2" fill="#c89f4b" opacity="0.6" />
        </g>

        {/* Tipografía sobria y distinguida estilo club de polo */}
        <text
          x="100"
          y="32"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="8.5"
          fontWeight="600"
          fill="#e8d5aa"
          letterSpacing="3.8"
          textAnchor="middle"
          opacity="0.9"
        >
          POLO CLUB
        </text>

        <text
          x="100"
          y="174"
          fontFamily="'Playfair Display', Georgia, serif"
          fontSize="7.5"
          fontWeight="500"
          fill="#c5a059"
          letterSpacing="3.2"
          textAnchor="middle"
          opacity="0.85"
        >
          CARPETA
        </text>
      </svg>
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
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide" role="tablist" aria-label="Filtro de archivos">
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
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
                  className="group flex h-full flex-col overflow-hidden rounded-xl border bg-background transition-all duration-300 hover:border-[#c5a059]/50 hover:shadow-lg hover:shadow-[#c5a059]/5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
                            className="h-9 px-2.5 text-xs sm:text-sm"
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
                <li key={file.fsId} className="flex items-center gap-2 pr-3 min-h-[64px] sm:min-h-auto">
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
                      className="h-9 px-2.5 text-xs sm:text-sm"
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
