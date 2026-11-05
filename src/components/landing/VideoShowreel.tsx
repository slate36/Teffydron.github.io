import React from 'react'
import { useAppState } from '@/store/AppContext'
import { useRevealAll } from '@/hooks/useReveal'
import styles from './VideoShowreel.module.css'

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  if (ytMatch?.[1]) {
    return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=0&rel=0&modestbranding=1`
  }
  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch?.[1]) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?color=00d4ff`
  }
  // Already an embed URL
  return url
}

export default function VideoShowreel() {
  const { siteConfig } = useAppState()
  useRevealAll([])

  const embedUrl = getEmbedUrl(siteConfig.videoUrl)

  return (
    <section id="video" className={`section ${styles.video}`}>
      <div className={styles.bg} />
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center' }}>
          <p className="section-tag" style={{ justifyContent: 'center' }}>
            Showreel
          </p>
          <h2 className="section-title" style={{ textAlign: 'center' }}>
            Nuestro trabajo <span>habla por sí solo</span>
          </h2>
          <p className="section-subtitle" style={{ margin: '0 auto 60px', textAlign: 'center' }}>
            Más de 200 eventos filmados en toda Europa. Cada vuelo es una historia única.
          </p>
        </div>

        <div className={`reveal ${styles.wrapper}`}>
          <div className={styles.frame}>
            <div className={styles.glow} />
            <iframe
              src={embedUrl}
              title="TeffyDron Showreel"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className={styles.iframe}
            />
          </div>
        </div>

        <div className={`reveal ${styles.stats}`}>
          {[
            { num: '4K/8K', label: 'Resolución máxima' },
            { num: '120fps', label: 'Slow motion' },
            { num: '7km', label: 'Alcance de señal' },
            { num: '45min', label: 'Autonomía de vuelo' },
          ].map((s) => (
            <div key={s.label} className={`${styles.stat} glass-card`}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
