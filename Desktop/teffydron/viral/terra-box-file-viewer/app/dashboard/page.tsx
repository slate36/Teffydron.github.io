import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { eq } from 'drizzle-orm'
import {
  FileVideo,
  Heart,
  MessageSquare,
  User,
  PenSquare,
  QrCode,
  Settings,
  BarChart2,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { SignOutButton } from '@/components/sign-out-button'
import { SiteHeader } from '@/components/site-header'
import { getFeed, getOwnProfile } from '@/lib/queries'
import { db } from '@/lib/db'
import { comment, user } from '@/lib/db/schema'
import { getViewer } from '@/lib/viewer'

export const metadata: Metadata = { title: 'Dashboard | TefyDron Polo' }

export default async function DashboardPage() {
  const viewer = await getViewer()
  if (!viewer) redirect('/ingresar')

  const [profile, posts, comments, userRow] = await Promise.all([
    getOwnProfile(viewer.id),
    getFeed({ authorId: viewer.id }, viewer.id),
    getCommentsByUser(viewer.id),
    db.select({ role: user.role }).from(user).where(eq(user.id, viewer.id)).limit(1).then(r => r[0]),
  ])

  const isAdmin = userRow?.role === 'admin'

  const likeCount = posts.reduce((sum, p) => sum + p.likeCount, 0)
  const commentCount = comments.length
  const initials = viewer.name.slice(0, 2).toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        title={`Hola, ${viewer.name.split(' ')[0]}`}
        subtitle="Tu panel de actividad en TefyDron Polo"
      />

      <main className="mx-auto max-w-7xl px-4 py-8 lg:grid lg:grid-cols-[260px_1fr] lg:gap-8">

        {/* ── Sidebar ── */}
        <aside className="mb-8 lg:mb-0 lg:sticky lg:top-6 lg:self-start flex flex-col gap-4">

          {/* Avatar card */}
          <div className="rounded-xl border border-border bg-card p-5 flex flex-col items-center gap-3 shadow-sm">
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground shadow-md">
              {initials}
            </div>
            <div className="text-center">
              <p className="font-semibold">{viewer.name}</p>
              <p className="text-xs text-muted-foreground">@{viewer.handle}</p>
            </div>
            <Link
              href={`/u/${viewer.handle}`}
              className="w-full rounded-md border border-border px-3 py-1.5 text-center text-xs font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            >
              Ver perfil público
            </Link>
          </div>

          {/* Navigation */}
          <nav className="rounded-xl border border-border bg-card overflow-hidden shadow-sm" aria-label="Dashboard">
            <div className="px-3 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase border-b border-border">
              Panel
            </div>
            <div className="flex flex-col p-2 gap-0.5">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium bg-primary/10 text-primary"
              >
                <BarChart2 className="size-4" aria-hidden="true" />
                Dashboard
              </Link>
              <Link
                href="/comunidad"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <MessageSquare className="size-4" aria-hidden="true" />
                Foro
              </Link>
              <Link
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <FileVideo className="size-4" aria-hidden="true" />
                Videoteca
              </Link>
            </div>

            <div className="px-3 py-2 text-xs font-semibold tracking-widest text-muted-foreground uppercase border-t border-b border-border">
              Cuenta
            </div>
            <div className="flex flex-col p-2 gap-0.5">
              <Link
                href="/perfil"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              >
                <Settings className="size-4" aria-hidden="true" />
                Editar perfil
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                  <ShieldCheck className="size-4 text-accent-foreground" aria-hidden="true" />
                  Administración
                </Link>
              )}
              <SignOutButton className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors w-full text-left" />
            </div>
          </nav>

          {/* Quick actions */}
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm flex flex-col gap-2">
            <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase mb-1">Acciones rápidas</p>
            <Link
              href="/comunidad"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <PenSquare className="size-4 text-primary" aria-hidden="true" />
              Nueva publicación
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:border-primary/50 hover:bg-primary/5 transition-colors"
            >
              <QrCode className="size-4 text-primary" aria-hidden="true" />
              Generar QR
            </Link>
          </div>
        </aside>

        {/* ── Content ── */}
        <div className="flex flex-col gap-6">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[
              { label: 'Publicaciones', value: posts.length, icon: PenSquare, color: 'text-blue-600 bg-blue-50' },
              { label: 'Likes recibidos', value: likeCount, icon: Heart, color: 'text-rose-500 bg-rose-50' },
              { label: 'Comentarios', value: commentCount, icon: MessageSquare, color: 'text-amber-600 bg-amber-50' },
              { label: 'Usuario', value: `@${profile?.handle ?? viewer.handle}`, icon: User, color: 'text-primary bg-primary/10', small: true },
            ].map(({ label, value, icon: Icon, color, small }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col gap-3">
                <div className={`flex size-10 items-center justify-center rounded-lg ${color}`}>
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`font-bold ${small ? 'text-base' : 'text-2xl'} truncate`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent posts */}
          <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                Publicaciones recientes
              </h2>
              <Link href="/comunidad" className="text-xs font-medium text-primary hover:underline">
                Ver todas →
              </Link>
            </div>
            {posts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                <PenSquare className="size-10 text-muted-foreground/40" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">Todavía no tenés publicaciones.</p>
                <Link href="/comunidad" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90">
                  Crear primera publicación
                </Link>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {posts.slice(0, 8).map((post) => (
                  <li key={post.id} className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-secondary/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{post.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        <Heart className="inline size-3 mr-0.5" aria-hidden="true" />
                        {post.likeCount} ·
                        <MessageSquare className="inline size-3 mx-0.5" aria-hidden="true" />
                        {post.commentCount}
                      </p>
                    </div>
                    <Link
                      href={`/comunidad/${post.id}`}
                      className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/10 transition-colors"
                    >
                      Ver
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* Recent comments */}
          {comments.length > 0 && (
            <section className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-border">
                <h2 className="font-serif text-lg font-bold flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" aria-hidden="true" />
                  Últimos comentarios
                </h2>
              </div>
              <ul className="divide-y divide-border">
                {comments.slice(0, 5).map((c) => (
                  <li key={c.id} className="flex items-start gap-3 px-6 py-4">
                    <MessageSquare className="size-4 mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="text-sm line-clamp-2">{c.body}</p>
                      <Link
                        href={`/comunidad/${c.postId}#comentarios`}
                        className="text-xs text-primary hover:underline mt-0.5 inline-block"
                      >
                        Ver en publicación →
                      </Link>
                    </div>
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

async function getCommentsByUser(userId: string) {
  return db.select().from(comment).where(eq(comment.userId, userId)).limit(100)
}
