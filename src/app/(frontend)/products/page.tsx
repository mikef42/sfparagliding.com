import type { Metadata } from 'next'
import { Suspense } from 'react'
import { getProducts, getCategories, getFilterOptions } from '@/lib/payload'
import { ShopView } from '@/components/products/ShopView'
import { MobileFilterBar } from '@/components/products/MobileFilterBar'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Products | SF Paragliding',
  description: 'Browse paragliding gear, gift certificates, and more from SF Paragliding.',
}

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string
    manufacturer?: string
    enRating?: string
    sort?: string
    page?: string
  }>
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const params = await searchParams
  const activeCategory = params.category
  const activeManufacturer = params.manufacturer
  const activeEnRating = params.enRating
  const activeSort = params.sort
  const currentPage = parseInt(params.page || '1', 10)

  let products
  let categories
  let filterOptions: { manufacturers: string[]; enRatings: string[] } = {
    manufacturers: [],
    enRatings: [],
  }

  try {
    ;[products, categories, filterOptions] = await Promise.all([
      getProducts({
        category: activeCategory,
        limit: 12,
        page: currentPage,
        manufacturer: activeManufacturer,
        enRating: activeEnRating,
        sort: activeSort || 'name',
      }),
      getCategories(),
      getFilterOptions(),
    ])
  } catch {
    products = { docs: [], totalPages: 1, page: 1, totalDocs: 0 }
    categories = { docs: [] }
  }

  const totalPages = (products as any).totalPages || 1
  const totalDocs = (products as any).totalDocs || 0

  /* Serialize categories for client components */
  const categoryList = categories.docs.map((cat) => ({
    id: cat.id,
    name: cat.name as string,
    slug: cat.slug as string,
  }))

  /* Serialize products for client component */
  const productList = products.docs.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice || undefined,
    manufacturer: p.manufacturer || undefined,
    enRating: p.enRating || undefined,
    images: p.images || [],
    colors: p.colors || [],
  }))

  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Page Heading ── */}
        <h1 className="font-serif text-4xl sm:text-5xl text-center text-gray-800 mb-1 italic">
          Products
        </h1>
        <p className="text-center text-xs tracking-[0.1em] text-gray-400 uppercase mb-8">
          ({totalDocs} products)
        </p>

        {/* ── Mobile: Filter/Sort Bar ── */}
        <Suspense>
          <MobileFilterBar
            filterOptions={{
              categories: categoryList,
              manufacturers: filterOptions.manufacturers,
              enRatings: filterOptions.enRatings,
            }}
            activeCategory={activeCategory}
            activeManufacturer={activeManufacturer}
            activeEnRating={activeEnRating}
            activeSort={activeSort}
            totalDocs={totalDocs}
          />
        </Suspense>

        {/* ── Desktop: Full ShopView ── */}
        <Suspense>
          <ShopView
            products={productList}
            categories={categoryList}
            manufacturers={filterOptions.manufacturers}
            enRatings={filterOptions.enRatings}
            activeCategory={activeCategory}
            activeManufacturer={activeManufacturer}
            activeEnRating={activeEnRating}
            activeSort={activeSort}
            currentPage={currentPage}
            totalPages={totalPages}
            totalDocs={totalDocs}
          />
        </Suspense>
      </div>
    </div>
  )
}
