import { getImageUrl, cn } from '@/lib/utils'

interface GalleryBlockProps {
  block: {
    heading?: string
    images: Array<{
      image: { url?: string; sizes?: Record<string, { url?: string }> }
      caption?: string
    }>
    columns?: '2' | '3' | '4'
  }
}

export function GalleryBlock({ block }: GalleryBlockProps) {
  const columns = block.columns || '3'

  if (!block.images || block.images.length === 0) return null

  return (
    <section className="py-16 lg:py-20">
      <div className="container-wide">
        {block.heading && (
          <>
            <h2 className="section-heading">{block.heading}</h2>
            <div className="section-divider" />
          </>
        )}

        <div
          className={cn(
            'grid gap-4',
            columns === '2' && 'grid-cols-1 sm:grid-cols-2',
            columns === '3' && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
            columns === '4' && 'grid-cols-2 lg:grid-cols-4',
          )}
        >
          {block.images.map((item, i) => {
            const imageUrl = getImageUrl(item.image as any, 'medium')
            return (
              <div key={i} className="group">
                <div className="aspect-[4/3] overflow-hidden rounded-sm bg-gray-100">
                  <img
                    src={imageUrl}
                    alt={item.caption || ''}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {item.caption && (
                  <p className="text-sm text-gray-500 mt-2">{item.caption}</p>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
