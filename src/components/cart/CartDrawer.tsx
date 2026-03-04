'use client'

import { useCartStore } from '@/store/cart'
import { formatPriceDollars } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function CartDrawer() {
  const [mounted, setMounted] = useState(false)
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotal } =
    useCartStore()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Avoid hydration mismatch — render empty until client mount
  const displayItems = mounted ? items : []
  const displayOpen = mounted ? isOpen : false

  return (
    <>
      {/* Backdrop */}
      {displayOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white z-50 shadow-2xl
                    transform transition-transform duration-300 ease-out
                    ${displayOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="font-heading text-xl tracking-wide">Your Cart</h2>
            <button
              onClick={closeCart}
              className="p-1 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close cart"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {displayItems.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-12 h-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-gray-500">Your cart is empty</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {displayItems.map((item) => {
                  const itemKey = item.cartItemId || item.id
                  return (
                    <li
                      key={itemKey}
                      className="flex gap-4 py-3 border-b border-gray-50"
                    >
                      {item.image && (
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{item.name}</p>
                        {(item.size || item.color) && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            {[item.size, item.color].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        {item.ushpaId && (
                          <p className="text-xs text-gray-400 mt-0.5">
                            USHPA#: {item.ushpaId}
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          {formatPriceDollars(item.price)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() =>
                              updateQuantity(itemKey, item.quantity - 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-gray-500 border border-gray-200 rounded
                                       hover:bg-gray-100 transition-colors text-xs"
                          >
                            -
                          </button>
                          <span className="text-sm w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(itemKey, item.quantity + 1)
                            }
                            className="w-6 h-6 flex items-center justify-center text-gray-500 border border-gray-200 rounded
                                       hover:bg-gray-100 transition-colors text-xs"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeItem(itemKey)}
                        className="text-gray-400 hover:text-red-500 transition-colors self-start"
                        aria-label={`Remove ${item.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {displayItems.length > 0 && (
            <div className="border-t border-gray-100 px-6 py-4 space-y-3">
              <div className="flex justify-between items-center font-medium">
                <span>Total</span>
                <span className="text-lg">{formatPriceDollars(getTotal())}</span>
              </div>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="btn-primary block text-center w-full"
              >
                Checkout
              </Link>
              <button
                onClick={closeCart}
                className="block w-full text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
