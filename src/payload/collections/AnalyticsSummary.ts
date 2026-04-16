import type { CollectionConfig } from 'payload'

export const AnalyticsSummary: CollectionConfig = {
  slug: 'analytics-summary',
  labels: {
    singular: 'Analytics Summary',
    plural: 'Analytics Summaries',
  },
  admin: {
    useAsTitle: 'date',
    defaultColumns: ['date', 'path', 'views', 'uniqueVisitors'],
    group: 'Analytics',
    hidden: true,
  },
  access: {
    read: () => true,
    create: () => true,
    update: () => true,
    delete: () => false,
  },
  fields: [
    {
      name: 'date',
      type: 'date',
      required: true,
      index: true,
    },
    {
      name: 'path',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'views',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'uniqueVisitors',
      type: 'number',
      required: true,
      defaultValue: 0,
    },
    {
      name: 'topReferrers',
      type: 'json',
    },
    {
      name: 'deviceBreakdown',
      type: 'json',
    },
  ],
  timestamps: true,
}
