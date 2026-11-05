'use client'

import { useEffect, useState } from 'react'
import {
  BarChart2, Activity, Monitor, Layers, Globe, Smartphone, Clock, Users as UsersIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatsResponse {
  totalVisits: number
  uniqueVisitors: number
  range: string
  visitsByPath: Array<{ path: string; count: number }>
  visitsByDay: Array<{ date: string; count: number }>
  visitsByDevice: Array<{ deviceType: string; count: number }>
  visitsByBrowser: Array<{ browser: string; count: number }>
  visitsByCountry: Array<{ country: string | null; count: number }>
  recentVisits: Array<{
    id: number
    ipAddress: string
    path: string
    country: string | null
    deviceType: string
    browser: string
    visitedAt: number
  }>
}

function formatNumber(n: number) {
  return new Intl.NumberFormat('es-AR').format(n)
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatRelativeDate(dateStr: string) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' })
}

export function StatsDashboard({ initialRange }: { initialRange: '7d' | '30d' | '90d' }) {
  const [stats, setStats] = useState<StatsResponse | null>(null)
  const [range, setRange] = useState<'7d' | '30d' | '90d'>(initialRange)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/stats?range=${range}`)
      .then((r) => r.json())
      .then((data: StatsResponse) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [range])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!stats) return null

  const { totalVisits, uniqueVisitors, visitsByPath, visitsByDay, visitsByDevice, visitsByBrowser, visitsByCountry, recentVisits } = stats

  return (
    <div className="space-y-8">
      {/* Filtro de rango */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm text-muted-foreground">Rango:</span>
        {(['7d', '30d', '90d'] as const).map((r) => (
          <Button
            key={r}
            variant={range === r ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRange(r)}
          >
            {r === '7d' ? '7 días' : r === '30d' ? '30 días' : '90 días'}
          </Button>
        ))}
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Visitas totales</p>
              <p className="text-2xl font-bold">{formatNumber(totalVisits)}</p>
            </div>
            <Activity className="size-5 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Visitantes únicos</p>
              <p className="text-2xl font-bold">{formatNumber(uniqueVisitors)}</p>
            </div>
            <UsersIcon className="size-5 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Páginas distintas</p>
              <p className="text-2xl font-bold">{formatNumber(visitsByPath.length)}</p>
            </div>
            <Layers className="size-5 text-primary" />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Visitas promedio/día</p>
              <p className="text-2xl font-bold">
                {formatNumber(Math.round(totalVisits / (range === '7d' ? 7 : range === '30d' ? 30 : 90)))}
              </p>
            </div>
            <Clock className="size-5 text-primary" />
          </div>
        </div>
      </div>

      {/* Gráficos fila 1 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart2 className="size-5 text-primary" /> Visitas por día
          </h3>
          <div className="h-64 w-full">
            <div className="h-full flex items-end gap-1">
              {visitsByDay.map((d) => {
                const max = Math.max(...visitsByDay.map((v) => v.count))
                const height = max > 0 ? (d.count / max) * 100 : 0
                return (
                  <div
                    key={d.date}
                    className="flex flex-col items-center gap-1 w-full"
                    title={`${formatRelativeDate(d.date)}: ${d.count} visitas`}
                  >
                    <div
                      className="w-full bg-primary rounded-t-sm transition-all duration-500"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{formatRelativeDate(d.date)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <Monitor className="size-5 text-primary" /> Dispositivos
          </h3>
          <div className="grid gap-2">
            {visitsByDevice.map((d) => {
              const total = visitsByDevice.reduce((sum, v) => sum + v.count, 0)
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
              const icon =
                d.deviceType === 'mobile' ? <Smartphone className="size-4" /> :
                  d.deviceType === 'tablet' ? <Layers className="size-4" /> : <Monitor className="size-4" />
              return (
                <div key={d.deviceType} className="flex items-center gap-3">
                  <div className="w-8">{icon}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.deviceType}</span>
                      <span className="font-medium">{d.count}</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-muted-foreground">{pct}%</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Gráficos fila 2 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="size-5 text-primary" /> Navegadores
          </h3>
          <div className="grid gap-2">
            {visitsByBrowser.map((d) => {
              const total = visitsByBrowser.reduce((sum, v) => sum + v.count, 0)
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
              return (
                <div key={d.browser} className="flex items-center gap-3">
                  <div className="w-8 text-muted-foreground">{d.browser}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.count} visitas</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="font-serif text-lg font-bold mb-4 flex items-center gap-2">
            <Globe className="size-5 text-primary" /> Países
          </h3>
          <div className="grid gap-2">
            {visitsByCountry.map((d) => {
              const total = visitsByCountry.reduce((sum, v) => sum + v.count, 0)
              const pct = total > 0 ? Math.round((d.count / total) * 100) : 0
              return (
                <div key={d.country ?? 'desconocido'} className="flex items-center gap-3">
                  <div className="w-8 text-muted-foreground">{d.country ?? 'Desconocido'}</div>
                  <div className="flex-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{d.count} visitas</span>
                      <span className="font-medium">{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Páginas más visitadas */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm mb-6">
        <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
          <BarChart2 className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Páginas más visitadas</span>
        </div>
        <div className="divide-y divide-border">
          {visitsByPath.map((p, i) => (
            <div key={p.path} className="flex items-center justify-between px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{p.path === '/' ? 'Inicio' : p.path}</p>
                <p className="text-xs text-muted-foreground">#{i + 1}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-accent" style={{ width: `${(p.count / Math.max(...visitsByPath.map((v) => v.count))) * 100}%` }}></div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{p.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visitas recientes */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-border bg-muted/40 flex items-center gap-2">
          <Clock className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Visitas recientes</span>
        </div>
        <div className="divide-y divide-border">
          {recentVisits.length > 0 ? (
            recentVisits.map((v) => (
              <div key={v.id} className="flex items-center justify-between px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{v.path === '/' ? 'Inicio' : v.path}</p>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span>{v.ipAddress}</span>
                    <span>•</span>
                    <span>{v.country ?? '—'}</span>
                    <span>•</span>
                    <span>{v.deviceType}</span>
                    <span>•</span>
                    <span>{v.browser}</span>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">{formatDate(v.visitedAt)}</span>
              </div>
            ))
          ) : (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No hay visitas registradas aún.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
