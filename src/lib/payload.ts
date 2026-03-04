import configPromise from '@payload-config'
import { getPayload as getPayloadInstance } from 'payload'

export const getPayload = async () => {
  return getPayloadInstance({ config: configPromise })
}

export async function getPage(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'pages',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getProduct(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    where: {
      slug: { equals: slug },
      status: { equals: 'active' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getProducts(options?: {
  category?: string
  manufacturer?: string
  enRating?: string
  limit?: number
  page?: number
  sort?: string
}) {
  const payload = await getPayload()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: { equals: 'active' } }

  if (options?.category) {
    where['category.slug'] = { equals: options.category }
  }

  if (options?.manufacturer) {
    where.manufacturer = { equals: options.manufacturer }
  }

  if (options?.enRating) {
    where.enRating = { equals: options.enRating }
  }

  return payload.find({
    collection: 'products',
    where,
    limit: options?.limit || 12,
    page: options?.page || 1,
    sort: options?.sort || 'name',
  })
}

export async function getFilterOptions(): Promise<{
  manufacturers: string[]
  enRatings: string[]
}> {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'products',
    where: { status: { equals: 'active' } },
    limit: 500,
  })
  const manufacturers = new Set<string>()
  const enRatings = new Set<string>()
  for (const p of result.docs) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prod = p as any
    if (prod.manufacturer) manufacturers.add(prod.manufacturer)
    if (prod.enRating) enRatings.add(prod.enRating)
  }
  const ratingOrder = ['EN A', 'EN B', 'EN C', 'EN D', 'CCC']
  return {
    manufacturers: Array.from(manufacturers).sort(),
    enRatings: Array.from(enRatings).sort(
      (a, b) => ratingOrder.indexOf(a) - ratingOrder.indexOf(b),
    ),
  }
}

export async function getService(slug: string) {
  const payload = await getPayload()
  const result = await payload.find({
    collection: 'services',
    where: {
      slug: { equals: slug },
      status: { equals: 'active' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getServices(limit?: number) {
  const payload = await getPayload()
  return payload.find({
    collection: 'services',
    where: { status: { equals: 'active' } },
    limit: limit || 20,
  })
}

export async function getCategories() {
  const payload = await getPayload()
  return payload.find({
    collection: 'categories',
    limit: 100,
  })
}

export async function getSiteSettings() {
  const payload = await getPayload()
  return payload.findGlobal({
    slug: 'site-settings',
  })
}

export async function getBlogPost(slug: string) {
  const payload = await getPayload()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await (payload as any).find({
    collection: 'posts',
    where: {
      slug: { equals: slug },
      status: { equals: 'published' },
    },
    limit: 1,
  })
  return result.docs[0] || null
}

export async function getBlogPosts(limit?: number) {
  const payload = await getPayload()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (payload as any).find({
    collection: 'posts',
    where: { status: { equals: 'published' } },
    limit: limit || 50,
    sort: '-publishedAt',
  })
}

export async function getHomepage() {
  const settings = await getSiteSettings()
  const homepageRef = settings?.homepage

  if (homepageRef && typeof homepageRef === 'object' && 'slug' in homepageRef) {
    return homepageRef
  }

  return getPage('home')
}
