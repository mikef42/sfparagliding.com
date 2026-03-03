import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getService } from '@/lib/payload'
import { getImageUrl, formatPriceDollars } from '@/lib/utils'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

interface ServicePageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const service = await getService(slug)
    if (!service) return {}
    return {
      title: service.meta?.metaTitle || `${service.name} | SF Paragliding`,
      description: service.meta?.metaDescription || undefined,
    }
  } catch {
    return {}
  }
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params
  let service
  try {
    service = await getService(slug)
  } catch {
    notFound()
  }
  if (!service) notFound()

  const imageUrl =
    service.image && typeof service.image === 'object'
      ? getImageUrl(service.image, 'large')
      : null

  return (
    <div className="py-12 lg:py-16">
      <div className="container-wide">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          {/* Image */}
          {imageUrl && (
            <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
              <img
                src={imageUrl}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Info */}
          <div className={imageUrl ? '' : 'lg:col-span-2 max-w-3xl mx-auto'}>
            <h1 className="font-heading text-3xl lg:text-4xl mb-4">{service.name}</h1>

            {service.contactForPricing ? (
              <p className="text-lg text-gray-500 mb-6">Contact for pricing</p>
            ) : service.price ? (
              <p className="text-2xl font-medium mb-6">
                {formatPriceDollars(service.price)}
              </p>
            ) : null}

            {service.features && service.features.length > 0 && (
              <ul className="space-y-2 mb-6">
                {service.features.map((f: { feature: string }, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-gray-700">
                    <svg
                      className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    {f.feature}
                  </li>
                ))}
              </ul>
            )}

            {service.description && (
              <div className="prose-content text-gray-600 mb-8">
                <RichTextRenderer content={service.description} />
              </div>
            )}

            <Link
              href={service.ctaLink || '/contact'}
              className="btn-primary text-base px-10 py-4"
            >
              {service.ctaLabel || 'Book Now'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
