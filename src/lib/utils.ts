export function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

export function formatPriceDollars(dollars: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(dollars)
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getImageUrl(
  image: { url?: string | null; sizes?: Record<string, { url?: string | null }> } | string | number | null | undefined,
  size?: string,
): string {
  if (!image) return '/placeholder.jpg'
  if (typeof image === 'string') return image
  if (typeof image === 'number') return '/placeholder.jpg'

  if (size && image.sizes?.[size]?.url) {
    return image.sizes[size].url
  }

  return image.url || '/placeholder.jpg'
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
