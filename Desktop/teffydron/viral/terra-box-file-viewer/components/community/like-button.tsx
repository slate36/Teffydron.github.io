'use client'

import { Heart } from 'lucide-react'
import Link from 'next/link'
import { useOptimistic, useTransition } from 'react'
import { toggleLike } from '@/app/actions/community'
import { cn } from '@/lib/utils'

type LikeState = { liked: boolean; count: number }

export function LikeButton({
  postId,
  liked,
  count,
  signedIn,
}: {
  postId: number
  liked: boolean
  count: number
  signedIn: boolean
}) {
  const [, startTransition] = useTransition()
  const [state, setOptimistic] = useOptimistic<LikeState, void>({ liked, count }, (s) => ({
    liked: !s.liked,
    count: s.count + (s.liked ? -1 : 1),
  }))

  const classes = cn(
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm transition-colors',
    state.liked ? 'bg-destructive/10 text-destructive' : 'text-muted-foreground hover:bg-secondary hover:text-foreground',
  )
  const content = (
    <>
      <Heart className={cn('size-4', state.liked && 'fill-current')} aria-hidden="true" />
      <span>{state.count}</span>
      <span className="sr-only">{state.liked ? 'Quitar me gusta' : 'Me gusta'}</span>
    </>
  )

  if (!signedIn) {
    return (
      <Link href="/ingresar" className={classes} aria-label="Ingresa para dar me gusta">
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      aria-pressed={state.liked}
      onClick={() =>
        startTransition(async () => {
          setOptimistic()
          await toggleLike(postId)
        })
      }
    >
      {content}
    </button>
  )
}
