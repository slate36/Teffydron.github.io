'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import type { NewsLang } from '@/lib/news'

const LANGS: { code: NewsLang; flag: string; label: string }[] = [
  { code: 'es', flag: '🇦🇷', label: 'Español' },
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'pt', flag: '🇧🇷', label: 'Português' },
]

export function LangSwitcher({ current }: { current: NewsLang }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function switchLang(lang: NewsLang) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('lang', lang)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-sm" role="group" aria-label="Idioma de noticias">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          onClick={() => switchLang(code)}
          aria-pressed={current === code}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors
            ${current === code
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
        >
          <span aria-hidden="true">{flag}</span>
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  )
}
