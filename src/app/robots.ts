import type { MetadataRoute } from 'next'
import { getPayload } from '@/lib/payload'
import { normalizeSitemapSettings } from '@/lib/sitemap'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

export default async function robots(): Promise<MetadataRoute.Robots> {
  let sitemapUrl: string | undefined = `${SITE_URL}/sitemap.xml`

  try {
    const payload = await getPayload()
    const settings = await payload.findGlobal({
      slug: 'sitemap-settings',
      overrideAccess: true,
    })

    if (!normalizeSitemapSettings(settings).enabled) {
      sitemapUrl = undefined
    }
  } catch (error) {
    console.error('Error loading sitemap settings for robots.txt:', error)
  }

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/checkout/'],
      },
    ],
    sitemap: sitemapUrl,
  }
}
