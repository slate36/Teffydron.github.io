import { db } from '@/lib/db'
import { pageVisit } from '@/lib/db/schema'
import { sql } from 'drizzle-orm'

async function main() {
  try {
    // Verificar si la tabla ya existe
    const tables = await db.execute(sql`SELECT name FROM sqlite_master WHERE type='table' AND name='page_visit'`)
    if (tables.rows.length > 0) {
      console.log('La tabla page_visit ya existe.')
      return
    }

    // Crear la tabla page_visit
    await db.execute(sql`
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
  }
}

main()
