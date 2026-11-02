import type { Metadata } from 'next'
import { getViewer } from '@/lib/viewer'
import { FileText, ArrowLeft, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Revistas - Polo',
  description: 'Revistas y publicaciones del mundo del polo.',
}

interface Magazine {
  id: string
  title: string
  description: string
  date: string
  type: 'pdf' | 'link'
  url: string
  cover: string
}

const magazines: Magazine[] = [
  {
    id: 'rev-1',
    title: 'Polo Life - Edición Primavera 2026',
    description: 'La revista oficial del Abierto de Palermo con las mejores tomas aéreas y entrevistas.',
    date: 'Oct 2026',
    type: 'pdf',
    url: '/docs/polo-life-primavera-2026.pdf',
    cover: 'https://images.unsplash.com/photo-1574398334244-9291a8492a78?w=400&h=500&fit=crop',
  },
  {
    id: 'rev-2',
    title: 'Polo Argentino - Anuario 2026',
    description: 'Anuario completo con estadísticas, jugadores y resultados de la temporada.',
    date: 'Sep 2026',
    type: 'pdf',
    url: '/docs/polo-anuario-2026.pdf',
    cover: 'https://images.unsplash.com/photo-1550694948-f303b982a8a1?w=400&h=500&fit=crop',
  },
  {
    id: 'rev-3',
    title: 'Guía de Campos de Polo',
    description: 'Directorio de las mejores canchas y clubes de polo en Argentina y Uruguay.',
    date: 'Ago 2026',
    type: 'link',
    url: 'https://example.com/campos-polo',
    cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abdac?w=400&h=500&fit=crop',
  },
  {
    id: 'rev-4',
    title: 'Polo Juvenil - Prospectos 2026',
    description: 'Los jóvenes talentos del polo que marcarán el futuro del deporte.',
    date: 'Jul 2026',
    type: 'pdf',
    url: '/docs/polo-juvenil-2026.pdf',
    cover: 'https://images.unsplash.com/photo-1579952363777-4227c80f8664?w=400&h=500&fit=crop',
  },
  {
    id: 'rev-5',
    title: 'Revista TefyDron - Especial Aéreo',
    description: 'Edición especial con las mejores tomas de drone del polo argentino.',
    date: 'Jun 2026',
    type: 'pdf',
    url: '/docs/tefydron-especial-aereo.pdf',
    cover: 'https://images.unsplash.com/photo-1579684348541-b2f8f2c7f6e2?w=400&h=500&fit=crop',
  },
]

export default async function RevistasPage() {
  const viewer = await getViewer().catch(() => null)

  return (
    <div className="min-h-screen bg-[#164532] text-white">
      <header className="border-b border-white/10 bg-[#164532]/80 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4 text-[#c5a059]" />
              <span className="font-serif text-lg font-bold">Volver al inicio</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/50 hidden sm:block">
                {viewer ? `@${viewer.handle}` : 'Invitado'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold tracking-tight text-white md:text-4xl">
            Revistas y Publicaciones
          </h1>
          <p className="mt-2 text-[#c5a059]/70">
            Descarga nuestras revistas o visita los enlaces relacionados con el mundo del polo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {magazines.map((mag) => (
            <div
              key={mag.id}
              className="rounded-xl overflow-hidden border border-white/10 bg-black/30 hover:border-[#c5a059]/50 transition-all duration-300"
            >
              <div className="aspect-[3/4] relative overflow-hidden">
                <img
                  src={mag.cover}
                  alt={mag.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {mag.type === 'pdf' ? (
                    <div className="flex items-center gap-2 bg-[#c5a059] px-3 py-1.5 rounded-full">
                      <FileText className="h-4 w-4 text-[#164532]" />
                      <span className="text-xs font-bold text-[#164532]">Descargar PDF</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#c5a059] px-3 py-1.5 rounded-full">
                      <ExternalLink className="h-4 w-4 text-[#164532]" />
                      <span className="text-xs font-bold text-[#164532]">Ver en línea</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm font-semibold text-white group-hover:text-[#c5a059] transition-colors mb-1">
                  {mag.title}
                </h3>
                <p className="text-xs text-[#c5a059]/70">{mag.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-white/50">{mag.date}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    mag.type === 'pdf'
                      ? 'bg-[#c5a059]/20 text-[#c5a059]'
                      : 'bg-white/10 text-white/60'
                  }`}>
                    {mag.type === 'pdf' ? 'PDF' : 'ENLACE'}
                  </span>
                </div>
              </div>
              <div className="bg-black/40 border-t border-white/10 px-4 py-3">
                <Link
                  href={mag.url}
                  target={mag.type === 'link' ? '_blank' : undefined}
                  rel={mag.type === 'link' ? 'noopener noreferrer' : undefined}
                  className="block w-full text-center text-xs font-bold text-[#c5a059] hover:bg-[#c5a059]/20 hover:text-[#164532] py-2 rounded transition-colors"
                >
                  {mag.type === 'pdf' ? 'Descargar Revista' : 'Ir al Enlace'}
                  <ExternalLink className="h-3 w-3 inline ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
