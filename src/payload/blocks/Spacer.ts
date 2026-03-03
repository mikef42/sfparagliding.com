import type { Block } from 'payload'

export const Spacer: Block = {
  slug: 'spacer',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#f8f8f8"/><line x1="20" y1="30" x2="180" y2="30" stroke="#ccc" stroke-width="1" stroke-dasharray="4 3"/><path d="M100 40 L94 48 L106 48 Z" fill="#bbb"/><rect x="96" y="48" width="8" height="24" rx="1" fill="#bbb" opacity="0.5"/><path d="M100 80 L94 72 L106 72 Z" fill="#bbb"/><line x1="20" y1="90" x2="180" y2="90" stroke="#ccc" stroke-width="1" stroke-dasharray="4 3"/></svg>'),
  imageAltText: 'Spacer block — adds vertical spacing between blocks',
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
      admin: {
        description: 'Amount of vertical space to add between blocks',
      },
    },
  ],
}
