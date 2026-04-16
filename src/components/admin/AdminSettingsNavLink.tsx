'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSettingsNavLink() {
  const pathname = usePathname()
  const isActive =
    pathname === '/admin/settings' ||
    pathname.startsWith('/admin/globals/site-settings') ||
    pathname.startsWith('/admin/sitemap-settings') ||
    pathname.startsWith('/admin/globals/sitemap-settings') ||
    pathname === '/admin/api-endpoints'

  return (
    <Link
      href="/admin/settings"
      className={`nav__link nav-settings-link${isActive ? ' nav__link--active' : ''}`}
    >
      <span className="nav__link-label">Settings</span>
    </Link>
  )
}
