import { revalidatePath, revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

// Secret token to protect this endpoint from unauthorized calls
// Set REVALIDATE_SECRET in your .env — Vercel cron and manual calls must include it
export async function GET(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET
  const provided = request.nextUrl.searchParams.get('secret')
    ?? request.headers.get('x-revalidate-secret')

  // If REVALIDATE_SECRET is set, enforce it
  if (secret && provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Revalidate the news page in all language variants
    revalidatePath('/noticias')
    revalidatePath('/noticias?lang=es')
    revalidatePath('/noticias?lang=en')
    revalidatePath('/noticias?lang=pt')

    const now = new Date().toISOString()
    console.log(`[revalidate-news] Triggered at ${now}`)

    return NextResponse.json({
      revalidated: true,
      timestamp: now,
      message: 'News cache cleared — next visit will fetch fresh data',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Revalidation failed', detail: String(error) },
      { status: 500 }
    )
  }
}
