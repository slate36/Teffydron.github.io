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
    <div className="relative size-full overflow-hidden bg-gradient-to-b from-[#113828] via-[#164532] to-[#0c241a] select-none">
      {/* Patrón de césped cortado alternado típico de cancha de polo */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 18px, transparent 18px, transparent 36px)',
        }}
      />

      {/* Iluminación cenital dorada */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(197,160,89,0.18)_0%,transparent_75%)]" />

      {/* Emblema polista: Tacos cruzados, bocha de polo y retícula aérea */}
      <svg
        viewBox="0 0 220 220"
        className="relative h-full w-full p-2.5 sm:p-4 transition-transform duration-500 group-hover:scale-105"
        aria-hidden="true"
      >
        <defs>
          {/* Gradiente dorado para tacos y marco */}
          <linearGradient id="poloGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#faecd0" />
            <stop offset="45%" stopColor="#c5a059" />
            <stop offset="100%" stopColor="#8d6b2c" />
          </linearGradient>

          {/* Gradiente de madera de tipa para la cabeza del mazo */}
          <linearGradient id="malletWood" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d9b36d" />
            <stop offset="50%" stopColor="#8f632b" />
            <stop offset="100%" stopColor="#5a3d16" />
          </linearGradient>

          {/* Gradiente esférico 3D para la bocha de polo */}
          <radialGradient id="poloBall" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#eae6dc" />
            <stop offset="85%" stopColor="#c2bab0" />
            <stop offset="100%" stopColor="#8b8478" />
          </radialGradient>

          {/* Sombra para bocha y mazos */}
          <filter id="poloShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.55" />
          </filter>
        </defs>

        {/* 1. Líneas de cancha de polo y esquinas de mira aérea (dron) */}
        <g stroke="#c5a059" strokeOpacity="0.35" fill="none">
          <rect x="18" y="18" width="184" height="184" rx="10" strokeWidth="1" strokeDasharray="4 4" />
          {/* Retícula de esquinas de cámara */}
          <path d="M 28 40 L 28 28 L 40 28" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 192 40 L 192 28 L 180 28" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 28 180 L 28 192 L 40 192" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 192 180 L 192 192 L 180 192" strokeWidth="2.5" strokeLinecap="round" />
        </g>

        {/* 2. Escudo central heráldico */}
        <g filter="url(#poloShadow)">
          <circle cx="110" cy="110" r="56" fill="#0d261b" fillOpacity="0.88" stroke="url(#poloGold)" strokeWidth="1.5" />
          <circle cx="110" cy="110" r="51" fill="none" stroke="#c5a059" strokeWidth="0.8" strokeOpacity="0.5" strokeDasharray="3 3" />

          {/* 3. Tacos de polo cruzados (Mallets) */}
          {/* Taco 1: Inferior izquierdo a superior derecho */}
          <g>
            <line x1="56" y1="164" x2="164" y2="56" stroke="url(#poloGold)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Empuñadura envuelta */}
            <line x1="56" y1="164" x2="72" y2="148" stroke="#f4f1ea" strokeWidth="5" strokeLinecap="round" />
            <line x1="57" y1="163" x2="60" y2="160" stroke="#c5a059" strokeWidth="4" />
            {/* Cabeza cilíndrica de madera de polo */}
            <g transform="translate(164, 56) rotate(45)">
              <rect x="-14" y="-5" width="28" height="10" rx="3.5" fill="url(#malletWood)" stroke="#c5a059" strokeWidth="1" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#faecd0" strokeWidth="1" strokeOpacity="0.6" />
            </g>
          </g>

          {/* Taco 2: Inferior derecho a superior izquierdo */}
          <g>
            <line x1="164" y1="164" x2="56" y2="56" stroke="url(#poloGold)" strokeWidth="3.5" strokeLinecap="round" />
            {/* Empuñadura envuelta */}
            <line x1="164" y1="164" x2="148" y2="148" stroke="#f4f1ea" strokeWidth="5" strokeLinecap="round" />
            <line x1="163" y1="163" x2="160" y2="160" stroke="#c5a059" strokeWidth="4" />
            {/* Cabeza cilíndrica */}
            <g transform="translate(56, 56) rotate(-45)">
              <rect x="-14" y="-5" width="28" height="10" rx="3.5" fill="url(#malletWood)" stroke="#c5a059" strokeWidth="1" />
              <line x1="0" y1="-5" x2="0" y2="5" stroke="#faecd0" strokeWidth="1" strokeOpacity="0.6" />
            </g>
          </g>

          {/* 4. Herradura / Corona ecuestre */}
          <g fill="#c5a059" opacity="0.9">
            <path d="M 104 80 C 103 72, 106 68, 110 68 C 114 68, 117 72, 116 80 L 113.5 80 C 114 74, 112 70.5, 110 70.5 C 108 70.5, 106 74, 106.5 80 Z" />
            <circle cx="105" cy="79" r="0.9" fill="#0d261b" />
            <circle cx="115" cy="79" r="0.9" fill="#0d261b" />
            <circle cx="106" cy="74" r="0.9" fill="#0d261b" />
            <circle cx="114" cy="74" r="0.9" fill="#0d261b" />
          </g>

          {/* 5. Bocha de Polo central */}
          <ellipse cx="110" cy="115" rx="14" ry="4" fill="#000000" fillOpacity="0.4" />
          <circle cx="110" cy="110" r="14" fill="url(#poloBall)" stroke="#ffffff" strokeWidth="1" />
          <path d="M 104 105 A 7 7 0 0 1 113 115" fill="none" stroke="#b0a99c" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M 107 103 A 7 7 0 0 1 116 113" fill="none" stroke="#ffffff" strokeWidth="0.8" strokeLinecap="round" />
        </g>
      </svg>

      {/* Detalle superior: Distintivo de polo */}
      <div className="absolute top-2 inset-x-2.5 flex items-center justify-between text-[9px] font-semibold uppercase tracking-[0.18em] text-[#e8d5aa]">
        <span className="flex items-center gap-1 rounded bg-black/50 px-1.5 py-0.5 border border-[#c5a059]/30 backdrop-blur-xs">
          <span className="size-1.5 rounded-full bg-[#c5a059] animate-pulse" />
          Polo
        </span>
        <span className="text-white/60 text-[8px] tracking-widest font-mono">
          Chukker
        </span>
      </div>

      {/* Detalle inferior: Etiqueta de carpeta polera */}
      <div className="absolute inset-x-2 bottom-2 flex items-center justify-center">
        <div className="flex items-center gap-1.5 rounded-md border border-[#c5a059]/35 bg-[#0f281e]/90 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.22em] text-[#e8d5aa] backdrop-blur-sm shadow-sm">
          <span className="text-[#c5a059] text-[8px]">★</span>
          <span>Carpeta</span>
          <span className="text-[#c5a059] text-[8px]">★</span>
        </div>
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
