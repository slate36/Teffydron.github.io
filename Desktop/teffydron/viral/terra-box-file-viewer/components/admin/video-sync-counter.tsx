'use client'

import { useEffect, useRef, useState } from 'react'

type SyncQueueItem = {
  name: string
  status: 'downloading' | 'queued'
}

type DownloadedVideo = {
  name: string
  size: number
}

type VideoSyncCounterProps = {
  initialCount: number
  initialBytes: number
  initialCachedBytes: number
  initialQueue: SyncQueueItem[]
  initialDownloaded: DownloadedVideo[]
}

type DownloadSample = {
  timestamp: number
  bytesPerSecond: number
}

function formatBytes(bytes: number) {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`
}

function formatRate(bytesPerSecond: number) {
  if (bytesPerSecond >= 1024 ** 2) return `${(bytesPerSecond / 1024 ** 2).toFixed(2)} MB/s`
  return `${(bytesPerSecond / 1024).toFixed(0)} KB/s`
}

export function VideoSyncCounter({
  initialCount,
  initialBytes,
  initialCachedBytes,
  initialQueue,
  initialDownloaded,
}: VideoSyncCounterProps) {
  const [count, setCount] = useState(initialCount)
  const [bytes, setBytes] = useState(initialBytes)
  const [cachedBytes, setCachedBytes] = useState(initialCachedBytes)
  const [queue, setQueue] = useState(initialQueue)
  const [downloaded, setDownloaded] = useState(initialDownloaded)
  const [samples, setSamples] = useState<DownloadSample[]>([])
  const [currentRate, setCurrentRate] = useState(0)
  const [queueOpen, setQueueOpen] = useState(false)
  const [downloadedOpen, setDownloadedOpen] = useState(false)
  const [hasError, setHasError] = useState(false)
  const previousSample = useRef<{ timestamp: number; totalBytes: number } | null>(null)

  useEffect(() => {
    let active = true
    let timer: number | undefined

    async function refresh() {
      try {
        const response = await fetch('/api/admin/video-sync', { cache: 'no-store' })
        if (!response.ok) throw new Error(`Video sync status request failed: ${response.status}`)
        const progress: {
          downloadingCount: number
          downloadingBytes: number
          cachedBytes: number
          queue: SyncQueueItem[]
          downloaded: DownloadedVideo[]
        } = await response.json()
        if (active) {
          const timestamp = Date.now()
          const totalBytes = progress.cachedBytes + progress.downloadingBytes
          const previous = previousSample.current
          const rate = previous && timestamp > previous.timestamp && totalBytes >= previous.totalBytes
            ? (totalBytes - previous.totalBytes) / ((timestamp - previous.timestamp) / 1000)
            : 0
          previousSample.current = { timestamp, totalBytes }
          setCount(progress.downloadingCount)
          setBytes(progress.downloadingBytes)
          setCachedBytes(progress.cachedBytes)
          setQueue(progress.queue)
          setDownloaded(progress.downloaded)
          setCurrentRate(rate)
          setSamples((current) => [...current.slice(-19), { timestamp, bytesPerSecond: rate }])
          setHasError(false)
        }
      } catch {
        if (active) setHasError(true)
      } finally {
        if (active) timer = window.setTimeout(() => void refresh(), 3000)
      }
    }

    void refresh()
    return () => {
      active = false
      if (timer !== undefined) window.clearTimeout(timer)
    }
  }, [])

  const downloadedBytes = downloaded.reduce((total, video) => total + video.size, 0)
  const maxRate = Math.max(1024, ...samples.map((sample) => sample.bytesPerSecond))
  const chartPoints = samples.map((sample, index) => {
    const x = samples.length === 1 ? 180 : 12 + (index / (samples.length - 1)) * 336
    const y = 88 - (sample.bytesPerSecond / maxRate) * 76
    return `${x},${y}`
  }).join(' ')

  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="text-xs text-muted-foreground">Descargando ahora</p>
          <p className="text-lg font-semibold" aria-live="polite">
            {count} videos · {formatBytes(bytes)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
            Disponibles en VPS: {downloaded.length} videos · {formatBytes(downloadedBytes)}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Velocidad estimada de descarga</p>
          <p className="text-lg font-semibold" aria-live="polite">{formatRate(currentRate)}</p>
          <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
            Espacio en caché: {formatBytes(cachedBytes)} / 70 GB
          </p>
        </div>
      </div>
      <div className="mt-4 rounded-lg border border-border p-3">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium">Transferencia en el último minuto</p>
          <span className="text-xs text-muted-foreground">Actualiza cada 3 s</span>
        </div>
        <svg
          viewBox="0 0 360 100"
          role="img"
          aria-label={`Velocidad estimada de descarga: ${formatRate(currentRate)}`}
          className="h-28 w-full overflow-visible text-primary"
        >
          {[12, 50, 88].map((y) => (
            <line
              key={y}
              x1="12"
              x2="348"
              y1={y}
              y2={y}
              className="stroke-border"
              strokeWidth="1"
            />
          ))}
          {samples.length > 1 && (
            <polyline
              points={chartPoints}
              fill="none"
              className="stroke-current"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {samples.length === 1 && (
            <circle
              cx="180"
              cy={88 - (samples[0].bytesPerSecond / maxRate) * 76}
              r="3"
              fill="currentColor"
            />
          )}
        </svg>
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Hace 1 min</span>
          <span>Ahora · máximo {formatRate(maxRate)}</span>
        </div>
      </div>
      {(queue.length > 0 || downloaded.length > 0) && (
        <div className="mt-2 space-y-2">
          {queue.length > 0 && (
            <>
              <button
                type="button"
                aria-expanded={queueOpen}
                aria-controls="video-sync-queue"
                onClick={() => setQueueOpen((open) => !open)}
                className="block text-left text-xs text-primary underline-offset-4 hover:underline"
              >
                {queueOpen
                  ? 'Ocultar lista de descarga'
                  : `Ver lista: ${count} descargando · ${queue.length - count} en espera`}
              </button>
              {queueOpen && (
                <ul
                  id="video-sync-queue"
                  className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2 text-xs"
                >
                  {queue.map((video, index) => (
                    <li
                      key={`${video.status}:${video.name}:${index}`}
                      className="flex items-center gap-2"
                      title={video.name}
                    >
                      <span aria-hidden="true">{video.status === 'downloading' ? '⬇️' : '⏳'}</span>
                      <span className="min-w-0 flex-1 truncate">{video.name}</span>
                      <span className="shrink-0 text-muted-foreground">
                        {video.status === 'downloading' ? 'Descargando' : 'En espera'}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
          {downloaded.length > 0 && (
            <>
              <button
                type="button"
                aria-expanded={downloadedOpen}
                aria-controls="video-sync-downloaded"
                onClick={() => setDownloadedOpen((open) => !open)}
                className="block text-left text-xs text-primary underline-offset-4 hover:underline"
              >
                {downloadedOpen
                  ? 'Ocultar videos guardados'
                  : `Ver guardados: ${downloaded.length} videos · ${formatBytes(downloadedBytes)}`}
              </button>
              {downloadedOpen && (
                <ul
                  id="video-sync-downloaded"
                  className="max-h-56 space-y-1 overflow-y-auto rounded-md border p-2 text-xs"
                >
                  {downloaded.map((video, index) => (
                    <li
                      key={`${video.name}:${index}`}
                      className="flex items-center gap-2"
                      title={video.name}
                    >
                      <span aria-hidden="true">✅</span>
                      <span className="min-w-0 flex-1 truncate">{video.name}</span>
                      <span className="shrink-0 text-muted-foreground">{formatBytes(video.size)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      )}
      {hasError && (
        <p className="text-xs text-destructive">No se pudo actualizar el contador.</p>
      )}
    </div>
  )
}
