import { betterAuth } from 'better-auth'
import { drizzleAdapter } from '@better-auth/drizzle-adapter'
import { headers } from 'next/headers'
import { db } from '@/lib/db'

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'sqlite' }),
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://195.26.250.106',
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  trustedOrigins: [
    'http://195.26.250.106',
    'http://195.26.250.106:80',
    'http://localhost:3000',
    'http://localhost:3001',
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'lax' as const,
      secure: false,
    },
  },
})

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}
