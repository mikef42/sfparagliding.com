import type { Block } from 'payload'

export const FeaturedServices: Block = {
  slug: 'featuredServices',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#f0f5f2"/><rect x="12" y="16" width="52" height="64" rx="4" fill="#fff" stroke="#1B3C2D" stroke-width="1" opacity="0.6"/><rect x="18" y="22" width="40" height="28" rx="2" fill="#1B3C2D" opacity="0.15"/><rect x="18" y="56" width="30" height="5" rx="1" fill="#1B3C2D" opacity="0.7"/><rect x="18" y="66" width="20" height="5" rx="1" fill="#1B3C2D" opacity="0.4"/><rect x="74" y="16" width="52" height="64" rx="4" fill="#fff" stroke="#1B3C2D" stroke-width="1" opacity="0.6"/><rect x="80" y="22" width="40" height="28" rx="2" fill="#1B3C2D" opacity="0.15"/><rect x="80" y="56" width="30" height="5" rx="1" fill="#1B3C2D" opacity="0.7"/><rect x="80" y="66" width="20" height="5" rx="1" fill="#1B3C2D" opacity="0.4"/><rect x="136" y="16" width="52" height="64" rx="4" fill="#fff" stroke="#1B3C2D" stroke-width="1" opacity="0.6"/><rect x="142" y="22" width="40" height="28" rx="2" fill="#1B3C2D" opacity="0.15"/><rect x="142" y="56" width="30" height="5" rx="1" fill="#1B3C2D" opacity="0.7"/><rect x="142" y="66" width="20" height="5" rx="1" fill="#1B3C2D" opacity="0.4"/><text x="100" y="106" text-anchor="middle" fill="#1B3C2D" font-size="8" font-family="sans-serif" opacity="0.5">Service Cards</text></svg>'),
  imageAltText: 'Featured Services block — displays a grid of service cards',
  labels: {
    singular: 'Featured Services',
    plural: 'Featured Services Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Services',
      admin: {
        description: 'Section heading above the services grid',
      },
    },
    {
      name: 'populateMode',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Pick Specific Services', value: 'manual' },
        { label: 'Auto-populate', value: 'auto' },
      ],
      admin: {
        description: 'Choose specific services or auto-fill',
      },
    },
    {
      name: 'services',
      type: 'relationship',
      relationTo: 'services',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'manual',
        description: 'Select the services to display',
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
        description: 'Maximum number of services to display',
      },
    },
  ],
}
