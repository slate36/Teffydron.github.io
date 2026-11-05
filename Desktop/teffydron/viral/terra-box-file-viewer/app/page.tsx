import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, User, Zap } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { getViewer } from '@/lib/viewer'
import { VideoPreviewButton, ImagesButton, MagazinesButton } from '@/components/video-preview-hover'

export const metadata: Metadata = {
  title: 'Videoteca de Polo',
  description: 'Archivo audiovisual y tomas aéreas del polo por Teffydron.',
}

export default async function HomePage() {
  const viewer = await getViewer().catch(() => null)

  return (
    <div className="min-h-screen bg-[#164532] text-white flex flex-col justify-between">
      {/* 1. Header with Title, Subtitle, and Interactive Drone */}
      <SiteHeader
        title="Videoteca de Polo"
        subtitle="Archivo audiovisual y tomas aéreas exclusivas del polo."
        showDroneHero={true}
      />

      {/* 2. Main Entrance: Action Buttons */}
      <main className="mx-auto max-w-7xl px-4 py-12 w-full flex-1 flex flex-col items-center justify-center gap-8 text-center">
        <div className="flex flex-wrap items-center justify-center gap-6">
          {/* Videos de Dron Button with Preview */}
          <VideoPreviewButton />

          {/* Imágenes Button */}
          <ImagesButton />

          {/* Revistas Button */}
          <MagazinesButton />

          {/* Profile companion button */}
          <Link
            href="/perfil"
            className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/5 px-6 py-5 text-sm font-semibold text-white transition-all hover:border-[#c5a059] hover:bg-white/10"
          >
            <User className="h-5 w-5 text-[#c5a059]" />
            <span>{viewer ? `@${viewer.handle}` : 'Mi Perfil'}</span>
          </Link>
        </div>

        {/* 3. Discreet Information and Details below */}
        <div className="w-full max-w-3xl pt-6 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            {/* Stat 1 */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">Calidad</span>
              <span className="mt-1 font-serif text-lg font-bold text-white">4K</span>
              <span className="text-xs text-white/55">tomas aéreas</span>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02] border-y sm:border-y-0 sm:border-x border-white/10">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">Servidor</span>
              <span className="mt-1 font-serif text-lg font-bold text-white">VPS</span>
              <span className="text-xs text-white/55">streaming directo</span>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059]">Disciplina</span>
              <span className="mt-1 font-serif text-lg font-bold text-white">Polo</span>
              <span className="text-xs text-white/55">partidos y chukkers</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-6 text-xs text-white/50">
            <Link href="/videoteca?dir=%2F__vps__" className="hover:text-[#c5a059] transition-colors flex items-center gap-1">
              <Zap className="h-3 w-3 text-[#c5a059]" />
              Biblioteca local del VPS
            </Link>
            <span>•</span>
            <Link href="/galeria" className="hover:text-[#c5a059] transition-colors flex items-center gap-1">
              Galería de imágenes
            </Link>
            <span>•</span>
            <Link href="/revistas" className="hover:text-[#c5a059] transition-colors flex items-center gap-1">
              Revistas y PDFs
            </Link>
            <span>•</span>
            <Link href="/perfil" className="hover:text-[#c5a059] transition-colors">
              Comunidad y perfil
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
