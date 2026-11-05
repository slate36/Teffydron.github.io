'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { POST_KINDS, extractMentions, extractTags, normalizeHandle, safeUrl } from '@/lib/community'
import { db } from '@/lib/db'
import { comment, post, postLike, profile } from '@/lib/db/schema'
import { getViewer } from '@/lib/viewer'

export type FormState = { error?: string; ok?: boolean }

async function requireViewer() {
  const viewer = await getViewer()
  if (!viewer) throw new Error('Unauthorized')
  return viewer
}

function readPostForm(formData: FormData) {
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const rawUrl = String(formData.get('url') ?? '').trim()
  const rawTags = String(formData.get('tags') ?? '')
  const kind = String(formData.get('kind') ?? 'enlace')

  if (title.length < 3 || title.length > 140) return { error: 'El título debe tener entre 3 y 140 caracteres.' }
  if (body.length > 2000) return { error: 'El texto no puede superar los 2000 caracteres.' }
  if (!POST_KINDS.some((k) => k.value === kind)) return { error: 'Tipo de publicación no válido.' }
  const url = rawUrl ? safeUrl(rawUrl) : null
  if (rawUrl && !url) return { error: 'El enlace debe empezar con http:// o https://' }

  const tagSource = `${title} ${body} ${rawTags
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((t) => (t.startsWith('#') ? t : `#${t}`))
    .join(' ')}`

  return {
    values: {
      title,
      body,
      url,
      kind,
      tags: extractTags(tagSource),
      mentions: extractMentions(`${title} ${body}`),
    },
  }
}

export async function createPost(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireViewer()
  const parsed = readPostForm(formData)
  if ('error' in parsed) return { error: parsed.error }
  await db.insert(post).values({
    ...parsed.values,
    userId: viewer.id,
    tags: JSON.stringify(parsed.values.tags),
    mentions: JSON.stringify(parsed.values.mentions),
  })
  revalidatePath('/comunidad')
  return { ok: true }
}

export async function updatePost(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireViewer()
  const parsed = readPostForm(formData)
  if ('error' in parsed) return { error: parsed.error }
  const updated = await db
    .update(post)
    .set({
      ...parsed.values,
      tags: JSON.stringify(parsed.values.tags),
      mentions: JSON.stringify(parsed.values.mentions),
      updatedAt: new Date(),
    })
    .where(and(eq(post.id, id), eq(post.userId, viewer.id)))
    .returning({ id: post.id })
  if (!updated.length) return { error: 'No puedes editar esta publicación.' }
  revalidatePath('/comunidad')
  redirect(`/comunidad/${id}`)
}

export async function deletePost(id: number) {
  const viewer = await requireViewer()
  const deleted = await db
    .delete(post)
    .where(and(eq(post.id, id), eq(post.userId, viewer.id)))
    .returning({ id: post.id })
  if (deleted.length) {
    await db.delete(comment).where(eq(comment.postId, id))
    await db.delete(postLike).where(eq(postLike.postId, id))
  }
  revalidatePath('/comunidad')
  redirect('/comunidad')
}

export async function toggleLike(postId: number) {
  const viewer = await requireViewer()
  const removed = await db
    .delete(postLike)
    .where(and(eq(postLike.postId, postId), eq(postLike.userId, viewer.id)))
    .returning()
  if (!removed.length) {
    const [exists] = await db.select({ id: post.id }).from(post).where(eq(post.id, postId)).limit(1)
    if (exists) await db.insert(postLike).values({ postId, userId: viewer.id }).onConflictDoNothing()
  }
  revalidatePath('/comunidad')
}

export async function addComment(postId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireViewer()
  const body = String(formData.get('body') ?? '').trim()
  if (body.length < 1 || body.length > 1000) return { error: 'El comentario debe tener entre 1 y 1000 caracteres.' }
  const [exists] = await db.select({ id: post.id }).from(post).where(eq(post.id, postId)).limit(1)
  if (!exists) return { error: 'La publicación ya no existe.' }
  await db.insert(comment).values({ postId, userId: viewer.id, body })
  revalidatePath(`/comunidad/${postId}`)
  return { ok: true }
}

export async function deleteComment(id: number, postId: number) {
  const viewer = await requireViewer()
  await db.delete(comment).where(and(eq(comment.id, id), eq(comment.userId, viewer.id)))
  revalidatePath(`/comunidad/${postId}`)
}

export async function updateProfile(_prev: FormState, formData: FormData): Promise<FormState> {
  const viewer = await requireViewer()
  const handle = normalizeHandle(String(formData.get('handle') ?? ''))
  const bio = String(formData.get('bio') ?? '').trim().slice(0, 300)
  const location = String(formData.get('location') ?? '').trim().slice(0, 80)
  const rawWebsite = String(formData.get('website') ?? '').trim()
  const instagram = normalizeHandle(String(formData.get('instagram') ?? '').replace(/^@/, ''))

  if (handle.length < 3) return { error: 'El usuario debe tener al menos 3 caracteres (letras, números, _ o .).' }
  const website = rawWebsite ? safeUrl(rawWebsite) : null
  if (rawWebsite && !website) return { error: 'El sitio web debe empezar con http:// o https://' }

  const [taken] = await db
    .select({ userId: profile.userId })
    .from(profile)
    .where(and(eq(profile.handle, handle), ne(profile.userId, viewer.id)))
    .limit(1)
  if (taken) return { error: 'Ese nombre de usuario ya está en uso.' }

  await db
    .update(profile)
    .set({ handle, bio: bio || null, location: location || null, website, instagram: instagram || null, updatedAt: new Date() })
    .where(eq(profile.userId, viewer.id))

  revalidatePath('/perfil')
  revalidatePath(`/u/${handle}`)
  return { ok: true }
}
