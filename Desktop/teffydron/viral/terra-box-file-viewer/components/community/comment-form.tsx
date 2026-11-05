'use client'

import { useActionState, useEffect, useRef } from 'react'
import type { FormState } from '@/app/actions/community'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function CommentForm({ action }: { action: (prev: FormState, formData: FormData) => Promise<FormState> }) {
  const [state, formAction, pending] = useActionState(action, {})
  const ref = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state.ok) ref.current?.reset()
  }, [state])

  return (
    <form ref={ref} action={formAction} className="flex flex-col gap-2">
      <label htmlFor="comment-body" className="sr-only">
        Comentario
      </label>
      <Textarea id="comment-body" name="body" rows={3} required maxLength={1000} placeholder="Escribe un comentario. Puedes usar #hashtags y @menciones." />
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      <Button type="submit" disabled={pending} size="sm" className="self-end">
        {pending ? 'Enviando...' : 'Comentar'}
      </Button>
    </form>
  )
}
