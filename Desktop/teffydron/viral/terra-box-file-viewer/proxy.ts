import { NextResponse, type NextRequest } from 'next/server'

// Optional Basic Auth for the private TeraBox browser + QR generator (home page only).
// QR pages, contact and the community are public; the community uses real user accounts.
// Set SITE_PASSWORD in your environment to enable this protection.
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD
  if (!password) return NextResponse.next()

  const header = request.headers.get('authorization')
  if (header?.startsWith('Basic ')) {
    const [, provided] = atob(header.slice(6)).split(':')
    if (provided === password) return NextResponse.next()
  }

  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Mis archivos", charset="UTF-8"' },
  })
}

export const config = {
  matcher: ['/'],
}
