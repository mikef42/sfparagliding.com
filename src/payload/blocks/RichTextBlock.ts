import type { Block } from 'payload'

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: {
    singular: 'Rich Text',
    plural: 'Rich Text Blocks',
  },
  fields: [
    {
      name: 'content',
      type: 'richText',
      required: true,
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
    },
  ],
}
