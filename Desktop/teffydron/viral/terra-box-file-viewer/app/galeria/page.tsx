import type { Metadata } from 'next'
import { GaleriaClient } from '@/components/galeria-client'

export const metadata: Metadata = {
  title: 'Galería de Imágenes - Polo',
  description: 'Galería de imágenes del mundo del polo.',
}

export default function GaleriaPage() {
  return <GaleriaClient />
}
