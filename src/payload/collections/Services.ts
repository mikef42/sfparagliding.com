import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Services: CollectionConfig = {
  slug: 'services',
  labels: {
    singular: 'Service',
    plural: 'Services',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'status'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollection('services')],
  },
  fields: [
    {
      name: 'name',
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
      name: 'description',
      type: 'richText',
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: {
        description: 'Price in USD. Leave empty if using contact for pricing.',
        condition: (data) => !data?.contactForPricing,
      },
    },
    {
      name: 'contactForPricing',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Show "Contact for pricing" instead of a price',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'features',
      type: 'array',
      fields: [
        {
          name: 'feature',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'ctaLabel',
      type: 'text',
      defaultValue: 'Book Now',
      admin: {
        description: 'Button label for this service',
      },
    },
    {
      name: 'ctaLink',
      type: 'text',
      admin: {
        description: 'URL the button links to (external booking, etc.)',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Archived', value: 'archived' },
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
