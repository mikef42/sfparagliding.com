'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface FilterOptions {
  categories: { name: string; slug: string }[]
  manufacturers: string[]
  enRatings: string[]
}

interface MobileFilterBarProps {
  filterOptions: FilterOptions
  activeCategory?: string
  activeManufacturer?: string
  activeEnRating?: string
  activeSort?: string
  totalDocs: number
}

export function MobileFilterBar({
  filterOptions,
  activeCategory,
  activeManufacturer,
  activeEnRating,
  activeSort,
  totalDocs,
}: MobileFilterBarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeFilterCount =
    (activeCategory ? 1 : 0) +
    (activeManufacturer ? 1 : 0) +
    (activeEnRating ? 1 : 0)

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

  function handleFilterSelect(key: string, value: string | undefined) {
    router.push(buildUrl({ [key]: value }))
    setDrawerOpen(false)
  }

  function handleSortChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.push(buildUrl({ sort: e.target.value || undefined }))
  }

  function handleClearAll() {
    router.push('/products')
    setDrawerOpen(false)
  }

  return (
    <>
      {/* ── Compact filter/sort bar ── */}
      <div className="flex items-center gap-3 mb-5 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-sm text-sm font-heading tracking-wider uppercase hover:border-brand-amber transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
          </svg>
          Filter
          {activeFilterCount > 0 && (
            <span className="bg-brand-amber text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>

        <div className="flex-1" />

        <select
          value={activeSort || ''}
          onChange={handleSortChange}
          className="px-3 py-2.5 border border-gray-300 rounded-sm text-sm bg-white font-heading tracking-wider uppercase appearance-none pr-8 cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 10px center',
          }}
        >
          <option value="">Sort by: Name</option>
          <option value="price">Price: Low → High</option>
          <option value="-price">Price: High → Low</option>
          <option value="-createdAt">Newest First</option>
        </select>
      </div>

      {/* ── Active filter chips (mobile) ── */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 lg:hidden">
          {activeCategory && (
            <button
              onClick={() => handleFilterSelect('category', undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-xs font-heading tracking-wider uppercase rounded-full"
            >
              {filterOptions.categories.find(c => c.slug === activeCategory)?.name || activeCategory}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {activeManufacturer && (
            <button
              onClick={() => handleFilterSelect('manufacturer', undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-xs font-heading tracking-wider uppercase rounded-full"
            >
              {activeManufacturer}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {activeEnRating && (
            <button
              onClick={() => handleFilterSelect('enRating', undefined)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-xs font-heading tracking-wider uppercase rounded-full"
            >
              {activeEnRating}
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      )}

      {/* ── Filter drawer overlay ── */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto animate-slide-up">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <h2 className="font-heading text-lg tracking-wide">Filters</h2>
              <div className="flex items-center gap-4">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-brand-amber font-heading tracking-wider uppercase"
                  >
                    Clear All
                  </button>
                )}
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-1 text-gray-400"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter sections */}
            <div className="px-5 py-4 space-y-6">
              {/* Category */}
              {filterOptions.categories.length > 0 && (
                <div>
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
                    Category
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleFilterSelect('category', undefined)}
                      className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                        !activeCategory
                          ? 'border-brand-amber bg-brand-amber/10 text-brand-amber font-medium'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {filterOptions.categories.map((cat) => (
                      <button
                        key={cat.slug}
                        onClick={() => handleFilterSelect('category', cat.slug)}
                        className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                          activeCategory === cat.slug
                            ? 'border-brand-amber bg-brand-amber/10 text-brand-amber font-medium'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Brand */}
              {filterOptions.manufacturers.length > 0 && (
                <div>
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
                    Brand
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleFilterSelect('manufacturer', undefined)}
                      className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                        !activeManufacturer
                          ? 'border-brand-amber bg-brand-amber/10 text-brand-amber font-medium'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {filterOptions.manufacturers.map((m) => (
                      <button
                        key={m}
                        onClick={() => handleFilterSelect('manufacturer', m)}
                        className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                          activeManufacturer === m
                            ? 'border-brand-amber bg-brand-amber/10 text-brand-amber font-medium'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EN Rating */}
              {filterOptions.enRatings.length > 0 && (
                <div>
                  <h3 className="font-heading text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">
                    EN Rating
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleFilterSelect('enRating', undefined)}
                      className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                        !activeEnRating
                          ? 'border-brand-amber bg-brand-amber/10 text-brand-amber font-medium'
                          : 'border-gray-200 text-gray-600'
                      }`}
                    >
                      All
                    </button>
                    {filterOptions.enRatings.map((r) => (
                      <button
                        key={r}
                        onClick={() => handleFilterSelect('enRating', r)}
                        className={`px-4 py-2 text-sm border rounded-full transition-colors ${
                          activeEnRating === r
                            ? 'border-brand-amber bg-brand-amber/10 text-brand-amber font-medium'
                            : 'border-gray-200 text-gray-600'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 px-5 py-4 border-t border-gray-100 bg-white">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-3 bg-brand-forest text-white font-heading tracking-wider uppercase text-sm rounded-sm"
              >
                Show {totalDocs} Result{totalDocs !== 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
