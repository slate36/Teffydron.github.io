import type { Metadata } from 'next'
import { Image as ImageIcon, Mail, MessageCircle, Phone } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: 'Contacto | Videoteca de Polo',
  description: 'Contacto por WhatsApp, teléfono o Instagram.',
}

const channels = [
  {
    icon: MessageCircle,
    label: 'WhatsApp',
    value: '+598 92 840 850',
    href: 'https://wa.me/59892840850',
    external: true,
  },
  {
    icon: Phone,
    label: 'Teléfono',
    value: '+598 92 840 850',
    href: 'tel:+59892840850',
    external: false,
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'tefydron@gmail.com',
    href: 'mailto:tefydron@gmail.com',
    external: false,
  },
  {
    icon: ImageIcon,
    label: 'Instagram',
    value: '@tefymoya',
    href: 'https://instagram.com/tefymoya',
    external: true,
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        title="Contacto"
        subtitle="Escríbenos para videos, tarjetas QR, coberturas de torneos o cualquier consulta sobre polo."
      />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <ul className="grid gap-4 sm:grid-cols-2">
          {channels.map(({ icon: Icon, label, value, href, external }) => (
            <li key={label}>
              <a
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex h-full flex-col items-start gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-accent hover:bg-secondary"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {label}
                </span>
                <span className="font-serif text-lg font-semibold text-card-foreground">{value}</span>
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
