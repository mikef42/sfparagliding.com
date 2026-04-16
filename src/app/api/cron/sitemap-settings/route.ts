import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { generateSitemapArtifacts } from '@/lib/sitemap-generation'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

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
