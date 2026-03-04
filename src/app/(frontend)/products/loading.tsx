export default function ProductsLoading() {
  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading skeleton */}
        <div className="flex justify-center mb-1">
          <div className="h-10 w-56 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="flex justify-center mb-8">
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>

        {/* Mobile filter bar skeleton */}
        <div className="flex items-center gap-3 mb-5 lg:hidden">
          <div className="h-10 w-24 bg-gray-200 rounded-sm animate-pulse" />
          <div className="flex-1" />
          <div className="h-10 w-36 bg-gray-200 rounded-sm animate-pulse" />
        </div>

        {/* Desktop filter toolbar skeleton */}
        <div className="hidden lg:flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
          <div className="flex items-center gap-6">
            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            <div className="h-4 w-36 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-5 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar skeleton (desktop only) */}
          <aside className="hidden lg:block w-60 shrink-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border-b border-gray-200 py-4">
                <div className="h-3 w-28 bg-gray-200 rounded mb-4 animate-pulse" />
                <div className="space-y-3">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </aside>

          {/* Product grid skeleton */}
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-gray-200 mb-3" />
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
