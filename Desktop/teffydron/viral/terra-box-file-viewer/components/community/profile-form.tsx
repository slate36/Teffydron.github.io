'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/community'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

type ProfileDefaults = {
  handle: string
  bio: string | null
  location: string | null
  website: string | null
  instagram: string | null
}

export function ProfileForm({ defaults }: { defaults: ProfileDefaults }) {
  const [state, formAction, pending] = useActionState(updateProfile, {})

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="handle">Nombre de usuario</Label>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground" aria-hidden="true">
            @
          </span>
          <Input id="handle" name="handle" required minLength={3} maxLength={30} defaultValue={defaults.handle} />
        </div>
        <p className="text-xs text-muted-foreground">Otros pueden mencionarte con este nombre.</p>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" name="bio" rows={3} maxLength={300} defaultValue={defaults.bio ?? ''} placeholder="Jugador, club, handicap, lo que quieras contar..." />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="location">Ubicación</Label>
          <Input id="location" name="location" maxLength={80} defaultValue={defaults.location ?? ''} placeholder="Montevideo, Uruguay" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="instagram">Instagram</Label>
          <Input id="instagram" name="instagram" maxLength={31} defaultValue={defaults.instagram ?? ''} placeholder="@usuario" />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="website">Sitio web</Label>
        <Input id="website" name="website" type="url" defaultValue={defaults.website ?? ''} placeholder="https://..." />
      </div>
      {state.error && (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      )}
      {state.ok && (
        <p role="status" className="text-sm text-primary">
          Perfil guardado.
        </p>
      )}
      <Button type="submit" disabled={pending} className="self-end">
        {pending ? 'Guardando...' : 'Guardar perfil'}
      </Button>
    </form>
  )
}
