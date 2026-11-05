import { integer, sqliteTable, primaryKey, text } from 'drizzle-orm/sqlite-core'

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', { mode: 'boolean' }).notNull().default(false),
  image: text('image'),
  role: text('role', { enum: ['user', 'admin'] }).notNull().default('user'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(new Date()),
})

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(new Date()),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', { mode: 'timestamp' }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', { mode: 'timestamp' }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(new Date()),
})

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', { mode: 'timestamp' }).notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).default(new Date()),
})

export const profile = sqliteTable('profile', {
  userId: text('userId').primaryKey(),
  handle: text('handle').notNull().unique(),
  bio: text('bio'),
  location: text('location'),
  website: text('website'),
  instagram: text('instagram'),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(new Date()),
})

export const post = sqliteTable('post', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  kind: text('kind').notNull().default('enlace'),
  title: text('title').notNull(),
  url: text('url'),
  body: text('body').notNull().default(''),
  tags: text('tags').notNull().default('[]'), // JSON string array
  mentions: text('mentions').notNull().default('[]'), // JSON string array
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(new Date()),
})

export const comment = sqliteTable('comment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  postId: integer('postId').notNull(),
  userId: text('userId').notNull(),
  body: text('body').notNull(),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
})

export const postLike = sqliteTable(
  'post_like',
  {
    postId: integer('postId').notNull(),
    userId: text('userId').notNull(),
    createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  },
  (t) => [primaryKey({ columns: [t.postId, t.userId] })],
)

// Carpetas de TeraBox configuradas por el admin
export const folderConfig = sqliteTable('folder_config', {
  path: text('path').primaryKey(),          // ej: "/polo/torneos"
  label: text('label').notNull().default(''), // nombre visible opcional
  visible: integer('visible', { mode: 'boolean' }).notNull().default(true),
  pinned: integer('pinned', { mode: 'boolean' }).notNull().default(false),
  sortOrder: integer('sortOrder').notNull().default(0),
  createdAt: integer('createdAt', { mode: 'timestamp' }).notNull().default(new Date()),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull().default(new Date()),
})

export const videoCache = sqliteTable('video_cache', {
  path: text('path').primaryKey(),
  size: integer('size').notNull().default(0),
  modifiedAt: integer('modifiedAt', { mode: 'timestamp_ms' }).notNull(),
  status: text('status', {
    enum: ['queued', 'downloading', 'downloaded', 'error', 'skipped'],
  }).notNull(),
  error: text('error'),
  downloadedAt: integer('downloadedAt', { mode: 'timestamp' }),
  updatedAt: integer('updatedAt', { mode: 'timestamp' }).notNull(),
})

export const videoSyncState = sqliteTable('video_sync_state', {
  id: text('id').primaryKey(),
  status: text('status', { enum: ['running', 'complete', 'partial', 'error'] }).notNull(),
  startedAt: integer('startedAt', { mode: 'timestamp' }).notNull(),
  finishedAt: integer('finishedAt', { mode: 'timestamp' }),
  scanned: integer('scanned').notNull().default(0),
  downloaded: integer('downloaded').notNull().default(0),
  failed: integer('failed').notNull().default(0),
  skipped: integer('skipped').notNull().default(0),
  cachedBytes: integer('cachedBytes').notNull().default(0),
  limitBytes: integer('limitBytes').notNull(),
  error: text('error'),
})

// Visitas y analítica de la videoteca
export const pageVisit = sqliteTable('page_visit', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ipAddress: text('ipAddress').notNull(),
  path: text('path').notNull(),
  userAgent: text('userAgent').notNull(),
  referrer: text('referrer'),
  country: text('country'),
  city: text('city'),
  deviceType: text('deviceType', { enum: ['mobile', 'desktop', 'tablet'] }).notNull().default('desktop'),
  browser: text('browser'),
  os: text('os'),
  sessionId: text('sessionId').notNull(),
  userId: text('userId'),
  visitedAt: integer('visitedAt', { mode: 'timestamp' }).notNull().default(new Date()),
})
