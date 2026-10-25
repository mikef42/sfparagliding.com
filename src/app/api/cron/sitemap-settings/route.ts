import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { generateSitemapArtifacts } from '@/lib/sitemap-generation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

// The server's cron calls this once a day (every 15 minutes until 2026-10-24). A run
// records lastGeneratedAt a few seconds after the call arrives, so the next "daily"
// due time falls a few seconds after the next day's call and an exact check would
// skip every other day. A scheduled call therefore counts generation as due up to an
// hour early; manual and on-publish generation are unchanged.
const SCHEDULED_DUE_TOLERANCE_MS = 60 * 60 * 1000

function getCronSecret(): string | null {
  return process.env.SITEMAP_CRON_SECRET || process.env.ANALYTICS_CRON_SECRET || null
}

export async function POST(req: NextRequest) {
  const cronSecret = getCronSecret()
  const authHeader = req.headers.get('authorization')

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload()
    const result = await generateSitemapArtifacts({
      payload,
      siteUrl: SITE_URL,
      trigger: 'scheduled',
      dueToleranceMs: SCHEDULED_DUE_TOLERANCE_MS,
    })

    return NextResponse.json({
      ok: true,
      ...result,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate sitemap.'
    console.error('[Sitemap Cron] Generation failed:', error)

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 },
    )
  }
}
