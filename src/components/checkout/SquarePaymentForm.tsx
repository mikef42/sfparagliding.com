'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore, type CartItem } from '@/store/cart'
import { formatPriceDollars } from '@/lib/utils'

interface SquarePaymentFormProps {
  amount: number
  customerEmail: string
  customerName: string
  items: CartItem[]
}

declare global {
  interface Window {
    Square?: {
      payments: (appId: string, locationId: string) => Promise<Payments>
    }
  }
}

interface Payments {
  card: () => Promise<Card>
}

interface Card {
  attach: (selector: string) => Promise<void>
  tokenize: () => Promise<{ status: string; token: string; errors?: Array<{ message: string }> }>
  destroy: () => void
}

export function SquarePaymentForm({
  amount,
  customerEmail,
  customerName,
  items,
}: SquarePaymentFormProps) {
  const cardRef = useRef<Card | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sdkReady, setSdkReady] = useState(false)
  const router = useRouter()
  const clearCart = useCartStore((s) => s.clearCart)

  useEffect(() => {
    const appId = process.env.NEXT_PUBLIC_SQUARE_APP_ID
    const locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID

    if (!appId || !locationId) {
      setError('Square payment is not configured. Please contact support.')
      return
    }

    // Load Square Web Payments SDK
    const script = document.createElement('script')
    script.src = 'https://sandbox.web.squarecdn.com/v1/square.js'
    script.async = true
    script.onload = async () => {
      try {
        if (!window.Square) {
          setError('Failed to load payment form.')
          return
        }
        const payments = await window.Square.payments(appId, locationId)
        const card = await payments.card()
        await card.attach('#card-container')
        cardRef.current = card
        setSdkReady(true)
      } catch (e) {
        console.error('Square SDK error:', e)
        setError('Failed to initialize payment form.')
      }
    }
    document.body.appendChild(script)

    return () => {
      cardRef.current?.destroy()
      script.remove()
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cardRef.current) return

    if (!customerEmail) {
      setError('Please enter your email address.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await cardRef.current.tokenize()

      if (result.status !== 'OK') {
        setError(result.errors?.[0]?.message || 'Payment failed. Please try again.')
        setLoading(false)
        return
      }

      // Send to server
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceId: result.token,
          amount: Math.round(amount * 100), // Convert to cents
          customerEmail,
          customerName,
          items: items.map((i) => ({
            id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            type: i.type,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Payment failed. Please try again.')
        setLoading(false)
        return
      }

      clearCart()
      router.push(`/confirmation?orderId=${data.orderId}`)
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div
        id="card-container"
        className="min-h-[90px] border border-gray-200 rounded p-3 mb-4"
      />

      {error && (
        <div className="bg-red-50 text-red-700 text-sm rounded px-4 py-3 mb-4">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !sdkReady}
        className="btn-primary w-full text-center text-base py-4 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading
          ? 'Processing...'
          : `Pay ${formatPriceDollars(amount)}`}
      </button>

      <p className="text-xs text-gray-400 text-center mt-3">
        Payments secured by Square. Your card info never touches our servers.
      </p>
    </form>
  )
}
