import type { MetadataRoute } from 'next'
import type { Payload } from 'payload'

export type SitemapChangeFrequency = Exclude<
  MetadataRoute.Sitemap[number]['changeFrequency'],
  undefined
>

export type SitemapGenerationFrequency = 'manual' | 'hourly' | 'daily' | 'weekly' | 'monthly'
export type SitemapGenerationStatus = 'success' | 'failed'

export interface SitemapStaticEntryConfig {
  path: string
  changeFrequency: SitemapChangeFrequency
  priority: number
}

export interface SitemapDynamicCollectionsConfig {
  pages: boolean
  posts: boolean
  products: boolean
  services: boolean
  categories: boolean
}

type SitemapDynamicCollectionsInput = Partial<
  Record<keyof SitemapDynamicCollectionsConfig, boolean | null>
>

export interface SitemapSettingsShape {
  enabled?: boolean | null
  staticEntries?: Array<{
    path?: string | null
    changeFrequency?: SitemapChangeFrequency | null
    priority?: number | null
  }> | null
  dynamicCollections?: SitemapDynamicCollectionsInput | null
  excludePaths?: string | null
  generationFrequency?: SitemapGenerationFrequency | null
  lastGeneratedAt?: string | Date | null
  lastGeneratedCount?: number | null
  lastGenerationStatus?: SitemapGenerationStatus | null
  lastGenerationMessage?: string | null
  updatedAt?: string | Date | null
}

export interface NormalizedSitemapSettings {
  enabled: boolean
  staticEntries: SitemapStaticEntryConfig[]
  dynamicCollections: SitemapDynamicCollectionsConfig
  excludePaths: string[]
}

