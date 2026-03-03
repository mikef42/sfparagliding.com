/**
 * Seed script — populates the CMS with initial data for SF Paragliding.
 *
 * Run with: npm run seed  (or npx tsx src/seed/index.ts)
 *
 * This creates:
 * - An admin user
 * - Site Settings global
 * - Services (Tandem Flights, Paragliding Lessons)
 * - A Gift Certificate product
 * - A homepage built with the page builder
 */

import { getPayload } from 'payload'
import config from '../../payload.config'

async function seed() {
  console.log('🌱 Seeding database...')

  const payload = await getPayload({ config })

  // ─── Create Admin User ───
  const existingUsers = await payload.find({
    collection: 'users',
    limit: 1,
  })

  if (existingUsers.docs.length === 0) {
    await payload.create({
      collection: 'users',
      data: {
        email: 'admin@sfparagliding.com',
        password: 'changeme123',
        name: 'Admin',
        role: 'admin',
      },
    })
    console.log('✅ Admin user created (admin@sfparagliding.com / changeme123)')
  } else {
    console.log('⏭️  Admin user already exists, skipping')
  }

  // ─── Create Categories ───
  const flightsCategory = await payload.create({
    collection: 'categories',
    data: {
      name: 'Tandem Flights',
      slug: 'tandem-flights',
      description: 'Experience paragliding with one of our experienced tandem pilots.',
    },
  })

  const gearCategory = await payload.create({
    collection: 'categories',
    data: {
      name: 'Gift Cards',
      slug: 'gift-cards',
      description: 'Give the gift of flight.',
    },
  })
  console.log('✅ Categories created')

  // ─── Create Services ───
  const tandemService = await payload.create({
    collection: 'services',
    data: {
      name: 'Tandem Flights',
      slug: 'tandem-flights',
      price: 250,
      features: [
        { feature: 'Same day booking' },
        { feature: 'Unlimited flight time' },
        { feature: 'No age limit' },
        { feature: 'Free Pictures' },
        { feature: 'All equipment provided' },
        { feature: 'Professional tandem pilots' },
      ],
      ctaLabel: 'Book Now',
      ctaLink: '/services/tandem-flights',
      status: 'active',
      meta: {
        metaTitle: 'Tandem Paragliding Flights | SF Paragliding',
        metaDescription:
          'Book a tandem paragliding flight with SF Paragliding. Same day booking, unlimited flight time, no age limit, free pictures.',
      },
    },
  })

  const lessonsService = await payload.create({
    collection: 'services',
    data: {
      name: 'Paragliding Lessons',
      slug: 'paragliding-lessons',
      contactForPricing: true,
      features: [
        { feature: 'USHPA certified instruction' },
        { feature: 'Earn your P2 rating' },
        { feature: 'Various Bay Area flying sites' },
        { feature: 'All equipment provided' },
        { feature: 'Year-round availability' },
        { feature: 'Experienced certified instructors' },
      ],
      ctaLabel: 'Sign Up Today!',
      ctaLink: '/services/paragliding-lessons',
      status: 'active',
      meta: {
        metaTitle: 'Paragliding Lessons | SF Paragliding',
        metaDescription:
          'Learn to paraglide with USHPA certified instructors at SF Paragliding. Earn your P2 rating and fly at thousands of sites worldwide.',
      },
    },
  })
  console.log('✅ Services created')

  // ─── Create Gift Certificate Product ───
  await payload.create({
    collection: 'products',
    data: {
      name: 'Gift Certificate — Tandem Flight',
      slug: 'gift-certificate',
      price: 250,
      sku: 'GC-TANDEM-001',
      inventory: 999,
      category: gearCategory.id,
      status: 'active',
      meta: {
        metaTitle: 'Gift Certificate — Tandem Paragliding Flight | SF Paragliding',
        metaDescription:
          'Give the gift of flight! SF Paragliding gift certificates are delivered electronically and never expire.',
      },
    },
  })
  console.log('✅ Gift Certificate product created')

  // ─── Update Site Settings ───
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      header: {
        logoText: 'SF Paragliding',
        navLinks: [
          { label: 'Tandem Flights', linkType: 'url', url: '/services/tandem-flights' },
          { label: 'Gift Card', linkType: 'url', url: '/products/gift-certificate' },
          { label: 'Shop', linkType: 'url', url: '/products' },
          { label: 'Contact', linkType: 'url', url: '/contact' },
          { label: 'Services', linkType: 'url', url: '/services' },
        ],
      },
      footer: {
        copyrightText: '© SFParagliding',
        socialLinks: [
          { platform: 'facebook', url: 'https://www.facebook.com/SFParagliding' },
          { platform: 'twitter', url: 'https://twitter.com/SFParagliding' },
          { platform: 'pinterest', url: 'https://www.pinterest.com/sfparagliding' },
          { platform: 'instagram', url: 'https://www.instagram.com/sfparagliding' },
        ],
        bottomLinks: [
          { label: 'Privacy Policy', url: '/privacy-policy' },
          { label: 'Terms of Service', url: '/terms-of-service' },
          { label: 'Refund Policy', url: '/refund-policy' },
          { label: 'Contact', url: '/contact' },
        ],
      },
      brandColors: {
        primary: '#1B3C2D',
        secondary: '#E8952F',
        accent: '#FAFAF5',
      },
      seo: {
        siteName: 'SF Paragliding',
        titleSuffix: ' | SF Paragliding',
        defaultDescription:
          'Experience the beauty of the San Francisco Bay Area from a new perspective with SF Paragliding. Tandem flights and lessons year round.',
      },
      newsletter: {
        heading: 'Special Offers',
        description:
          'Join to get special offers, free giveaways, and once-in-a-lifetime deals.',
        enabled: true,
      },
    },
  })
  console.log('✅ Site Settings updated')

  console.log('\n🎉 Seeding complete! You can now run the app with `npm run dev`')
  console.log('   Admin panel: http://localhost:3000/admin')
  console.log('   Login: admin@sfparagliding.com / changeme123')
  process.exit(0)
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
