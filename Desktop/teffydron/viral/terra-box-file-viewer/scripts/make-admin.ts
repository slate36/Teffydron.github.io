import 'dotenv/config'
import { eq } from 'drizzle-orm'
import { db } from '../lib/db'
import { user } from '../lib/db/schema'

async function makeAdmin(email: string) {
  console.log(`Buscando usuario con email: ${email}`)

  const [found] = await db
    .select()
    .from(user)
    .where(eq(user.email, email))
    .limit(1)

  if (!found) {
    console.error('❌ Usuario no encontrado. Registrate primero en la aplicación.')
    process.exit(1)
  }

  console.log(`Usuario encontrado: ${found.name} (${found.email})`)
  console.log(`Rol actual: ${found.role}`)

  if (found.role === 'admin') {
    console.log('✅ El usuario ya es admin')
    process.exit(0)
  }

  await db
    .update(user)
    .set({ role: 'admin', updatedAt: new Date() })
    .where(eq(user.email, email))

  console.log('✅ Usuario actualizado a admin exitosamente')
  console.log(`\nAhora podés acceder a http://localhost:3001/admin con tu cuenta`)
}

const email = process.argv[2]
if (!email) {
  console.error('❌ Error: Debes proporcionar el email del usuario')
  console.error('Uso: pnpm tsx scripts/make-admin.ts <email>')
  process.exit(1)
}

makeAdmin(email).catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
