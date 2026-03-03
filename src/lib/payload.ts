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
  limit?: number
  page?: number
}) {
  const payload = await getPayload()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { status: { equals: 'active' } }

  if (options?.category) {
    where['category.slug'] = { equals: options.category }
  }

  return payload.find({
    collection: 'products',
    where,
    limit: options?.limit || 12,
    page: options?.page || 1,
  })
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

export async function getHomepage() {
  const settings = await getSiteSettings()
  const homepageRef = settings?.homepage

  if (homepageRef && typeof homepageRef === 'object' && 'slug' in homepageRef) {
    return homepageRef
  }

  return getPage('home')
}
