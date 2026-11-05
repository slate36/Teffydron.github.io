import React from 'react'
import { useAppState, useAppDispatch } from '@/store/AppContext'
import styles from './Admin.module.css'

export default function AdminMessages() {
  const { messages } = useAppState()
  const dispatch = useAppDispatch()

  const unread = messages.filter((m) => !m.read).length

  const handleMarkRead = (id: string) => {
    dispatch({ type: 'MARK_MESSAGE_READ', payload: id })
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Eliminar este mensaje?')) {
      dispatch({ type: 'DELETE_MESSAGE', payload: id })
    }
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div>
      <div className={`glass-card ${styles.section}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h3 className={styles.sectionTitle} style={{ marginBottom: 0 }}>
            📩 Mensajes ({messages.length})
            {unread > 0 && (
              <span style={{ marginLeft: 12, fontSize: 12, background: 'var(--accent)', color: 'white', borderRadius: 50, padding: '3px 10px', fontWeight: 700 }}>
                {unread} sin leer
              </span>
            )}
          </h3>
        </div>

        {messages.length === 0 && (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>
            No hay mensajes aún. Aparecerán aquí cuando alguien use el formulario de contacto.
          </p>
        )}

        <div className={styles.messageList}>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`${styles.messageItem} ${!msg.read ? styles.unread : ''}`}
            >
              <div className={styles.messageHeader}>
                <div className={styles.messageSender}>
                  <div className={styles.senderAvatar}>
                    {msg.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className={styles.senderName}>{msg.name}</p>
                    <p className={styles.senderMeta}>
                      <a href={`mailto:${msg.email}`} style={{ color: 'var(--primary)' }}>{msg.email}</a>
                      {msg.phone && ` · ${msg.phone}`}
                    </p>
                  </div>
                </div>
                <div className={styles.messageMeta}>
                  {msg.eventType && (
                    <span className={styles.eventType}>{msg.eventType}</span>
                  )}
                  {!msg.read && <span className={styles.unreadBadge}>Nuevo</span>}
                  <span className={styles.messageDate}>{formatDate(msg.createdAt)}</span>
                </div>
              </div>

              <p className={styles.messageText}>{msg.message}</p>

              <div className={styles.messageActions}>
                <a
                  href={`mailto:${msg.email}?subject=Re: Tu consulta a TeffyDron`}
                  className="btn btn-primary"
                  style={{ fontSize: 13, padding: '8px 18px' }}
                >
                  📧 Responder
                </a>
                {msg.phone && (
                  <a
                    href={`https://wa.me/${msg.phone.replace(/\D/g, '')}?text=Hola ${msg.name}!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-whatsapp"
                    style={{ fontSize: 13, padding: '8px 18px' }}
                  >
                    WhatsApp
                  </a>
                )}
                {!msg.read && (
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: 13, padding: '8px 18px' }}
                    onClick={() => handleMarkRead(msg.id)}
                  >
                    Marcar leído
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(msg.id)}
                  aria-label="Eliminar mensaje"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
