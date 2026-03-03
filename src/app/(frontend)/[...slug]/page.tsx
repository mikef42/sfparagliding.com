import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPage } from '@/lib/payload'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'

interface PageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const slugString = slug.join('/')

  try {
    const page = await getPage(slugString)
    if (!page) return {}

    return {
      title: page.meta?.metaTitle || `${page.title} | SF Paragliding`,
      description: page.meta?.metaDescription || undefined,
      openGraph: {
        title: page.meta?.metaTitle || page.title,
        description: page.meta?.metaDescription || undefined,
      },
    }
  } catch {
    return {}
  }
}

export default async function DynamicPage({ params }: PageProps) {
  const { slug } = await params
  const slugString = slug.join('/')

  let page
  try {
    page = await getPage(slugString)
  } catch {
    notFound()
  }

  if (!page) notFound()

  return (
    <article>
      {/* JSON-LD BreadcrumbList */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: process.env.NEXT_PUBLIC_SITE_URL,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: page.title,
                item: `${process.env.NEXT_PUBLIC_SITE_URL}/${slugString}`,
              },
            ],
          }),
        }}
      />
      <RenderBlocks blocks={page.layout || []} />
    </article>
  )
}
