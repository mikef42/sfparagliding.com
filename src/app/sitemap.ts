import type { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload'
import { buildSitemapEntries } from '@/lib/sitemap'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({
      slug: 'sitemap-settings',
      overrideAccess: true,
    })

    return buildSitemapEntries({
      payload,
      settings,
      siteUrl: SITE_URL,
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)

    return buildSitemapEntries({
      siteUrl: SITE_URL,
    })
  }
}
