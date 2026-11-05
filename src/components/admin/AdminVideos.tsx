import React, { useState } from 'react'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import styles from './Admin.module.css'

export default function AdminVideos() {
  const { siteConfig } = useAppState()
  const dispatch = useAppDispatch()
  const [url, setUrl] = useState(siteConfig.videoUrl)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    dispatch({ type: 'UPDATE_CONFIG', payload: { videoUrl: url } })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className={`glass-card ${styles.section}`}>
      <h3 className={styles.sectionTitle}>🎬 URL del Video Showreel</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 24 }}>
        Pega la URL de YouTube o Vimeo. Se convertirá automáticamente en embed para la landing page.
      </p>
      <div className="form-group" style={{ marginBottom: 20 }}>
        <label className="form-label" htmlFor="video-url">URL del video</label>
        <input
          id="video-url"
          type="url"
          className="form-input"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
        />
      </div>
      {url && (
        <div className={styles.videoPreview}>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>URL actual:</p>
          <code style={{ fontSize: 12, color: 'var(--primary)', wordBreak: 'break-all' }}>{url}</code>
        </div>
      )}
      <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
        <button className="btn btn-primary" onClick={handleSave} id="admin-save-video">
          {saved ? '✅ Guardado' : '💾 Guardar URL'}
        </button>
        {saved && <span style={{ color: '#00ff88', fontSize: 14 }}>Los cambios se reflejan en el sitio</span>}
      </div>
    </div>
  )
}
