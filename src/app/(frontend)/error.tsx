'use client'

import { useEffect, useState } from 'react'

/**
 * Detect if the error is a chunk/module loading failure.
 * These happen when a deploy changes chunk hashes while clients
 * still reference old URLs (stale deployment).
 */
function isChunkLoadError(err: Error): boolean {
  const msg = err.message || ''
  const name = err.name || ''
  return (
    name === 'ChunkLoadError' ||
    msg.includes('Loading chunk') ||
    msg.includes('Loading CSS chunk') ||
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Importing a module script failed')
  )
}

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [retrying, setRetrying] = useState(false)

  useEffect(() => {
    // Log detailed error info for debugging
    console.error('[SFP Error Boundary]', {
      message: error.message,
      name: error.name,
      digest: error.digest,
      stack: error.stack?.slice(0, 500),
      url: window.location.href,
      timestamp: new Date().toISOString(),
    })

    // For chunk loading errors (stale deploys), auto-refresh immediately.
    // For other errors, auto-refresh once to recover from transient issues.
    const key = isChunkLoadError(error) ? 'sfp-chunk-refresh' : 'sfp-error-refresh'
    const lastRefresh = sessionStorage.getItem(key)
    const now = Date.now()

    // Allow one auto-refresh per 15 seconds per error type
    if (!lastRefresh || now - parseInt(lastRefresh, 10) > 15000) {
      sessionStorage.setItem(key, String(now))
      setRetrying(true)
      window.location.reload()
      return
    }
  }, [error])

  if (retrying) {
    return (
      <div className="py-20 text-center">
        <div className="max-w-lg mx-auto px-4">
          <div className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-gray-800 rounded-full mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Refreshing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="py-20 text-center">
      <div className="max-w-lg mx-auto px-4">
        <h1 className="font-heading text-3xl mb-4">Something Went Wrong</h1>
        <p className="text-gray-500 mb-6">
          {isChunkLoadError(error)
            ? 'The site was recently updated. A quick refresh should fix this.'
            : 'An unexpected error occurred. Please try refreshing the page.'}
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
          <button
            onClick={() => reset()}
            className="px-6 py-3 border border-gray-300 rounded text-sm font-heading tracking-wider uppercase hover:border-gray-500 transition-colors"
          >
            Try Again
          </button>
        </div>
        {error.digest && (
          <p className="text-xs text-gray-300 mt-6">
            Error ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
