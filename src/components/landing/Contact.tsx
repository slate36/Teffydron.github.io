import React, { useState, useId } from 'react'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import { useRevealAll } from '@/hooks/useReveal'
import type { ContactMessage } from '@/types'
import styles from './Contact.module.css'

const EVENT_TYPES = [
  'Fútbol / Rugby / Hockey',
  'Ciclismo / Triatlón',
  'Atletismo / Maratón',
  'Automovilismo / Motociclismo',
  'Deportes acuáticos',
  'Esquí / Snowboard',
  'eSports / Gaming',
  'Otro evento',
]

interface FormState {
  name: string
  email: string
  phone: string
  eventType: string
  message: string
}

const EMPTY_FORM: FormState = {
  name: '',
  email: '',
  phone: '',
  eventType: '',
  message: '',
}

export default function Contact() {
  const { siteConfig } = useAppState()
  const dispatch = useAppDispatch()
  const [form, setForm] = useState<FormState>(EMPTY_FORM)
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const formId = useId()
  useRevealAll([])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')

    try {
      // Save to local state
      const message: ContactMessage = {
        id: crypto.randomUUID(),
        ...form,
        createdAt: new Date().toISOString(),
        read: false,
      }
      dispatch({ type: 'ADD_MESSAGE', payload: message })

      // EmailJS — placeholders (configure en panel admin o .env)
      // Si tienes EmailJS: descomenta y agrega tus keys
      /*
      await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        { from_name: form.name, from_email: form.email, message: form.message },
        'YOUR_PUBLIC_KEY'
      )
      */

      // Fallback: mailto
      const mailto = `mailto:${siteConfig.contactEmail}?subject=Consulta de ${form.name}&body=${encodeURIComponent(
        `Nombre: ${form.name}\nEmail: ${form.email}\nTeléfono: ${form.phone}\nEvento: ${form.eventType}\n\n${form.message}`
      )}`
      window.open(mailto, '_blank')

      setStatus('sent')
      setForm(EMPTY_FORM)
    } catch {
      setStatus('error')
    }
  }

  const handleWhatsapp = () => {
    window.open(
      `https://wa.me/${siteConfig.whatsappNumber}?text=Hola! Me interesa contratar sus servicios de drones para: ${form.eventType || 'un evento'}.`,
      '_blank'
    )
  }

  return (
    <section id="contacto" className={`section ${styles.contact}`}>
      <div className={styles.bg} />
      <div className="container">
        <div className="reveal">
          <p className="section-tag">Contacto</p>
          <h2 className="section-title">
            Hablemos de tu <span>próximo evento</span>
          </h2>
          <p className="section-subtitle">
            Cuéntanos sobre tu evento y te enviaremos un presupuesto personalizado en menos de 24 horas.
          </p>
        </div>

        <div className={styles.layout}>
          {/* Form */}
          <form
            id={`contact-form-${formId}`}
            className={`reveal glass-card ${styles.form}`}
            onSubmit={handleSubmit}
          >
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label" htmlFor={`name-${formId}`}>Nombre completo *</label>
                <input
                  id={`name-${formId}`}
                  name="name"
                  type="text"
                  className="form-input"
                  placeholder="Tu nombre"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor={`email-${formId}`}>Email *</label>
                <input
                  id={`email-${formId}`}
                  name="email"
                  type="email"
                  className="form-input"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label" htmlFor={`phone-${formId}`}>Teléfono</label>
                <input
                  id={`phone-${formId}`}
                  name="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+34 600 000 000"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor={`event-${formId}`}>Tipo de evento</label>
                <select
                  id={`event-${formId}`}
                  name="eventType"
                  className="form-input"
                  value={form.eventType}
                  onChange={handleChange}
                >
                  <option value="">Selecciona un tipo...</option>
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor={`message-${formId}`}>Mensaje *</label>
              <textarea
                id={`message-${formId}`}
                name="message"
                className="form-input"
                placeholder="Cuéntanos sobre tu evento: fecha, lugar, duración, número de espectadores..."
                value={form.message}
                onChange={handleChange}
                required
                rows={5}
              />
            </div>

            {status === 'sent' && (
              <div className={styles.success}>
                ✅ Mensaje enviado. Te contactaremos en menos de 24 horas.
              </div>
            )}
            {status === 'error' && (
              <div className={styles.errorMsg}>
                ❌ Error al enviar. Escríbenos directamente a {siteConfig.contactEmail}
              </div>
            )}

            <div className={styles.formActions}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === 'sending'}
                id="submit-contact-form"
              >
                {status === 'sending' ? (
                  <>
                    <span className={styles.spinner} />
                    Enviando...
                  </>
                ) : (
                  <>
                    Enviar consulta
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </>
                )}
              </button>
              <button type="button" className="btn btn-whatsapp" onClick={handleWhatsapp}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp directo
              </button>
            </div>

            <p className={styles.gdpr}>
              Al enviar este formulario aceptas nuestra{' '}
              <a href="#" style={{ color: 'var(--primary)' }}>política de privacidad</a>{' '}
              conforme al RGPD (UE) 2016/679.
            </p>
          </form>

          {/* Info panel */}
          <div className={`reveal reveal-delay-2 ${styles.info}`}>
            <div className={`${styles.infoCard} glass-card`}>
              <h3 className={styles.infoTitle}>Información de contacto</h3>
              <div className={styles.infoItems}>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>📧</span>
                  <div>
                    <p className={styles.infoLabel}>Email</p>
                    <a href={`mailto:${siteConfig.contactEmail}`} className={styles.infoValue}>
                      {siteConfig.contactEmail}
                    </a>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>💬</span>
                  <div>
                    <p className={styles.infoLabel}>WhatsApp</p>
                    <p className={styles.infoValue}>+{siteConfig.whatsappNumber}</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🕐</span>
                  <div>
                    <p className={styles.infoLabel}>Respuesta garantizada</p>
                    <p className={styles.infoValue}>Menos de 24 horas</p>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoIcon}>🌍</span>
                  <div>
                    <p className={styles.infoLabel}>Área de servicio</p>
                    <p className={styles.infoValue}>España y toda Europa</p>
                  </div>
                </div>
              </div>
            </div>

            <div className={`${styles.certCard} glass-card`}>
              <p className={styles.certTitle}>Certificaciones y permisos</p>
              <ul className={styles.certList}>
                <li>✅ Piloto certificado AESA (España)</li>
                <li>✅ Licencia EASA categoría Específica</li>
                <li>✅ Seguro RC de 1M€</li>
                <li>✅ Registro operador UAS</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
