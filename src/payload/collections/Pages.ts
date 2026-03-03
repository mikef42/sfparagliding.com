import type { CollectionConfig } from 'payload'
import { Hero } from '../blocks/Hero'
import { RichTextBlock } from '../blocks/RichTextBlock'
import { FeaturedProducts } from '../blocks/FeaturedProducts'
import { FeaturedServices } from '../blocks/FeaturedServices'
import { ImageText } from '../blocks/ImageText'
import { Testimonials } from '../blocks/Testimonials'
import { CTABanner } from '../blocks/CTABanner'
import { FAQAccordion } from '../blocks/FAQAccordion'
import { Gallery } from '../blocks/Gallery'
import { Spacer } from '../blocks/Spacer'
import { CodeEmbed } from '../blocks/CodeEmbed'
import { revalidateCollection } from '../hooks/revalidate'

export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => {
        const slug = data?.slug
        if (!slug) return '/preview'
        return `${process.env.NEXT_PUBLIC_SERVER_URL}/${slug === 'home' ? '' : slug}`
      },
    },
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollection('pages')],
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
      name: 'meta',
      type: 'group',
      fields: [
        {
          name: 'metaTitle',
          type: 'text',
          admin: { description: 'Defaults to page title if empty' },
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
    {
      name: 'layout',
      type: 'blocks',
      blocks: [
        Hero,
        RichTextBlock,
        FeaturedProducts,
        FeaturedServices,
        ImageText,
        Testimonials,
        CTABanner,
        FAQAccordion,
        Gallery,
        Spacer,
        CodeEmbed,
      ],
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
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
  ],
}
