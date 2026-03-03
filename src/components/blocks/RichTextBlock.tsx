import { cn } from '@/lib/utils'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

interface RichTextBlockProps {
  block: {
    content: unknown
    maxWidth?: 'narrow' | 'medium' | 'wide'
  }
}

export function RichTextBlock({ block }: RichTextBlockProps) {
  const maxWidth = block.maxWidth || 'narrow'

  return (
    <section className="py-12 lg:py-16">
      <div
        className={cn(
          'mx-auto px-4 sm:px-6 lg:px-8 prose-content',
          maxWidth === 'narrow' && 'max-w-3xl',
          maxWidth === 'medium' && 'max-w-5xl',
          maxWidth === 'wide' && 'max-w-7xl',
        )}
      >
        <RichTextRenderer content={block.content} />
      </div>
    </section>
  )
}
