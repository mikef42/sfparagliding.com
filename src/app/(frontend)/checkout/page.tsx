'use client'

import { useCartStore } from '@/store/cart'
import { formatPriceDollars } from '@/lib/utils'
import { SquarePaymentForm } from '@/components/checkout/SquarePaymentForm'
import Link from 'next/link'
import { useState } from 'react'

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore()
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerName, setCustomerName] = useState('')

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="container-narrow">
          <h1 className="font-heading text-3xl mb-4">Your Cart is Empty</h1>
          <p className="text-gray-500 mb-6">
            Add some items to your cart before checking out.
          </p>
          <Link href="/products" className="btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="container-wide">
        <h1 className="font-heading text-3xl lg:text-4xl mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">
          {/* Payment Form */}
          <div className="lg:col-span-3">
            {/* Customer Info */}
            <div className="mb-8">
              <h2 className="font-heading text-xl tracking-wide mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-3 text-sm
                             focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber
                             transition-colors"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded px-4 py-3 text-sm
                             focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber
                             transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Square Payment */}
            <div>
              <h2 className="font-heading text-xl tracking-wide mb-4">
                Payment
              </h2>
              <SquarePaymentForm
                amount={getTotal()}
                customerEmail={customerEmail}
                customerName={customerName}
                items={items}
              />
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 rounded-sm p-6 sticky top-24">
              <h2 className="font-heading text-xl tracking-wide mb-4">
                Order Summary
              </h2>
              <ul className="space-y-3 mb-6">
                {items.map((item) => (
                  <li key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.name} &times; {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPriceDollars(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-gray-200 pt-4 flex justify-between">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">
                  {formatPriceDollars(getTotal())}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
