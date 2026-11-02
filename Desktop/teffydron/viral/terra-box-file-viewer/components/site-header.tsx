import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SiteNav } from '@/components/site-nav'
import { InteractiveDrone } from '@/components/interactive-drone'

export function SiteHeader({
  title = 'Videoteca de Polo',
  subtitle = 'Archivo audiovisual y tomas aéreas exclusivas.',
  showDroneHero = false,
}: {
  title?: string
  subtitle?: string
  showDroneHero?: boolean
}) {
  const heroImage = '/images/polo-hero.png'

  return (
    <header className="relative isolate overflow-hidden bg-[#164532] text-primary-foreground border-b border-[#c5a059]/20">
      <Image
        src={heroImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover opacity-25"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(5,15,12,0.96),rgba(6,18,14,0.90),rgba(6,18,14,0.60),rgba(6,18,14,0.30))]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#164532] to-transparent" />

      <div className="mx-auto max-w-7xl px-4 pt-4">
        <div className="flex justify-end">
          <SiteNav />
        </div>

        <div className="grid items-center gap-8 pb-10 pt-6 md:pb-14 lg:grid-cols-[1.1fr_0.9fr] lg:pt-8">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c5a059]/30 bg-[#c5a059]/10 px-3 py-1 text-[11px] font-medium tracking-[0.2em] text-[#e8d5aa] uppercase backdrop-blur-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c5a059]" />
            </div>

            <div className="mb-4">
              <Image
                src="/images/teffydron-logo.png"
                alt="TefyDron"
                width={170}
                height={100}
                className="drop-shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
                priority
              />
            </div>

            <h1 className="max-w-xl font-serif text-4xl font-bold tracking-tight text-white md:text-5xl lg:text-6xl text-balance">
              {title}
            </h1>

            <p className="mt-4 max-w-xl font-serif italic text-base leading-relaxed text-white/75 md:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
            {showDroneHero ? (
              <>
                {/* Botón CTA solo móvil: arriba, sin dron visible en celular */}
                <div className="lg:hidden mb-8 text-center">
                  <Link
                    href="/videoteca"
                    className="inline-block flex items-center gap-2 rounded-xl bg-[#c5a059] px-4 py-3 text-sm font-bold text-[#0a1714] transition-all hover:bg-[#d8b56f] shadow-[0_15px_30px_rgba(0,0,0,0.5)] whitespace-nowrap"
                  >
                    <span>Videos de Dron</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
                <InteractiveDrone className="hidden lg:block w-full min-h-[420px]" />
              </>
            ) : (
              <div className="relative overflow-hidden rounded-[24px] border border-[#c5a059]/25 bg-white/5 shadow-[0_30px_60px_rgba(0,0,0,0.4)] backdrop-blur-md">
                <div className="relative h-[360px]">
                  <Image
                    src={heroImage}
                    alt="Vista aérea de campo de polo"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 480px"
                    className="object-cover opacity-60"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#164532] via-transparent to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="mb-2 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#c5a059]">
                      <span>Campo de Polo</span>
                      <span className="rounded-full border border-[#c5a059]/40 bg-[#c5a059]/20 px-2 py-0.5 text-[#e8d5aa]">
                        4K Drone
                      </span>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/40 p-3.5 backdrop-blur-md">
                      <p className="font-serif text-lg font-semibold text-white">Palermo / Abierto de Polo</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="h-0.5 bg-gradient-to-r from-transparent via-[#c5a059] to-transparent opacity-60" />
    </header>
  )
}
