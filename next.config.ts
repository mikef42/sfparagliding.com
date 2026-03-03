import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sfparagliding.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  experimental: {
    reactCompiler: false,
  },
  async redirects() {
    return [
      { source: '/services/tandem-flights', destination: '/tandem-flights', permanent: true },
      { source: '/services/paragliding-lessons', destination: '/paragliding-lessons', permanent: true },
      { source: '/products/gift-certificate', destination: '/gift-certificate', permanent: true },
    ]
  },
}

export default withPayload(nextConfig)
