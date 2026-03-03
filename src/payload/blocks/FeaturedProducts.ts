import type { Block } from 'payload'

export const FeaturedProducts: Block = {
  slug: 'featuredProducts',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#f7f7f5"/><rect x="12" y="16" width="52" height="64" rx="4" fill="#fff" stroke="#ddd" stroke-width="1"/><rect x="18" y="22" width="40" height="28" rx="2" fill="#e8952f" opacity="0.2"/><rect x="18" y="56" width="30" height="5" rx="1" fill="#333" opacity="0.7"/><rect x="18" y="66" width="20" height="5" rx="1" fill="#e8952f"/><rect x="74" y="16" width="52" height="64" rx="4" fill="#fff" stroke="#ddd" stroke-width="1"/><rect x="80" y="22" width="40" height="28" rx="2" fill="#e8952f" opacity="0.2"/><rect x="80" y="56" width="30" height="5" rx="1" fill="#333" opacity="0.7"/><rect x="80" y="66" width="20" height="5" rx="1" fill="#e8952f"/><rect x="136" y="16" width="52" height="64" rx="4" fill="#fff" stroke="#ddd" stroke-width="1"/><rect x="142" y="22" width="40" height="28" rx="2" fill="#e8952f" opacity="0.2"/><rect x="142" y="56" width="30" height="5" rx="1" fill="#333" opacity="0.7"/><rect x="142" y="66" width="20" height="5" rx="1" fill="#e8952f"/><text x="100" y="106" text-anchor="middle" fill="#999" font-size="8" font-family="sans-serif">Product Grid</text></svg>'),
  imageAltText: 'Featured Products block — displays a grid of product cards from your shop',
  labels: {
    singular: 'Featured Products',
    plural: 'Featured Products Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Featured Products',
      admin: {
        description: 'Section heading above the product grid',
      },
    },
    {
      name: 'populateMode',
      type: 'select',
      defaultValue: 'manual',
      options: [
        { label: 'Pick Specific Products', value: 'manual' },
        { label: 'Auto-populate from Category', value: 'auto' },
      ],
      admin: {
        description: 'Choose specific products or auto-fill from a category',
      },
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'manual',
        description: 'Select the products to display',
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
      admin: {
        condition: (_, siblingData) => siblingData?.populateMode === 'auto',
        description: 'Products from this category will be shown',
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
        description: 'Maximum number of products to display',
      },
    },
  ],
}
