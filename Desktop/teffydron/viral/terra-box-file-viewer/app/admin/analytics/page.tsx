import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BarChart2, Activity, Monitor, Layers, Globe, Smartphone, Clock,
} from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SignOutButton } from '@/components/sign-out-button'
import { requireAdmin } from '@/lib/admin'
import { StatsDashboard } from './stats-dashboard'

export const metadata: Metadata = { title: 'Analítica | TefyDron' }

export default async function AnalyticsPage() {
  const viewer = await requireAdmin()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Analítica de visitas" subtitle="Métricas y estadísticas de la videoteca pública" />

      <main className="mx-auto max-w-7xl px-4 py-8">
        <StatsDashboard initialRange="7d" />
      </main>

      <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
        <SignOutButton className="px-3 py-1.5 text-sm" />
        <Link href="/admin" className="px-3 py-1.5 rounded-md bg-secondary text-muted-foreground hover:bg-secondary/80 transition-colors">
          Volver al panel
        </Link>
      </div>
    </div>
  )
}
