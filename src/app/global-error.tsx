'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Global error:', error)

    // Auto-refresh once to recover from stale deployments.
    // Use sessionStorage to prevent infinite refresh loops.
    try {
      const key = 'sfp-global-error-refresh'
      const lastRefresh = sessionStorage.getItem(key)
      const now = Date.now()

      if (!lastRefresh || now - parseInt(lastRefresh, 10) > 10000) {
        sessionStorage.setItem(key, String(now))
        window.location.reload()
        return
      }
    } catch {
      // sessionStorage may not be available
    }
  }, [error])

  return (
    <html>
      <body>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          fontFamily: 'system-ui, sans-serif',
          padding: '2rem',
          textAlign: 'center',
        }}>
          <h1 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Something went wrong
          </h1>
          <p style={{ color: '#666', marginBottom: '1.5rem', maxWidth: '400px' }}>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#1B3C2D',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  )
}
