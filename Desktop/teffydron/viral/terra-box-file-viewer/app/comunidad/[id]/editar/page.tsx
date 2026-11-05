import { notFound, redirect } from 'next/navigation'
import { updatePost } from '@/app/actions/community'
import { PostForm } from '@/components/community/post-form'
import { SiteHeader } from '@/components/site-header'
import { getPost } from '@/lib/queries'
import { getViewer } from '@/lib/viewer'

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id)
  if (!Number.isInteger(id) || id <= 0) notFound()
  const viewer = await getViewer()
  if (!viewer) redirect('/ingresar')
  const post = await getPost(id, viewer.id)
  if (!post || post.userId !== viewer.id) notFound()

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader title="Editar publicación" subtitle={post.title} />
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <PostForm
            action={updatePost.bind(null, post.id)}
            defaults={{ kind: post.kind, title: post.title, url: post.url, body: post.body, tags: post.tags }}
            submitLabel="Guardar cambios"
          />
        </div>
      </main>
    </div>
  )
}
