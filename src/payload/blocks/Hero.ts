import type { Block } from 'payload'

export const Hero: Block = {
  slug: 'hero',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#1B3C2D"/><rect x="16" y="16" width="168" height="88" rx="4" fill="#2a5e44" opacity="0.5"/><rect x="40" y="38" width="120" height="12" rx="2" fill="#fff" opacity="0.9"/><rect x="55" y="58" width="90" height="6" rx="1" fill="#fff" opacity="0.5"/><rect x="70" y="76" width="60" height="20" rx="4" fill="#e8952f"/><text x="100" y="90" text-anchor="middle" fill="#fff" font-size="8" font-family="sans-serif">CTA</text></svg>'),
  imageAltText: 'Hero block — full-width banner with heading, subheading, and call-to-action button over a background image',
  labels: {
    singular: 'Hero',
    plural: 'Heroes',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'Main headline displayed over the hero image',
      },
    },
    {
      name: 'subheading',
      type: 'text',
      admin: {
        description: 'Smaller text below the heading',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Full-width background image (recommended: 1920x800+)',
      },
    },
    {
      name: 'ctaButton',
      type: 'group',
      admin: {
        description: 'Optional call-to-action button',
      },
      fields: [
        {
          name: 'label',
          type: 'text',
        },
        {
          name: 'link',
          type: 'text',
        },
      ],
    },
    {
      name: 'overlayOpacity',
      type: 'number',
      min: 0,
      max: 100,
      defaultValue: 30,
      admin: {
        description: 'Dark overlay opacity (0 = none, 100 = fully dark)',
      },
    },
    {
      name: 'textAlignment',
      type: 'select',
      defaultValue: 'center',
      options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ],
    },
  ],
}
