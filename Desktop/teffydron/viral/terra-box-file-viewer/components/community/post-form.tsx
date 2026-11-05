'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { FormState } from '@/app/actions/community'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { POST_KINDS } from '@/lib/community'

type Defaults = { kind: string; title: string; url: string | null; body: string; tags: string[] }

export function PostForm({
  action,
  defaults,
  submitLabel = 'Publicar',
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>
  defaults?: Defaults
  submitLabel?: string
}) {
  const [state, formAction, pending] = useActionState(action, {})
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok && !defaults) formRef.current?.reset()
  }, [state, defaults])

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Tipo</legend>
        <div className="flex flex-wrap gap-2">
          {POST_KINDS.map((k) => (
            <label key={k.value} className="cursor-pointer">
              <input
                type="radio"
                name="kind"
                value={k.value}
                defaultChecked={(defaults?.kind ?? 'enlace') === k.value}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-border px-3 py-1 text-sm transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">
                {k.label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Título</Label>
        <Input id="title" name="title" required minLength={3} maxLength={140} defaultValue={defaults?.title} placeholder="Ej: Revista Polo Life · edición de primavera" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="url">Enlace (opcional)</Label>
        <Input id="url" name="url" type="url" defaultValue={defaults?.url ?? ''} placeholder="https://..." />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="body">Descripción</Label>
        <Textarea
          id="body"
          name="body"
          rows={4}
          maxLength={2000}
          defaultValue={defaults?.body}
          placeholder="Cuenta de qué se trata. Usa #hashtags y menciona a otros con @usuario."
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="tags">Hashtags extra (opcional)</Label>
        <Input id="tags" name="tags" defaultValue={defaults?.tags.map((t) => `#${t}`).join(' ')} placeholder="#palermo #handicap #abierto" />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.ok && !defaults && (
        <p role="status" className="text-sm text-primary">
          Publicado.
        </p>
      )}

      <Button type="submit" disabled={pending} className="self-end">
        {pending ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  )
}
