const Database = require('better-sqlite3')
const path = require('path')

const dbPath = path.join(process.cwd(), 'local.db')
const db = new Database(dbPath)

try {
  const existing = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='page_visit'").get()
  if (existing) {
    console.log('La tabla page_visit ya existe.')
    process.exit(0)
  }

  db.exec(`
    CREATE TABLE IF NOT EXISTS page_visit (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      ipAddress TEXT NOT NULL,
      path TEXT NOT NULL,
      userAgent TEXT NOT NULL,
      referrer TEXT,
      country TEXT,
      city TEXT,
      deviceType TEXT DEFAULT 'desktop' NOT NULL,
      browser TEXT,
      os TEXT,
      sessionId TEXT NOT NULL,
      userId TEXT,
      visitedAt INTEGER NOT NULL
    )
  `)

  console.log('Tabla page_visit creada exitosamente.')
} catch (error) {
  console.error('Error creando la tabla:', error)
  process.exit(1)
} finally {
  db.close()
}
