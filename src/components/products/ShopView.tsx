'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

/* ─── Types ─── */
interface Category {
  id: number | string
  name: string
  slug: string
}

interface ProductImage {
  image?: {
    url?: string
    sizes?: {
      medium?: { url?: string }
      thumbnail?: { url?: string }
    }
  }
}

interface Product {
  id: number | string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  manufacturer?: string
  enRating?: string
  images?: ProductImage[]
  colors?: { label: string; value: string }[]
}

interface ShopViewProps {
  products: Product[]
  categories: Category[]
  manufacturers: string[]
  enRatings: string[]
  activeCategory?: string
  activeManufacturer?: string
  activeEnRating?: string
  activeSort?: string
  currentPage: number
  totalPages: number
  totalDocs: number
}

/* ─── Helpers ─── */
function getImageUrl(image: any): string {
  if (!image) return '/placeholder.jpg'
  if (image.sizes?.medium?.url) return image.sizes.medium.url
  if (image.url) return image.url
  return '/placeholder.jpg'
}

function formatPrice(cents: number): string {
  return `$${(cents / 1).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/* ─── Accordion Section ─── */
function FilterSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full text-left"
      >
        <span className="font-heading text-xs tracking-[0.2em] uppercase text-gray-800">
          {title}
        </span>
        <svg
          className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  )
}

/* ─── Checkbox Filter Item ─── */
function FilterCheckbox({
  label,
  checked,
  onClick,
  disabled,
}: {
  label: string
  checked: boolean
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2.5 w-full text-left group ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span
        className={`w-4 h-4 border flex items-center justify-center rounded-[2px] transition-colors shrink-0 ${
          checked
            ? 'bg-gray-800 border-gray-800'
            : 'border-gray-300 group-hover:border-gray-500'
        }`}
      >
        {checked && (
          <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </span>
      <span
        className={`text-xs tracking-[0.1em] uppercase ${
          disabled ? 'text-gray-400' : checked ? 'text-gray-900' : 'text-gray-600'
        }`}
      >
        {label}
      </span>
    </button>
  )
}

/* ─── Main Component ─── */
export function ShopView({
  products,
  categories,
  manufacturers,
  enRatings,
  activeCategory,
  activeManufacturer,
  activeEnRating,
  activeSort,
  currentPage,
  totalPages,
  totalDocs,
}: ShopViewProps) {
  const [showFilters, setShowFilters] = useState(true)
  const [gridCols, setGridCols] = useState<2 | 3 | 4>(3)
  const router = useRouter()
  const searchParams = useSearchParams()

  const buildUrl = useCallback(
    (overrides: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(overrides)) {
        if (v === undefined) params.delete(k)
        else params.set(k, v)
      }
      params.delete('page')
      const qs = params.toString()
      return `/products${qs ? `?${qs}` : ''}`
    },
    [searchParams],
  )

  function pageUrl(page: number) {
    const params = new URLSearchParams(searchParams.toString())
    if (page > 1) params.set('page', String(page))
    else params.delete('page')
    const qs = params.toString()
    return `/products${qs ? `?${qs}` : ''}`
  }

  function toggleFilter(key: string, value: string) {
    const current = searchParams.get(key)
    if (current === value) {
      router.push(buildUrl({ [key]: undefined }))
    } else {
      router.push(buildUrl({ [key]: value }))
    }
  }

  function handleSort(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl({ sort: e.target.value || undefined }))
  }

  const gridClass =
    gridCols === 2
      ? 'grid-cols-2'
      : gridCols === 4
        ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
        : 'grid-cols-2 sm:grid-cols-3'

  return (
    <>
      {/* ── Filter Toolbar ── */}
      <div className="hidden lg:flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
        <div className="flex items-center gap-6">
          {/* Hide/Show Filters */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 font-heading text-xs tracking-[0.15em] uppercase text-gray-700 hover:text-gray-900 transition-colors"
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={activeSort || ''}
              onChange={handleSort}
              className="font-heading text-xs tracking-[0.15em] uppercase text-gray-700 bg-transparent border-none cursor-pointer focus:outline-none appearance-none pr-5"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 24 24' fill='none' stroke='%23555' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0 center',
              }}
            >
              <option value="">Alphabetically, A-Z</option>
              <option value="-name">Alphabetically, Z-A</option>
              <option value="price">Price, low to high</option>
              <option value="-price">Price, high to low</option>
              <option value="-createdAt">Date, new to old</option>
              <option value="createdAt">Date, old to new</option>
            </select>
            <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
            </svg>
          </div>
        </div>

        {/* Grid View Toggles */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-400 mr-2">{totalDocs} products</span>
          <button
            onClick={() => setGridCols(2)}
            className={`p-1.5 rounded transition-colors ${gridCols === 2 ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
            aria-label="2-column grid"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="2" y="2" width="9" height="9" rx="1" />
              <rect x="13" y="2" width="9" height="9" rx="1" />
              <rect x="2" y="13" width="9" height="9" rx="1" />
              <rect x="13" y="13" width="9" height="9" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setGridCols(3)}
            className={`p-1.5 rounded transition-colors ${gridCols === 3 ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
            aria-label="3-column grid"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="1" y="2" width="6" height="9" rx="1" />
              <rect x="9" y="2" width="6" height="9" rx="1" />
              <rect x="17" y="2" width="6" height="9" rx="1" />
              <rect x="1" y="13" width="6" height="9" rx="1" />
              <rect x="9" y="13" width="6" height="9" rx="1" />
              <rect x="17" y="13" width="6" height="9" rx="1" />
            </svg>
          </button>
          <button
            onClick={() => setGridCols(4)}
            className={`p-1.5 rounded transition-colors ${gridCols === 4 ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
            aria-label="4-column grid"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="1" y="2" width="4.5" height="9" rx="0.5" />
              <rect x="7" y="2" width="4.5" height="9" rx="0.5" />
              <rect x="13" y="2" width="4.5" height="9" rx="0.5" />
              <rect x="18.5" y="2" width="4.5" height="9" rx="0.5" />
              <rect x="1" y="13" width="4.5" height="9" rx="0.5" />
              <rect x="7" y="13" width="4.5" height="9" rx="0.5" />
              <rect x="13" y="13" width="4.5" height="9" rx="0.5" />
              <rect x="18.5" y="13" width="4.5" height="9" rx="0.5" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── Layout: Sidebar + Grid ── */}
      <div className="flex gap-8">
        {/* ── Sidebar (desktop only) ── */}
        {showFilters && (
          <aside className="hidden lg:block w-60 shrink-0">
            {/* Collections / Category */}
            {categories.length > 0 && (
              <FilterSection title="All Collections">
                {categories.map((cat) => (
                  <FilterCheckbox
                    key={cat.slug}
                    label={cat.name}
                    checked={activeCategory === cat.slug}
                    onClick={() => toggleFilter('category', cat.slug)}
                  />
                ))}
              </FilterSection>
            )}

            {/* Brand / Manufacturer */}
            {manufacturers.length > 0 && (
              <FilterSection title="Brand">
                {manufacturers.map((m) => (
                  <FilterCheckbox
                    key={m}
                    label={m}
                    checked={activeManufacturer === m}
                    onClick={() => toggleFilter('manufacturer', m)}
                  />
                ))}
              </FilterSection>
            )}

            {/* EN Rating */}
            {enRatings.length > 0 && (
              <FilterSection title="EN Rating">
                {enRatings.map((r) => (
                  <FilterCheckbox
                    key={r}
                    label={r}
                    checked={activeEnRating === r}
                    onClick={() => toggleFilter('enRating', r)}
                  />
                ))}
              </FilterSection>
            )}

            {/* Clear Filters */}
            {(activeCategory || activeManufacturer || activeEnRating) && (
              <div className="pt-4">
                <button
                  onClick={() => router.push('/products')}
                  className="font-heading text-[10px] tracking-[0.15em] uppercase text-gray-500 hover:text-brand-amber transition-colors underline underline-offset-2"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </aside>
        )}

        {/* ── Product Grid ── */}
        <div className="flex-1 min-w-0">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 mb-4">No products match your filters.</p>
              <button
                onClick={() => router.push('/products')}
                className="text-brand-amber hover:underline text-sm"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={`grid ${gridClass} gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10`}>
              {products.map((product) => {
                const imageUrl =
                  product.images?.[0]?.image
                    ? getImageUrl(product.images[0].image)
                    : '/placeholder.jpg'

                const isOnSale =
                  product.compareAtPrice != null &&
                  product.compareAtPrice > product.price

                const colorCount = product.colors?.length || 0

                return (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group block"
                  >
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 mb-3">
                      <img
                        src={imageUrl}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      {/* SALE Badge */}
                      {isOnSale && (
                        <span className="absolute top-3 right-3 bg-white/90 text-[10px] font-heading tracking-[0.15em] uppercase px-2.5 py-1 text-gray-800">
                          Sale
                        </span>
                      )}
                      {/* QUICK ADD Overlay */}
                      <div className="absolute inset-x-0 bottom-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="block w-[85%] mx-auto mb-3 py-2.5 bg-white/95 text-center font-heading text-xs tracking-[0.15em] uppercase text-gray-800 hover:bg-white transition-colors shadow-sm">
                          Quick Add
                        </span>
                      </div>
                    </div>

                    {/* Product Info — centered */}
                    <div className="text-center">
                      <h3 className="text-sm font-body font-normal text-gray-800 mb-1 group-hover:underline underline-offset-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-center gap-2">
                        {isOnSale ? (
                          <>
                            <span className="text-sm text-red-600">
                              {formatPrice(product.price)}
                            </span>
                            <span className="text-sm text-gray-400 line-through">
                              {formatPrice(product.compareAtPrice!)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm text-gray-700">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      {colorCount > 1 && (
                        <p className="text-[10px] tracking-[0.1em] uppercase text-gray-400 mt-1">
                          {colorCount} colors available
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-center gap-2 mt-14">
              {currentPage > 1 ? (
                <Link
                  href={pageUrl(currentPage - 1)}
                  className="px-3 py-2 text-xs font-heading tracking-[0.15em] uppercase border border-gray-200 rounded-sm hover:border-gray-800 transition-colors"
                >
                  &larr; Prev
                </Link>
              ) : (
                <span className="px-3 py-2 text-xs font-heading tracking-[0.15em] uppercase border border-gray-100 rounded-sm text-gray-300 cursor-not-allowed">
                  &larr; Prev
                </span>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <Link
                  key={pg}
                  href={pageUrl(pg)}
                  className={`w-9 h-9 flex items-center justify-center text-xs font-heading rounded-sm transition-colors ${
                    pg === currentPage
                      ? 'bg-gray-800 text-white'
                      : 'border border-gray-200 text-gray-600 hover:border-gray-800'
                  }`}
                >
                  {pg}
                </Link>
              ))}
              {currentPage < totalPages ? (
                <Link
                  href={pageUrl(currentPage + 1)}
                  className="px-3 py-2 text-xs font-heading tracking-[0.15em] uppercase border border-gray-200 rounded-sm hover:border-gray-800 transition-colors"
                >
                  Next &rarr;
                </Link>
              ) : (
                <span className="px-3 py-2 text-xs font-heading tracking-[0.15em] uppercase border border-gray-100 rounded-sm text-gray-300 cursor-not-allowed">
                  Next &rarr;
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </>
  )
}
