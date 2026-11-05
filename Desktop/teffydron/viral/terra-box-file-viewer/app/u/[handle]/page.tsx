import { AtSign, Globe, MapPin } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { PostCard } from '@/components/community/post-card'
import { SiteHeader } from '@/components/site-header'
import { hostOf } from '@/lib/community'
import { getFeed, getProfileByHandle } from '@/lib/queries'
import { getViewer } from '@/lib/viewer'

type Props = { params: Promise<{ handle: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { handle } = await params
  return { title: `@${decodeURIComponent(handle)} | Comunidad de Polo` }
}

export default async function UserPage({ params }: Props) {
  const handle = decodeURIComponent((await params).handle).toLowerCase()
  const [profile, viewer] = await Promise.all([getProfileByHandle(handle), getViewer()])
  if (!profile) notFound()

  const [own, mentions] = await Promise.all([
    getFeed({ authorId: profile.userId }, viewer?.id ?? null),
    getFeed({ mention: profile.handle }, viewer?.id ?? null),
  ])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title={profile.name ?? `@${profile.handle}`} subtitle={profile.bio ?? `@${profile.handle} en la comunidad de polo`} />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[320px_1fr]">
        <aside className="flex flex-col gap-3 self-start rounded-lg border border-border bg-card p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <AtSign className="size-4 text-primary" aria-hidden="true" />
            {profile.handle}
          </p>
          {profile.location && (
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="size-4" aria-hidden="true" />
              {profile.location}
            </p>
          )}
          {profile.instagram && (
            <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline">
              {/* Instagram icon (brand) */}
              <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
              @{profile.instagram}
            </a>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer nofollow" className="flex items-center gap-2 text-primary hover:underline">
              <Globe className="size-4" aria-hidden="true" />
              {hostOf(profile.website)}
            </a>
          )}
          <p className="border-t border-border pt-3 text-muted-foreground">
            {own.length} publicaciones · {mentions.length} menciones
          </p>
          {viewer?.id === profile.userId && (
            <Link href="/perfil" className="rounded-md bg-primary px-3 py-1.5 text-center font-medium text-primary-foreground hover:opacity-90">
              Editar perfil
            </Link>
          )}
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <section aria-labelledby="own-title" className="flex flex-col gap-4">
            <h2 id="own-title" className="font-serif text-xl font-bold">
              Publicaciones
            </h2>
            {own.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin publicaciones todavía.</p>
            ) : (
              <ul className="flex flex-col gap-4">
                {own.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} signedIn={Boolean(viewer)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
          {mentions.length > 0 && (
            <section aria-labelledby="mentions-title" className="flex flex-col gap-4">
              <h2 id="mentions-title" className="font-serif text-xl font-bold">
                Menciones a @{profile.handle}
              </h2>
              <ul className="flex flex-col gap-4">
                {mentions.map((p) => (
                  <li key={p.id}>
                    <PostCard post={p} signedIn={Boolean(viewer)} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}
