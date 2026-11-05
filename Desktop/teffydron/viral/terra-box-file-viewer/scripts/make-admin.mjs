import Database from 'better-sqlite3'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, '..', 'local.db'))

const email = process.argv[2]
if (!email) {
  console.error('Usage: node scripts/make-admin.mjs <email>')
  process.exit(1)
}

const result = db.prepare(`UPDATE user SET role = 'admin' WHERE email = ?`).run(email)
if (result.changes > 0) {
  console.log(`✓ ${email} ahora es admin`)
} else {
  console.log(`✗ No se encontró el usuario con email: ${email}`)
}
db.close()
