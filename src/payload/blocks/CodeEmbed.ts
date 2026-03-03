import type { Block } from 'payload'

export const CodeEmbed: Block = {
  slug: 'codeEmbed',
  labels: {
    singular: 'Code Embed',
    plural: 'Code Embeds',
  },
  fields: [
    {
      name: 'label',
      type: 'text',
      admin: {
        description: 'Internal label for this embed (not displayed on the page)',
      },
    },
    {
      name: 'code',
      type: 'code',
      required: true,
      admin: {
        language: 'html',
        description: 'Paste HTML, iframes, or script tags here. This code will render directly on the frontend page.',
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
    },
  ],
}
