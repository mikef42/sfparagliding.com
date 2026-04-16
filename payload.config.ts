import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor, FixedToolbarFeature, HTMLConverterFeature } from '@payloadcms/richtext-lexical'
import sharp from 'sharp'

import { Pages } from '@/payload/collections/Pages'
import { Products } from '@/payload/collections/Products'
import { Categories } from '@/payload/collections/Categories'
import { Services } from '@/payload/collections/Services'
import { Orders } from '@/payload/collections/Orders'
import { Media } from '@/payload/collections/Media'
import { Posts } from '@/payload/collections/Posts'
import { PageViews } from '@/payload/collections/PageViews'
import { AnalyticsSummary } from '@/payload/collections/AnalyticsSummary'
import { ApiKeys } from '@/payload/collections/ApiKeys'
import { SiteSettings } from '@/payload/globals/SiteSettings'
import { SitemapSettings } from '@/payload/globals/SitemapSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: 'users',
    importMap: {
      baseDir: path.resolve(dirname),
    },
    meta: {
      titleSuffix: ' — SF Paragliding',
    },
    components: {
      actions: ['@/components/admin/ThemeToggle', '@/components/admin/AdminUserMenu'],
      beforeDashboard: ['@/components/admin/AnalyticsDashboard'],
      beforeNavLinks: ['@/components/admin/AdminDashboardLink'],
      afterNavLinks: ['@/components/admin/AdminSettingsNavLink'],
      afterNav: ['@/components/admin/NavCollapseButton'],
      graphics: {
        Logo: '@/components/admin/AdminLogo',
        Icon: '@/components/admin/AdminIcon',
      },
      views: {
        settings: {
          Component: '@/components/admin/SettingsView',
          path: '/settings',
        },
        'sitemap-settings': {
          Component: '@/components/admin/SitemapSettingsView',
          path: '/sitemap-settings',
        },
        'api-endpoints': {
          Component: '@/components/admin/ApiEndpointsView',
          path: '/api-endpoints',
        },
      },
    },
  },
  editor: lexicalEditor({
    features: ({ defaultFeatures }) => [
      ...defaultFeatures,
      FixedToolbarFeature(),
      HTMLConverterFeature({}),
    ],
  }),
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    },
    push: true,
  }),
  collections: [
    Pages,
    Products,
    Categories,
    Services,
    Orders,
    Media,
    Posts,
    PageViews,
    AnalyticsSummary,
    ApiKeys,
    {
      slug: 'users',
      auth: true,
      admin: {
        useAsTitle: 'email',
      },
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'role',
          type: 'select',
          defaultValue: 'editor',
          options: [
            { label: 'Admin', value: 'admin' },
            { label: 'Editor', value: 'editor' },
          ],
        },
      ],
    },
  ],
  globals: [SiteSettings, SitemapSettings],
  plugins: [],
  secret: process.env.PAYLOAD_SECRET || 'default-secret-change-me',
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
})
