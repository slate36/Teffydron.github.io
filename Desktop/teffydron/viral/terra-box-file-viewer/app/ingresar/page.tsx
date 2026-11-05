import type { Metadata } from 'next'
import { AuthPage } from '@/components/auth-page'

export const metadata: Metadata = { title: 'Ingresar | TefyDron Polo' }

export default function SignInPage() {
  return <AuthPage mode="sign-in" />
}
