import Link from 'next/link'
import { getImageUrl } from '@/lib/utils'

interface CTABannerBlockProps {
  block: {
    heading: string
    text?: string
    buttonLabel: string
    buttonLink: string
    backgroundImage?: { url?: string; sizes?: Record<string, { url?: string }> }
    backgroundColor?: string
  }
}

export function CTABannerBlock({ block }: CTABannerBlockProps) {
  const hasImage = !!block.backgroundImage
  const imageUrl = hasImage ? getImageUrl(block.backgroundImage, 'large') : null

  return (
    <section
      className="relative py-20 lg:py-28 overflow-hidden"
      style={!hasImage && block.backgroundColor ? { backgroundColor: block.backgroundColor } : undefined}
    >
      {imageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${imageUrl})` }}
          />
          <div className="absolute inset-0 bg-brand-forest/70" />
        </>
      )}

      <div className="relative z-10 container-wide text-center">
        <h2
          className={`font-heading text-4xl md:text-5xl lg:text-6xl mb-4 ${
            hasImage ? 'text-white' : ''
          }`}
        >
          {block.heading}
        </h2>
        {block.text && (
          <p
            className={`text-lg max-w-xl mx-auto mb-8 ${
              hasImage ? 'text-white/80' : 'text-gray-600'
            }`}
          >
            {block.text}
          </p>
        )}
        <Link href={block.buttonLink} className="btn-primary text-base px-12 py-4">
          {block.buttonLabel}
        </Link>
      </div>
    </section>
  )
}
