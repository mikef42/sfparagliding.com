'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { getImageUrl, formatPriceDollars, cn } from '@/lib/utils'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

/* eslint-disable @typescript-eslint/no-explicit-any */

interface ProductDetailProps {
  product: {
    id: number | string
    name: string
    slug: string
    price: number
    compareAtPrice?: number | null
    description?: any
    images?: Array<{ image: any; id?: string | null }>
    sizes?: Array<{ label: string; value: string; id?: string | null }>
    colors?: Array<{
      label: string
      value: string
      priceModifier?: number | null
      id?: string | null
    }>
    sizingChart?: any
    sku?: string | null
    inventory?: number | null
    category?: { id: number | string; name: string; slug: string } | null
  }
}

export function ProductDetail({ product }: ProductDetailProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [ushpaId, setUshpaId] = useState('')
  const [added, setAdded] = useState(false)
  const [showValidation, setShowValidation] = useState(false)
  const [sizingChartOpen, setSizingChartOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const addItem = useCartStore((s) => s.addItem)
  const router = useRouter()

  const images = product.images || []
  const hasSizes = (product.sizes?.length ?? 0) > 0
  const hasColors = (product.colors?.length ?? 0) > 0
  const isParaglider =
    product.category &&
    typeof product.category === 'object' &&
    product.category.slug === 'paragliders'
  const requiresUshpa = isParaglider

  // Price reacts to selected color's priceModifier
  const activeColor = product.colors?.find((c) => c.value === selectedColor)
  const displayPrice = activeColor?.priceModifier ?? product.price

  // Selected labels for inline display
  const selectedSizeLabel = product.sizes?.find(
    (s) => s.value === selectedSize,
  )?.label
  const selectedColorLabel = product.colors?.find(
    (c) => c.value === selectedColor,
  )?.label

  const canAdd =
    (!hasSizes || selectedSize !== null) &&
    (!hasColors || selectedColor !== null) &&
    (!requiresUshpa || ushpaId.trim().length > 0)

  const handleAdd = () => {
    if (!canAdd) {
      setShowValidation(true)
      return
    }

    const sizeLabel = product.sizes?.find(
      (s) => s.value === selectedSize,
    )?.label
    const colorLabel = product.colors?.find(
      (c) => c.value === selectedColor,
    )?.label
    const featuredImage =
      images[0]?.image && typeof images[0].image === 'object'
        ? getImageUrl(images[0].image, 'medium')
        : '/placeholder.jpg'

    addItem(
      {
        id: String(product.id),
        name: product.name,
        price: displayPrice,
        image: featuredImage,
        slug: product.slug,
        type: 'product',
        size: sizeLabel,
        color: colorLabel,
        ushpaId: requiresUshpa ? ushpaId.trim() : undefined,
      },
      quantity,
    )

    setAdded(true)
    setShowValidation(false)
    setTimeout(() => setAdded(false), 2000)
  }

  const handleBuyNow = () => {
    if (!canAdd) {
      setShowValidation(true)
      return
    }
    handleAdd()
    router.push('/checkout')
  }

  const handleShare = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: product.name, url })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const mainImageUrl =
    images[selectedImageIndex]?.image &&
    typeof images[selectedImageIndex].image === 'object'
      ? getImageUrl(images[selectedImageIndex].image, 'large')
      : images[selectedImageIndex]?.image &&
          typeof images[selectedImageIndex].image === 'string'
        ? (images[selectedImageIndex].image as string)
        : '/placeholder.jpg'

  return (
    <div className="py-8 lg:py-12">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* ─── Top Section: Images + Info ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Image Gallery */}
          <div>
            {/* Main image */}
            <div className="aspect-[4/3] overflow-hidden bg-gray-100 mb-4">
              <img
                src={mainImageUrl}
                alt={`${product.name} ${selectedImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => {
                  const thumbUrl =
                    typeof img.image === 'object'
                      ? getImageUrl(img.image, 'thumbnail')
                      : typeof img.image === 'string'
                        ? img.image
                        : '/placeholder.jpg'

                  return (
                    <button
                      key={img.id || i}
                      onClick={() => setSelectedImageIndex(i)}
                      className={cn(
                        'w-[72px] h-[72px] flex-shrink-0 overflow-hidden bg-gray-100 border-2 transition-colors',
                        i === selectedImageIndex
                          ? 'border-gray-900'
                          : 'border-transparent hover:border-gray-300',
                      )}
                    >
                      <img
                        src={thumbUrl}
                        alt={`${product.name} thumbnail ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div>
            <h1 className="font-serif text-3xl lg:text-4xl text-gray-900 mb-4">
              {product.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span className="text-xl text-gray-900">
                {formatPriceDollars(displayPrice)}
              </span>
              {product.compareAtPrice &&
                product.compareAtPrice > displayPrice && (
                  <span className="text-base text-gray-400 line-through">
                    {formatPriceDollars(product.compareAtPrice)}
                  </span>
                )}
            </div>

            {/* Color Selector */}
            {hasColors && (
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-heading text-xs tracking-[0.15em] uppercase text-gray-800">
                    Color
                  </span>
                  {selectedColorLabel && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="font-heading text-xs tracking-[0.1em] uppercase text-gray-500">
                        {selectedColorLabel}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors!.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => {
                        setSelectedColor(color.value)
                        setShowValidation(false)
                      }}
                      className={cn(
                        'px-5 py-2.5 min-w-[60px] text-sm font-heading tracking-wider uppercase border transition-all',
                        selectedColor === color.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900',
                        showValidation &&
                          selectedColor === null &&
                          'border-red-300',
                      )}
                    >
                      {color.label}
                    </button>
                  ))}
                </div>
                {showValidation && selectedColor === null && (
                  <p className="text-red-500 text-xs mt-1.5">
                    Please select a color
                  </p>
                )}
              </div>
            )}

            {/* Size Selector */}
            {hasSizes && (
              <div className="mb-6">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="font-heading text-xs tracking-[0.15em] uppercase text-gray-800">
                    Size
                  </span>
                  {selectedSizeLabel && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span className="font-heading text-xs tracking-[0.1em] uppercase text-gray-500">
                        {selectedSizeLabel}
                      </span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes!.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => {
                        setSelectedSize(size.value)
                        setShowValidation(false)
                      }}
                      className={cn(
                        'px-5 py-2.5 min-w-[60px] text-sm font-heading tracking-wider uppercase border transition-all',
                        selectedSize === size.value
                          ? 'border-gray-900 bg-gray-900 text-white'
                          : 'border-gray-300 text-gray-700 hover:border-gray-900',
                        showValidation &&
                          selectedSize === null &&
                          'border-red-300',
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
                {showValidation && selectedSize === null && (
                  <p className="text-red-500 text-xs mt-1.5">
                    Please select a size
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector */}
            <div className="mb-6">
              <div className="inline-flex items-center border border-gray-300">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-11 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Decrease quantity"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="w-12 h-11 flex items-center justify-center text-sm font-medium text-gray-900 border-x border-gray-300">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-11 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors"
                  aria-label="Increase quantity"
                >
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* USHPA ID Field (paragliders only) */}
            {requiresUshpa && (
              <div className="mb-6">
                <label
                  htmlFor="ushpa-id"
                  className="block font-heading text-xs tracking-[0.15em] uppercase text-gray-800 mb-2"
                >
                  USHPA# or Equivalent<span className="text-red-500">*</span>
                </label>
                <input
                  id="ushpa-id"
                  type="text"
                  value={ushpaId}
                  onChange={(e) => {
                    setUshpaId(e.target.value)
                    if (e.target.value.trim()) setShowValidation(false)
                  }}
                  className={cn(
                    'w-full px-4 py-3 border text-sm text-gray-900 focus:outline-none focus:border-gray-900 transition-colors',
                    showValidation && !ushpaId.trim()
                      ? 'border-red-300'
                      : 'border-gray-300',
                  )}
                  placeholder=""
                />
                {showValidation && !ushpaId.trim() && (
                  <p className="text-red-500 text-xs mt-1.5">
                    USHPA# or equivalent is required
                  </p>
                )}
              </div>
            )}

            {/* Add to Cart */}
            <button
              onClick={handleAdd}
              className={cn(
                'w-full py-3.5 mb-3 border border-gray-900 font-heading text-sm tracking-[0.15em] uppercase transition-all',
                added
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-900 hover:bg-gray-50',
                !canAdd && showValidation && 'opacity-60',
              )}
            >
              {added
                ? 'Added to Cart!'
                : `Add to Cart \u00B7 ${formatPriceDollars(displayPrice * quantity)}`}
            </button>

            {/* Buy Now */}
            <button
              onClick={handleBuyNow}
              className="w-full py-3.5 mb-6 bg-gray-900 text-white font-heading text-sm tracking-[0.15em] uppercase hover:bg-gray-800 transition-colors"
            >
              Buy Now
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 font-heading text-xs tracking-[0.15em] uppercase text-gray-500 hover:text-gray-900 transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
              {copied ? 'Link Copied!' : 'Share'}
            </button>

            {product.sku && (
              <p className="text-xs text-gray-400 mt-4">
                SKU: {product.sku}
              </p>
            )}
          </div>
        </div>

        {/* ─── Description (full width, below images) ─── */}
        {product.description && (
          <div className="mt-12 pt-10 border-t border-gray-200">
            <h2 className="font-heading text-2xl tracking-wide mb-6">
              Description
            </h2>
            <div className="prose-content max-w-4xl text-gray-600">
              <RichTextRenderer content={product.description} />
            </div>
          </div>
        )}

        {/* ─── Sizing Chart (collapsible, below description) ─── */}
        {product.sizingChart && (
          <div className="mt-10 pt-8 border-t border-gray-200">
            <button
              onClick={() => setSizingChartOpen(!sizingChartOpen)}
              className="flex items-center justify-between w-full text-left group"
            >
              <h2 className="font-heading text-2xl tracking-wide group-hover:text-brand-amber transition-colors">
                Sizing Chart
              </h2>
              <svg
                className={cn(
                  'w-5 h-5 text-gray-400 transition-transform duration-200',
                  sizingChartOpen && 'rotate-180',
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {sizingChartOpen && (
              <div className="mt-6 prose-content overflow-x-auto">
                <RichTextRenderer content={product.sizingChart} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
