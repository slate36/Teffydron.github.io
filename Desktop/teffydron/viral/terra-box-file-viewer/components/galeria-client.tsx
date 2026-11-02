'use client'

import { useState } from 'react'
import { Image as ImageIcon, ArrowLeft, Play } from 'lucide-react'
import Link from 'next/link'

interface ImageItem {
  id: string
  title: string
  category: string
  url: string
  thumbnail: string
}

const sampleImages: ImageItem[] = [
  {
    id: 'img-1',
    title: 'Palermo 2026 - Final',
    category: 'torneos',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1579684348541-b2f8f2c7f6e2?w=600&h=400&fit=crop',
  },
  {
    id: 'img-2',
    title: 'Tanda A - Jugadores',
    category: 'jugadores',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1550694948-f303b982a8a1?w=600&h=400&fit=crop',
  },
  {
    id: 'img-3',
    title: 'Campo de Polo - Vista aérea',
    category: 'canchas',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abdac?w=600&h=400&fit=crop',
  },
  {
    id: 'img-4',
    title: 'Polo Juvenil',
    category: 'juvenil',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1579952363777-4227c80f8664?w=600&h=400&fit=crop',
  },
  {
    id: 'img-5',
    title: 'Abierto de Polo 2025',
    category: 'torneos',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1574398334244-9291a8492a78?w=600&h=400&fit=crop',
  },
  {
    id: 'img-6',
    title: 'Equipo de Polo',
    category: 'jugadores',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1570295989372-2c96446586d2?w=600&h=400&fit=crop',
  },
  {
    id: 'img-7',
    title: 'Partido de Polo',
    category: 'partidos',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1551943543-60c215966896?w=600&h=400&fit=crop',
  },
  {
    id: 'img-8',
    title: 'Caballos de Polo',
    category: 'caballos',
    url: '/videoteca?dir=/__vps__',
    thumbnail: 'https://images.unsplash.com/photo-1568506217692-0eb66377d62b?w=600&h=400&fit=crop',
  },
]

export function GaleriaClient() {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos')

  const categories = [
    { id: 'todos', label: 'Todas' },
    { id: 'torneos', label: 'Torneos' },
    { id: 'jugadores', label: 'Jugadores' },
    { id: 'canchas', label: 'Canchas' },
    { id: 'juvenil', label: 'Juvenil' },
    { id: 'partidos', label: 'Partidos' },
    { id: 'caballos', label: 'Caballos' },
  ]

  const filteredImages = selectedCategory === 'todos'
    ? sampleImages
    : sampleImages.filter((img) => img.category === selectedCategory)

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
              <span className="text-xs text-white/50 hidden sm:block">Galería pública</span>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col lg:flex-row lg:items-start gap-6 mb-8">
          <div className="flex-1">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-white md:text-4xl">
              Galería de Imágenes
            </h1>
            <p className="mt-2 text-[#c5a059]/70">
              Explora el mundo del polo a través de imágenes seleccionadas.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#c5a059] text-[#164532]'
                    : 'border border-white/10 text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="group rounded-xl overflow-hidden border border-white/10 bg-black/30 hover:border-[#c5a059]/50 transition-all duration-300"
            >
              <Link href={image.url} className="block">
                <div className="aspect-video relative overflow-hidden">
                  <img
                    src={image.thumbnail}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                    <div className="flex items-center gap-2 bg-[#164532]/60 backdrop-blur px-2 py-1 rounded">
                      <Play className="h-4 w-4 text-[#c5a059]" />
                      <span className="text-xs font-semibold text-white">Ver</span>
                    </div>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#c5a059] transition-colors">
                    {image.title}
                  </h3>
                  <span className="text-[10px] text-[#c5a059] uppercase tracking-wider">
                    {image.category}
                  </span>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ImageIcon className="h-12 w-12 text-white/20 mb-4" />
            <p className="text-white/50">No se encontraron imágenes en esta categoría.</p>
          </div>
        )}
      </div>
    </div>
  )
}
