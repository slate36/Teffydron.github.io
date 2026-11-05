'use client'

import { useEffect } from 'react'

function generateSessionId() {
  // Fallback compatible con navegadores antiguos que no tienen crypto.randomUUID
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  // UUID v4 básico usando Math.random
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export function VisitTracker() {
  useEffect(() => {
    // Generar o recuperar session ID
    let sid = sessionStorage.getItem('teffydron_session_id')
    if (!sid) {
      sid = generateSessionId()
      sessionStorage.setItem('teffydron_session_id', sid)
    }

    // Enviar visita al servidor
    const path = typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''
    const referrer = typeof document !== 'undefined' ? document.referrer : ''

    fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referrer, sessionId: sid }),
    }).catch(() => {
      // Silenciar errores de tracking (no bloquear la UI)
    })
  }, [])

  return null
}
