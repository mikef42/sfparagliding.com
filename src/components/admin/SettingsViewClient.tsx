'use client'

import React from 'react'
import Link from 'next/link'

const cards = [
  {
    title: 'Header & Navigation',
    description: 'Manage your logo, navigation links, and call-to-action button.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
      </svg>
    ),
    iconBg: '#dbeafe',
    iconColor: '#2563eb',
  },
  {
    title: 'Footer',
    description: 'Configure footer content, links, and contact information.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v14a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16h18" />
      </svg>
    ),
    iconBg: '#e0e7ff',
    iconColor: '#4f46e5',
  },
  {
    title: 'Homepage',
    description: 'Set up hero content, featured sections, and homepage layout.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    iconBg: '#dcfce7',
    iconColor: '#16a34a',
  },
  {
    title: 'Brand Colors',
    description: 'Customize the primary, secondary, and accent colors for your site.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    iconBg: '#fef3c7',
    iconColor: '#d97706',
  },
  {
    title: 'SEO',
    description: 'Manage meta titles, descriptions, and social sharing settings.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
    iconBg: '#fce7f3',
    iconColor: '#db2777',
  },
  {
    title: 'SEO Sitemap',
    description: 'Control which site pages and collections are included in sitemap.xml.',
    href: '/admin/sitemap-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4h10M7 9h10M7 14h10M5 4h.01M5 9h.01M5 14h.01M7 19h6M5 19h.01" />
      </svg>
    ),
    iconBg: '#fee2e2',
    iconColor: '#dc2626',
  },
  {
    title: 'Newsletter',
    description: 'Configure newsletter signup integration and subscriber settings.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    iconBg: '#ede9fe',
    iconColor: '#7c3aed',
  },
  {
    title: 'Payments',
    description: 'Set up Square payment processing for products and services.',
    href: '/admin/globals/site-settings',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
    iconBg: '#d1fae5',
    iconColor: '#059669',
  },
  {
    title: 'API Endpoints',
    description: 'View API documentation for remote blog publishing.',
    href: '/admin/api-endpoints',
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.6}>
        <polyline strokeLinecap="round" strokeLinejoin="round" points="16 18 22 12 16 6" />
        <polyline strokeLinecap="round" strokeLinejoin="round" points="8 6 2 12 8 18" />
      </svg>
    ),
    iconBg: '#f1f5f9',
    iconColor: '#475569',
  },
]

export default function SettingsView() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 32, color: 'var(--theme-text, #111)' }}>
        Settings
      </h1>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {cards.map((card) => (
          <Link
            key={card.title}
            href={card.href}
            style={{
              display: 'block',
              background: 'var(--theme-elevation-0, #fff)',
              border: '1px solid var(--theme-elevation-150, #e5e7eb)',
              borderRadius: 12,
              padding: 20,
              textDecoration: 'none',
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'
              e.currentTarget.style.borderColor = 'var(--theme-elevation-250, #c7d2fe)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none'
              e.currentTarget.style.borderColor = 'var(--theme-elevation-150, #e5e7eb)'
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 14,
                background: card.iconBg,
                color: card.iconColor,
              }}
            >
              {card.icon}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--theme-text, #111)', marginBottom: 4 }}>
              {card.title}
            </div>
            <div style={{ fontSize: 12, color: 'var(--theme-elevation-500, #6b7280)', lineHeight: 1.5 }}>
              {card.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
