import type { Payload } from 'payload'
import {
  buildSitemapEntries,
  getNextSitemapGenerationAt,
  isSitemapGenerationDue,
  normalizeSitemapGenerationFrequency,
  type SitemapGenerationFrequency,
  type SitemapGenerationStatus,
  type SitemapSettingsShape,
} from '@/lib/sitemap'

type SitemapGenerationTrigger = 'manual' | 'scheduled' | 'content-change'

export interface SitemapGenerationResult {
  triggered: boolean
  generatedEntries: number
  generationFrequency: SitemapGenerationFrequency
  generatedAt: string | null
  lastGenerationStatus: SitemapGenerationStatus | null
  lastGenerationMessage: string
  nextScheduledGenerationAt: string | null
  warmRoutes: string[]
}

const SITEMAP_ROUTE_PATHS = ['/sitemap.xml', '/robots.txt']

function toIsoString(value: Date | string | null | undefined): string | null {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

async function warmSitemapRoutes(siteUrl: string): Promise<string[]> {
  const warmedRoutes: string[] = []

  await Promise.allSettled(
    SITEMAP_ROUTE_PATHS.map(async (path) => {
      const response = await fetch(new URL(path, siteUrl), { cache: 'no-store' })

      if (!response.ok) {
        throw new Error(`Failed to warm ${path} (${response.status}).`)
      }

      warmedRoutes.push(path)
    }),
  )

  return warmedRoutes
}

function buildSuccessMessage(
  generatedEntries: number,
  trigger: SitemapGenerationTrigger,
): string {
  const noun = generatedEntries === 1 ? 'URL' : 'URLs'
  const triggerLabel =
    trigger === 'manual'
      ? 'manually'
      : trigger === 'scheduled'
        ? 'on schedule'
        : 'after a content change'

  return `Generated ${generatedEntries} sitemap ${noun} ${triggerLabel}.`
}

function buildFailureMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Failed to generate sitemap.'
}

export async function generateSitemapArtifacts({
  force = false,
  payload,
  siteUrl,
  trigger,
}: {
  force?: boolean
  payload: Payload
  siteUrl: string
  trigger: SitemapGenerationTrigger
}): Promise<SitemapGenerationResult> {
  const settings = await payload.findGlobal({
    slug: 'sitemap-settings',
    depth: 0,
    overrideAccess: true,
  })

  const generationFrequency = normalizeSitemapGenerationFrequency(settings.generationFrequency)
  const nextScheduledGenerationAt = getNextSitemapGenerationAt(settings)
  const generationDue = force || isSitemapGenerationDue(settings)

  if (!generationDue) {
    return {
      triggered: false,
      generatedEntries: settings.lastGeneratedCount ?? 0,
      generationFrequency,
      generatedAt: toIsoString(settings.lastGeneratedAt),
      lastGenerationStatus: settings.lastGenerationStatus ?? null,
      lastGenerationMessage: 'Sitemap generation is not due yet.',
      nextScheduledGenerationAt: toIsoString(nextScheduledGenerationAt),
      warmRoutes: [],
    }
  }

  const generatedAt = new Date()

  try {
    const entries = await buildSitemapEntries({
      payload,
      settings,
      siteUrl,
    })
    const lastGenerationMessage = buildSuccessMessage(entries.length, trigger)

    await payload.updateGlobal({
      slug: 'sitemap-settings',
      overrideAccess: true,
      depth: 0,
      data: {
        lastGeneratedAt: generatedAt.toISOString(),
        lastGeneratedCount: entries.length,
        lastGenerationStatus: 'success',
        lastGenerationMessage,
      },
    })

    const warmRoutes = await warmSitemapRoutes(siteUrl)

    return {
      triggered: true,
      generatedEntries: entries.length,
      generationFrequency,
      generatedAt: generatedAt.toISOString(),
      lastGenerationStatus: 'success',
      lastGenerationMessage,
      nextScheduledGenerationAt: toIsoString(
        getNextSitemapGenerationAt({
          generationFrequency,
          lastGeneratedAt: generatedAt,
        } satisfies Pick<SitemapSettingsShape, 'generationFrequency' | 'lastGeneratedAt'>),
      ),
      warmRoutes,
    }
  } catch (error) {
    const lastGenerationMessage = buildFailureMessage(error)

    await payload
      .updateGlobal({
        slug: 'sitemap-settings',
        overrideAccess: true,
        depth: 0,
        data: {
          lastGeneratedAt: generatedAt.toISOString(),
          lastGenerationStatus: 'failed',
          lastGenerationMessage,
        },
      })
      .catch(() => {})

    throw new Error(lastGenerationMessage)
  }
}
