import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TRACKING_EXCLUDE = /^\/(admin|api|_next|media|favicon\.ico)/

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

  if (request.nextUrl.pathname.startsWith('/admin/globals/sitemap-settings')) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/sitemap-settings'
    return NextResponse.redirect(url, 307)
  }

  // Analytics tracking (fire-and-forget)
  const pathname = request.nextUrl.pathname
  if (!TRACKING_EXCLUDE.test(pathname)) {
    const trackingData = {
      path: pathname,
      ip:
        request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        request.headers.get('x-real-ip') ||
        'unknown',
      userAgent: request.headers.get('user-agent') || '',
      referrer: request.headers.get('referer') || '',
    }

    const trackUrl = new URL('/api/track', request.url)
    fetch(trackUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(trackingData),
    }).catch(() => {})
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|media).*)'],
}
