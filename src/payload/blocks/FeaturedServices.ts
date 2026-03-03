import type { Block } from 'payload'

export const FeaturedServices: Block = {
  slug: 'featuredServices',
  labels: {
    singular: 'Featured Services',
    plural: 'Featured Services Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Services',
    },
    {
      name: 'populateMode',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Pick Specific Services', value: 'manual' },
        { label: 'Auto-populate', value: 'auto' },
      ],
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'manual',
      },
    },
    {
      name: 'limit',
      type: 'number',
      defaultValue: 6,
      min: 1,
      max: 12,
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'auto',
      },
    },
  ],
}
