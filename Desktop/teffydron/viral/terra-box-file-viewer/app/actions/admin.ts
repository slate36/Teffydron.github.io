'use server'

import { and, eq, ne } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { folderConfig, user } from '@/lib/db/schema'
import { requireAdmin } from '@/lib/admin'
import { getViewer } from '@/lib/viewer'

export async function getCurrentUserId() {
  const viewer = await getViewer()
  return viewer?.id ?? null
}

// ── Folder config ──────────────────────────────────────────────

export async function upsertFolderConfig(
  path: string,
  data: { label?: string; visible?: boolean; pinned?: boolean; sortOrder?: number },
) {
  await requireAdmin()
  await db
    .insert(folderConfig)
    .values({ path, label: data.label ?? '', visible: data.visible ?? true, pinned: data.pinned ?? false, sortOrder: data.sortOrder ?? 0 })
    .onConflictDoUpdate({
      target: folderConfig.path,
      set: { ...data, updatedAt: new Date() },
    })
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function deleteFolderConfig(path: string) {
  await requireAdmin()
  await db.delete(folderConfig).where(eq(folderConfig.path, path))
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function toggleFolderVisible(path: string, visible: boolean) {
  await requireAdmin()
  await db
    .insert(folderConfig)
    .values({ path, visible })
    .onConflictDoUpdate({
      target: folderConfig.path,
      set: { visible, updatedAt: new Date() },
    })
  revalidatePath('/')
  revalidatePath('/admin')
}

export async function toggleFolderPinned(path: string, pinned: boolean) {
  await requireAdmin()
  await db
    .insert(folderConfig)
    .values({ path, pinned })
    .onConflictDoUpdate({
      target: folderConfig.path,
      set: { pinned, updatedAt: new Date() },
    })
  revalidatePath('/')
  revalidatePath('/admin')
}

// ── User management ────────────────────────────────────────────

export async function listUsers() {
  await requireAdmin()
  return db.select({ id: user.id, name: user.name, email: user.email, role: user.role, createdAt: user.createdAt }).from(user).orderBy(user.createdAt)
}

export async function setUserRole(userId: string, role: 'user' | 'admin') {
  const viewer = await requireAdmin()
  // Prevent removing own admin role
  if (userId === viewer.id && role !== 'admin') return { error: 'No podés quitarte el rol de administrador.' }
  await db.update(user).set({ role, updatedAt: new Date() }).where(eq(user.id, userId))
  revalidatePath('/admin')
}
