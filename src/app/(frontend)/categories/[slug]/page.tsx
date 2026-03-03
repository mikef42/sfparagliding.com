import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from '@/lib/payload'
import { getImageUrl, formatPriceDollars } from '@/lib/utils'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    const category = result.docs[0]
    if (!category) return {}
    return {
      title: `${category.name} | SF Paragliding`,
      description: category.description || undefined,
    }
  } catch {
    return {}
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params

  let category
  let products

  try {
    const payload = await getPayload()
    const catResult = await payload.find({
      collection: 'categories',
      where: { slug: { equals: slug } },
      limit: 1,
    })
    category = catResult.docs[0]

    if (!category) notFound()

    products = await payload.find({
      collection: 'products',
      where: {
        category: { equals: category.id },
        status: { equals: 'active' },
      },
      limit: 50,
    })
  } catch {
    notFound()
  }

  if (!category) notFound()

  return (
    <div className="py-12 lg:py-16">
      <div className="container-wide">
        <h1 className="section-heading text-2xl mb-2">{category.name}</h1>
        <div className="section-divider" />

        {category.description && (
          <p className="text-center text-gray-600 max-w-2xl mx-auto mb-10">
            {category.description}
          </p>
        )}

        {!products || products.docs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products in this category yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.docs.map((product) => {
              const imageUrl =
                product.images?.[0]?.image &&
                  typeof product.images[0].image === 'object'
                  ? getImageUrl(product.images[0].image as any, 'medium')
                  : '/placeholder.jpg'

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="aspect-square overflow-hidden rounded-sm bg-gray-100 mb-4">
                    <img
                      src={imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h3 className="font-heading text-base tracking-wide mb-1 group-hover:text-brand-amber transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-gray-800">{formatPriceDollars(product.price)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
