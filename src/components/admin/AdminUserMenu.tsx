'use client'

import React, { useState, useEffect, useRef } from 'react'

export default function AdminUserMenu() {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch('/api/users/me', { credentials: 'include' })
        if (res.ok) {
          const data = await res.json()
          setEmail(data?.user?.email || null)
        }
      } catch {
        // silently fail — user initial will show "?"
      }
    }
    loadUser()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    if (open) {
      document.addEventListener('keydown', handleKey)
      return () => document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const initial = email ? email.charAt(0).toUpperCase() : '?'

  return (
    <div ref={menuRef} className={`admin-user-menu${open ? ' admin-user-menu--open' : ''}`}>
      <button
        type="button"
        className="admin-user-menu__trigger"
        onClick={() => setOpen(!open)}
        aria-label="User menu"
        aria-expanded={open}
        title={email || 'User menu'}
      >
        {initial}
      </button>

      {open && (
        <div className="admin-user-menu__dropdown" role="menu">
          {email && <div className="admin-user-menu__email">{email}</div>}

          <a
            href="/admin/account"
            className="admin-user-menu__item"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Account
          </a>

          <a
            href="/admin/logout"
            className="admin-user-menu__item admin-user-menu__item--logout"
            role="menuitem"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log out
          </a>
        </div>
      )}
    </div>
  )
}
