import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageVisit } from '@/lib/db/schema'

export const runtime = 'nodejs'

function parseUA(userAgent: string) {
  const ua = userAgent.toLowerCase()
  let deviceType = 'desktop'
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) deviceType = 'mobile'
  else if (/tablet/.test(ua)) deviceType = 'tablet'

  let browser = 'Desconocido'
  if (ua.includes('chrome')) browser = 'Chrome'
  else if (ua.includes('safari')) browser = 'Safari'
  else if (ua.includes('firefox')) browser = 'Firefox'
  else if (ua.includes('edge')) browser = 'Edge'
  else if (ua.includes('opera')) browser = 'Opera'

  let os = 'Desconocido'
  if (ua.includes('windows')) os = 'Windows'
  else if (ua.includes('mac')) os = 'macOS'
  else if (ua.includes('linux')) os = 'Linux'
  else if (ua.includes('android')) os = 'Android'
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS'

  return { deviceType, browser, os }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as {
      path?: string
      referrer?: string
      sessionId?: string
      userId?: string
    }

    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'
    const userAgent = request.headers.get('user-agent') ?? 'unknown'
    const { deviceType, browser, os } = parseUA(userAgent)

    // Obtener ubicación aproximada desde IP (solo si no es localhost/privada)
    let country = null
    let city = null
    const clientIp = ip.split(',')[0]?.trim() ?? 'unknown'
    if (clientIp && clientIp !== 'unknown' && !clientIp.startsWith('127.') && !clientIp.startsWith('192.168.') && !clientIp.startsWith('10.')) {
      try {
        const geoRes = await fetch(`https://ipapi.co/${clientIp}/json/`, { signal: AbortSignal.timeout(3000) })
        if (geoRes.ok) {
          const geo = await geoRes.json()
          country = geo.country_name ?? null
          city = geo.city ?? null
        }
      } catch {
        // Ignorar errores de geolocalización
      }
    }

    await db.insert(pageVisit).values({
      ipAddress: clientIp,
      path: body.path ?? '/',
      userAgent,
      referrer: body.referrer ?? null,
      country,
      city,
      deviceType: (deviceType as 'mobile' | 'desktop' | 'tablet'),
      browser,
      os,
      sessionId: body.sessionId ?? 'unknown',
      userId: body.userId ?? null,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    return NextResponse.json({ error: 'No se pudo registrar la visita.' }, { status: 500 })
  }
}
