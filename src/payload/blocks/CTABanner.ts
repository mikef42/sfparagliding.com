import type { Block } from 'payload'

export const CTABanner: Block = {
  slug: 'ctaBanner',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#1B3C2D"/><rect x="40" y="30" width="120" height="12" rx="2" fill="#fff" opacity="0.9"/><rect x="50" y="50" width="100" height="5" rx="1" fill="#fff" opacity="0.4"/><rect x="65" y="72" width="70" height="24" rx="6" fill="#e8952f"/><text x="100" y="88" text-anchor="middle" fill="#fff" font-size="9" font-family="sans-serif" font-weight="bold">Button</text></svg>'),
  imageAltText: 'CTA Banner — colored banner with heading and a call-to-action button',
  labels: {
    singular: 'CTA Banner',
    plural: 'CTA Banners',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      required: true,
      admin: {
        description: 'Bold heading text for the banner',
      },
    },
    {
      name: 'text',
      type: 'textarea',
      admin: {
        description: 'Supporting text below the heading (plain text only — use Code Embed for HTML)',
      },
    },
    {
      name: 'buttonLabel',
      type: 'text',
      required: true,
      admin: {
        description: 'Button text (e.g., "Book Now", "Learn More")',
      },
    },
    {
      name: 'buttonLink',
      type: 'text',
      required: true,
      admin: {
        description: 'URL the button links to (e.g., /contact)',
      },
    },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Optional background image (overrides background color)',
      },
    },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: {
        description: 'Fallback background color if no image (e.g., #1B3C2D)',
      },
    },
  ],
}
