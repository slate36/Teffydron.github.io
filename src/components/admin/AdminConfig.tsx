import React, { useState } from 'react'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import { DEFAULT_CONFIG } from '@/store/defaults'
import styles from './Admin.module.css'

export default function AdminConfig() {
  const { siteConfig } = useAppState()
  const dispatch = useAppDispatch()
  const [form, setForm] = useState(siteConfig)
  const [saved, setSaved] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = () => {
    dispatch({ type: 'UPDATE_CONFIG', payload: form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    if (confirm('¿Resetear configuración a valores por defecto?')) {
      setForm(DEFAULT_CONFIG)
      dispatch({ type: 'UPDATE_CONFIG', payload: DEFAULT_CONFIG })
    }
  }

  return (
    <div className={styles.configWrap}>
      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>🏢 Información de la empresa</h3>
        <div className={styles.grid2}>
          <Field label="Nombre de la empresa" name="companyName" value={form.companyName} onChange={handleChange} />
          <Field label="Email de contacto" name="contactEmail" value={form.contactEmail} onChange={handleChange} type="email" />
          <Field label="Número WhatsApp (con código país, sin +)" name="whatsappNumber" value={form.whatsappNumber} onChange={handleChange} placeholder="34600000000" />
          <Field label="URL Instagram" name="instagramUrl" value={form.instagramUrl} onChange={handleChange} type="url" />
          <Field label="URL YouTube" name="youtubeUrl" value={form.youtubeUrl} onChange={handleChange} type="url" />
          <Field label="URL Facebook" name="facebookUrl" value={form.facebookUrl} onChange={handleChange} type="url" />
        </div>
      </div>

      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>🎯 Textos del Hero</h3>
        <Field label="Tagline principal" name="tagline" value={form.tagline} onChange={handleChange} />
        <div className="form-group" style={{ marginTop: 16 }}>
          <label className="form-label">Subtítulo del hero</label>
          <textarea name="heroSubtitle" className="form-input" value={form.heroSubtitle} onChange={handleChange} rows={3} />
        </div>
        <div style={{ marginTop: 16 }}>
          <Field label="Texto del footer" name="footerText" value={form.footerText} onChange={handleChange} />
        </div>
      </div>

      <div className={`glass-card ${styles.section}`}>
        <h3 className={styles.sectionTitle}>🎬 Video Showreel</h3>
        <Field
          label="URL del video (YouTube o Vimeo)"
          name="videoUrl"
          value={form.videoUrl}
          onChange={handleChange}
          placeholder="https://www.youtube.com/watch?v=..."
          type="url"
        />
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          Pega la URL normal de YouTube o Vimeo. Se convertirá automáticamente a embed.
        </p>
      </div>

      <div className={styles.actions}>
        {saved && <span className={styles.savedMsg}>✅ Configuración guardada</span>}
        <button className="btn btn-outline" onClick={handleReset} id="admin-reset-config">
          Resetear
        </button>
        <button className="btn btn-primary" onClick={handleSave} id="admin-save-config">
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: string
  placeholder?: string
}) {
  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <label className="form-label" htmlFor={`config-${name}`}>{label}</label>
      <input
        id={`config-${name}`}
        name={name}
        type={type}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
    </div>
  )
}
