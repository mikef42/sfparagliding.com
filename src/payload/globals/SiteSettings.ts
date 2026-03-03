import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [revalidateGlobal('site-settings')],
  },
  fields: [
    // Header Configuration
    {
      name: 'header',
      type: 'group',
      fields: [
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'logoText',
          type: 'text',
          defaultValue: 'SF Paragliding',
        },
        {
          name: 'navLinks',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'linkType',
              type: 'select',
              defaultValue: 'url',
              options: [
                { label: 'Page', value: 'page' },
                { label: 'URL', value: 'url' },
                { label: 'Product', value: 'product' },
                { label: 'Category', value: 'category' },
              ],
            },
            {
              name: 'reference',
              type: 'relationship',
              relationTo: ['pages', 'products', 'categories'],
              admin: {
                condition: (_, siblingData) =>
                  siblingData?.linkType === 'page' ||
                  siblingData?.linkType === 'product' ||
                  siblingData?.linkType === 'category',
              },
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                condition: (_, siblingData) => siblingData?.linkType === 'url',
              },
            },
            {
              name: 'openInNewTab',
              type: 'checkbox',
              defaultValue: false,
            },
          ],
        },
        {
          name: 'ctaButton',
          type: 'group',
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'link',
              type: 'text',
            },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'primary',
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Outline', value: 'outline' },
              ],
            },
          ],
        },
      ],
    },

    // Footer Configuration
    {
      name: 'footer',
      type: 'group',
      fields: [
        {
          name: 'columns',
          type: 'array',
          fields: [
            {
              name: 'heading',
              type: 'text',
              required: true,
            },
            {
              name: 'links',
              type: 'array',
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
                {
                  name: 'openInNewTab',
                  type: 'checkbox',
                  defaultValue: false,
                },
              ],
            },
          ],
        },
        {
          name: 'copyrightText',
          type: 'text',
          defaultValue: '© SFParagliding',
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            {
              name: 'platform',
              type: 'select',
              required: true,
              options: [
                { label: 'Facebook', value: 'facebook' },
                { label: 'Twitter', value: 'twitter' },
                { label: 'Instagram', value: 'instagram' },
                { label: 'Pinterest', value: 'pinterest' },
                { label: 'YouTube', value: 'youtube' },
                { label: 'TikTok', value: 'tiktok' },
                { label: 'Yelp', value: 'yelp' },
              ],
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
        {
          name: 'bottomLinks',
          type: 'array',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              required: true,
            },
          ],
        },
      ],
    },

    // Homepage Reference
    {
      name: 'homepage',
      type: 'relationship',
      relationTo: 'pages',
      admin: {
        description: 'Select which page to display as the homepage',
      },
    },

    // Brand Colors
    {
      name: 'brandColors',
      type: 'group',
      fields: [
        {
          name: 'primary',
          type: 'text',
          defaultValue: '#1B3C2D',
          admin: { description: 'Primary brand color (forest green)' },
        },
        {
          name: 'secondary',
          type: 'text',
          defaultValue: '#E8952F',
          admin: { description: 'Secondary brand color (amber)' },
        },
        {
          name: 'accent',
          type: 'text',
          defaultValue: '#FAFAF5',
          admin: { description: 'Accent color (cream)' },
        },
      ],
    },

    // Global SEO
    {
      name: 'seo',
      type: 'group',
      fields: [
        {
          name: 'siteName',
          type: 'text',
          defaultValue: 'SF Paragliding',
        },
        {
          name: 'titleSuffix',
          type: 'text',
          defaultValue: ' | SF Paragliding',
        },
        {
          name: 'defaultDescription',
          type: 'textarea',
          defaultValue:
            'Experience the beauty of the San Francisco Bay Area from a new perspective with SF Paragliding. Tandem flights and lessons year round.',
        },
        {
          name: 'defaultOgImage',
          type: 'upload',
          relationTo: 'media',
        },
      ],
    },

    // Newsletter / Special Offers
    {
      name: 'newsletter',
      type: 'group',
      fields: [
        {
          name: 'heading',
          type: 'text',
          defaultValue: 'Special Offers',
        },
        {
          name: 'description',
          type: 'text',
          defaultValue:
            'Join to get special offers, free giveaways, and once-in-a-lifetime deals.',
        },
        {
          name: 'enabled',
          type: 'checkbox',
          defaultValue: true,
        },
      ],
    },
  ],
}
