'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cart'

interface NavLink {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

const NAV_LINKS: NavLink[] = [
  { label: 'Tandem Flights', href: '/tandem-flights' },
  { label: 'Gift Card', href: '/gift-certificate' },
  {
    label: 'Shop',
    href: '/products',
    children: [
      { label: 'Paragliders', href: '/products?category=paragliders' },
      { label: 'Harnesses', href: '/products?category=harnesses' },
    ],
  },
  { label: 'Contact', href: '/contact' },
  { label: 'Services', href: '/services' },
]

export function Header({ logoScale = 90 }: { logoScale?: number }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubmenu, setMobileSubmenu] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { toggleCart, getItemCount } = useCartStore()
  const itemCount = mounted ? getItemCount() : 0

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[70px]">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <img
              src="/logo.png"
              alt="SF Paragliding"
              className="w-auto object-contain"
              style={{ height: `${(40 * logoScale) / 100}px` }}
            />
          </Link>

          {/* Desktop Navigation — centered */}
          <nav className="hidden lg:flex items-center gap-10">
            {NAV_LINKS.map((link) => (
              <DesktopNavItem key={link.href} link={link} />
            ))}
          </nav>

          {/* Right side: Cart + Mobile menu */}
          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
              aria-label="Shopping cart"
            >
              <svg className="w-[22px] h-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-brand-amber text-white text-[10px]
                               font-bold w-4.5 h-4.5 rounded-full flex items-center justify-center
                               animate-fade-in min-w-[18px] min-h-[18px]">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-gray-700"
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <nav className="lg:hidden py-4 border-t border-gray-200 animate-slide-down">
            {NAV_LINKS.map((link) => (
              <div key={link.href}>
                {link.children ? (
                  <>
                    <button
                      onClick={() =>
                        setMobileSubmenu(mobileSubmenu === link.label ? null : link.label)
                      }
                      className="flex items-center justify-between w-full py-3 font-heading text-sm tracking-[0.15em] uppercase text-gray-700"
                    >
                      {link.label}
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform ${
                          mobileSubmenu === link.label ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {mobileSubmenu === link.label && (
                      <div className="pl-4 pb-2">
                        <Link
                          href={link.href}
                          onClick={() => setMobileOpen(false)}
                          className="block py-2 font-heading text-xs tracking-[0.15em] uppercase text-gray-500 hover:text-brand-amber transition-colors"
                        >
                          All Products
                        </Link>
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setMobileOpen(false)}
                            className="block py-2 font-heading text-xs tracking-[0.15em] uppercase text-gray-500 hover:text-brand-amber transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block py-3 font-heading text-sm tracking-[0.15em] uppercase text-gray-700
                             hover:text-brand-amber transition-colors"
                  >
                    {link.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        )}
      </div>
    </header>
  )
}

/* ─── Desktop Nav Item with optional hover dropdown ─── */
function DesktopNavItem({ link }: { link: NavLink }) {
  const [open, setOpen] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    setOpen(true)
  }

  function handleLeave() {
    timeoutRef.current = setTimeout(() => setOpen(false), 150)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  if (!link.children) {
    return (
      <Link
        href={link.href}
        className="font-heading text-[13px] tracking-[0.18em] uppercase text-gray-600
                   hover:text-gray-900 transition-colors py-1"
      >
        {link.label}
      </Link>
    )
  }

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        href={link.href}
        className={`font-heading text-[13px] tracking-[0.18em] uppercase py-1 transition-colors ${
          open ? 'text-gray-900' : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        {link.label}
      </Link>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3">
          <div className="bg-white border border-gray-200 shadow-sm rounded-sm min-w-[180px] py-2">
            {link.children.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="block px-5 py-2 font-heading text-[12px] tracking-[0.15em] uppercase text-gray-500
                           hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {child.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
