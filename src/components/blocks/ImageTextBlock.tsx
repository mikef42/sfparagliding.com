import { getImageUrl, cn } from '@/lib/utils'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

interface ImageTextBlockProps {
  block: {
    image: { url?: string; sizes?: Record<string, { url?: string }> }
    content: unknown
    layout?: 'image-left' | 'image-right'
    backgroundColor?: string
  }
}

export function ImageTextBlock({ block }: ImageTextBlockProps) {
  const imageUrl = getImageUrl(block.image as any, 'large')
  const isImageLeft = block.layout !== 'image-right'

  return (
    <section
      className="py-16 lg:py-20"
      style={block.backgroundColor ? { backgroundColor: block.backgroundColor } : undefined}
    >
      <div className="container-wide">
        <div
          className={cn(
            'grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center',
            !isImageLeft && 'lg:[direction:rtl] lg:*:[direction:ltr]',
          )}
        >
          <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
            <img
              src={imageUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="prose-content">
            <RichTextRenderer content={block.content} />
          </div>
        </div>
      </div>
    </section>
  )
}
