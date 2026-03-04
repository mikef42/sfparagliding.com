import type { CollectionAfterChangeHook } from 'payload'
import { revalidatePath } from 'next/cache'
import { revalidateTag } from 'next/cache'

const COLLECTION_PATHS: Record<string, string[]> = {
  products: ['/products', '/'],
  services: ['/services', '/'],
  posts: ['/blog'],
  pages: ['/'],
  categories: ['/products'],
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

    return doc
  }

export const revalidateGlobal = (tag: string) => {
  return () => {
    revalidateTag(tag)
    revalidatePath('/')
  }
}
