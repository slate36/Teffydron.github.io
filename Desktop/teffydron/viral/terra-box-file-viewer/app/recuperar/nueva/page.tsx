'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'

function ResetForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const data = new FormData(e.currentTarget)
    const password = String(data.get('password'))
    const confirm = String(data.get('confirm'))

    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    if (password.length < 8) { setError('La contraseña debe tener al menos 8 caracteres.'); return }
    if (!token) { setError('Enlace inválido o expirado. Solicitá uno nuevo.'); return }

    setPending(true)
    const result = await authClient.resetPassword({ newPassword: password, token })
    setPending(false)

    if (result.error) {
      setError('No se pudo restablecer la contraseña. El enlace puede haber expirado.')
      return
    }
    router.push('/ingresar?reset=ok')
  }

  return (
    <form onSubmit={onSubmit} className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">Nueva contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input id="password" name="password" type={showPass ? 'text' : 'password'} required minLength={8} autoComplete="new-password" placeholder="Mínimo 8 caracteres" className="pl-9 pr-10" />
          <button type="button" onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showPass ? 'Ocultar' : 'Mostrar'}>
            {showPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm">Confirmar contraseña</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" aria-hidden="true" />
          <Input id="confirm" name="confirm" type={showConfirm ? 'text' : 'password'} required autoComplete="new-password" placeholder="Repetí la contraseña" className="pl-9 pr-10" />
          <button type="button" onClick={() => setShowConfirm(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors" aria-label={showConfirm ? 'Ocultar' : 'Mostrar'}>
            {showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}

      <Button type="submit" disabled={pending} className="w-full" size="lg">
        {pending ? 'Guardando...' : 'Establecer nueva contraseña'}
      </Button>
    </form>
  )
}

export default function NewPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-primary">
        <div className="mx-auto flex max-w-7xl items-center px-4 py-3">
          <Link href="/" aria-label="Inicio TefyDron">
            <Image src="/images/teffydron-logo.png" alt="TefyDron" width={90} height={56} className="drop-shadow" priority />
          </Link>
        </div>
        <div className="h-1 bg-accent" />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-bold">Nueva contraseña</h1>
            <p className="text-sm text-muted-foreground">Elegí una contraseña segura para tu cuenta.</p>
          </div>
          <Suspense fallback={<div className="h-48 rounded-xl border animate-pulse bg-muted" />}>
            <ResetForm />
          </Suspense>
        </div>
      </main>

      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TefyDron
      </footer>
    </div>
  )
}
