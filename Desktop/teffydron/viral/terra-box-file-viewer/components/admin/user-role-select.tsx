'use client'

import { useTransition } from 'react'
import { setUserRole } from '@/app/actions/admin'

export function UserRoleSelect({ userId, role, selfId }: { userId: string; role: string; selfId: string }) {
  const [pending, startTransition] = useTransition()
  const isSelf = userId === selfId

  return (
    <select
      value={role}
      disabled={pending || isSelf}
      onChange={(e) =>
        startTransition(async () => {
          await setUserRole(userId, e.target.value as 'user' | 'admin')
        })
      }
      className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium disabled:opacity-50"
      title={isSelf ? 'No podés cambiarte el rol a vos mismo' : undefined}
    >
      <option value="user">Usuario</option>
      <option value="admin">Admin</option>
    </select>
  )
}
