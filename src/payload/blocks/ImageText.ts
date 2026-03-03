import type { Block } from 'payload'

export const ImageText: Block = {
  slug: 'imageText',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#fafaf5"/><rect x="12" y="20" width="84" height="80" rx="4" fill="#1B3C2D" opacity="0.12"/><path d="M30 70 L50 45 L70 60 L80 50 L90 70 Z" fill="#1B3C2D" opacity="0.2"/><circle cx="35" cy="38" r="6" fill="#e8952f" opacity="0.4"/><rect x="110" y="28" width="72" height="8" rx="2" fill="#333" opacity="0.7"/><rect x="110" y="44" width="78" height="5" rx="1" fill="#666" opacity="0.4"/><rect x="110" y="54" width="70" height="5" rx="1" fill="#666" opacity="0.4"/><rect x="110" y="64" width="75" height="5" rx="1" fill="#666" opacity="0.4"/><rect x="110" y="80" width="50" height="16" rx="3" fill="#e8952f" opacity="0.8"/></svg>'),
  imageAltText: 'Image + Text block — side-by-side layout with an image on one side and text on the other',
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
      admin: {
        description: 'Image displayed alongside the text content',
      },
    },
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Text content displayed next to the image',
      },
    },
    {
      name: 'layout',
      type: 'select',
      defaultValue: 'image-left',
      options: [
        { label: 'Image Left', value: 'image-left' },
        { label: 'Image Right', value: 'image-right' },
      ],
      admin: {
        description: 'Which side the image appears on',
      },
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
