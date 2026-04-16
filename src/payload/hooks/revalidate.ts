import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'
import { generateSitemapArtifacts } from '@/lib/sitemap-generation'

const COLLECTION_PATHS: Record<string, string[]> = {
  products: ['/products', '/'],
  services: ['/services', '/'],
  posts: ['/blog'],
  pages: ['/'],
  categories: ['/products'],
}

const SEO_PATHS = ['/sitemap.xml', '/robots.txt']
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://sfparagliding.com'

const revalidateSeoPaths = () => {
  for (const path of SEO_PATHS) {
    revalidatePath(path)
  }
}

async function regenerateSitemapAfterContentChange({
  action,
  collectionSlug,
  payload,
}: {
  action: 'change' | 'delete'
  collectionSlug: string
  payload: Parameters<typeof generateSitemapArtifacts>[0]['payload']
}) {
  try {
    await generateSitemapArtifacts({
      force: true,
      payload,
      siteUrl: SITE_URL,
      trigger: 'content-change',
    })
  } catch (error) {
    console.error(`[Sitemap] Failed to regenerate after ${collectionSlug} ${action}:`, error)
  }
}

export const revalidateCollection =
  (tag: string): CollectionAfterChangeHook =>
  ({ doc }) => {
    revalidateTag(tag)
    revalidateTag(`${tag}-${doc.slug || doc.id}`)

    // Revalidate the listing pages so new/updated items appear
    const paths = COLLECTION_PATHS[tag]
    if (paths) {
      for (const path of paths) {
        revalidatePath(path)
      }
    }

    // Revalidate the individual item page
    const slug = doc.slug || doc.id
    if (tag === 'products') revalidatePath(`/products/${slug}`)
    else if (tag === 'services') revalidatePath(`/services/${slug}`)
    else if (tag === 'posts') revalidatePath(`/blog/${slug}`)
    else if (tag === 'pages') revalidatePath(`/${slug}`)

    revalidateSeoPaths()

    return doc
  }

export const regenerateSitemapOnContentChange: CollectionAfterChangeHook = async ({
  collection,
  doc,
  req,
}) => {
  await regenerateSitemapAfterContentChange({
    action: 'change',
    collectionSlug: collection.slug,
    payload: req.payload,
  })

  return doc
}

export const regenerateSitemapOnContentDelete: CollectionAfterDeleteHook = async ({
  collection,
  doc,
  req,
}) => {
  await regenerateSitemapAfterContentChange({
    action: 'delete',
    collectionSlug: collection.slug,
    payload: req.payload,
  })

  return doc
}

export const revalidateGlobal = (tag: string) => {
  return () => {
    revalidateTag(tag)
    revalidatePath('/')
    revalidateSeoPaths()
  }
}
