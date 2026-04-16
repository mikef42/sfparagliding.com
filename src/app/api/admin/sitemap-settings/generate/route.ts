import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import { generateSitemapArtifacts } from '@/lib/sitemap-generation'
import {
  getNextSitemapGenerationAt,
  normalizeSitemapGenerationFrequency,
  normalizeSitemapGenerationStatus,
  normalizeSitemapSettings,
  type SitemapGenerationFrequency,
  type SitemapGenerationStatus,
  type SitemapDynamicCollectionsConfig,
  type SitemapStaticEntryConfig,
} from '@/lib/sitemap'
import type { SitemapSetting } from '@/payload-types'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

type SitemapSettingsApiResponse = {
  enabled: boolean
  staticEntries: SitemapStaticEntryConfig[]
  dynamicCollections: SitemapDynamicCollectionsConfig
  excludePaths: string
  generationFrequency: SitemapGenerationFrequency
  lastGeneratedAt: string | null
  lastGeneratedCount: number | null
  lastGenerationStatus: SitemapGenerationStatus | null
  lastGenerationMessage: string
  nextScheduledGenerationAt: string | null
}

async function getAuthenticatedUser(req: NextRequest) {
  const payload = await getPayload()

  try {
    const result = await payload.auth({ headers: req.headers })
    return result.user
  } catch {
    return null
  }
}

function toApiResponse(settings?: SitemapSetting | null): SitemapSettingsApiResponse {
  const normalized = normalizeSitemapSettings(settings)
  const nextScheduledGenerationAt = getNextSitemapGenerationAt(settings)
  const lastGeneratedAt = settings?.lastGeneratedAt ? new Date(settings.lastGeneratedAt) : null

  return {
    enabled: normalized.enabled,
    staticEntries: normalized.staticEntries,
    dynamicCollections: normalized.dynamicCollections,
    excludePaths: typeof settings?.excludePaths === 'string' ? settings.excludePaths : '',
    generationFrequency: normalizeSitemapGenerationFrequency(settings?.generationFrequency),
    lastGeneratedAt:
      lastGeneratedAt && !Number.isNaN(lastGeneratedAt.getTime())
        ? lastGeneratedAt.toISOString()
        : null,
    lastGeneratedCount:
      typeof settings?.lastGeneratedCount === 'number' ? settings.lastGeneratedCount : null,
    lastGenerationStatus: normalizeSitemapGenerationStatus(settings?.lastGenerationStatus),
    lastGenerationMessage:
      typeof settings?.lastGenerationMessage === 'string' ? settings.lastGenerationMessage : '',
    nextScheduledGenerationAt:
      nextScheduledGenerationAt && !Number.isNaN(nextScheduledGenerationAt.getTime())
        ? nextScheduledGenerationAt.toISOString()
        : null,
  }
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const payload = await getPayload()
    const result = await generateSitemapArtifacts({
      force: true,
      payload,
      siteUrl: SITE_URL,
      trigger: 'manual',
    })
    const settings = await payload.findGlobal({
      slug: 'sitemap-settings',
      depth: 0,
      overrideAccess: true,
    })

    return NextResponse.json({
      message: result.lastGenerationMessage,
      result,
      settings: toApiResponse(settings),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate sitemap.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
