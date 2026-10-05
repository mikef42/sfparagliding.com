import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getProduct } from '@/lib/payload'
import { getSquarePublicConfig } from '@/lib/square'
import { getImageUrl } from '@/lib/utils'
import { ProductDetail } from '@/components/products/ProductDetail'

export const dynamic = 'force-dynamic'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const product = await getProduct(slug)
    if (!product) return {}
    const meta = product.meta
    return {
      title: meta?.metaTitle || `${product.name} | SF Paragliding`,
      description: meta?.metaDescription || undefined,
      keywords: meta?.metaKeywords || undefined,
    }
  } catch (error) {
    console.error('[ProductPage] Error generating metadata:', error)
    return {}
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  let product
  try {
    product = await getProduct(slug)
  } catch (error) {
    console.error('[ProductPage] Error fetching product:', error)
    notFound()
  }
  if (!product) notFound()

  // Card checkout works only once Square is set up in Site Settings. Until
  // then the page offers ordering by phone rather than a checkout that
  // can't take payment (the case from launch to 2026-10-05).
  let onlineCheckout = false
  try {
    const square = await getSquarePublicConfig()
    onlineCheckout = Boolean(square.paymentsEnabled && square.appId && square.locationId)
  } catch (error) {
    console.error('[ProductPage] Could not read payment settings:', error)
  }

  const featuredImage =
    product.images?.[0]?.image && typeof product.images[0].image === 'object'
      ? getImageUrl(product.images[0].image, 'large')
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

      <ProductDetail product={product} onlineCheckout={onlineCheckout} />
    </>
  )
}
