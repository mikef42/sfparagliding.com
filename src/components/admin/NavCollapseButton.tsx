'use client'

import React from 'react'
import { useNav } from '@payloadcms/ui'

export default function NavCollapseButton() {
  const { navOpen, setNavOpen } = useNav()

  return (
    <button
      type="button"
      className="nav-collapse-btn"
      onClick={() => setNavOpen(!navOpen)}
      aria-label={navOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      title={navOpen ? 'Collapse sidebar' : 'Expand sidebar'}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: navOpen ? 'rotate(0deg)' : 'rotate(180deg)',
          transition: 'transform 0.15s ease',
        }}
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  )
}
