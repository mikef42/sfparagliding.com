import { NextRequest, NextResponse } from 'next/server'
import { squareClient, SQUARE_LOCATION_ID } from '@/lib/square'
import { getPayload } from '@/lib/payload'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { sourceId, amount, customerEmail, customerName, items } = body

    if (!sourceId || !amount || !customerEmail || !items?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 },
      )
    }

    // Create payment with Square
    const idempotencyKey = uuidv4()

    const { result } = await squareClient.paymentsApi.createPayment({
      sourceId,
      idempotencyKey,
      amountMoney: {
        amount: BigInt(amount), // Amount in cents
        currency: 'USD',
      },
      locationId: SQUARE_LOCATION_ID,
      buyerEmailAddress: customerEmail,
      note: `Order from ${customerName || customerEmail}`,
    })

    if (!result.payment?.id) {
      return NextResponse.json(
        { error: 'Payment processing failed' },
        { status: 500 },
      )
    }

    // Create order in Payload CMS
    const payload = await getPayload()

    const order = await payload.create({
      collection: 'orders',
      data: {
        items: items.map(
          (item: {
            id: string
            name: string
            price: number
            quantity: number
            type: string
          }) => ({
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            ...(item.type === 'product' ? { product: item.id } : {}),
            ...(item.type === 'service' ? { service: item.id } : {}),
          }),
        ),
        total: amount / 100, // Store in dollars
        paymentId: result.payment.id,
        customerEmail,
        customerName: customerName || undefined,
        status: 'paid',
      },
    })

    return NextResponse.json({
      success: true,
      orderId: order.id,
      paymentId: result.payment.id,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'An error occurred processing your payment. Please try again.' },
      { status: 500 },
    )
  }
}
