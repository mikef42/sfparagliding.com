'use client'

import { useCartStore } from '@/store/cart'
import { useState } from 'react'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    slug?: string
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      type: 'product',
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <button
      onClick={handleAdd}
      className="btn-primary w-full text-center text-base py-4"
    >
      {added ? 'Added to Cart!' : 'Add to Cart'}
    </button>
  )
}
