import { drizzle } from 'drizzle-orm/better-sqlite3'
import Database from 'better-sqlite3'
import * as schema from './schema'
import path from 'path'

const dbPath = path.join(process.cwd(), 'local.db')
const sqlite = new Database(dbPath)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS video_cache (
    path TEXT PRIMARY KEY NOT NULL,
    size INTEGER NOT NULL DEFAULT 0,
    modifiedAt INTEGER NOT NULL,
    status TEXT NOT NULL,
    error TEXT,
    downloadedAt INTEGER,
    updatedAt INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS video_cache_status_idx ON video_cache (status);

  CREATE TABLE IF NOT EXISTS video_sync_state (
    id TEXT PRIMARY KEY NOT NULL,
    status TEXT NOT NULL,
    startedAt INTEGER NOT NULL,
    finishedAt INTEGER,
    scanned INTEGER NOT NULL DEFAULT 0,
    downloaded INTEGER NOT NULL DEFAULT 0,
    failed INTEGER NOT NULL DEFAULT 0,
    skipped INTEGER NOT NULL DEFAULT 0,
    cachedBytes INTEGER NOT NULL DEFAULT 0,
    limitBytes INTEGER NOT NULL,
    error TEXT
  );
`)
export const db = drizzle(sqlite, { schema })
