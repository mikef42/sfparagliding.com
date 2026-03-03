import type { Block } from 'payload'

export const Testimonials: Block = {
  slug: 'testimonials',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#fdf8f0"/><text x="30" y="35" fill="#e8952f" font-size="36" font-family="serif" opacity="0.4">"</text><rect x="50" y="28" width="120" height="5" rx="1" fill="#666" opacity="0.5"/><rect x="50" y="38" width="100" height="5" rx="1" fill="#666" opacity="0.5"/><rect x="50" y="48" width="110" height="5" rx="1" fill="#666" opacity="0.5"/><circle cx="55" cy="75" r="12" fill="#1B3C2D" opacity="0.2"/><rect x="75" y="70" width="50" height="5" rx="1" fill="#333" opacity="0.6"/><rect x="75" y="80" width="35" height="4" rx="1" fill="#999" opacity="0.4"/><line x1="12" y1="100" x2="188" y2="100" stroke="#e8952f" stroke-width="0.5" opacity="0.3"/></svg>'),
  imageAltText: 'Testimonials block — customer quotes with author names and optional avatars',
  labels: {
    singular: 'Testimonials',
    plural: 'Testimonials Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Testimonials',
      admin: {
        description: 'Section heading above the testimonials',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Add customer testimonials — each with a quote, author name, and optional photo',
      },
      fields: [
        {
          name: 'title',
          type: 'text',
        },
        {
          name: 'quote',
          type: 'textarea',
          required: true,
        },
        {
          name: 'author',
          type: 'text',
          required: true,
        },
        {
          name: 'role',
          type: 'text',
          admin: {
            description: 'e.g., "Tandem Flight Customer"',
          },
        },
        {
          name: 'avatar',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },
  ],
}
