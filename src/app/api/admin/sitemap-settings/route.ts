import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import {
  getNextSitemapGenerationAt,
  normalizeSitemapPath,
  normalizeSitemapGenerationFrequency,
  normalizeSitemapGenerationStatus,
  normalizeSitemapSettings,
  SITEMAP_CHANGE_FREQUENCY_OPTIONS,
  type SitemapGenerationFrequency,
  type SitemapGenerationStatus,
  type SitemapChangeFrequency,
  type SitemapDynamicCollectionsConfig,
  type SitemapStaticEntryConfig,
} from '@/lib/sitemap'
import type { SitemapSetting } from '@/payload-types'

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

const VALID_CHANGE_FREQUENCIES = new Set(
  SITEMAP_CHANGE_FREQUENCY_OPTIONS.map((option) => option.value),
)

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

function clampPriority(value: unknown, fallback: number): number {
  const numericValue =
    typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : Number.NaN

  if (!Number.isFinite(numericValue)) {
    return fallback
  }

  return Math.max(0, Math.min(1, Number(numericValue.toFixed(2))))
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function readGenerationFrequency(
  value: unknown,
  fallback: SitemapGenerationFrequency,
): SitemapGenerationFrequency {
  return normalizeSitemapGenerationFrequency(
    typeof value === 'string' ? value : fallback,
  )
}

function sanitizeStaticEntries(
  entries: unknown,
  fallback: SitemapStaticEntryConfig[],
): SitemapStaticEntryConfig[] {
  if (!Array.isArray(entries)) {
    return fallback
  }

  return entries.map((entry, index) => {
    const path = normalizeSitemapPath(
      entry && typeof entry === 'object' && 'path' in entry ? entry.path as string : null,
    )

    if (!path) {
      throw new Error(`Static route ${index + 1} is missing a valid path.`)
    }

    const changeFrequency =
      entry &&
      typeof entry === 'object' &&
      'changeFrequency' in entry &&
      VALID_CHANGE_FREQUENCIES.has(entry.changeFrequency as SitemapChangeFrequency)
        ? (entry.changeFrequency as SitemapChangeFrequency)
        : 'weekly'

    const priority = clampPriority(
      entry && typeof entry === 'object' && 'priority' in entry ? entry.priority : null,
      0.5,
    )

    return {
      path,
      changeFrequency,
      priority,
    }
  })
}

export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload()
  const settings = await payload.findGlobal({
    slug: 'sitemap-settings',
    depth: 0,
    overrideAccess: true,
  })

  return NextResponse.json({ settings: toApiResponse(settings) })
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload()
  const currentSettings = await payload.findGlobal({
    slug: 'sitemap-settings',
    depth: 0,
    overrideAccess: true,
  })
  const normalizedCurrentSettings = normalizeSitemapSettings(currentSettings)

  try {
    const body = await req.json()
    const dynamicCollectionsInput =
      body && typeof body === 'object' && 'dynamicCollections' in body ? body.dynamicCollections : null

    const updatedSettings = await payload.updateGlobal({
      slug: 'sitemap-settings',
      overrideAccess: true,
      depth: 0,
      data: {
        enabled:
          body && typeof body === 'object' && 'enabled' in body
            ? readBoolean(body.enabled, normalizedCurrentSettings.enabled)
            : normalizedCurrentSettings.enabled,
        staticEntries:
          body && typeof body === 'object' && 'staticEntries' in body
            ? sanitizeStaticEntries(body.staticEntries, normalizedCurrentSettings.staticEntries)
            : normalizedCurrentSettings.staticEntries,
        dynamicCollections: {
          pages: readBoolean(
            dynamicCollectionsInput &&
              typeof dynamicCollectionsInput === 'object' &&
              'pages' in dynamicCollectionsInput
              ? dynamicCollectionsInput.pages
              : null,
            normalizedCurrentSettings.dynamicCollections.pages,
          ),
          posts: readBoolean(
            dynamicCollectionsInput &&
              typeof dynamicCollectionsInput === 'object' &&
              'posts' in dynamicCollectionsInput
              ? dynamicCollectionsInput.posts
              : null,
            normalizedCurrentSettings.dynamicCollections.posts,
          ),
          products: readBoolean(
            dynamicCollectionsInput &&
              typeof dynamicCollectionsInput === 'object' &&
              'products' in dynamicCollectionsInput
              ? dynamicCollectionsInput.products
              : null,
            normalizedCurrentSettings.dynamicCollections.products,
          ),
          services: readBoolean(
            dynamicCollectionsInput &&
              typeof dynamicCollectionsInput === 'object' &&
              'services' in dynamicCollectionsInput
              ? dynamicCollectionsInput.services
              : null,
            normalizedCurrentSettings.dynamicCollections.services,
          ),
          categories: readBoolean(
            dynamicCollectionsInput &&
              typeof dynamicCollectionsInput === 'object' &&
              'categories' in dynamicCollectionsInput
              ? dynamicCollectionsInput.categories
              : null,
            normalizedCurrentSettings.dynamicCollections.categories,
          ),
        },
        excludePaths:
          body && typeof body === 'object' && 'excludePaths' in body && typeof body.excludePaths === 'string'
            ? body.excludePaths
            : currentSettings.excludePaths ?? '',
        generationFrequency:
          body && typeof body === 'object' && 'generationFrequency' in body
            ? readGenerationFrequency(body.generationFrequency, normalizeSitemapGenerationFrequency(currentSettings.generationFrequency))
            : normalizeSitemapGenerationFrequency(currentSettings.generationFrequency),
      },
    })

    return NextResponse.json({ settings: toApiResponse(updatedSettings) })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to save sitemap settings.'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
