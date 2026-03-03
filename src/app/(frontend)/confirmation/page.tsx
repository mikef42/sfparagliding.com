import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Order Confirmed | SF Paragliding',
}

interface ConfirmationPageProps {
  searchParams: Promise<{ orderId?: string }>
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { orderId } = await searchParams

  return (
    <div className="py-20 lg:py-32">
      <div className="container-narrow text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <h1 className="font-heading text-4xl lg:text-5xl mb-4">
          Thank You!
        </h1>
        <p className="text-gray-600 text-lg mb-2">
          Your order has been placed successfully.
        </p>
        {orderId && (
          <p className="text-sm text-gray-500 mb-8">
            Order ID: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <p className="text-gray-600 mb-8">
          You&apos;ll receive a confirmation email shortly. We can&apos;t wait to see you fly!
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Back to Home
          </Link>
          <Link href="/products" className="btn-outline">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
