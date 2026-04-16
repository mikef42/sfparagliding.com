'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminDashboardLink() {
  const pathname = usePathname()
  const isActive = pathname === '/admin' || pathname === '/admin/'

  return (
    <div className="nav-dashboard-wrap">
      {/* Logo above Dashboard link */}
      <div className="nav-logo-wrap">
        <Link href="/admin" aria-label="Home">
          <img
            src="/logo.png"
            alt="SF Paragliding"
            className="nav-logo-img"
          />
        </Link>
      </div>
      <Link
        href="/admin"
        className={`nav__link nav-dashboard-link${isActive ? ' nav__link--active' : ''}`}
      >
        <span className="nav__link-label">Dashboard</span>
      </Link>
    </div>
  )
}
