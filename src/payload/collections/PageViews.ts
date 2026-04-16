import type { CollectionConfig } from 'payload'

export const PageViews: CollectionConfig = {
  slug: 'page-views',
  labels: {
    singular: 'Page View',
    plural: 'Page Views',
  },
  admin: {
    useAsTitle: 'path',
    defaultColumns: ['path', 'device', 'referrer', 'createdAt'],
    group: 'Analytics',
    hidden: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => false,
    delete: () => false,
  },
  fields: [
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'visitorHash',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'SHA-256 hash of IP + User-Agent (privacy-safe unique visitor ID)',
      },
    },
    {
      name: 'referrer',
      type: 'text',
    },
    {
      name: 'userAgent',
      type: 'text',
    },
    {
      name: 'device',
      type: 'select',
      options: [
        { label: 'Desktop', value: 'desktop' },
        { label: 'Mobile', value: 'mobile' },
        { label: 'Tablet', value: 'tablet' },
      ],
    },
    {
      name: 'sessionDate',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Date portion (YYYY-MM-DD) for daily rollup queries',
      },
    },
  ],
  timestamps: true,
}
