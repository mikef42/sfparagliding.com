import type { MetadataRoute } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/services`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Fetch dynamic pages from CMS
  try {
    const { getPayload } = await import('@/lib/payload')
    const payload = await getPayload()

    // Pages
    const pages = await payload.find({
      collection: 'pages',
      where: { status: { equals: 'published' } },
      limit: 500,
    })

    pages.docs.forEach((page) => {
      if (page.slug === 'home') return
      entries.push({
        url: `${SITE_URL}/${page.slug}`,
        lastModified: new Date(page.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // Products
    const products = await payload.find({
      collection: 'products',
      where: { status: { equals: 'active' } },
      limit: 500,
    })

    products.docs.forEach((product) => {
      entries.push({
        url: `${SITE_URL}/products/${product.slug}`,
        lastModified: new Date(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })
    })

    // Services
    const services = await payload.find({
      collection: 'services',
      where: { status: { equals: 'active' } },
      limit: 100,
    })

    services.docs.forEach((service) => {
      entries.push({
        url: `${SITE_URL}/services/${service.slug}`,
        lastModified: new Date(service.updatedAt),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    })

    // Categories
    const categories = await payload.find({
      collection: 'categories',
      limit: 100,
    })

    categories.docs.forEach((category) => {
      entries.push({
        url: `${SITE_URL}/categories/${category.slug}`,
        lastModified: new Date(category.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6,
      })
    })
  } catch (e) {
    console.error('Error generating sitemap:', e)
  }

  return entries
}
