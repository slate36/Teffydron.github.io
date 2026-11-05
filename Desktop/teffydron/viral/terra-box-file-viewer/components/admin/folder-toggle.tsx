'use client'

import { useTransition } from 'react'
import { Eye, EyeOff, Pin, PinOff } from 'lucide-react'
import { toggleFolderVisible, toggleFolderPinned } from '@/app/actions/admin'

export function VisibilityToggle({ path, visible }: { path: string; visible: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleFolderVisible(path, !visible))}
      disabled={pending}
      title={visible ? 'Ocultar carpeta' : 'Mostrar carpeta'}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50
        ${visible
          ? 'bg-primary/10 text-primary hover:bg-primary/20'
          : 'bg-muted text-muted-foreground hover:bg-secondary'
        }`}
    >
      {visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
      {visible ? 'Visible' : 'Oculta'}
    </button>
  )
}

export function PinToggle({ path, pinned }: { path: string; pinned: boolean }) {
  const [pending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => toggleFolderPinned(path, !pinned))}
      disabled={pending}
      title={pinned ? 'Quitar destacado' : 'Destacar carpeta'}
      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50
        ${pinned
          ? 'bg-accent/30 text-accent-foreground hover:bg-accent/50'
          : 'bg-muted text-muted-foreground hover:bg-secondary'
        }`}
    >
      {pinned ? <Pin className="size-3.5" /> : <PinOff className="size-3.5" />}
      {pinned ? 'Destacada' : 'Destacar'}
    </button>
  )
}
