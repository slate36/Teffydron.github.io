import React, { useState } from 'react'
import { useAppState } from '@/store/AppContext'
import { useRevealAll } from '@/hooks/useReveal'
import styles from './Reviews.module.css'

export default function Reviews() {
  const { reviews } = useAppState()
  const [current, setCurrent] = useState(0)
  useRevealAll([])

  const prev = () => setCurrent((c) => (c === 0 ? reviews.length - 1 : c - 1))
  const next = () => setCurrent((c) => (c === reviews.length - 1 ? 0 : c + 1))

  if (reviews.length === 0) return null

  const review = reviews[current]

  return (
    <section id="resenas" className={`section ${styles.reviews}`}>
      <div className={styles.bg} />
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <p className="section-tag" style={{ justifyContent: 'center' }}>
            Reseñas
          </p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            Lo que dicen nuestros <span>clientes</span>
          </h2>
        </div>

        <div className={`reveal ${styles.carousel}`}>
          <button className={styles.arrow} onClick={prev} aria-label="Anterior">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className={`${styles.card} glass-card`}>
            <div className="stars">
              {Array.from({ length: review?.rating ?? 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
            <blockquote className={styles.quote}>
              "{review?.content}"
            </blockquote>
            <div className={styles.author}>
              <div className={styles.avatar}>{review?.avatar}</div>
              <div>
                <p className={styles.authorName}>{review?.author}</p>
                <p className={styles.authorRole}>{review?.role}</p>
              </div>
            </div>
          </div>

          <button className={styles.arrow} onClick={next} aria-label="Siguiente">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>

        {/* Dots */}
        <div className={`reveal ${styles.dots}`}>
          {reviews.map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
              onClick={() => setCurrent(i)}
              aria-label={`Ir a reseña ${i + 1}`}
            />
          ))}
        </div>

        {/* Trust badges */}
        <div className={`reveal ${styles.trust}`}>
          {[
            { label: 'Pilotos certificados AESA', icon: '✈️' },
            { label: 'Seguro de responsabilidad civil', icon: '🛡️' },
            { label: '+5 años de experiencia', icon: '⭐' },
            { label: 'Disponibilidad 24/7', icon: '🕐' },
          ].map((t) => (
            <div key={t.label} className={styles.trustItem}>
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
