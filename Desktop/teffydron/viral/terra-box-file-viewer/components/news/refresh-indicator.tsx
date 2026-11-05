'use client'

import { useState, useEffect, useTransition } from 'react'
import { RefreshCw } from 'lucide-react'

export function RefreshIndicator() {
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')

  // Auto-refresh every 30 minutes on the client side (just triggers a page reload)
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload()
    }, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  function handleRefresh() {
    startTransition(async () => {
      try {
        const secret = process.env.NEXT_PUBLIC_REVALIDATE_SECRET
        const url = secret
          ? `/api/revalidate-news?secret=${secret}`
          : '/api/revalidate-news'
        const res = await fetch(url)
        if (res.ok) {
          setLastUpdate(new Date())
          setStatus('ok')
          setTimeout(() => {
            setStatus('idle')
            window.location.reload()
          }, 800)
        } else {
          setStatus('error')
          setTimeout(() => setStatus('idle'), 3000)
        }
      } catch {
        setStatus('error')
        setTimeout(() => setStatus('idle'), 3000)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      {/* Live dot */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="relative flex size-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-50" />
          <span className="relative inline-flex size-2 rounded-full bg-primary" />
        </span>
        En vivo · actualizado {lastUpdate.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
      </div>

      {/* Manual refresh button */}
      <button
        onClick={handleRefresh}
        disabled={pending || status === 'ok'}
        title="Buscar noticias nuevas ahora"
        className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50
          ${status === 'ok' ? 'border-primary/50 bg-primary/10 text-primary'
          : status === 'error' ? 'border-destructive/50 bg-destructive/10 text-destructive'
          : 'border-border hover:bg-secondary text-muted-foreground hover:text-foreground'}`}
      >
        <RefreshCw className={`size-3.5 ${pending ? 'animate-spin' : ''}`} aria-hidden="true" />
        {status === 'ok' ? '¡Actualizado!' : status === 'error' ? 'Error' : 'Actualizar ahora'}
      </button>
    </div>
  )
}
