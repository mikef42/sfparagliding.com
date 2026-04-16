import type { Metadata } from 'next'
import Link from 'next/link'
import { getBlogPosts } from '@/lib/payload'
import { getImageUrl } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog | SF Paragliding',
  description:
    'Articles about paragliding, flying tips, destinations, and news from SF Paragliding.',
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })
}

export default async function BlogPage() {
  let posts

  try {
    posts = await getBlogPosts()
  } catch (error) {
    console.error('[BlogPage] Error fetching blog posts:', error)
    posts = { docs: [] }
  }

  return (
    <div className="py-12 lg:py-16">
      <div className="container-wide">
        <h1 className="font-heading text-3xl tracking-wide mb-10">Articles</h1>

        {posts.docs.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No articles yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {posts.docs.map((post) => {
              const imageUrl =
                post.featuredImage && typeof post.featuredImage === 'object'
                  ? getImageUrl(post.featuredImage, 'medium')
                  : null

              return (
                <article key={post.id}>
                  {imageUrl && (
                    <Link href={`/blog/${post.slug}`} className="block mb-4">
                      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                        />
                      </div>
                    </Link>
                  )}

                  <p className="text-sm text-gray-500 mb-2">
                    {formatDate(post.publishedAt)}
                  </p>

                  <h2 className="font-heading text-xl lg:text-2xl tracking-wide mb-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:text-brand-amber transition-colors"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-gray-600 text-sm leading-relaxed mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-sm underline underline-offset-4 hover:text-brand-amber transition-colors"
                  >
                    Read more
                  </Link>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
