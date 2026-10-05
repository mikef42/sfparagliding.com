import { ORDER_PHONE, ORDER_PHONE_E164 } from '@/lib/contact'

/**
 * Shown in place of Add to Cart / Buy Now and the payment form while the
 * site can't take card payments (Square not set up in Site Settings, or
 * payments switched off). Until 2026-10-05 customers instead reached a
 * checkout that said "Square payment is not configured" and couldn't pay.
 */
export function OrderByPhone({ context }: { context: 'product' | 'checkout' }) {
  return (
    <div className="mb-6 border border-gray-300 p-5">
      <p className="font-heading text-xs tracking-[0.15em] uppercase text-gray-800 mb-2">
        Order by phone
      </p>
      <p className="text-sm text-gray-700 mb-4">
        {context === 'product'
          ? "Online checkout isn't available for gear right now. Call or text us and we'll take your order, including size and color."
          : "Online payment isn't available right now. Call or text us and we'll take your order by phone. Your cart stays saved here."}
      </p>
      <a
        href={`tel:${ORDER_PHONE_E164}`}
        className="block w-full py-3.5 text-center bg-gray-900 text-white font-heading text-sm tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
      >
        Call {ORDER_PHONE}
      </a>
      <a
        href={`sms:${ORDER_PHONE_E164}`}
        className="block w-full mt-3 text-center text-sm text-gray-600 underline hover:text-gray-900"
      >
        Or text us
      </a>
    </div>
  )
}
