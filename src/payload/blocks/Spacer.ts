import type { Block } from 'payload'

export const Spacer: Block = {
  slug: 'spacer',
  labels: {
    singular: 'Spacer',
    plural: 'Spacers',
  },
  fields: [
    {
      name: 'height',
      type: 'select',
      defaultValue: 'medium',
      required: true,
      options: [
        { label: 'Small (2rem)', value: 'small' },
        { label: 'Medium (4rem)', value: 'medium' },
        { label: 'Large (8rem)', value: 'large' },
      ],
    },
  ],
}
