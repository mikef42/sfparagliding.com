import type { CollectionAfterChangeHook } from 'payload'
import { revalidateTag } from 'next/cache'

export const revalidateCollection =
  (tag: string): CollectionAfterChangeHook =>
  ({ doc }) => {
    revalidateTag(tag)
    revalidateTag(`${tag}-${doc.slug || doc.id}`)
    return doc
  }

export const revalidateGlobal = (tag: string) => {
  return () => {
    revalidateTag(tag)
  }
}
