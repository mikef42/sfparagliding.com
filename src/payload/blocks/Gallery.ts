import type { Block } from 'payload'

export const Gallery: Block = {
  slug: 'gallery',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#f4f5f7"/><rect x="12" y="16" width="56" height="40" rx="3" fill="#1B3C2D" opacity="0.15"/><path d="M20 42 L35 28 L50 38 L55 32 L64 42 Z" fill="#1B3C2D" opacity="0.25"/><circle cx="24" cy="26" r="4" fill="#e8952f" opacity="0.4"/><rect x="72" y="16" width="56" height="40" rx="3" fill="#1B3C2D" opacity="0.15"/><path d="M80 42 L95 28 L110 38 L115 32 L124 42 Z" fill="#1B3C2D" opacity="0.25"/><circle cx="84" cy="26" r="4" fill="#e8952f" opacity="0.4"/><rect x="132" y="16" width="56" height="40" rx="3" fill="#1B3C2D" opacity="0.15"/><path d="M140 42 L155 28 L170 38 L175 32 L184 42 Z" fill="#1B3C2D" opacity="0.25"/><circle cx="144" cy="26" r="4" fill="#e8952f" opacity="0.4"/><rect x="12" y="62" width="56" height="40" rx="3" fill="#1B3C2D" opacity="0.15"/><rect x="72" y="62" width="56" height="40" rx="3" fill="#1B3C2D" opacity="0.15"/><rect x="132" y="62" width="56" height="40" rx="3" fill="#1B3C2D" opacity="0.15"/></svg>'),
  imageAltText: 'Gallery block — grid of images with optional captions',
  labels: {
    singular: 'Gallery',
    plural: 'Gallery Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      admin: {
        description: 'Optional heading above the gallery grid',
      },
    },
    {
      name: 'images',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Upload images — each can have an optional caption',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
        {
          name: 'caption',
          type: 'text',
        },
      ],
    },
    {
      name: 'columns',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
        { label: '4 Columns', value: '4' },
      ],
      admin: {
        description: 'Number of columns in the gallery grid',
      },
    },
  ],
}
