import React, { useState } from 'react'
import { useAppState } from '@/store/AppContext'
import { useRevealAll } from '@/hooks/useReveal'
import type { GalleryImage } from '@/types'
import styles from './Gallery.module.css'

const CATEGORIES: Array<{ key: GalleryImage['category'] | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'deportes', label: 'Deportes' },
  { key: 'fpv', label: 'FPV Racing' },
  { key: 'cinematica', label: 'Cinematografía' },
  { key: 'aerea', label: 'Aérea' },
]

export default function Gallery() {
  const { gallery } = useAppState()
  const [filter, setFilter] = useState<GalleryImage['category'] | 'all'>('all')
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null)
  useRevealAll([filter])

  const filtered =
    filter === 'all' ? gallery : gallery.filter((img) => img.category === filter)

  return (
    <section id="galeria" className={`section ${styles.galery}`}>
      <div className="container">
        <div className="reveal">
          <p className="section-tag">Galería</p>
          <h2 className="section-title">
            Momentos que <span>definen el deporte</span>
          </h2>
          <p className="section-subtitle">
            Una selección de nuestros mejores trabajos en eventos deportivos por toda Europa.
          </p>
        </div>

        {/* Filters */}
        <div className={`reveal ${styles.filters}`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              className={`${styles.filterBtn} ${filter === cat.key ? styles.active : ''}`}
              onClick={() => setFilter(cat.key)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className={styles.grid}>
          {filtered.map((img, i) => (
            <div
              key={img.id}
              className={`reveal reveal-delay-${Math.min((i % 4) + 1, 5)} ${styles.item}`}
              onClick={() => setLightbox(img)}
            >
              <img src={img.src} alt={img.alt} loading="lazy" />
              <div className={styles.itemOverlay}>
                <span className={styles.itemCat}>{img.category}</span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35M11 8v6M8 11h6" />
                </svg>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className={styles.empty}>
            <p>No hay imágenes en esta categoría. ¡Añade desde el panel admin!</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className={styles.lightbox}
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista de imagen"
        >
          <button className={styles.lightboxClose} onClick={() => setLightbox(null)}>
            ✕
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            onClick={(e) => e.stopPropagation()}
          />
          <p className={styles.lightboxCaption}>{lightbox.alt}</p>
        </div>
      )}
    </section>
  )
}
