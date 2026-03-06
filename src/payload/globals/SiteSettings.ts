import type { GlobalConfig } from 'payload'
import { revalidateGlobal } from '../hooks/revalidate'

const colorPickerField = '@/components/admin/ColorPickerField'

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
    {
      type: 'tabs',
      tabs: [
        // ── Tab 1: Header ──
        {
          label: 'Header',
          fields: [
            {
              name: 'header',
              type: 'group',
              label: false,
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
                  name: 'logoScale',
                  type: 'number',
                  defaultValue: 90,
                  min: 50,
                  max: 200,
                  admin: {
                    description:
                      'Logo size as a percentage of the default (100 = original, 90 = 10% smaller). Adjust in increments of 5.',
                    step: 5,
                  },
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
          ],
        },

        // ── Tab 2: Footer ──
        {
          label: 'Footer',
          fields: [
            {
              name: 'footer',
              type: 'group',
              label: false,
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
          ],
        },

        // ── Tab 3: Homepage ──
        {
          label: 'Homepage',
          fields: [
            {
              name: 'homepage',
              type: 'relationship',
              relationTo: 'pages',
              admin: {
                description: 'Select which page to display as the homepage',
              },
            },
          ],
        },

        // ── Tab 4: Brand Colors ──
        {
          label: 'Brand Colors',
          fields: [
            {
              name: 'brandColors',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'primary',
                  type: 'text',
                  defaultValue: '#1B3C2D',
                  admin: {
                    description: 'Primary brand color (forest green)',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
                {
                  name: 'secondary',
                  type: 'text',
                  defaultValue: '#E8952F',
                  admin: {
                    description: 'Secondary brand color (amber)',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
                {
                  name: 'accent',
                  type: 'text',
                  defaultValue: '#FAFAF5',
                  admin: {
                    description: 'Accent color (cream)',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
              ],
            },
          ],
        },

        // ── Tab 5: SEO ──
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
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
          ],
        },

        // ── Tab 6: Newsletter ──
        {
          label: 'Newsletter',
          fields: [
            {
              name: 'newsletter',
              type: 'group',
              label: false,
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
        },

        // ── Tab 7: Admin Nav ──
        {
          label: 'Admin Nav',
          fields: [
            {
              name: 'adminTheme',
              type: 'group',
              label: false,
              admin: {
                description:
                  'Customize the admin sidebar navigation colors. Leave blank to use defaults.',
              },
              fields: [
                {
                  name: 'navBgColor',
                  type: 'text',
                  label: 'Sidebar Background',
                  admin: {
                    description:
                      'Background color of the left sidebar (default: white in light mode, dark in dark mode)',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
                {
                  name: 'navLinkColor',
                  type: 'text',
                  label: 'Link Color',
                  admin: {
                    description: 'Default text color for navigation links',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
                {
                  name: 'navLinkHoverColor',
                  type: 'text',
                  label: 'Link Hover Color',
                  admin: {
                    description: 'Text color when hovering over a navigation link',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
                {
                  name: 'navActiveBgColor',
                  type: 'text',
                  label: 'Active Link Background',
                  admin: {
                    description: 'Background color of the currently active navigation link',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
                {
                  name: 'navActiveTextColor',
                  type: 'text',
                  label: 'Active Link Text',
                  admin: {
                    description: 'Text color of the currently active navigation link',
                    components: {
                      Field: colorPickerField,
                    },
                  },
                },
              ],
            },
          ],
        },

        // ── Tab 8: Contact ──
        {
          label: 'Contact',
          fields: [
            {
              name: 'contact',
              type: 'group',
              label: false,
              admin: {
                description:
                  'Configure the contact information displayed on the Contact Us page.',
              },
              fields: [
                {
                  name: 'heading',
                  type: 'text',
                  defaultValue: 'Get in Touch',
                  admin: {
                    description: 'Main heading shown on the contact page',
                  },
                },
                {
                  name: 'description',
                  type: 'textarea',
                  defaultValue:
                    "Have questions about tandem flights, lessons, or gift certificates? We'd love to hear from you!",
                  admin: {
                    description: 'Introductory text below the heading',
                  },
                },
                {
                  name: 'email',
                  type: 'email',
                  defaultValue: 'info@sfparagliding.com',
                  admin: {
                    description: 'Contact email address',
                  },
                },
                {
                  name: 'phone',
                  type: 'text',
                  defaultValue: '(415) 555-1234',
                  admin: {
                    description: 'Phone number displayed on the contact page',
                  },
                },
                {
                  name: 'addressLine1',
                  type: 'text',
                  defaultValue: 'Pacifica, California',
                  admin: {
                    description: 'Primary address line (city, state)',
                  },
                },
                {
                  name: 'addressLine2',
                  type: 'text',
                  defaultValue: 'San Francisco Bay Area',
                  admin: {
                    description: 'Secondary address line (region or additional info)',
                  },
                },
                {
                  name: 'hours',
                  type: 'text',
                  admin: {
                    description:
                      'Business hours (optional — only displayed if filled in)',
                  },
                },
              ],
            },
          ],
        },

        // ── Tab 9: Payments ──
        {
          label: 'Payments',
          fields: [
            {
              name: 'payments',
              type: 'group',
              label: false,
              admin: {
                description:
                  'Configure Square payment processing. Enter your Square credentials to enable checkout on the storefront.',
              },
              fields: [
                {
                  name: 'paymentsEnabled',
                  type: 'checkbox',
                  defaultValue: true,
                  label: 'Enable Payments',
                  admin: {
                    description:
                      'When disabled, the checkout button will be hidden and customers cannot make purchases.',
                  },
                },
                {
                  name: 'squareEnvironment',
                  type: 'select',
                  defaultValue: 'sandbox',
                  label: 'Square Environment',
                  options: [
                    { label: 'Sandbox (Testing)', value: 'sandbox' },
                    { label: 'Production (Live)', value: 'production' },
                  ],
                  admin: {
                    description:
                      'Use Sandbox for testing with test cards. Switch to Production when ready to accept real payments.',
                  },
                },
                {
                  name: 'squareAppId',
                  type: 'text',
                  label: 'Square Application ID',
                  admin: {
                    description:
                      'Found in your Square Developer Dashboard under your application credentials.',
                  },
                },
                {
                  name: 'squareLocationId',
                  type: 'text',
                  label: 'Square Location ID',
                  admin: {
                    description:
                      'The location ID for the Square business location to process payments against.',
                  },
                },
                {
                  name: 'squareAccessToken',
                  type: 'text',
                  label: 'Square Access Token',
                  admin: {
                    description:
                      'Your Square access token. This is sensitive — keep it secret. Used server-side only; never exposed to the browser.',
                    components: {
                      Field: '@/components/admin/MaskedTextField',
                    },
                  },
                  access: {
                    read: ({ req }) => Boolean(req.user),
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
