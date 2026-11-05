import React from 'react'
import { useRevealAll } from '@/hooks/useReveal'
import styles from './Services.module.css'

const SERVICES = [
  {
    icon: '🏆',
    title: 'Eventos Deportivos',
    description:
      'Cobertura aérea profesional de competiciones, maratones, ciclismo, fútbol y cualquier evento deportivo. Perspectivas únicas que ninguna cámara en tierra puede capturar.',
    tag: 'Especialidad',
  },
  {
    icon: '📡',
    title: 'Retransmisión en Vivo',
    description:
      'Streaming en tiempo real con latencia mínima. Integración con OBS, YouTube Live y plataformas de broadcasting profesional.',
    tag: 'Streaming',
  },
  {
    icon: '📸',
    title: 'Fotografía Aérea',
    description:
      'Imágenes en 8K con drones de última generación. Perfecto para marketing deportivo, publicaciones y contenido para redes sociales.',
    tag: 'Fotografía',
  },
  {
    icon: '🎯',
    title: 'FPV Racing',
    description:
      'Drones FPV de alta velocidad para seguimiento de pilotos, ciclistas y atletas. La experiencia más inmersiva y emocionante del mercado.',
    tag: 'FPV',
  },
  {
    icon: '🗺️',
    title: 'Mapping 3D',
    description:
      'Cartografía y modelado 3D de instalaciones deportivas, estadios y recorridos. Ideal para planificación y análisis táctico.',
    tag: 'Tecnología',
  },
  {
    icon: '🎬',
    title: 'Cinematografía',
    description:
      'Producciones cinematográficas de alto nivel para documentales, spots publicitarios y contenido premium de eventos.',
    tag: 'Cine',
  },
]

export default function Services() {
  useRevealAll([])

  return (
    <section id="servicios" className={`section ${styles.services}`}>
      <div className="grid-bg" style={{ opacity: 0.5 }} />
      <div className="container">
        <div className="reveal">
          <p className="section-tag">Nuestros Servicios</p>
          <h2 className="section-title">
            Tecnología aérea para <span>cada momento</span>
          </h2>
          <p className="section-subtitle">
            Ofrecemos soluciones completas de drones para todo tipo de eventos deportivos
            en España y Europa, con equipamiento de última generación y pilotos certificados.
          </p>
        </div>

        <div className={styles.grid}>
          {SERVICES.map((svc, i) => (
            <div
              key={svc.title}
              className={`reveal reveal-delay-${Math.min(i + 1, 5)} ${styles.card} glass-card`}
            >
              <div className={styles.cardTop}>
                <span className={styles.icon}>{svc.icon}</span>
                <span className={styles.tag}>{svc.tag}</span>
              </div>
              <h3 className={styles.cardTitle}>{svc.title}</h3>
              <p className={styles.cardDesc}>{svc.description}</p>
              <div className={styles.cardLine} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
