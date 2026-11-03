'use client'

import { useState } from 'react'
import { Phone, Mail, Share2, Copy, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ShareMenuProps {
  url: string
  title?: string
  className?: string
}

export function ShareMenu({ url, title, className }: ShareMenuProps) {
  const [open, setOpen] = useState(false)

  const shareWhatsApp = () => {
    const encodedUrl = encodeURIComponent(url)
    window.open(`https://wa.me/?text=${encodedUrl}`, '_blank')
    setOpen(false)
  }

  const shareInstagram = () => {
    window.open(`https://instagram.com/share?url=${encodeURIComponent(url)}`, '_blank')
    setOpen(false)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setOpen(false)
  }

  return (
    <div className="relative inline-block">
      <Button
        size="lg"
        variant="outline"
        className={cn('w-full flex items-center justify-center gap-2 text-sm font-semibold', className)}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(!open)
        }}
      >
        <Share2 className="size-5" />
        <span>Compartir video</span>
      </Button>
      {open && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 rounded-xl border border-white/20 bg-[#164532]/95 backdrop-blur-md shadow-2xl p-3 text-white z-50"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="flex items-center gap-2 px-3 py-1.5 text-xs text-[#c5a059]/70 uppercase tracking-wider border-b border-white/10 mb-2">
            <span>Compartir</span>
          </div>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-white hover:bg-white/10 py-2 px-3 flex items-center gap-2"
            onClick={shareWhatsApp}
          >
            <Phone className="size-4 text-green-500 mr-2" /> WhatsApp
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-white hover:bg-white/10 py-2 px-3 flex items-center gap-2"
            onClick={shareInstagram}
          >
            <Mail className="size-4 text-[#e1306c] mr-2" /> Instagram
          </Button>
          <Button
            variant="ghost"
            className="w-full text-left text-sm text-white hover:bg-white/10 py-2 px-3 flex items-center gap-2"
            onClick={copyLink}
          >
            <Copy className="size-4 text-[#c5a059] mr-2" /> Copiar enlace
          </Button>
        </div>
      )}
    </div>
  )
}
