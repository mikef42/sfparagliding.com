import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richText',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#f0f1f4"/><rect x="30" y="20" width="100" height="10" rx="2" fill="#333" opacity="0.8"/><rect x="30" y="38" width="140" height="5" rx="1" fill="#666" opacity="0.5"/><rect x="30" y="48" width="130" height="5" rx="1" fill="#666" opacity="0.5"/><rect x="30" y="58" width="140" height="5" rx="1" fill="#666" opacity="0.5"/><rect x="30" y="68" width="100" height="5" rx="1" fill="#666" opacity="0.5"/><rect x="30" y="84" width="80" height="8" rx="2" fill="#333" opacity="0.7"/><rect x="30" y="98" width="140" height="5" rx="1" fill="#666" opacity="0.5"/></svg>'),
  imageAltText: 'Rich Text block — formatted text with headings, paragraphs, lists, and links',
  labels: {
    singular: 'Rich Text',
    plural: 'Rich Text Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Formatted text — use the toolbar for headings, bold, italic, links, and lists',
      },
    },
    {
      name: 'maxWidth',
      type: 'select',
      defaultValue: 'narrow',
      options: [
        { label: 'Narrow (800px)', value: 'narrow' },
        { label: 'Medium (1000px)', value: 'medium' },
        { label: 'Wide (1200px)', value: 'wide' },
      ],
      admin: {
        description: 'Maximum width of the text content area',
      },
    },
  ],
}
