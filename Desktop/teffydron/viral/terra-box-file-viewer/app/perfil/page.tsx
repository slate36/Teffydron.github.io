import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ProfileForm } from '@/components/community/profile-form'
import { SiteHeader } from '@/components/site-header'
import { getOwnProfile } from '@/lib/queries'
import { getViewer } from '@/lib/viewer'

export const metadata: Metadata = { title: 'Mi perfil | Comunidad de Polo' }

export default async function MyProfilePage() {
  const viewer = await getViewer()
  if (!viewer) redirect('/ingresar')
  const profile = await getOwnProfile(viewer.id)
  if (!profile) redirect('/ingresar')

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Mi perfil" subtitle={`${viewer.name} · ${viewer.email}`} />
      <main className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-8">
        <Link href={`/u/${profile.handle}`} className="self-end text-sm font-medium text-primary hover:underline">
          Ver mi perfil público
        </Link>
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <ProfileForm defaults={profile} />
        </div>
      </main>
    </div>
  )
}
