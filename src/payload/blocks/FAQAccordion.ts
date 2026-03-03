import type { Block } from 'payload'

export const FAQAccordion: Block = {
  slug: 'faqAccordion',
  imageURL: 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120" fill="none"><rect width="200" height="120" rx="8" fill="#fafaf5"/><rect x="20" y="16" width="160" height="22" rx="4" fill="#fff" stroke="#ddd" stroke-width="1"/><rect x="28" y="24" width="80" height="5" rx="1" fill="#333" opacity="0.6"/><text x="168" y="30" fill="#e8952f" font-size="12" font-family="sans-serif">+</text><rect x="20" y="44" width="160" height="38" rx="4" fill="#fff" stroke="#e8952f" stroke-width="1.5"/><rect x="28" y="52" width="80" height="5" rx="1" fill="#333" opacity="0.6"/><text x="168" y="58" fill="#e8952f" font-size="12" font-family="sans-serif">-</text><rect x="28" y="64" width="140" height="4" rx="1" fill="#666" opacity="0.3"/><rect x="28" y="72" width="120" height="4" rx="1" fill="#666" opacity="0.3"/><rect x="20" y="88" width="160" height="22" rx="4" fill="#fff" stroke="#ddd" stroke-width="1"/><rect x="28" y="96" width="90" height="5" rx="1" fill="#333" opacity="0.6"/><text x="168" y="102" fill="#e8952f" font-size="12" font-family="sans-serif">+</text></svg>'),
  imageAltText: 'FAQ Accordion — expandable question-and-answer sections',
  labels: {
    singular: 'FAQ Accordion',
    plural: 'FAQ Accordion Blocks',
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      defaultValue: 'Frequently Asked Questions',
      admin: {
        description: 'Section heading above the FAQ list',
      },
    },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      admin: {
        description: 'Add questions and answers — each item expands/collapses on the page',
      },
      fields: [
        {
          name: 'question',
          type: 'text',
          required: true,
        },
        {
          name: 'answer',
          type: 'richText',
          required: true,
        },
      ],
    },
  ],
}
