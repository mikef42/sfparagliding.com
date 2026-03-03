import type { Block } from 'payload'

export const CodeEmbed: Block = {
  slug: 'codeEmbed',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#1a1a2e"/><text x="100" y="40" text-anchor="middle" fill="#e8952f" font-size="28" font-family="monospace" opacity="0.9">&lt;/&gt;</text><rect x="35" y="58" width="130" height="5" rx="1" fill="#4ec9b0" opacity="0.4"/><rect x="45" y="68" width="110" height="5" rx="1" fill="#ce9178" opacity="0.4"/><rect x="45" y="78" width="90" height="5" rx="1" fill="#9cdcfe" opacity="0.4"/><rect x="35" y="88" width="60" height="5" rx="1" fill="#4ec9b0" opacity="0.4"/><text x="100" y="110" text-anchor="middle" fill="#888" font-size="7" font-family="sans-serif">Embeds HTML, iframes, scripts</text></svg>'),
  imageAltText: 'Code Embed block — renders raw HTML, iframes, and script tags directly on the page',
  labels: {
    singular: 'Code Embed',
    plural: 'Code Embeds',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Internal label for this embed (not shown on the page, just for your reference)',
      },
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Paste HTML, iframes, or script tags here. This code renders directly on the frontend. Use this block for booking widgets, embedded forms, maps, etc.',
      },
    },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'wide',
      options: [
        { label: 'Narrow (800px)', value: 'narrow' },
        { label: 'Medium (1000px)', value: 'medium' },
        { label: 'Wide (1200px)', value: 'wide' },
        { label: 'Full Width', value: 'full' },
      ],
      admin: {
        description: 'Maximum width of the embed container',
      },
    },
  ],
}
