import Image from 'next/image'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AuthForm } from '@/components/auth-form'
import { getSession } from '@/lib/auth'

const config = {
  'sign-in': {
    title: 'Ingresar',
    subtitle: 'Accedé a tu cuenta para explorar la videoteca y participar en el foro.',
  },
  'sign-up': {
    title: 'Crear cuenta',
    subtitle: 'Unite a la comunidad del polo. Es gratis y toma solo unos segundos.',
  },
  'forgot-password': {
    title: 'Recuperar contraseña',
    subtitle: 'Ingresá tu correo y te enviamos las instrucciones para restablecer tu contraseña.',
  },
}

export async function AuthPage({ mode }: { mode: 'sign-in' | 'sign-up' | 'forgot-password' }) {
  const session = await getSession()
  if (session?.user) redirect('/dashboard')

  const { title, subtitle } = config[mode]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b bg-primary">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link href="/" aria-label="Inicio TefyDron">
            <Image
              src="/images/teffydron-logo.png"
              alt="TefyDron"
              width={90}
              height={56}
              className="drop-shadow"
              priority
            />
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/comunidad" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Foro
            </Link>
            <Link href="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Videoteca
            </Link>
          </nav>
        </div>
        <div className="h-1 bg-accent" />
      </header>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md flex flex-col gap-6">
          <div className="text-center flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-bold">{title}</h1>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <AuthForm mode={mode} />
        </div>
      </main>

      {/* Footer mini */}
      <footer className="border-t py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} TefyDron ·
        <Link href="/privacidad" className="hover:underline ml-1">Privacidad</Link> ·
        <Link href="/terminos" className="hover:underline ml-1">Términos</Link>
      </footer>
    </div>
  )
}
