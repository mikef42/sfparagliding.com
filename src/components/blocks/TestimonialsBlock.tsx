interface TestimonialsBlockProps {
  block: {
    heading?: string
    items: Array<{
      title?: string
      quote: string
      author: string
      role?: string
      avatar?: { url?: string }
    }>
  }
}

export function TestimonialsBlock({ block }: TestimonialsBlockProps) {
  if (!block.items || block.items.length === 0) return null

  return (
    <section className="py-16 lg:py-20 bg-brand-cream">
      <div className="container-wide">
        {block.heading && (
          <>
            <h2 className="section-heading">{block.heading}</h2>
            <div className="section-divider" />
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {block.items.map((item, i) => (
            <div
              key={i}
              className="bg-white rounded-sm p-6 lg:p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {item.title && (
                <h3 className="font-heading text-sm tracking-[0.15em] uppercase mb-3">
                  {item.title}
                </h3>
              )}
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                &ldquo;{item.quote}&rdquo;
              </p>
              <div className="flex items-center gap-3 mt-auto">
                {item.avatar?.url && (
                  <img
                    src={item.avatar.url}
                    alt={item.author}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {item.author}
                  </p>
                  {item.role && (
                    <p className="text-xs text-gray-500">{item.role}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
