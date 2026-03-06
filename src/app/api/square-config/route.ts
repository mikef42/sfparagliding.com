import { NextResponse } from 'next/server'
import { getSquarePublicConfig } from '@/lib/square'

/**
 * GET /api/square-config
 *
 * Returns the public Square configuration (appId, locationId, environment).
 * The access token is NEVER exposed — it stays server-side only.
 */
export async function GET() {
  try {
    const config = await getSquarePublicConfig()

    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'private, max-age=60',
      },
    })
  } catch (error) {
    console.error('[square-config] Failed to load config:', error)
    return NextResponse.json(
      { error: 'Failed to load payment configuration' },
      { status: 500 },
    )
  }
}
