'use client'

import { useId, useRef, useState } from 'react'
import { QRCodeCanvas, QRCodeSVG } from 'qrcode.react'
import { Check, Copy, Download, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

const GREEN = '#1f4a3a'
const GOLD = '#e8c468'
const CREAM = '#fbf8ef'
const LOGO = { src: '/polo-mark.svg', height: 96, width: 96, excavate: true }

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean)
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width <= maxWidth || !line) {
      line = next
    } else {
      lines.push(line)
      line = word
    }
  }
  if (line) lines.push(line)
  if (lines.length > maxLines) {
    lines.length = maxLines
    lines[maxLines - 1] = `${lines[maxLines - 1].replace(/\s+\S*$/, '')}…`
  }
  return lines
}

function fileSafe(text: string) {
  return text.replace(/[^\w\-]+/g, '-').replace(/-+/g, '-').slice(0, 60) || 'tarjeta'
}

function downloadCard(qr: HTMLCanvasElement, title: string, subtitle: string) {
  const W = 1000
  const H = 1400
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const styles = getComputedStyle(document.documentElement)
  const serif = styles.getPropertyValue('--font-playfair') || 'serif'
  const sans = styles.getPropertyValue('--font-geist-sans') || 'sans-serif'

  ctx.fillStyle = GREEN
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = GOLD
  ctx.lineWidth = 6
  ctx.strokeRect(40, 40, W - 80, H - 80)

  ctx.textAlign = 'center'
  ctx.fillStyle = GOLD
  ctx.font = `600 30px ${sans}`
  ctx.letterSpacing = '12px'
  ctx.fillText('POLO', W / 2, 140)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = CREAM
  ctx.font = `700 62px ${serif}`
  const lines = wrapLines(ctx, title || 'Video de polo', W - 200, 2)
  lines.forEach((l, i) => ctx.fillText(l, W / 2, 230 + i * 74))

  const boxSize = 720
  const boxX = (W - boxSize) / 2
  const boxY = 400
  ctx.fillStyle = CREAM
  ctx.beginPath()
  ctx.roundRect(boxX, boxY, boxSize, boxSize, 36)
  ctx.fill()
  ctx.drawImage(qr, boxX + 40, boxY + 40, boxSize - 80, boxSize - 80)

  ctx.fillStyle = GOLD
  ctx.font = `500 36px ${sans}`
  wrapLines(ctx, subtitle, W - 200, 2).forEach((l, i) => ctx.fillText(l, W / 2, 1200 + i * 46))

  const link = document.createElement('a')
  link.download = `qr-${fileSafe(title)}.png`
  link.href = canvas.toDataURL('image/png')
  link.click()
}

export function QrCard({
  initialUrl,
  initialTitle,
  initialSubtitle = 'Escanea para ver el video',
  editableUrl = false,
}: {
  initialUrl: string
  initialTitle: string
  initialSubtitle?: string
  editableUrl?: boolean
}) {
  const id = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [url, setUrl] = useState(initialUrl)
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle)
  const [copied, setCopied] = useState(false)
  const hasUrl = url.trim().length > 0

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch (error) {
      console.error('Error al copiar al portapapeles:', error)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="mx-auto flex w-full max-w-64 flex-col items-center gap-3 rounded-xl border-2 border-accent bg-primary px-5 py-6 text-center text-primary-foreground shadow-sm">
        <span className="text-[10px] font-semibold tracking-[0.4em] text-accent">POLO</span>
        <p className="line-clamp-2 font-serif text-lg font-bold leading-snug text-balance">
          {title || 'Video de polo'}
        </p>
        <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-primary-foreground p-3">
          {hasUrl ? (
            <QRCodeSVG
              value={url}
              level="H"
              size={512}
              fgColor={GREEN}
              bgColor={CREAM}
              imageSettings={{ ...LOGO, height: 96, width: 96 }}
              className="size-full"
              title={`Código QR de ${title}`}
            />
          ) : (
            <p className="text-xs text-muted-foreground">Escribe un enlace para generar el QR</p>
          )}
        </div>
        <p className="line-clamp-2 text-xs text-accent">{subtitle}</p>
      </div>

      {hasUrl && (
        <QRCodeCanvas
          ref={canvasRef}
          value={url}
          level="H"
          size={1024}
          fgColor={GREEN}
          bgColor={CREAM}
          imageSettings={{ ...LOGO, height: 192, width: 192 }}
          className="hidden"
          aria-hidden="true"
        />
      )}

      <div className="flex flex-col gap-3">
        {editableUrl && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-url`} className="text-sm font-medium">
              Enlace
            </label>
            <input
              id={`${id}-url`}
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://…"
              className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-title`} className="text-sm font-medium">
            Título de la tarjeta
          </label>
          <input
            id={`${id}-title`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-subtitle`} className="text-sm font-medium">
            Texto inferior
          </label>
          <input
            id={`${id}-subtitle`}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className="h-9 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={!hasUrl}
          onClick={() => canvasRef.current && downloadCard(canvasRef.current, title, subtitle)}
          className="flex-1"
        >
          <Download aria-hidden="true" />
          Descargar tarjeta
        </Button>
        <Button type="button" variant="outline" disabled={!hasUrl} onClick={copy}>
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? 'Copiado' : 'Copiar enlace'}
        </Button>
        {hasUrl && (
          <Button
            variant="outline"
            size="icon"
            render={<a href={url} target="_blank" rel="noopener noreferrer" />}
            nativeButton={false}
            aria-label="Abrir enlace"
          >
            <ExternalLink aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  )
}
