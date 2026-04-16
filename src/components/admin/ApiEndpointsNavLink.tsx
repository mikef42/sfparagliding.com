'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function ApiEndpointsNavLink() {
  const pathname = usePathname()
  const isActive = pathname === '/admin/api-endpoints'

  return (
    <div style={{ padding: '0 16px', marginTop: 4, marginBottom: 4 }}>
      <Link
        href="/admin/api-endpoints"
        className={`nav__link${isActive ? ' nav__link--active' : ''}`}
        id="nav-api-endpoints"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 12px',
          borderRadius: 8,
          textDecoration: 'none',
          color: isActive ? '#4f46e5' : '#6b7280',
          background: isActive ? '#eef2ff' : 'transparent',
          fontSize: 13,
          fontWeight: isActive ? 600 : 400,
          transition: 'all 0.15s ease',
        }}
      >
        <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        <span>API Endpoints</span>
      </Link>
    </div>
  )
}
