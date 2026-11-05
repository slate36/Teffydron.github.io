'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { authClient } from '@/lib/auth-client'

export function SignOutButton({ className }: { className?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await authClient.signOut()
        router.push('/comunidad')
        router.refresh()
      }}
    >
      <LogOut className="size-4" aria-hidden="true" />
      Cerrar sesión
    </button>
  )
}
