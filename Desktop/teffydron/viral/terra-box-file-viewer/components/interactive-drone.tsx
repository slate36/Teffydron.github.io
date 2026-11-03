'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Compass, Shield, User, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

export function InteractiveDrone({
  className,
}: {
  className?: string
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 })
  const [selectedChukker, setSelectedChukker] = useState(3)
  const containerRef = useRef<HTMLDivElement>(null)
  const propellerRefs = useRef<(SVGLineElement | null)[]>([null, null, null, null])
  const animRef = useRef<number | null>(null)

  // Smooth mouse tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2 // -1 to 1
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2
    setMousePos({ x, y })

    // Move ball & camera reticle on polo field
    const fieldX = Math.max(15, Math.min(85, 50 + x * 28))
    const fieldY = Math.max(20, Math.min(80, 50 + y * 22))
    setBallPos({ x: fieldX, y: fieldY })
  }

  const handleMouseLeave = () => {
    setMousePos({ x: 0, y: 0 })
    setBallPos({ x: 50, y: 50 })
  }

  const tiltX = -mousePos.y * 8
  const tiltY = mousePos.x * 10

  // Propeller spin animation via requestAnimationFrame (pure 2D, no 3D interference)
  useEffect(() => {
    let angle = 0
    const speed = 12 // degrees per frame

    const spin = () => {
      angle = (angle + speed) % 360
      const reverseAngle = (360 - angle) % 360

      if (propellerRefs.current[0]) {
        propellerRefs.current[0]!.style.transform = `rotate(${angle}deg)`
      }
      if (propellerRefs.current[1]) {
        propellerRefs.current[1]!.style.transform = `rotate(${reverseAngle}deg)`
      }
      if (propellerRefs.current[2]) {
        propellerRefs.current[2]!.style.transform = `rotate(${reverseAngle}deg)`
      }
      if (propellerRefs.current[3]) {
        propellerRefs.current[3]!.style.transform = `rotate(${angle}deg)`
      }

      animRef.current = requestAnimationFrame(spin)
    }

    animRef.current = requestAnimationFrame(spin)

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'group/stage relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[#c5a059]/25 bg-gradient-to-b from-[#164532] via-[#164532] to-[#164532] p-4 sm:p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.6)] select-none',
        className,
      )}
      style={{ perspective: 1000 }}
    >
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#c5a059]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-[#164532]/25 blur-3xl" />

      {/* Top Bar: Discreet Polo & Drone Status */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-2 sm:pb-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#c5a059] animate-pulse" />
          <span className="font-serif tracking-widest text-[#e8d5aa] text-[11px] uppercase">
            Cancha 1 · Palermo
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-white/60">
          <span className="rounded border border-[#c5a059]/30 bg-[#c5a059]/10 px-2 py-0.5 font-mono text-[#e8d5aa]">
            Chukker {selectedChukker}
          </span>
          <span className="font-mono text-emerald-400/90">VPS ONLINE</span>
        </div>
      </div>

      {/* Main Interactive Stage: Drone & Polo Tactical Pitch */}
      <div className="relative my-2 sm:my-4 flex flex-col gap-2 sm:gap-4">
        {/* Floating Discreet Drone */}
        <Link
          href="/videoteca"
          title="Ingresar a la Videoteca de Polo"
          className="group/drone relative flex cursor-pointer flex-col items-center justify-center transition-transform duration-300 ease-out hover:scale-[1.02]"
          style={{
            transform: `rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
          }}
        >
          <div className="relative h-32 sm:h-40 w-48 sm:w-60 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] sm:h-44 sm:w-64">
            <svg viewBox="0 0 320 220" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="droneMatte" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#164532" />
                  <stop offset="50%" stopColor="#164532" />
                  <stop offset="100%" stopColor="#164532" />
                </linearGradient>
                <linearGradient id="poloGold" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#9a7b38" />
                  <stop offset="50%" stopColor="#e5caa1" />
                  <stop offset="100%" stopColor="#9a7b38" />
                </linearGradient>
              </defs>

              {/* Carbon arms */}
              <g stroke="url(#droneMatte)" strokeWidth="10" strokeLinecap="round">
                <line x1="160" y1="110" x2="72" y2="55" />
                <line x1="160" y1="110" x2="248" y2="55" />
                <line x1="160" y1="110" x2="62" y2="165" />
                <line x1="160" y1="110" x2="258" y2="165" />
              </g>

              {/* Gold inlays */}
              <g stroke="url(#poloGold)" strokeWidth="1.5" opacity="0.8">
                <line x1="152" y1="105" x2="82" y2="62" />
                <line x1="168" y1="105" x2="238" y2="62" />
                <line x1="152" y1="115" x2="72" y2="160" />
                <line x1="168" y1="115" x2="248" y2="160" />
              </g>

              {/* Motors */}
              <circle cx="72" cy="55" r="12" fill="#111c19" stroke="url(#poloGold)" strokeWidth="2" />
              <circle cx="248" cy="55" r="12" fill="#111c19" stroke="url(#poloGold)" strokeWidth="2" />
              <circle cx="62" cy="165" r="12" fill="#111c19" stroke="url(#poloGold)" strokeWidth="2" />
              <circle cx="258" cy="165" r="12" fill="#111c19" stroke="url(#poloGold)" strokeWidth="2" />

              {/* Smooth rotating propellers - JS driven, pure 2D rotation */}
              <g transform="translate(72, 55)">
                <ellipse rx="32" ry="7" fill="none" stroke="rgba(229,202,161,0.25)" strokeWidth="1" />
                <line
                  ref={(el) => { propellerRefs.current[0] = el }}
                  x1="-34" y1="0" x2="34" y2="0"
                  stroke="#f0e6d2" strokeWidth="2.5" strokeLinecap="round"
                  opacity="0.75"
                />
                <circle r="3" fill="#c5a059" />
              </g>

              <g transform="translate(248, 55)">
                <ellipse rx="32" ry="7" fill="none" stroke="rgba(229,202,161,0.25)" strokeWidth="1" />
                <line
                  ref={(el) => { propellerRefs.current[1] = el }}
                  x1="-34" y1="0" x2="34" y2="0"
                  stroke="#f0e6d2" strokeWidth="2.5" strokeLinecap="round"
                  opacity="0.75"
                />
                <circle r="3" fill="#c5a059" />
              </g>

              <g transform="translate(62, 165)">
                <ellipse rx="32" ry="7" fill="none" stroke="rgba(229,202,161,0.25)" strokeWidth="1" />
                <line
                  ref={(el) => { propellerRefs.current[2] = el }}
                  x1="-34" y1="0" x2="34" y2="0"
                  stroke="#f0e6d2" strokeWidth="2.5" strokeLinecap="round"
                  opacity="0.75"
                />
                <circle r="3" fill="#c5a059" />
              </g>

              <g transform="translate(258, 165)">
                <ellipse rx="32" ry="7" fill="none" stroke="rgba(229,202,161,0.25)" strokeWidth="1" />
                <line
                  ref={(el) => { propellerRefs.current[3] = el }}
                  x1="-34" y1="0" x2="34" y2="0"
                  stroke="#f0e6d2" strokeWidth="2.5" strokeLinecap="round"
                  opacity="0.75"
                />
                <circle r="3" fill="#c5a059" />
              </g>

              {/* Fuselage / Aerodynamic body */}
              <path
                d="M160 68 C185 68, 198 90, 194 125 C190 148, 178 158, 160 158 C142 158, 130 148, 126 125 C122 90, 135 68, 160 68 Z"
                fill="url(#droneMatte)"
                stroke="url(#poloGold)"
                strokeWidth="2"
              />

              {/* Center crest */}
              <circle cx="160" cy="112" r="14" fill="#091310" stroke="url(#poloGold)" strokeWidth="1.2" />
              <text x="160" y="115" textAnchor="middle" fill="#e5caa1" fontSize="7" fontWeight="bold" fontFamily="serif" letterSpacing="0.8">
                POLO
              </text>

              {/* Gimbal camera */}
              <circle cx={160 + mousePos.x * 4} cy={72 + mousePos.y * 4} r="10" fill="#164532" stroke="url(#poloGold)" strokeWidth="1.5" />
              <circle cx={160 + mousePos.x * 4} cy={72 + mousePos.y * 4} r="5" fill="#38bdf8" opacity="0.7" />
            </svg>
          </div>

          <span className="mt-1 font-serif text-xs text-[#e8d5aa] tracking-widest uppercase transition-opacity group-hover/drone:text-white">
            Ingresar a la Videoteca ➔
          </span>
        </Link>

        {/* Discreet Interactive Polo Tactical Field */}
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#164532]/80 p-3 backdrop-blur-sm">
          <div className="mb-2 flex items-center justify-between text-[10px] text-white/60">
            <span className="flex items-center gap-1">
              <Compass className="h-3 w-3 text-[#c5a059]" />
              Vista aérea interactiva
            </span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5, 6].map((chk) => (
                <button
                  key={chk}
                  type="button"
                  onClick={() => setSelectedChukker(chk)}
                  className={cn(
                    'h-5 w-5 rounded text-[10px] font-mono transition-colors',
                    selectedChukker === chk
                      ? 'bg-[#c5a059] text-black font-bold'
                      : 'bg-white/5 text-white/50 hover:bg-white/10',
                  )}
                >
                  {chk}
                </button>
              ))}
            </div>
          </div>

          {/* Minimalist Polo Pitch SVG */}
          <div className="relative h-20 sm:h-28 w-full overflow-hidden rounded-lg border border-[#c5a059]/20 bg-[#164532]">
            {/* Field Stripes */}
            <div className="absolute inset-0 grid grid-cols-6 opacity-15">
              <div className="bg-black/30" />
              <div className="bg-white/10" />
              <div className="bg-black/30" />
              <div className="bg-white/10" />
              <div className="bg-black/30" />
              <div className="bg-white/10" />
            </div>

            {/* Pitch Lines */}
            <svg viewBox="0 0 300 120" className="absolute inset-0 h-full w-full" fill="none">
              {/* Outer boundary */}
              <rect x="10" y="8" width="280" height="104" stroke="#c5a059" strokeWidth="1" opacity="0.4" />
              {/* Center line */}
              <line x1="150" y1="8" x2="150" y2="112" stroke="#c5a059" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
              {/* Center circle */}
              <circle cx="150" cy="60" r="16" stroke="#c5a059" strokeWidth="1" opacity="0.35" />

              {/* Goal posts (Arcos de mimbre) */}
              <circle cx="10" cy="50" r="2.5" fill="#e8d5aa" />
              <circle cx="10" cy="70" r="2.5" fill="#e8d5aa" />
              <circle cx="290" cy="50" r="2.5" fill="#e8d5aa" />
              <circle cx="290" cy="70" r="2.5" fill="#e8d5aa" />

              {/* 30 & 60 yard markers */}
              <line x1="45" y1="8" x2="45" y2="112" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <line x1="80" y1="8" x2="80" y2="112" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <line x1="220" y1="8" x2="220" y2="112" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <line x1="255" y1="8" x2="255" y2="112" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
            </svg>

            {/* Dynamic Camera Drone Reticle Tracking Movement */}
            <div
              className="pointer-events-none absolute h-9 w-9 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-out"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            >
              <div className="relative h-full w-full rounded-full border border-[#c5a059] bg-[#c5a059]/15 flex items-center justify-center">
                <span className="h-1.5 w-1.5 rounded-full bg-[#e8d5aa]" />
                <span className="absolute -top-3 text-[8px] font-mono font-bold text-[#e8d5aa] tracking-widest">
                  CAM
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar: Profile only */}
      <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-3">
        <Link
          href="/perfil"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/90 transition-colors hover:border-[#c5a059] hover:bg-white/10"
        >
          <User className="h-3.5 w-3.5 text-[#c5a059]" />
          <span>Mi Perfil</span>
        </Link>

        <div className="hidden lg:flex items-center gap-1.5">
          <Link
            href="/videoteca"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#c5a059] px-4 py-1.5 text-xs font-semibold text-[#0a1714] transition-all hover:bg-[#d8b56f]"
          >
            <span>Videoteca</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
