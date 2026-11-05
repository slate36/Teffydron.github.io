import type { Metadata } from 'next'
import Link from 'next/link'
import { Camera, FileVideo, MessageCircle, Megaphone, Newspaper, Users, CheckCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Sobre Teffydron | Videoteca de Polo',
  description: 'Teffydron es la plataforma de difusión del polo con imágenes y videos aéreos capturados con drones.',
}

const pillars = [
  {
    icon: FileVideo,
    label: 'Videoteca',
    description: 'Videos y tomas aéreas de partidos, torneos y entrenamientos capturados con drones profesionales.',
    href: '/',
  },
  {
    icon: Newspaper,
    label: 'Notas',
    description: 'Artículos, crónicas y contenido editorial sobre el mundo del polo. Noticias de torneos y jugadores.',
    href: '/comunidad?kind=nota',
  },
  {
    icon: MessageCircle,
    label: 'Foro',
    description: 'Intercambiá experiencias, comentá partidos y conectá con otros apasionados del polo.',
    href: '/comunidad',
  },
  {
    icon: Megaphone,
    label: 'Publicidad',
    description: 'Espacios publicitarios para marcas y sponsors que quieren llegar a la comunidad del polo.',
    href: '/contacto',
  },
]

export default function VisitorPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        title="Videoteca de Polo"
        subtitle="Producción audiovisual con drones para el polo. Archivo exclusivo de partidos y entrenamientos."
      />

      <main className="mx-auto max-w-7xl px-4 py-12 flex flex-col gap-16">

        {/* — Quién es Teffydron — */}
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-bold tracking-[0.4em] text-primary uppercase">Quiénes somos</p>
            <h2 className="font-serif text-3xl font-bold leading-snug text-balance">
              Producción audiovisual aérea para el polo
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Teffydron nació de la pasión por el polo y la tecnología. Usamos drones profesionales para capturar
              cada jugada desde perspectivas imposibles — la cancha entera, el galope, el golpe exacto del mazo.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Esta plataforma centraliza todo ese contenido: una videoteca con material de torneos y entrenamientos,
              un foro donde la comunidad debate, y un espacio para notas y publicidad del deporte.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/registro">
                <Button size="lg">Unirme gratis</Button>
              </Link>
              <Link href="/comunidad">
                <Button size="lg" variant="outline">Ver el foro</Button>
              </Link>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: 'Drone', label: 'Producción aérea' },
              { value: 'HD', label: 'Calidad de video' },
              { value: 'Polo', label: 'Deporte foco' },
              { value: 'ARG', label: 'Origen' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center shadow-sm"
              >
                <p className="font-serif text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* — Los 4 pilares — */}
        <section className="flex flex-col gap-6">
          <div className="text-center">
            <p className="text-xs font-bold tracking-[0.4em] text-primary uppercase mb-2">La plataforma</p>
            <h2 className="font-serif text-2xl font-bold">Todo el polo en un solo lugar</h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map(({ icon: Icon, label, description, href }) => (
              <Link
                key={label}
                href={href}
                className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/50 hover:shadow-md"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="font-semibold">{label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                <span className="text-xs font-medium text-primary mt-auto">
                  Ir a {label} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* — Por qué Teffydron — */}
        <section className="rounded-2xl bg-primary px-8 py-12 text-primary-foreground">
          <div className="mx-auto max-w-3xl text-center flex flex-col gap-6">
            <Camera className="mx-auto size-10 text-accent" aria-hidden="true" />
            <h2 className="font-serif text-2xl font-bold">
              El polo visto desde arriba es otro deporte
            </h2>
            <p className="text-primary-foreground/80 leading-relaxed">
              La perspectiva aérea revela la táctica, el movimiento y la belleza del polo de una manera
              que ninguna cámara en el suelo puede capturar. Teffydron lleva esa visión a jugadores,
              sponsors, periodistas y fanáticos.
            </p>
            <ul className="grid gap-3 sm:grid-cols-2 text-left">
              {[
                'Cobertura completa de torneos',
                'Material para sponsors y marcas',
                'Archivo de partidos y jugadas',
                'Comunidad activa de polo',
                'Notas y análisis editoriales',
                'Códigos QR para compartir material',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="size-4 text-accent shrink-0" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Link href="/registro">
                <Button variant="secondary" size="lg">Crear cuenta gratis</Button>
              </Link>
              <Link href="/contacto">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Publicitar
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* — Cómo participar — */}
        <section className="flex flex-col gap-6">
          <h2 className="font-serif text-2xl font-bold text-center">Cómo participar</h2>
          <ol className="mx-auto max-w-2xl flex flex-col gap-4">
            {[
              'Registrate con tu correo — es gratis y toma segundos.',
              'Explorá la videoteca con tomas aéreas de torneos y partidos.',
              'Participá en el foro compartiendo notas, links y opiniones.',
              'Generá códigos QR para compartir videos directamente.',
              'Si sos marca o sponsor, contactanos para publicitar.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-bold">
                  {i + 1}
                </span>
                <p className="text-muted-foreground pt-0.5 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
          <div className="text-center pt-4">
            <Link href="/registro">
              <Button size="lg">Empezar ahora</Button>
            </Link>
          </div>
        </section>

      </main>
    </div>
  )
}
