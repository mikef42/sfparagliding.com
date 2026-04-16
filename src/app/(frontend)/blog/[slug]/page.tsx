import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost } from '@/lib/payload'
import { getImageUrl } from '@/lib/utils'
import { RichTextRenderer } from '@/components/ui/RichTextRenderer'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  try {
    const post = await getBlogPost(slug)
    if (!post) return {}
    const ogImage =
      post.meta?.ogImage && typeof post.meta.ogImage === 'object'
        ? getImageUrl(post.meta.ogImage, 'og')
        : post.featuredImage && typeof post.featuredImage === 'object'
          ? getImageUrl(post.featuredImage, 'og')
          : undefined
    return {
      title: post.meta?.metaTitle || `${post.title} | SF Paragliding`,
      description: post.meta?.metaDescription || post.excerpt || undefined,
      openGraph: {
        title: post.meta?.metaTitle || post.title,
        description: post.meta?.metaDescription || post.excerpt || undefined,
        type: 'article',
        ...(ogImage ? { images: [{ url: ogImage }] } : {}),
      },
    }
  } catch (error) {
    console.error('[BlogPostPage] Error generating metadata:', error)
    return {}
  }
}

function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: '2-digit',
  })
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  let post
  try {
    post = await getBlogPost(slug)
  } catch (error) {
    console.error('[BlogPostPage] Error fetching blog post:', error)
    notFound()
  }
  if (!post) notFound()

  const featuredImage =
    post.featuredImage && typeof post.featuredImage === 'object'
      ? getImageUrl(post.featuredImage, 'large')
      : null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(post.publishedAt ? { datePublished: post.publishedAt } : {}),
    ...(post.author ? { author: { '@type': 'Person', name: post.author } } : {}),
    ...(featuredImage ? { image: featuredImage } : {}),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className="py-12 lg:py-16">
        <div className="max-w-3xl mx-auto px-4">
          <Link
            href="/blog"
            className="text-sm text-gray-500 hover:text-brand-amber transition-colors mb-8 inline-block"
          >
            &larr; Back to Blog
          </Link>

          <h1 className="font-heading text-3xl lg:text-4xl tracking-wide mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 text-sm text-gray-500 mb-8">
            {post.author && <span>{post.author}</span>}
            {post.author && post.publishedAt && <span>&middot;</span>}
            {post.publishedAt && <time>{formatDate(post.publishedAt)}</time>}
          </div>

          {featuredImage && (
            <div className="mb-10">
              <img
                src={featuredImage}
                alt={post.title}
                className="w-full rounded-sm"
              />
            </div>
          )}

          <div className="prose-content">
            <RichTextRenderer content={post.content} />
          </div>
        </div>
      </article>
    </>
  )
}
