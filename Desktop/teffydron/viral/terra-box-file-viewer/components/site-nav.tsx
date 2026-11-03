import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'

const links = [
  { href: '/', label: 'Inicio' },
  { href: '/videoteca', label: 'Videoteca' },
  { href: '/perfil', label: 'Perfil' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/comunidad', label: 'Foro' },
  { href: '/contacto', label: 'Contacto' },
]

const linkClass =
  'block rounded-md px-3 py-1.5 text-sm font-medium text-primary-foreground/85 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground'

type SiteNavProps = {
  viewer?: { id: string; handle: string } | null
}

export default function SiteNav({ viewer }: SiteNavProps = {}) {
  const [open, setOpen] = useState(false)

  return (
    <nav aria-label="Principal" className="flex items-center justify-end gap-1">
      {/* Enlaces de escritorio (siempre visibles en desktop) */}
      <div className="hidden sm:flex items-center gap-1">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={linkClass}>
            {link.label}
          </Link>
        ))}
        <span className="mx-1 h-5 w-px bg-primary-foreground/25" aria-hidden="true" />
        {viewer ? (
          <>
            <Link href="/dashboard" className={linkClass}>
              Dashboard
            </Link>
            <Link href="/perfil" className={linkClass}>
              @{viewer.handle}
            </Link>
            <SignOutButton className={linkClass} />
          </>
        ) : (
          <Link
            href="/ingresar"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          >
            Ingresar
          </Link>
        )}
      </div>

      {/* Menú hamburguesa para móvil */}
      <div className="sm:hidden">
        <button
          onClick={() => setOpen((prev) => !prev)}
          className="rounded-md p-2 text-primary-foreground hover:bg-primary-foreground/10 focus:outline-none"
          aria-label="Abrir menú"
          aria-expanded={open}
        >
          {open ? (
            <X className="size-5" />
          ) : (
            <Menu className="size-5" />
          )}
        </button>
        {open && (
          <div className="absolute top-12 right-0 w-56 mt-2 rounded-xl border border-white/20 bg-[#164532]/95 backdrop-blur-md shadow-2xl p-2 z-50">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mx-1 mt-1 mb-1 h-px bg-primary-foreground/25" aria-hidden="true" />
            {viewer ? (
              <>
                <Link
                  href="/dashboard"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/perfil"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                  onClick={() => setOpen(false)}
                >
                  @{viewer.handle}
                </Link>
                <button
                  className="w-full rounded-md px-3 py-2 text-sm font-medium text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground text-left"
                  onClick={() => setOpen(false)}
                >
                  <SignOutButton />
                </button>
              </>
            ) : (
              <Link
                href="/ingresar"
                className="block rounded-md bg-accent px-3 py-2 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                onClick={() => setOpen(false)}
              >
                Ingresar
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
