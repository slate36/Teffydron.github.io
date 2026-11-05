import { and, asc, desc, eq, like, or, sql, type SQL } from 'drizzle-orm'
import { db } from '@/lib/db'
import { comment, post, profile, user } from '@/lib/db/schema'

export type FeedFilters = {
  tag?: string
  mention?: string
  kind?: string
  q?: string
  authorId?: string
}

function postSelection(viewerId: string | null) {
  return {
    id: post.id,
    userId: post.userId,
    kind: post.kind,
    title: post.title,
    url: post.url,
    body: post.body,
    tags: post.tags,
    mentions: post.mentions,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    authorName: user.name,
    authorHandle: profile.handle,
    likeCount: sql<number>`cast((select count(*) from post_like pl where pl."postId" = ${post.id}) as integer)`,
    commentCount: sql<number>`cast((select count(*) from comment c where c."postId" = ${post.id}) as integer)`,
    likedByMe: viewerId
      ? sql<boolean>`exists(select 1 from post_like pl where pl."postId" = ${post.id} and pl."userId" = ${viewerId})`
      : sql<boolean>`false`,
  }
}

export type FeedPost = {
  id: number
  userId: string
  kind: string
  title: string
  url: string | null
  body: string
  tags: string[]
  mentions: string[]
  createdAt: Date
  updatedAt: Date
  authorName: string | null
  authorHandle: string | null
  likeCount: number
  commentCount: number
  likedByMe: boolean
}

export async function getFeed(filters: FeedFilters, viewerId: string | null) {
  const where: SQL[] = []
  if (filters.tag) where.push(sql`json_extract(${post.tags}, '$') LIKE ${`%"${filters.tag.toLowerCase()}"%`}`)
  if (filters.mention) where.push(sql`json_extract(${post.mentions}, '$') LIKE ${`%"${filters.mention.toLowerCase()}"%`}`)
  if (filters.kind) where.push(eq(post.kind, filters.kind))
  if (filters.authorId) where.push(eq(post.userId, filters.authorId))
  if (filters.q) {
    const term = `%${filters.q.replace(/[%_]/g, '')}%`
    const match = or(like(post.title, term), like(post.body, term))
    if (match) where.push(match)
  }

  const rows = await db
    .select(postSelection(viewerId))
    .from(post)
    .leftJoin(user, eq(user.id, post.userId))
    .leftJoin(profile, eq(profile.userId, post.userId))
    .where(where.length ? and(...where) : undefined)
    .orderBy(desc(post.createdAt))
    .limit(50)

  return rows.map((row) => ({
    ...row,
    tags: parseJsonArray(row.tags as string),
    mentions: parseJsonArray(row.mentions as string),
  }))
}

function parseJsonArray(value: string): string[] {
  try {
    return JSON.parse(value || '[]')
  } catch {
    return []
  }
}

export async function getPost(id: number, viewerId: string | null) {
  const [row] = await db
    .select(postSelection(viewerId))
    .from(post)
    .leftJoin(user, eq(user.id, post.userId))
    .leftJoin(profile, eq(profile.userId, post.userId))
    .where(eq(post.id, id))
    .limit(1)
  if (!row) return null
  return {
    ...row,
    tags: parseJsonArray(row.tags as string),
    mentions: parseJsonArray(row.mentions as string),
  }
}

export async function getComments(postId: number) {
  return db
    .select({
      id: comment.id,
      userId: comment.userId,
      body: comment.body,
      createdAt: comment.createdAt,
      authorName: user.name,
      authorHandle: profile.handle,
    })
    .from(comment)
    .leftJoin(user, eq(user.id, comment.userId))
    .leftJoin(profile, eq(profile.userId, comment.userId))
    .where(eq(comment.postId, postId))
    .orderBy(asc(comment.createdAt))
}

export async function getTrendingTags() {
  const rows = await db.select({ tags: post.tags }).from(post)
  const tagCounts = new Map<string, number>()
  for (const row of rows) {
    try {
      const tags = JSON.parse(row.tags || '[]') as string[]
      for (const tag of tags) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1)
      }
    } catch {
      // Skip invalid JSON
    }
  }
  return Array.from(tagCounts.entries())
    .map(([tag, total]) => ({ tag, total }))
    .sort((a, b) => b.total - a.total || a.tag.localeCompare(b.tag))
    .slice(0, 15)
}

export async function getProfileByHandle(handle: string) {
  const [row] = await db
    .select({
      userId: profile.userId,
      handle: profile.handle,
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      instagram: profile.instagram,
      createdAt: profile.createdAt,
      name: user.name,
    })
    .from(profile)
    .leftJoin(user, eq(user.id, profile.userId))
    .where(eq(profile.handle, handle.toLowerCase()))
    .limit(1)
  return row ?? null
}

export async function getOwnProfile(userId: string) {
  const [row] = await db.select().from(profile).where(eq(profile.userId, userId)).limit(1)
  return row ?? null
}
