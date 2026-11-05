'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

function PasswordInput({
  id,
  name,
  autoComplete,
  placeholder,
  minLength,
}: {
  id: string
  name: string
  autoComplete: string
  placeholder: string
  minLength?: number
}) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        type={show ? 'text' : 'password'}
        required
        minLength={minLength}
        autoComplete={autoComplete}
        placeholder={placeholder}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}

export function AuthForm({ mode }: { mode: 'sign-in' | 'sign-up' | 'forgot-password' }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [pending, setPending] = useState(false)
  const isSignUp = mode === 'sign-up'
  const isForgot = mode === 'forgot-password'

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setPending(true)
    const data = new FormData(event.currentTarget)
    const email = String(data.get('email'))

    if (isForgot) {
      await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/recuperar/nueva`,
      })
      setSuccess(true)
      setPending(false)
      return
    }

    const password = String(data.get('password'))
    const result = isSignUp
      ? await authClient.signUp.email({ email, password, name: String(data.get('name')) })
      : await authClient.signIn.email({ email, password })

    setPending(false)
    if (result.error) {
      setError(
        isSignUp
          ? 'No se pudo crear la cuenta. Revisá los datos e intentá de nuevo.'
          : 'Correo o contraseña incorrectos.',
      )
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  /* ── Forgot password ── */
  if (isForgot) {
    if (success) {
      return (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 text-center flex flex-col gap-4 shadow-sm">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Mail className="size-6" />
          </div>
          <h2 className="font-serif text-lg font-bold">Revisá tu correo</h2>
          <p className="text-sm text-muted-foreground">
            Si existe una cuenta con ese correo, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
          </p>
          <Link href="/ingresar">
            <Button variant="outline" className="w-full">Volver a ingresar</Button>
          </Link>
        </div>
      )
    }

    return (
      <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Correo electrónico</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
            <Input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" className="pl-9" />
          </div>
        </div>
        {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? 'Enviando...' : 'Enviar instrucciones'}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/ingresar" className="font-medium text-primary underline-offset-4 hover:underline">
            ← Volver a ingresar
          </Link>
        </p>
      </form>
    )
  }

  /* ── Sign in / Sign up ── */
  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
      {isSignUp && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre completo</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
            <Input id="name" name="name" required minLength={2} maxLength={60} autoComplete="name" placeholder="Tu nombre" className="pl-9" />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Correo electrónico</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input id="email" name="email" type="email" required autoComplete="email" placeholder="tu@email.com" className="pl-9" />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Contraseña</Label>
          {!isSignUp && (
            <Link href="/recuperar" className="text-xs text-primary hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          )}
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground z-10" aria-hidden="true" />
          <div className="pl-9">
            <PasswordInput
              id="password"
              name="password"
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              placeholder={isSignUp ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
              minLength={8}
            />
          </div>
        </div>
        {isSignUp && (
          <p className="text-xs text-muted-foreground">Mínimo 8 caracteres. Usá letras, números y símbolos.</p>
        )}
      </div>

      {error && (
        <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? 'Un momento...' : isSignUp ? 'Crear cuenta' : 'Ingresar'}
      </Button>

      {!isSignUp && (
        <Link href="/registro" className="w-full block text-center">
          <Button variant="outline" className="w-full" size="sm">
            Crear cuenta nueva
          </Button>
        </Link>
      )}

      <p className="text-center text-sm text-muted-foreground border-t border-border pt-4">
        {isSignUp ? '¿Ya tenés cuenta? ' : '¿No tenés cuenta? '}
        <Link href={isSignUp ? '/ingresar' : '/registro'} className="font-medium text-primary underline-offset-4 hover:underline">
          {isSignUp ? 'Ingresá' : 'Creá una gratis'}
        </Link>
      </p>
    </form>
  )
}
