import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'
import {
  DEFAULT_STATIC_SITEMAP_ENTRIES,
  SITEMAP_CHANGE_FREQUENCY_OPTIONS,
  SITEMAP_GENERATION_FREQUENCY_OPTIONS,
} from '@/lib/sitemap'

export const SitemapSettings: GlobalConfig = {
  slug: 'sitemap-settings',
  label: 'SEO Sitemap',
  admin: {
    group: false,
    hideAPIURL: true,
    description:
      'Manage the automatically generated XML sitemap that is published at /sitemap.xml.',
  },
  access: {
    read: () => true,
    update: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterChange: [revalidateGlobal('sitemap-settings')],
  },
  fields: [
    {
      name: 'enabled',
      type: 'checkbox',
      label: 'Enable sitemap.xml',
      defaultValue: true,
      admin: {
        description:
          'When disabled, the site will stop advertising the sitemap in robots.txt and return an empty sitemap response.',
      },
    },
    {
      name: 'staticEntries',
      type: 'array',
      label: 'Static Routes',
      defaultValue: DEFAULT_STATIC_SITEMAP_ENTRIES,
      admin: {
        description:
          'These routes are included before dynamic content. Use site-relative paths such as /contact or /blog.',
      },
      fields: [
        {
          name: 'path',
          type: 'text',
          required: true,
          admin: {
            description: 'Site-relative path or full URL. Full URLs will be normalized back to a path.',
          },
        },
        {
          name: 'changeFrequency',
          type: 'select',
          required: true,
          defaultValue: 'weekly',
          options: SITEMAP_CHANGE_FREQUENCY_OPTIONS,
        },
        {
          name: 'priority',
          type: 'number',
          required: true,
          defaultValue: 0.5,
          min: 0,
          max: 1,
          admin: {
            description: 'Priority from 0.0 to 1.0.',
            step: 0.1,
          },
        },
      ],
    },
    {
      name: 'dynamicCollections',
      type: 'group',
      label: 'Auto-Included Content',
      fields: [
        {
          name: 'pages',
          type: 'checkbox',
          label: 'Published CMS pages',
          defaultValue: true,
        },
        {
          name: 'posts',
          type: 'checkbox',
          label: 'Published blog posts',
          defaultValue: true,
        },
        {
          name: 'products',
          type: 'checkbox',
          label: 'Active products',
          defaultValue: true,
        },
        {
          name: 'services',
          type: 'checkbox',
          label: 'Active services',
          defaultValue: true,
        },
        {
          name: 'categories',
          type: 'checkbox',
          label: 'Categories',
          defaultValue: true,
        },
      ],
    },
    {
      name: 'excludePaths',
      type: 'textarea',
      label: 'Excluded Paths',
      defaultValue: '',
      admin: {
        description:
          'Optional. Enter one site-relative path per line to remove it from the generated sitemap, including dynamic URLs.',
      },
    },
    {
      name: 'generationFrequency',
      type: 'select',
      label: 'Auto-Generation Schedule',
      defaultValue: 'manual',
      options: SITEMAP_GENERATION_FREQUENCY_OPTIONS,
      admin: {
        description:
          'Controls how often the server cron should regenerate sitemap.xml and robots.txt from the saved settings.',
      },
    },
    {
      name: 'lastGeneratedAt',
      type: 'date',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'lastGeneratedCount',
      type: 'number',
      admin: {
        hidden: true,
      },
    },
    {
      name: 'lastGenerationStatus',
      type: 'select',
      options: [
        { label: 'Success', value: 'success' },
        { label: 'Failed', value: 'failed' },
      ],
      admin: {
        hidden: true,
      },
    },
    {
      name: 'lastGenerationMessage',
      type: 'textarea',
      admin: {
        hidden: true,
      },
    },
  ],
}
