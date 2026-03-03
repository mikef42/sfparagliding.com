import type { Metadata } from 'next'
import { StaticHomepage } from '@/components/homepage/StaticHomepage'

export const metadata: Metadata = {
  title: 'SF Paragliding — Fly Today!',
  description:
    'Experience the beauty of the San Francisco Bay Area from a new perspective with SF Paragliding. Tandem paragliding flights and lessons year round.',
  openGraph: {
    title: 'SF Paragliding — Fly Today!',
    description:
      'Experience the beauty of the San Francisco Bay Area from a new perspective with SF Paragliding.',
    type: 'website',
  },
}

// The homepage renders a static version on first load.
// Once the CMS is seeded, it can be switched to render from the page builder via Site Settings.
// For now, the static version matches the SFParagliding.com design.

export default function HomePage() {
  return <StaticHomepage />
}
