import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/payload'
import { getImageUrl, formatPriceDollars } from '@/lib/utils'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'
import { AddToCartButton } from '@/components/products/AddToCartButton'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await getProduct(slug)
    if (!product) return {}
    return {
      title: product.meta?.metaTitle || `${product.name} | SF Paragliding`,
      description: product.meta?.metaDescription || undefined,
    }
  } catch {
    return {}
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  let product
  try {
    product = await getProduct(slug)
  } catch {
    notFound()
  }
  if (!product) notFound()

  const images = product.images || []
  const featuredImage =
    images[0]?.image && typeof images[0].image === 'object'
      ? getImageUrl(images[0].image as any, 'large')
      : '/placeholder.jpg'

  return (
    <>
      {/* JSON-LD Product */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: featuredImage,
            description: product.meta?.metaDescription || '',
            sku: product.sku || undefined,
            offers: {
              '@type': 'Offer',
              price: product.price,
              priceCurrency: 'USD',
              availability:
                (product.inventory ?? 0) > 0
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
            },
          }),
        }}
      />

      <div className="py-12 lg:py-16">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Images */}
            <div>
              <div className="aspect-square overflow-hidden rounded-sm bg-gray-100 mb-4">
                <img
                  src={featuredImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {images.slice(1, 5).map((img: { image: unknown }, i: number) => {
                    const url =
                      typeof img.image === 'object'
                        ? getImageUrl(img.image, 'thumbnail')
                        : '/placeholder.jpg'
                    return (
                      <div
                        key={i}
                        className="aspect-square overflow-hidden rounded-sm bg-gray-100"
                      >
                        <img
                          src={url}
                          alt={`${product.name} ${i + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div>
              <h1 className="font-heading text-3xl lg:text-4xl mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-2xl font-medium">
                  {formatPriceDollars(product.price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <span className="text-lg text-gray-400 line-through">
                    {formatPriceDollars(product.compareAtPrice)}
                  </span>
                )}
              </div>

              {product.description && (
                <div className="prose-content mb-8 text-gray-600">
                  <RichTextRenderer content={product.description} />
                </div>
              )}

              <AddToCartButton
                product={{
                  id: String(product.id),
                  name: product.name,
                  price: product.price,
                  image: featuredImage,
                  slug: product.slug,
                }}
              />

              {product.sku && (
                <p className="text-xs text-gray-400 mt-6">SKU: {product.sku}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
