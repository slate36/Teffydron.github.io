import React, { useState } from 'react'
import type { AdminSection } from '@/types'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import AdminConfig from './AdminConfig'
import AdminGallery from './AdminGallery'
import AdminReviews from './AdminReviews'
import AdminMessages from './AdminMessages'
import AdminVideos from './AdminVideos'
import styles from './AdminLayout.module.css'

const NAV_ITEMS: Array<{ id: AdminSection; label: string; icon: string }> = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'config', label: 'Configuración', icon: '⚙️' },
  { id: 'gallery', label: 'Galería', icon: '🖼️' },
  { id: 'videos', label: 'Video', icon: '🎬' },
  { id: 'reviews', label: 'Reseñas', icon: '⭐' },
  { id: 'messages', label: 'Mensajes', icon: '📩' },
]

export default function AdminLayout() {
  const [section, setSection] = useState<AdminSection>('dashboard')
  const { messages, gallery, reviews } = useAppState()
  const unread = messages.filter((m) => !m.read).length

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <span>🚁</span>
          <div>
            <p className={styles.logoText}>TeffyDron</p>
            <p className={styles.logoSub}>Panel Admin</p>
          </div>
        </div>

        <nav className={styles.sideNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${section === item.id ? styles.active : ''}`}
              onClick={() => setSection(item.id)}
              id={`admin-nav-${item.id}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.id === 'messages' && unread > 0 && (
                <span className="badge">{unread}</span>
              )}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <a href="/" className={styles.viewSite}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
            </svg>
            Ver sitio
          </a>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.topbar}>
          <h1 className={styles.pageTitle}>
            {NAV_ITEMS.find((n) => n.id === section)?.icon}{' '}
            {NAV_ITEMS.find((n) => n.id === section)?.label}
          </h1>
          <div className={styles.topbarRight}>
            <span className={styles.statusDot} />
            <span className={styles.statusText}>Sistema operativo</span>
          </div>
        </div>

        <div className={styles.content}>
          {section === 'dashboard' && (
            <AdminDashboard
              galleryCount={gallery.length}
              reviewCount={reviews.length}
              messageCount={messages.length}
              unread={unread}
              onNavigate={setSection}
            />
          )}
          {section === 'config' && <AdminConfig />}
          {section === 'gallery' && <AdminGallery />}
          {section === 'videos' && <AdminVideos />}
          {section === 'reviews' && <AdminReviews />}
          {section === 'messages' && <AdminMessages />}
        </div>
      </main>
    </div>
  )
}

function AdminDashboard({
  galleryCount,
  reviewCount,
  messageCount,
  unread,
  onNavigate,
}: {
  galleryCount: number
  reviewCount: number
  messageCount: number
  unread: number
  onNavigate: (s: AdminSection) => void
}) {
  const stats: Array<{ label: string; value: number; icon: string; section: AdminSection }> = [
    { label: 'Imágenes en galería', value: galleryCount, icon: '🖼️', section: 'gallery' },
    { label: 'Reseñas publicadas', value: reviewCount, icon: '⭐', section: 'reviews' },
    { label: 'Mensajes totales', value: messageCount, icon: '📩', section: 'messages' },
    { label: 'Sin leer', value: unread, icon: '🔔', section: 'messages' },
  ]

  return (
    <div>
      <div className={styles.dashGrid}>
        {stats.map((s) => (
          <button
            key={s.label}
            className={`${styles.dashCard} glass-card`}
            onClick={() => onNavigate(s.section)}
          >
            <span className={styles.dashIcon}>{s.icon}</span>
            <span className={styles.dashValue}>{s.value}</span>
            <span className={styles.dashLabel}>{s.label}</span>
          </button>
        ))}
      </div>

      <div className={`${styles.dashInfo} glass-card`}>
        <h3 style={{ marginBottom: 12, fontSize: '1rem' }}>Guía rápida del panel</h3>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 8, color: 'var(--text-secondary)', fontSize: 14, paddingLeft: 0 }}>
          <li>⚙️ <strong>Configuración</strong> — Nombre, WhatsApp, email, video URL, redes sociales</li>
          <li>🖼️ <strong>Galería</strong> — Añade o elimina imágenes por categoría</li>
          <li>🎬 <strong>Video</strong> — Actualiza la URL del showreel (YouTube o Vimeo)</li>
          <li>⭐ <strong>Reseñas</strong> — Gestiona los testimonios de clientes</li>
          <li>📩 <strong>Mensajes</strong> — Lee las consultas del formulario de contacto</li>
        </ul>
      </div>
    </div>
  )
}

// Suppress unused import warning
void useAppDispatch
