import { eq } from 'drizzle-orm'
import { cache } from 'react'
import { getSession } from '@/lib/auth'
import { normalizeHandle } from '@/lib/community'
import { db } from '@/lib/db'
import { profile } from '@/lib/db/schema'

export type Viewer = { id: string; name: string; email: string; handle: string }

async function ensureProfile(userId: string, name: string, email: string) {
  const [existing] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  if (existing) return existing

  const base = normalizeHandle(name) || normalizeHandle(email.split('@')[0]) || 'jugador'
  for (let attempt = 0; attempt < 6; attempt++) {
    const handle = attempt === 0 ? base : `${base.slice(0, 25)}${Math.floor(Math.random() * 9000 + 1000)}`
    const [created] = await db
      .insert(profile)
      .values({ userId, handle })
      .onConflictDoNothing()
      .returning()
    if (created) return created
    const [raced] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
    if (raced) return raced
  }
  throw new Error('No se pudo crear el perfil')
}

export const getViewer = cache(async (): Promise<Viewer | null> => {
  const session = await getSession()
  if (!session?.user) return null
  const { id, name, email } = session.user
  const p = await ensureProfile(id, name, email)
  return { id, name, email, handle: p.handle }
})
