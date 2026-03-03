import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts, getCategories } from '@/lib/payload'
import { getImageUrl, formatPriceDollars } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Shop | SF Paragliding',
  description: 'Browse paragliding gear, gift certificates, and more from SF Paragliding.',
}

export default async function ProductsPage() {
  let products
  let categories

  try {
    ;[products, categories] = await Promise.all([
      getProducts({ limit: 24 }),
      getCategories(),
    ])
  } catch {
    products = { docs: [] }
    categories = { docs: [] }
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="container-wide">
        <h1 className="section-heading text-2xl mb-2">Shop</h1>
        <div className="section-divider" />

        {/* Category Filters */}
        {categories.docs.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            <Link
              href="/products"
              className="text-xs font-heading tracking-widest uppercase px-4 py-2 border border-gray-200
                         hover:border-brand-amber hover:text-brand-amber transition-colors rounded-sm"
            >
              All
            </Link>
            {categories.docs.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="text-xs font-heading tracking-widest uppercase px-4 py-2 border border-gray-200
                           hover:border-brand-amber hover:text-brand-amber transition-colors rounded-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {products.docs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No products available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.docs.map((product) => {
              const imageUrl =
                product.images?.[0]?.image &&
                typeof product.images[0].image === 'object'
                  ? getImageUrl(product.images[0].image, 'medium')
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
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800">{formatPriceDollars(product.price)}</span>
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
        )}
      </div>
    </div>
  )
}
