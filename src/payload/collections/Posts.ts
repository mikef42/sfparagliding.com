import type { CollectionConfig, CollectionBeforeChangeHook } from 'payload'
import {
  regenerateSitemapOnContentChange,
  regenerateSitemapOnContentDelete,
  revalidateCollection,
} from '../hooks/revalidate'

// Auto-set publishedAt when status changes to 'published' and it's not already set
const autoSetPublishedAt: CollectionBeforeChangeHook = ({ data }) => {
  if (data?.status === 'published' && !data.publishedAt) {
    data.publishedAt = new Date().toISOString()
  }
  return data
}

export const Posts: CollectionConfig = {
  slug: 'posts',
  labels: {
    singular: 'Blog Post',
    plural: 'Blog',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'status', 'publishedAt'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [autoSetPublishedAt],
    afterChange: [revalidateCollection('posts'), regenerateSitemapOnContentChange],
    afterDelete: [regenerateSitemapOnContentDelete],
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Short summary shown on the blog listing page',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'featuredImage',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'author',
      type: 'text',
      admin: {
        description: 'Author name displayed on the post',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: { description: 'Defaults to post title if empty' },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
        {
          name: 'ogImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
