import Link from 'next/link'
import { getImageUrl } from '@/lib/utils'

interface ServiceItem {
  id: string
  name: string
  slug: string
  image?: { url?: string; sizes?: Record<string, { url?: string }> }
  description?: unknown
  features?: Array<{ feature: string }>
  ctaLabel?: string
  ctaLink?: string
  price?: number
  contactForPricing?: boolean
}

interface FeaturedServicesBlockProps {
  block: {
    heading?: string
    services?: ServiceItem[]
  }
}

export function FeaturedServicesBlock({ block }: FeaturedServicesBlockProps) {
  const services = block.services || []

  if (services.length === 0) return null

  return (
    <section className="py-16 lg:py-20">
      <div className="container-wide">
        {block.heading && (
          <>
            <h2 className="section-heading">{block.heading}</h2>
            <div className="section-divider" />
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service) => {
            const imageUrl = getImageUrl(service.image, 'medium')

            return (
              <div key={service.id} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-5">
                  <img
                    src={imageUrl}
                    alt={service.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-heading text-sm tracking-[0.2em] uppercase mb-3 text-center">
                  {service.name}
                </h3>
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-1 mb-4 text-sm text-gray-600">
                    {service.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-brand-amber mt-0.5">&#8226;</span>
                        {f.feature}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="text-center">
                  <Link
                    href={service.ctaLink || `/services/${service.slug}`}
                    className="btn-primary text-xs"
                  >
                    {service.ctaLabel || 'Learn More'}
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