export const SITEMAP_CHANGE_FREQUENCY_OPTIONS: Array<{
  label: string
  value: SitemapChangeFrequency
}> = [
  { label: 'Always', value: 'always' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Yearly', value: 'yearly' },
  { label: 'Never', value: 'never' },
]

export const SITEMAP_GENERATION_FREQUENCY_OPTIONS: Array<{
  label: string
  value: SitemapGenerationFrequency
}> = [
  { label: 'Manual only', value: 'manual' },
  { label: 'Hourly', value: 'hourly' },
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
]

export const DEFAULT_STATIC_SITEMAP_ENTRIES: SitemapStaticEntryConfig[] = [
  { path: '/', changeFrequency: 'weekly', priority: 1 },
  { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
  { path: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { path: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { path: '/contact', changeFrequency: 'monthly', priority: 0.6 },
  { path: '/privacy-policy', changeFrequency: 'yearly', priority: 0.3 },
  { path: '/terms-of-service', changeFrequency: 'yearly', priority: 0.3 },
]

const DEFAULT_DYNAMIC_COLLECTIONS: SitemapDynamicCollectionsConfig = {
  pages: true,
  posts: true,
  products: true,
  services: true,
  categories: true,
}

const VALID_GENERATION_FREQUENCIES = new Set<SitemapGenerationFrequency>(
  SITEMAP_GENERATION_FREQUENCY_OPTIONS.map((option) => option.value),
)

function clampPriority(value: number | null | undefined, fallback: number): number {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return fallback
  }

  return Math.max(0, Math.min(1, Number(value.toFixed(2))))
}

export function normalizeSitemapPath(path: string | null | undefined): string | null {
  if (!path) return null

  const trimmed = path.trim()
  if (!trimmed) return null

  let pathname = trimmed

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      pathname = new URL(trimmed).pathname || '/'
    } catch {
      pathname = trimmed
    }
  }

  pathname = pathname.split('?')[0]?.split('#')[0] ?? pathname
  pathname = `/${pathname.replace(/^\/+/, '')}`
  pathname = pathname.replace(/\/{2,}/g, '/')
  pathname = pathname.replace(/\/+$/, '') || '/'

  return pathname
}

function parseExcludedPaths(value: string | null | undefined): string[] {
  if (!value) return []

  return value
    .split(/\r?\n|,/)
    .map((entry) => normalizeSitemapPath(entry))
    .filter((entry): entry is string => Boolean(entry))
}

function toValidDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null

  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function normalizeSitemapGenerationFrequency(
  value: SitemapGenerationFrequency | string | null | undefined,
): SitemapGenerationFrequency {
  if (typeof value === 'string' && VALID_GENERATION_FREQUENCIES.has(value as SitemapGenerationFrequency)) {
    return value as SitemapGenerationFrequency
  }

  return 'manual'
}

export function normalizeSitemapGenerationStatus(
  value: SitemapGenerationStatus | string | null | undefined,
): SitemapGenerationStatus | null {
  return value === 'success' || value === 'failed' ? value : null
}

export function getNextSitemapGenerationAt(
  settings?: Pick<SitemapSettingsShape, 'generationFrequency' | 'lastGeneratedAt'> | null,
): Date | null {
  const generationFrequency = normalizeSitemapGenerationFrequency(settings?.generationFrequency)

  if (generationFrequency === 'manual') {
    return null
  }

  const lastGeneratedAt = toValidDate(settings?.lastGeneratedAt)
  if (!lastGeneratedAt) {
    return new Date()
  }

  const nextGenerationAt = new Date(lastGeneratedAt)

  if (generationFrequency === 'hourly') {
    nextGenerationAt.setHours(nextGenerationAt.getHours() + 1)
  } else if (generationFrequency === 'daily') {
    nextGenerationAt.setDate(nextGenerationAt.getDate() + 1)
  } else if (generationFrequency === 'weekly') {
    nextGenerationAt.setDate(nextGenerationAt.getDate() + 7)
  } else if (generationFrequency === 'monthly') {
    nextGenerationAt.setMonth(nextGenerationAt.getMonth() + 1)
  }

  return nextGenerationAt
}

export function isSitemapGenerationDue(
  settings?: Pick<SitemapSettingsShape, 'generationFrequency' | 'lastGeneratedAt'> | null,
  now: Date = new Date(),
): boolean {
  const nextGenerationAt = getNextSitemapGenerationAt(settings)

  if (!nextGenerationAt) {
    return false
  }

  return nextGenerationAt.getTime() <= now.getTime()
}

export function normalizeSitemapSettings(
  settings?: SitemapSettingsShape | null,
): NormalizedSitemapSettings {
  const configuredStaticEntries = Array.isArray(settings?.staticEntries)
    ? settings.staticEntries
    : null
  const staticEntries = configuredStaticEntries
    ? configuredStaticEntries
        .map((entry) => {
          const path = normalizeSitemapPath(entry.path)
          if (!path) return null

          return {
            path,
            changeFrequency: entry.changeFrequency ?? 'weekly',
            priority: clampPriority(entry.priority, 0.5),
          }
        })
        .filter((entry): entry is SitemapStaticEntryConfig => Boolean(entry))
    : DEFAULT_STATIC_SITEMAP_ENTRIES

  return {
    enabled: settings?.enabled ?? true,
    staticEntries,
    dynamicCollections: {
      pages: settings?.dynamicCollections?.pages ?? DEFAULT_DYNAMIC_COLLECTIONS.pages,
      posts: settings?.dynamicCollections?.posts ?? DEFAULT_DYNAMIC_COLLECTIONS.posts,
      products: settings?.dynamicCollections?.products ?? DEFAULT_DYNAMIC_COLLECTIONS.products,
      services: settings?.dynamicCollections?.services ?? DEFAULT_DYNAMIC_COLLECTIONS.services,
      categories: settings?.dynamicCollections?.categories ?? DEFAULT_DYNAMIC_COLLECTIONS.categories,
    },
    excludePaths: parseExcludedPaths(settings?.excludePaths),
  }
}

function getAbsoluteSitemapUrl(path: string, siteUrl: string): string {
  const baseUrl = siteUrl.replace(/\/+$/, '')
  return path === '/' ? baseUrl : `${baseUrl}${path}`
}

interface BuildSitemapEntriesOptions {
  payload?: Payload
  settings?: SitemapSettingsShape | null
  siteUrl: string
}

export async function buildSitemapEntries({
  payload,
  settings,
  siteUrl,
}: BuildSitemapEntriesOptions): Promise<MetadataRoute.Sitemap> {
  const normalizedSettings = normalizeSitemapSettings(settings)

  if (!normalizedSettings.enabled) {
    return []
  }

  const entries: MetadataRoute.Sitemap = []
  const seenPaths = new Set<string>()
  const excludedPaths = new Set(normalizedSettings.excludePaths)
  const staticLastModified = settings?.updatedAt ? new Date(settings.updatedAt) : new Date()

  const addEntry = (
    path: string | null | undefined,
    entry: Omit<MetadataRoute.Sitemap[number], 'url'>,
  ) => {
    const normalizedPath = normalizeSitemapPath(path)

    if (!normalizedPath || excludedPaths.has(normalizedPath) || seenPaths.has(normalizedPath)) {
      return
    }

    seenPaths.add(normalizedPath)
    entries.push({
      url: getAbsoluteSitemapUrl(normalizedPath, siteUrl),
      ...entry,
    })
  }

  for (const staticEntry of normalizedSettings.staticEntries) {
    addEntry(staticEntry.path, {
      lastModified: staticLastModified,
      changeFrequency: staticEntry.changeFrequency,
      priority: staticEntry.priority,
    })
  }

  if (!payload) {
    return entries
  }

  if (normalizedSettings.dynamicCollections.pages) {
    try {
      const pages = await payload.find({
        collection: 'pages',
        where: { status: { equals: 'published' } },
        limit: 500,
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      for (const page of pages.docs) {
        if (!page.slug || page.slug === 'home') continue

        addEntry(`/${page.slug}`, {
          lastModified: new Date(page.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    } catch (error) {
      console.error('Error generating page sitemap entries:', error)
    }
  }

  if (normalizedSettings.dynamicCollections.products) {
    try {
      const products = await payload.find({
        collection: 'products',
        where: { status: { equals: 'active' } },
        limit: 500,
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      for (const product of products.docs) {
        if (!product.slug) continue

        addEntry(`/products/${product.slug}`, {
          lastModified: new Date(product.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    } catch (error) {
      console.error('Error generating product sitemap entries:', error)
    }
  }

  if (normalizedSettings.dynamicCollections.services) {
    try {
      const services = await payload.find({
        collection: 'services',
        where: { status: { equals: 'active' } },
        limit: 100,
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      for (const service of services.docs) {
        if (!service.slug) continue

        addEntry(`/services/${service.slug}`, {
          lastModified: new Date(service.updatedAt),
          changeFrequency: 'monthly',
          priority: 0.7,
        })
      }
    } catch (error) {
      console.error('Error generating service sitemap entries:', error)
    }
  }

  if (normalizedSettings.dynamicCollections.categories) {
    try {
      const categories = await payload.find({
        collection: 'categories',
        limit: 100,
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      for (const category of categories.docs) {
        if (!category.slug) continue

        addEntry(`/categories/${category.slug}`, {
          lastModified: new Date(category.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.6,
        })
      }
    } catch (error) {
      console.error('Error generating category sitemap entries:', error)
    }
  }

  if (normalizedSettings.dynamicCollections.posts) {
    try {
      const posts = await payload.find({
        collection: 'posts',
        where: { status: { equals: 'published' } },
        limit: 500,
        select: {
          slug: true,
          updatedAt: true,
        },
      })

      for (const post of posts.docs) {
        if (!post.slug) continue

        addEntry(`/blog/${post.slug}`, {
          lastModified: new Date(post.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        })
      }
    } catch (error) {
      console.error('Error generating blog sitemap entries:', error)
    }
  }

  return entries
}
