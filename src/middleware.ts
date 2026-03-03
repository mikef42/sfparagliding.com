import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''

  // Redirect www to non-www
  if (host.startsWith('www.')) {
    const nonWwwHost = host.replace(/^www\./, '')
    const url = request.nextUrl.clone()
    url.host = nonWwwHost
    url.protocol = 'https'
    url.port = ''
    return NextResponse.redirect(url, 301)
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except static assets & API routes that shouldn't redirect
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|media|api).*)',
  ],
}
