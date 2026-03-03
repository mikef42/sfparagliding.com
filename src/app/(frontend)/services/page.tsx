import type { Metadata } from 'next'
import Link from 'next/link'
import { getServices } from '@/lib/payload'
import { getImageUrl, formatPriceDollars } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Services | SF Paragliding',
  description:
    'Tandem paragliding flights, lessons, and more from SF Paragliding in the San Francisco Bay Area.',
}

export default async function ServicesPage() {
  let services

  try {
    services = await getServices()
  } catch {
    services = { docs: [] }
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="container-wide">
        <h1 className="section-heading text-2xl mb-2">Our Services</h1>
        <div className="section-divider" />

        {services.docs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">Services coming soon. Check back!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.docs.map((service) => {
              const imageUrl =
                service.image && typeof service.image === 'object'
                  ? getImageUrl(service.image as any, 'medium')
                  : '/placeholder.jpg'

              return (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group"
                >
                  <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-4">
                    <img
                      src={imageUrl}
                      alt={service.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-heading text-lg tracking-wide mb-1 group-hover:text-brand-amber transition-colors">
                    {service.name}
                  </h3>
                  {service.contactForPricing ? (
                    <span className="text-sm text-gray-500">Contact for pricing</span>
                  ) : service.price ? (
                    <span className="text-gray-800">
                      {formatPriceDollars(service.price)}
                    </span>
                  ) : null}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
