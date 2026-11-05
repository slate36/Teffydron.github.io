'use client'

import { useTransition, useState } from 'react'
import { Plus } from 'lucide-react'
import { upsertFolderConfig } from '@/app/actions/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function AddFolderForm() {
  const [pending, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const path = String(data.get('path')).trim()
    const label = String(data.get('label')).trim()
    if (!path.startsWith('/')) return
    startTransition(async () => {
      await upsertFolderConfig(path, { label, visible: true })
      setOpen(false)
      ;(e.target as HTMLFormElement).reset()
    })
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm" variant="outline" className="gap-1.5">
        <Plus className="size-4" />
        Agregar carpeta
      </Button>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex flex-col gap-1.5 min-w-[200px]">
        <Label htmlFor="path" className="text-xs">Ruta en TeraBox</Label>
        <Input id="path" name="path" required placeholder="/polo/torneos" className="text-sm" />
        <p className="text-xs text-muted-foreground">Debe empezar con /</p>
      </div>
      <div className="flex flex-col gap-1.5 min-w-[160px]">
        <Label htmlFor="label" className="text-xs">Etiqueta (opcional)</Label>
        <Input id="label" name="label" placeholder="Torneos 2025" className="text-sm" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} size="sm">
          {pending ? 'Guardando...' : 'Agregar'}
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
