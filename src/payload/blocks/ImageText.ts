import type { Block } from 'payload'

export const ImageText: Block = {
  slug: 'imageText',
  labels: {
    singular: 'Image + Text',
    plural: 'Image + Text Blocks',
  },
  fields: [
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'image-left',
      options: [
        { label: 'Image Left', value: 'image-left' },
        { label: 'Image Right', value: 'image-right' },
      ],
    },
    {
      name: 'backgroundColor',
      type: 'text',
      admin: {
        description: 'Optional background color (hex or CSS color)',
      },
    },
  ],
}
