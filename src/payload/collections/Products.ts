import type { CollectionConfig } from 'payload'
import { revalidateCollection } from '../hooks/revalidate'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: {
    singular: 'Product',
    plural: 'Products',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'category', 'status'],
  },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateCollection('products')],
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
      required: true,
      min: 0,
      admin: {
        description: 'Price in USD',
      },
    },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: {
        description: 'Original price for showing discounts',
      },
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'sizes',
      type: 'array',
      label: 'Available Sizes',
      admin: {
        description: 'Add available sizes for this product',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'Display label (e.g. "XS", "Small")' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'Internal value (e.g. "xs", "s")' },
        },
      ],
    },
    {
      name: 'colors',
      type: 'array',
      label: 'Available Colors',
      admin: {
        description: 'Add available color options for this product',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          admin: { description: 'Display label (e.g. "HTA/W", "Custom")' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          admin: { description: 'Internal value (e.g. "hta-w", "custom")' },
        },
        {
          name: 'priceModifier',
          type: 'number',
          admin: {
            description:
              'Override price for this color. Leave blank to use default product price.',
          },
        },
      ],
    },
    {
      name: 'sizingChart',
      type: 'richText',
      label: 'Sizing Chart',
      admin: {
        description: 'Optional sizing chart (tables, text, etc.)',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
    {
      name: 'manufacturer',
      type: 'text',
      index: true,
      admin: {
        description: 'Brand / manufacturer name (e.g. "Ozone", "Gin", "SUP\'Air")',
      },
    },
    {
      name: 'enRating',
      type: 'select',
      label: 'EN Rating',
      index: true,
      options: [
        { label: 'EN A', value: 'EN A' },
        { label: 'EN B', value: 'EN B' },
        { label: 'EN C', value: 'EN C' },
        { label: 'EN D', value: 'EN D' },
        { label: 'CCC', value: 'CCC' },
      ],
      admin: {
        description: 'EN certification class',
      },
    },
    {
      name: 'sku',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'inventory',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        position: 'sidebar',
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
          admin: { description: 'Defaults to product name if empty' },
        },
        {
          name: 'metaDescription',
          type: 'textarea',
        },
        {
          name: 'metaKeywords',
          type: 'text',
          admin: {
            description: 'Comma-separated keywords for SEO',
          },
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
