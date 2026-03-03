import type { Block } from 'payload'

export const FeaturedProducts: Block = {
  slug: 'featuredProducts',
  labels: {
    singular: 'Featured Products',
    plural: 'Featured Products Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Featured Products',
    },
    {
      name: 'populateMode',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Pick Specific Products', value: 'manual' },
        { label: 'Auto-populate from Category', value: 'auto' },
      ],
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'manual',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'auto',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 24,
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'auto',
      },
    },
  ],
}
