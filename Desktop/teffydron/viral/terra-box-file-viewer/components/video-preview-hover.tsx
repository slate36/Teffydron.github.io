'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Play, Image as ImageIcon, FileText, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VideoPreviewButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState<string | null>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  // Videos simulados del VPS (se pueden reemplazar con llamadas reales a la API)
  const sampleVideos = [
    {
      id: '1',
      title: 'Polo Palermo 2026 - Chukker 1',
      duration: '2:15',
      thumbnail: 'https://images.unsplash.com/photo-1579684348541-b2f8f2c7f6e2?w=400&h=225&fit=crop',
      url: '/videoteca?dir=/__vps__',
    },
    {
      id: '2',
      title: 'Tanda A - Abierto de Polo',
      duration: '3:40',
      thumbnail: 'https://images.unsplash.com/photo-1550694948-f303b982a8a1?w=400&h=225&fit=crop',
      url: '/videoteca?dir=/__vps__',
    },
    {
      id: '3',
      title: 'Polo Juvenil - Final',
      duration: '1:50',
      thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abdac?w=400&h=225&fit=crop',
      url: '/videoteca?dir=/__vps__',
    },
  ]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        if (previewRef.current && !previewRef.current.contains(event.target as Node)) {
          setIsOpen(false)
          setPreviewUrl(null)
          setPreviewTitle(null)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative inline-block" ref={buttonRef}>
      <Link
        href="/videoteca"
        className="group relative inline-flex items-center gap-4 overflow-hidden rounded-xl border border-[#c5a059] bg-gradient-to-r from-[#c5a059] via-[#ebd7b2] to-[#c5a059] px-9 py-5 text-[#164532] shadow-[0_12px_35px_rgba(197,160,89,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_45px_rgba(197,160,89,0.5)]"
      >
        {/* Detailed Luxury Drone Icon */}
        <div className="relative flex h-12 w-14 items-center justify-center rounded-xl bg-[#164532] p-1.5 shadow-inner">
          <svg
            viewBox="0 0 48 36"
            className="h-full w-full transition-transform duration-300 group-hover:rotate-6"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line x1="8" y1="8" x2="24" y2="18" stroke="#c5a059" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="8" x2="24" y2="18" stroke="#c5a059" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="8" y1="28" x2="24" y2="18" stroke="#c5a059" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="40" y1="28" x2="24" y2="18" stroke="#c5a059" strokeWidth="2.5" strokeLinecap="round" />
            <ellipse cx="8" cy="8" rx="7" ry="2" fill="#e8d5aa" opacity="0.85" />
            <ellipse cx="40" cy="8" rx="7" ry="2" fill="#e8d5aa" opacity="0.85" />
            <ellipse cx="8" cy="28" rx="7" ry="2" fill="#e8d5aa" opacity="0.85" />
            <ellipse cx="40" cy="28" rx="7" ry="2" fill="#e8d5aa" opacity="0.85" />
            <ellipse cx="24" cy="18" rx="7" ry="5" fill="#c5a059" stroke="#e8d5aa" strokeWidth="1" />
            <circle cx="24" cy="18" r="2.5" fill="#164532" />
          </svg>
        </div>

        <div className="flex flex-col text-left">
          <span className="font-serif text-2xl font-bold tracking-tight text-[#164532] md:text-3xl">
            Videos de Dron
          </span>
          <span className="text-[11px] font-semibold tracking-widest uppercase text-[#3e2c14]/85">
            Ingresar a la Videoteca
          </span>
        </div>

        <ArrowRight className="ml-2 h-6 w-6 text-[#164532] transition-transform duration-300 group-hover:translate-x-2" />

        {/* Preview trigger on hover/focus */}
        <div
          className="absolute inset-0 z-20"
          onMouseEnter={() => {
            setIsOpen(true)
            setPreviewUrl(sampleVideos[0].thumbnail)
            setPreviewTitle(sampleVideos[0].title)
          }}
          onMouseLeave={() => setIsOpen(false)}
          onFocus={() => {
            setIsOpen(true)
            setPreviewUrl(sampleVideos[0].thumbnail)
            setPreviewTitle(sampleVideos[0].title)
          }}
          onBlur={() => setIsOpen(false)}
        />
      </Link>

      {/* Video Preview Popup */}
      {isOpen && previewUrl && (
        <div
          ref={previewRef}
          className="absolute top-full left-0 mt-4 w-80 rounded-xl border border-[#c5a059]/30 bg-[#164532]/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold tracking-widest text-[#c5a059] uppercase">
                Vista previa
              </span>
              <button
                onClick={() => {
                  setIsOpen(false)
                  setPreviewUrl(null)
                  setPreviewTitle(null)
                }}
                className="p-1 rounded hover:bg-white/10"
              >
                <span className="sr-only">Cerrar</span>
                <span className="text-white/50">✕</span>
              </button>
            </div>
            <div className="aspect-video w-full rounded-lg overflow-hidden bg-[#164532] border border-white/10">
              <img
                src={previewUrl}
                alt={previewTitle || 'Video'}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex items-center gap-2 bg-[#164532]/80 backdrop-blur px-3 py-1.5 rounded-full">
                  <Play className="h-5 w-5 text-[#c5a059]" />
                  <span className="text-xs font-bold text-white">Ver video</span>
                </div>
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-sm font-semibold text-white">{previewTitle || 'Video de polo'}</h3>
              <p className="text-xs text-[#c5a059]/70">Haz clic para ver el video completo</p>
            </div>
          </div>
          <div className="border-t border-white/10">
            <Link
              href="/videoteca"
              className="block w-full px-4 py-3 text-center text-xs font-bold text-[#c5a059] hover:bg-white/5 transition-colors"
            >
              Abrir Videoteca <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export function ImagesButton() {
  return (
    <Link
      href="/galeria"
      className="group relative inline-flex items-center gap-4 overflow-hidden rounded-2xl border border-[#c5a059] bg-gradient-to-r from-[#c5a059] via-[#ebd7b2] to-[#c5a059] px-9 py-5 text-[#164532] shadow-[0_12px_35px_rgba(197,160,89,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_45px_rgba(197,160,89,0.5)]"
    >
      <div className="relative flex h-12 w-14 items-center justify-center rounded-xl bg-[#164532] p-1.5 shadow-inner">
        <ImageIcon className="h-full w-full text-[#c5a059]" />
      </div>

      <div className="flex flex-col text-left">
        <span className="font-serif text-2xl font-bold tracking-tight text-[#164532] md:text-3xl">
          Imágenes
        </span>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#3e2c14]/85">
          Galería de fotos
        </span>
      </div>

      <ArrowRight className="ml-2 h-6 w-6 text-[#164532] transition-transform duration-300 group-hover:translate-x-2" />
    </Link>
  )
}

export function MagazinesButton() {
  return (
    <Link
      href="/revistas"
      className="group relative inline-flex items-center gap-4 overflow-hidden rounded-2xl border border-[#c5a059] bg-gradient-to-r from-[#c5a059] via-[#ebd7b2] to-[#c5a059] px-9 py-5 text-[#164532] shadow-[0_12px_35px_rgba(197,160,89,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_16px_45px_rgba(197,160,89,0.5)]"
    >
      <div className="relative flex h-12 w-14 items-center justify-center rounded-xl bg-[#164532] p-1.5 shadow-inner">
        <FileText className="h-full w-full text-[#c5a059]" />
      </div>

      <div className="flex flex-col text-left">
        <span className="font-serif text-2xl font-bold tracking-tight text-[#164532] md:text-3xl">
          Revistas
        </span>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#3e2c14]/85">
          PDFs y publicaciones
        </span>
      </div>

      <ArrowRight className="ml-2 h-6 w-6 text-[#164532] transition-transform duration-300 group-hover:translate-x-2" />
    </Link>
  )
}
