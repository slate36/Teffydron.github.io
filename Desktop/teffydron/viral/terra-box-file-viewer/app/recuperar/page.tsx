import type { Metadata } from 'next'
import { AuthPage } from '@/components/auth-page'

export const metadata: Metadata = { title: 'Recuperar contraseña | TefyDron Polo' }

export default function ForgotPasswordPage() {
  return <AuthPage mode="forgot-password" />
}
