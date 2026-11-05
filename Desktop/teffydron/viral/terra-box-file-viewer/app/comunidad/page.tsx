import type { Metadata } from 'next'
import Link from 'next/link'
import { createPost } from '@/app/actions/community'
import { FeedFilters } from '@/components/community/feed-filters'
import { PostCard } from '@/components/community/post-card'
import { PostForm } from '@/components/community/post-form'
import { SiteHeader } from '@/components/site-header'
import { POST_KINDS } from '@/lib/community'
import { getFeed, getTrendingTags } from '@/lib/queries'
import { getViewer } from '@/lib/viewer'

export const metadata: Metadata = {
  title: 'Foro | Teffydron Polo',
  description: 'Foro de la comunidad del polo. Notas, torneos, enlaces, debates y menciones. Contenido creado por Teffydron y la comunidad.',
}

function param(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value
  return v?.trim() || undefined
}

export default async function CommunityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams
  const rawKind = param(sp.kind)
  const filters = {
    tag: param(sp.tag)?.toLowerCase(),
    mention: param(sp.m)?.toLowerCase(),
    kind: POST_KINDS.some((k) => k.value === rawKind) ? rawKind : undefined,
    q: param(sp.q)?.slice(0, 80),
  }

  const viewer = await getViewer()
  const [posts, trending] = await Promise.all([getFeed(filters, viewer?.id ?? null), getTrendingTags()])

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Foro de Polo" subtitle="Notas, torneos, debates y contenido de la comunidad del polo. Publicá, comentá y seguí los hashtags." />
      <main className="mx-auto grid max-w-7xl gap-8 px-4 py-8 lg:grid-cols-[1fr_320px]">
        <section aria-labelledby="feed-title" className="flex min-w-0 flex-col gap-5">
          <h2 id="feed-title" className="sr-only">
            Publicaciones
          </h2>
          <FeedFilters kind={filters.kind} q={filters.q} tag={filters.tag} mention={filters.mention} />

          {viewer ? (
            <details className="group rounded-lg border border-border bg-card p-5 shadow-sm open:border-primary/40">
              <summary className="cursor-pointer list-none font-serif text-lg font-bold marker:hidden">
                <span className="text-primary">+</span> Nueva publicación
              </summary>
              <div className="mt-4">
                <PostForm action={createPost} />
              </div>
            </details>
          ) : (
            <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-primary/40 bg-secondary p-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-secondary-foreground">Ingresa para publicar, comentar y dar me gusta.</p>
              <div className="flex gap-2">
                <Link href="/ingresar" className="rounded-md border border-primary px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10">
                  Ingresar
                </Link>
                <Link href="/registro" className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Crear cuenta
                </Link>
              </div>
            </div>
          )}

          {posts.length === 0 ? (
            <p className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground">
              Todavía no hay publicaciones aquí.
            </p>
          ) : (
            <ul className="flex flex-col gap-4">
              {posts.map((post) => (
                <li key={post.id}>
                  <PostCard post={post} signedIn={Boolean(viewer)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-6 lg:self-start">
          <section aria-labelledby="trending-title" className="rounded-lg border border-border bg-card p-5">
            <h2 id="trending-title" className="mb-3 font-serif text-lg font-bold">
              Hashtags del momento
            </h2>
            {trending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aún no hay hashtags. Prueba con #polo o #palermo.</p>
            ) : (
              <ul className="flex flex-col">
                {trending.map(({ tag, total }) => (
                  <li key={tag}>
                    <Link
                      href={`/comunidad?tag=${encodeURIComponent(tag)}`}
                      className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-secondary"
                    >
                      <span className="font-medium text-primary">#{tag}</span>
                      <span className="text-xs text-muted-foreground">{total}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="rounded-lg bg-primary p-5 text-primary-foreground">
            <h2 className="mb-2 font-serif text-lg font-bold">¿Cómo funciona?</h2>
            <ul className="flex flex-col gap-1.5 text-sm text-primary-foreground/85">
              <li>
                Escribe <span className="font-semibold text-accent">#hashtag</span> para agrupar temas.
              </li>
              <li>
                Usa <span className="font-semibold text-accent">@usuario</span> para mencionar a alguien.
              </li>
              <li>Agrega enlaces a revistas, sitios o torneos.</li>
            </ul>
          </section>
        </aside>
      </main>
    </div>
  )
}
