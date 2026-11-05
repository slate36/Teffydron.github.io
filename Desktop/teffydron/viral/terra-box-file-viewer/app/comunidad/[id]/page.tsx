import { ArrowLeft, Pencil, Trash2 } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { addComment, deleteComment, deletePost } from '@/app/actions/community'
import { CommentForm } from '@/components/community/comment-form'
import { ConfirmSubmit } from '@/components/community/confirm-submit'
import { PostCard } from '@/components/community/post-card'
import { RichText } from '@/components/community/rich-text'
import { SiteHeader } from '@/components/site-header'
import { timeAgo } from '@/lib/community'
import { getComments, getPost } from '@/lib/queries'
import { getViewer } from '@/lib/viewer'

type Props = { params: Promise<{ id: string }> }

async function loadPost(params: Props['params']) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  return id
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = await loadPost(params)
  const post = await getPost(id, null)
  return { title: post ? `${post.title} | Comunidad de Polo` : 'Publicación | Comunidad de Polo' }
}

export default async function PostPage({ params }: Props) {
  const id = await loadPost(params)
  const viewer = await getViewer()
  const [post, comments] = await Promise.all([getPost(id, viewer?.id ?? null), getComments(id)])
  if (!post) notFound()
  const isOwner = viewer?.id === post.userId

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Comunidad" subtitle="Publicación" />
      <main className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8">
        <div className="flex items-center justify-between gap-3">
          <Link href="/comunidad" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" aria-hidden="true" />
            Volver
          </Link>
          {isOwner && (
            <div className="flex items-center gap-2">
              <Link href={`/comunidad/${post.id}/editar`} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:border-primary">
                <Pencil className="size-4" aria-hidden="true" />
                Editar
              </Link>
              <form action={deletePost.bind(null, post.id)}>
                <ConfirmSubmit
                  message="¿Eliminar esta publicación? No se puede deshacer."
                  className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-card px-3 py-1.5 text-sm text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Eliminar
                </ConfirmSubmit>
              </form>
            </div>
          )}
        </div>

        <PostCard post={post} signedIn={Boolean(viewer)} full />

        <section id="comentarios" aria-labelledby="comments-title" className="flex flex-col gap-4">
          <h2 id="comments-title" className="font-serif text-xl font-bold">
            Comentarios ({comments.length})
          </h2>
          {viewer ? (
            <CommentForm action={addComment.bind(null, post.id)} />
          ) : (
            <p className="text-sm text-muted-foreground">
              <Link href="/ingresar" className="font-medium text-primary hover:underline">
                Ingresa
              </Link>{' '}
              para comentar.
            </p>
          )}
          <ul className="flex flex-col gap-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <p className="text-sm">
                    <Link href={`/u/${c.authorHandle}`} className="font-semibold hover:underline">
                      {c.authorName}
                    </Link>{' '}
                    <span className="text-xs text-muted-foreground">
                      @{c.authorHandle} · {timeAgo(c.createdAt)}
                    </span>
                  </p>
                  {viewer?.id === c.userId && (
                    <form action={deleteComment.bind(null, c.id, post.id)}>
                      <ConfirmSubmit message="¿Eliminar este comentario?" className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                        <Trash2 className="size-4" aria-hidden="true" />
                        <span className="sr-only">Eliminar comentario</span>
                      </ConfirmSubmit>
                    </form>
                  )}
                </div>
                <RichText text={c.body} className="whitespace-pre-line text-sm leading-relaxed" />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  )
}
