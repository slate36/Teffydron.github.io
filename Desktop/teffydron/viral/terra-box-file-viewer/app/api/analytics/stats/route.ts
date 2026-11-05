import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { pageVisit } from '@/lib/db/schema'
import { sql, lt, gte } from 'drizzle-orm'

export const runtime = 'nodejs'

function daysAgo(days: number) {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const range = searchParams.get('range') ?? '7d' // 7d, 30d, 90d

  const days = range === '30d' ? 30 : range === '90d' ? 90 : 7
  const since = daysAgo(days)

  try {
    // Total visits
    const totalResult = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
    const totalVisits = totalResult[0]?.count ?? 0

    // Unique IPs
    const uniqueIpsResult = await db
      .select({ count: sql`count(distinct ${pageVisit.ipAddress})`.mapWith(Number) })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
    const uniqueVisitors = uniqueIpsResult[0]?.count ?? 0

    // Visits by path
    const visitsByPath = await db
      .select({
        path: pageVisit.path,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
      .groupBy(pageVisit.path)
      .orderBy(sql`count(*) desc`)
      .limit(10)

    // Visits by day (last N days)
    const visitsByDay = await db
      .select({
        date: sql`date(${pageVisit.visitedAt})`.as('date'),
        count: sql`count(*)`.mapWith(Number),
      })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
      .groupBy(sql`date(${pageVisit.visitedAt})`)
      .orderBy(sql`date(${pageVisit.visitedAt})`)

    // Visits by device type
    const visitsByDevice = await db
      .select({
        deviceType: pageVisit.deviceType,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
      .groupBy(pageVisit.deviceType)

    // Visits by browser
    const visitsByBrowser = await db
      .select({
        browser: pageVisit.browser,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
      .groupBy(pageVisit.browser)
      .orderBy(sql`count(*) desc`)
      .limit(5)

    // Visits by country
    const visitsByCountry = await db
      .select({
        country: pageVisit.country,
        count: sql`count(*)`.mapWith(Number),
      })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
      .groupBy(pageVisit.country)
      .orderBy(sql`count(*) desc`)
      .limit(10)

    // Recent visits
    const recentVisits = await db
      .select({
        id: pageVisit.id,
        ipAddress: pageVisit.ipAddress,
        path: pageVisit.path,
        country: pageVisit.country,
        deviceType: pageVisit.deviceType,
        browser: pageVisit.browser,
        visitedAt: pageVisit.visitedAt,
      })
      .from(pageVisit)
      .where(gte(pageVisit.visitedAt, since))
      .orderBy(pageVisit.visitedAt)
      .limit(50)

    return NextResponse.json({
      totalVisits,
      uniqueVisitors,
      range,
      visitsByPath,
      visitsByDay,
      visitsByDevice,
      visitsByBrowser,
      visitsByCountry,
      recentVisits,
    })
  } catch (error) {
    return NextResponse.json({ error: 'No se pudieron obtener las estadísticas.' }, { status: 500 })
  }
}
