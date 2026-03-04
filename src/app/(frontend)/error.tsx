'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Page error:', error)

    // Auto-refresh once to recover from stale deployments or hydration errors.
    // Use sessionStorage to prevent infinite refresh loops.
    const key = 'sfp-error-refresh'
    const lastRefresh = sessionStorage.getItem(key)
    const now = Date.now()

    // Only auto-refresh if we haven't done so in the last 10 seconds
    if (!lastRefresh || now - parseInt(lastRefresh, 10) > 10000) {
      sessionStorage.setItem(key, String(now))
      window.location.reload()
      return
    }
  }, [error])

  return (
    <div className="py-20 text-center">
      <div className="container-narrow">
        <h1 className="font-heading text-3xl mb-4">Something Went Wrong</h1>
        <p className="text-gray-500 mb-6 max-w-md mx-auto">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}
