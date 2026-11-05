import React, { useState } from 'react'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import type { GalleryImage } from '@/types'
import styles from './Admin.module.css'

const CATEGORIES: Array<GalleryImage['category']> = ['deportes', 'fpv', 'cinematica', 'aerea']

export default function AdminGallery() {
  const { gallery } = useAppState()
  const dispatch = useAppDispatch()
  const [newUrl, setNewUrl] = useState('')
  const [newAlt, setNewAlt] = useState('')
  const [newCat, setNewCat] = useState<GalleryImage['category']>('deportes')
  const [preview, setPreview] = useState(false)

  const handleAdd = () => {
    if (!newUrl.trim()) return
    const image: GalleryImage = {
      id: crypto.randomUUID(),
      src: newUrl.trim(),
      alt: newAlt.trim() || 'Imagen de drone',
      category: newCat,
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: 'ADD_IMAGE', payload: image })
    setNewUrl('')
    setNewAlt('')
    setPreview(false)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta imagen?')) {
      dispatch({ type: 'DELETE_IMAGE', payload: id })
    }
  }

  return (
    <div>
      {/* Add form */}
      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>➕ Añadir imagen</h3>
        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="gallery-url">URL de la imagen *</label>
            <input
              id="gallery-url"
              type="url"
              className="form-input"
              placeholder="https://..."
              value={newUrl}
              onChange={(e) => { setNewUrl(e.target.value); setPreview(false) }}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="gallery-alt">Descripción</label>
            <input
              id="gallery-alt"
              type="text"
              className="form-input"
              placeholder="Drone en evento deportivo..."
              value={newAlt}
              onChange={(e) => setNewAlt(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="gallery-cat">Categoría</label>
            <select
              id="gallery-cat"
              className="form-input"
              value={newCat}
              onChange={(e) => setNewCat(e.target.value as GalleryImage['category'])}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {newUrl && (
          <div className={styles.previewBox}>
            <button
              className={styles.previewToggle}
              onClick={() => setPreview((p) => !p)}
            >
              {preview ? 'Ocultar' : 'Ver'} preview
            </button>
            {preview && (
              <img src={newUrl} alt="preview" className={styles.previewImg} />
            )}
          </div>
        )}

        <div style={{ marginTop: 20 }}>
          <button
            className="btn btn-primary"
            onClick={handleAdd}
            disabled={!newUrl.trim()}
            id="admin-add-image"
          >
            ➕ Añadir a galería
          </button>
        </div>
      </div>

      {/* Gallery grid */}
      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>
          🖼️ Galería actual ({gallery.length} imágenes)
        </h3>
        <div className={styles.galleryGrid}>
          {gallery.map((img) => (
            <div key={img.id} className={styles.galleryItem}>
              <img src={img.src} alt={img.alt} />
              <div className={styles.galleryMeta}>
                <span className={styles.galleryCat}>{img.category}</span>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(img.id)}
                  aria-label="Eliminar"
                >
                  🗑️
                </button>
              </div>
              <p className={styles.galleryAlt}>{img.alt}</p>
            </div>
          ))}
        </div>

        {gallery.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            No hay imágenes. ¡Añade la primera arriba!
          </p>
        )}
      </div>
    </div>
  )
}
