import Link from 'next/link'
import Image from 'next/image'

export function SiteFooter() {
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Image
              src="/images/teffydron-logo.png"
              alt="TefyDron"
              width={120}
              height={75}
              className="drop-shadow-md brightness-0 invert opacity-90"
            />
            <p className="text-xs text-primary-foreground/55 max-w-xs leading-relaxed">
              Producción audiovisual con drones para el mundo del polo. Videoteca, notas, foro y publicidad especializada en el deporte.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-2 text-sm" aria-label="Footer">
            <p className="text-xs font-semibold tracking-widest text-accent/80 uppercase mb-1">Secciones</p>
            <Link href="/" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Videoteca
            </Link>
            <Link href="/comunidad" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Foro
            </Link>
            <Link href="/contacto" className="text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              Contacto
            </Link>
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col gap-2 border-t border-primary-foreground/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-primary-foreground/45">
            © {new Date().getFullYear()} Teffydron. Todos los derechos reservados.
          </p>
          <nav className="flex flex-wrap gap-4 text-xs" aria-label="Legal">
            <Link href="/privacidad" className="text-primary-foreground/45 hover:text-primary-foreground/80 transition-colors">
              Privacidad
            </Link>
            <Link href="/terminos" className="text-primary-foreground/45 hover:text-primary-foreground/80 transition-colors">
              Términos
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  )
}
