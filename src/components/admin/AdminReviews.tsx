import React, { useState } from 'react'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import type { Review } from '@/types'
import styles from './Admin.module.css'

const EMPTY_REVIEW: Omit<Review, 'id' | 'createdAt'> = {
  author: '',
  role: '',
  content: '',
  rating: 5,
  avatar: '',
}

export default function AdminReviews() {
  const { reviews } = useAppState()
  const dispatch = useAppDispatch()
  const [form, setForm] = useState(EMPTY_REVIEW)
  const [editing, setEditing] = useState<string | null>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const val = e.target.name === 'rating' ? Number(e.target.value) : e.target.value
    setForm((prev) => ({ ...prev, [e.target.name]: val }))
  }

  const handleSubmit = () => {
    if (!form.author.trim() || !form.content.trim()) return

    if (editing) {
      dispatch({
        type: 'UPDATE_REVIEW',
        payload: {
          id: editing,
          ...form,
          avatar: form.author.slice(0, 2).toUpperCase(),
          createdAt: reviews.find((r) => r.id === editing)?.createdAt ?? new Date().toISOString(),
        },
      })
      setEditing(null)
    } else {
      dispatch({
        type: 'ADD_REVIEW',
        payload: {
          id: crypto.randomUUID(),
          ...form,
          avatar: form.author.slice(0, 2).toUpperCase(),
          createdAt: new Date().toISOString(),
        },
      })
    }
    setForm(EMPTY_REVIEW)
  }

  const handleEdit = (review: Review) => {
    setEditing(review.id)
    setForm({
      author: review.author,
      role: review.role,
      content: review.content,
      rating: review.rating,
      avatar: review.avatar,
    })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar esta reseña?')) {
      dispatch({ type: 'DELETE_REVIEW', payload: id })
    }
  }

  return (
    <div>
      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>
          {editing ? '✏️ Editar reseña' : '➕ Nueva reseña'}
        </h3>
        <div className={styles.grid2}>
          <div className="form-group">
            <label className="form-label" htmlFor="review-author">Nombre *</label>
            <input id="review-author" name="author" type="text" className="form-input" value={form.author} onChange={handleChange} placeholder="Carlos Martínez" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="review-role">Cargo / Empresa</label>
            <input id="review-role" name="role" type="text" className="form-input" value={form.role} onChange={handleChange} placeholder="Director — Club Atlético" />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="review-rating">Puntuación</label>
            <select id="review-rating" name="rating" className="form-input" value={form.rating} onChange={handleChange}>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>{'★'.repeat(n)} ({n}/5)</option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group" style={{ marginTop: 4 }}>
          <label className="form-label" htmlFor="review-content">Reseña *</label>
          <textarea id="review-content" name="content" className="form-input" rows={4} value={form.content} onChange={handleChange} placeholder="Descripción de la experiencia..." />
        </div>
        <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={handleSubmit} id="admin-save-review">
            {editing ? '💾 Guardar cambios' : '➕ Añadir reseña'}
          </button>
          {editing && (
            <button className="btn btn-outline" onClick={() => { setEditing(null); setForm(EMPTY_REVIEW) }}>
              Cancelar
            </button>
          )}
        </div>
      </div>

      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>⭐ Reseñas ({reviews.length})</h3>
        <div className={styles.reviewList}>
          {reviews.map((r) => (
            <div key={r.id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <div className={styles.reviewAvatar}>{r.avatar}</div>
                <div>
                  <p className={styles.reviewAuthor}>{r.author}</p>
                  <p className={styles.reviewRole}>{r.role}</p>
                  <div className="stars" style={{ fontSize: 14, marginTop: 4 }}>
                    {'★'.repeat(r.rating)}
                  </div>
                </div>
                <div className={styles.reviewActions}>
                  <button onClick={() => handleEdit(r)} aria-label="Editar" className={styles.editBtn}>✏️</button>
                  <button onClick={() => handleDelete(r.id)} aria-label="Eliminar" className={styles.deleteBtn}>🗑️</button>
                </div>
              </div>
              <p className={styles.reviewContent}>"{r.content}"</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '30px 0' }}>
              No hay reseñas. ¡Añade la primera!
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
