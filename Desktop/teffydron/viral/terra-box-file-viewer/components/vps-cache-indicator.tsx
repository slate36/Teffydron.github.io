import { Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

export function VpsCacheIndicator({ className }: { className?: string }) {
  return (
    <span
      title="Video completo disponible localmente en el VPS"
      aria-label="Video completo disponible localmente en el VPS"
      className={cn(
        'inline-flex items-center gap-1 rounded-full border-2 border-amber-300 bg-amber-400 px-2.5 py-1 align-middle text-[11px] leading-none font-extrabold tracking-wide text-amber-950 shadow-[0_2px_12px_rgba(0,0,0,0.45)]',
        className,
      )}
    >
      <Zap className="size-4 fill-current" aria-hidden="true" />
      EN VPS
    </span>
  )
}
