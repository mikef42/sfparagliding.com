import Link from 'next/link'
import { getImageUrl, formatPriceDollars } from '@/lib/utils'

interface FeaturedProductsBlockProps {
  block: {
    heading?: string
    products?: Array<{
      id: string
      name: string
      slug: string
      price: number
      compareAtPrice?: number
      images?: Array<{ image: { url?: string; sizes?: Record<string, { url?: string }> } }>
    }>
  }
}

export function FeaturedProductsBlock({ block }: FeaturedProductsBlockProps) {
  const products = block.products || []

  if (products.length === 0) return null

  return (
    <section className="py-16 lg:py-20">
      <div className="container-wide">
        {block.heading && (
          <>
            <h2 className="section-heading">{block.heading}</h2>
            <div className="section-divider" />
          </>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => {
            const imageUrl = product.images?.[0]?.image
              ? getImageUrl(product.images[0].image, 'medium')
              : '/placeholder.jpg'

            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group"
              >
                <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100 mb-4">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="font-heading text-lg tracking-wide mb-1 group-hover:text-brand-amber transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-gray-800 font-medium">
                    {formatPriceDollars(product.price)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-gray-400 line-through text-sm">
                      {formatPriceDollars(product.compareAtPrice)}
                    </span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
