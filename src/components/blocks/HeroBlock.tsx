import { getImageUrl, cn } from '@/lib/utils'
import Link from 'next/link'

interface HeroBlockProps {
  block: {
    heading: string
    subheading?: string
    backgroundImage?: { url?: string; sizes?: Record<string, { url?: string }> }
    ctaButton?: { label?: string; link?: string }
    overlayOpacity?: number
    textAlignment?: 'left' | 'center' | 'right'
  }
}

export function HeroBlock({ block }: HeroBlockProps) {
  const imageUrl = getImageUrl(block.backgroundImage, 'large')
  const opacity = (block.overlayOpacity ?? 30) / 100
  const align = block.textAlignment || 'center'

  return (
    <section className="relative h-[70vh] min-h-[500px] max-h-[800px] flex items-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${imageUrl})` }}
      />
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ opacity }}
      />

      {/* Content */}
      <div
        className={cn(
          'relative z-10 container-wide w-full',
          align === 'center' && 'text-center',
          align === 'right' && 'text-right',
          align === 'left' && 'text-left',
        )}
      >
        <h1 className="text-5xl md:text-7xl lg:text-8xl text-white mb-4 animate-fade-up">
          {block.heading}
        </h1>
        {block.subheading && (
          <p className="text-lg md:text-xl text-white/90 mb-6 font-body font-light max-w-2xl mx-auto animate-fade-up animate-delay-100">
            {block.subheading}
          </p>
        )}
        {block.ctaButton?.label && block.ctaButton?.link && (
          <div className="animate-fade-up animate-delay-200">
            <Link href={block.ctaButton.link} className="btn-primary text-base px-10 py-4">
              {block.ctaButton.label}
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
