import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, '..', 'local.db'))

// 1. Add role column to user table
try {
  db.exec(`ALTER TABLE user ADD COLUMN role TEXT NOT NULL DEFAULT 'user'`)
  console.log('✓ role column added to user')
} catch (e) {
  if (e.message.includes('duplicate column')) {
    console.log('  role column already exists')
  } else {
    console.error('  role:', e.message)
  }
}

// 2. Create folder_config table
db.exec(`
  CREATE TABLE IF NOT EXISTS folder_config (
    path      TEXT    PRIMARY KEY,
    label     TEXT    NOT NULL DEFAULT '',
    visible   INTEGER NOT NULL DEFAULT 1,
    pinned    INTEGER NOT NULL DEFAULT 0,
    sortOrder INTEGER NOT NULL DEFAULT 0,
    createdAt INTEGER NOT NULL DEFAULT (unixepoch()),
    updatedAt INTEGER NOT NULL DEFAULT (unixepoch())
  )
`)
console.log('✓ folder_config table ready')

db.close()
console.log('Migration complete.')
