import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'
import type { Post } from '@/payload-types'
import fs from 'fs/promises'
import path from 'path'

// ---------------------------------------------------------------------------
// Auth helper — validates Bearer token against DB-stored hashed keys
// Falls back to BLOG_API_KEY env var for backward compatibility
// ---------------------------------------------------------------------------
async function authenticate(req: NextRequest): Promise<boolean> {
  const auth = req.headers.get('authorization')
  if (!auth) return false
  const token = auth.replace(/^Bearer\s+/i, '')
  if (!token) return false

  // Legacy fallback: check BLOG_API_KEY env var
  const legacyKey = process.env.BLOG_API_KEY
  if (legacyKey && token === legacyKey) return true

  // Hash the incoming token and look it up in the database
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex')
  try {
    const payload = await getPayload()
    const result = await payload.find({
      collection: 'api-keys',
      where: { keyHash: { equals: tokenHash } },
      limit: 1,
    })
    return result.docs.length > 0
  } catch {
    return false
  }
}

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized — provide a valid Bearer token' }, { status: 401 })
}

// ---------------------------------------------------------------------------
// Slug helper
// ---------------------------------------------------------------------------
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ---------------------------------------------------------------------------
// Convert plain HTML string to Payload Lexical rich-text JSON
// Supports: <h2>–<h6>, <p>, <ul>/<ol> with <li>, <strong>, <em>, <a>
// ---------------------------------------------------------------------------
interface LexicalNode {
  type: string
  version: number
  [key: string]: unknown
}

interface LexicalTextNode extends LexicalNode {
  type: 'text'
  mode: string
  text: string
  style: string
  detail: number
  format: number
}

interface LexicalLinkNode extends LexicalNode {
  type: 'link'
  fields: { url: string; newTab: boolean; linkType: string }
  children: LexicalTextNode[]
}

interface LexicalElementNode extends LexicalNode {
  children: (LexicalTextNode | LexicalLinkNode | LexicalElementNode)[]
  direction: null
}

function htmlToLexical(html: string): Post['content'] {
  // Strip full document wrappers if present
  html = html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<\/body[\s\S]*$/i, '')

  const children: LexicalElementNode[] = []

  // Split into top-level block elements
  const blockRegex = /<(h[2-6]|p|ul|ol)([\s\S]*?)>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(html)) !== null) {
    const tag = match[1].toLowerCase()
    const inner = match[3].trim()

    if (tag.startsWith('h')) {
      children.push({
        tag,
        type: 'heading',
        format: 'start',
        indent: 0,
        version: 1,
        children: parseInline(inner),
        direction: null,
      })
    } else if (tag === 'p') {
      children.push({
        type: 'paragraph',
        format: 'start',
        indent: 0,
        version: 1,
        children: parseInline(inner),
        direction: null,
        textStyle: '',
        textFormat: 0,
      } as LexicalElementNode)
    } else if (tag === 'ul' || tag === 'ol') {
      const items: LexicalElementNode[] = []
      const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi
      let liMatch: RegExpExecArray | null
      let liIndex = 1
      while ((liMatch = liRegex.exec(inner)) !== null) {
        items.push({
          type: 'listitem',
          value: liIndex++,
          format: 'start',
          indent: 0,
          version: 1,
          children: parseInline(liMatch[1].trim()),
          direction: null,
        } as LexicalElementNode)
      }
      children.push({
        tag,
        type: 'list',
        start: 1,
        format: '',
        indent: 0,
        version: 1,
        children: items,
        direction: null,
        listType: tag === 'ul' ? 'bullet' : 'number',
      } as LexicalElementNode)
    }
  }

  // If no block elements found, treat entire input as a single paragraph
  if (children.length === 0 && html.trim().length > 0) {
    children.push({
      type: 'paragraph',
      format: 'start',
      indent: 0,
      version: 1,
      children: parseInline(html.trim()),
      direction: null,
      textStyle: '',
      textFormat: 0,
    } as LexicalElementNode)
  }

  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      children: children as Post['content']['root']['children'],
      direction: null,
    },
  }
}

function parseInline(html: string): (LexicalTextNode | LexicalLinkNode)[] {
  const nodes: (LexicalTextNode | LexicalLinkNode)[] = []

  // Process inline elements: <strong>, <em>, <a>, and plain text
  const inlineRegex = /<(strong|b|em|i|a)((?:\s[^>]*)?)>([\s\S]*?)<\/\1>/gi
  let lastIndex = 0
  let inlineMatch: RegExpExecArray | null

  while ((inlineMatch = inlineRegex.exec(html)) !== null) {
    // Add preceding plain text
    if (inlineMatch.index > lastIndex) {
      const text = stripTags(html.slice(lastIndex, inlineMatch.index))
      if (text) {
        nodes.push(makeText(text, 0))
      }
    }

    const inlineTag = inlineMatch[1].toLowerCase()
    const attrs = inlineMatch[2] || ''
    const innerText = stripTags(inlineMatch[3])

    if (inlineTag === 'a') {
      const hrefMatch = /href=["']([^"']*)["']/i.exec(attrs)
      const href = hrefMatch ? hrefMatch[1] : '#'
      nodes.push({
        type: 'link',
        version: 1,
        format: '',
        indent: 0,
        direction: null,
        fields: { url: href, newTab: true, linkType: 'custom' },
        children: [makeText(innerText, 0)],
      } as unknown as LexicalLinkNode)
    } else if (inlineTag === 'strong' || inlineTag === 'b') {
      nodes.push(makeText(innerText, 1)) // bold
    } else if (inlineTag === 'em' || inlineTag === 'i') {
      nodes.push(makeText(innerText, 2)) // italic
    }

    lastIndex = inlineMatch.index + inlineMatch[0].length
  }

  // Remaining plain text
  if (lastIndex < html.length) {
    const text = stripTags(html.slice(lastIndex))
    if (text) {
      nodes.push(makeText(text, 0))
    }
  }

  // If nothing was parsed, add empty text node
  if (nodes.length === 0) {
    nodes.push(makeText('', 0))
  }

  return nodes
}

function makeText(text: string, format: number): LexicalTextNode {
  return {
    mode: 'normal',
    text,
    type: 'text',
    style: '',
    detail: 0,
    format,
    version: 1,
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
}

// ---------------------------------------------------------------------------
// Auto-generate an excerpt from HTML content (first ~200 chars of text)
// ---------------------------------------------------------------------------
function generateExcerpt(html: string, maxLength = 200): string {
  const text = stripTags(html).replace(/\s+/g, ' ').trim()
  if (text.length <= maxLength) return text
  // Cut at word boundary
  const truncated = text.slice(0, maxLength)
  const lastSpace = truncated.lastIndexOf(' ')
  return (lastSpace > 0 ? truncated.slice(0, lastSpace) : truncated) + '...'
}

// Extract plain text from Lexical JSON for excerpt generation
function lexicalToPlainText(lexical: Post['content']): string {
  const parts: string[] = []
  function walk(node: any) {
    if (node.type === 'text' && typeof node.text === 'string') {
      parts.push(node.text)
    }
    if (Array.isArray(node.children)) {
      for (const child of node.children) walk(child)
    }
  }
  if (lexical?.root) walk(lexical.root)
  return parts.join(' ').replace(/\s+/g, ' ').trim()
}

// ---------------------------------------------------------------------------
// Image upload helper — accepts base64 data and saves to media dir + DB
// ---------------------------------------------------------------------------
async function uploadImage(
  base64Data: string,
  filename: string,
  alt: string,
): Promise<number> {
  const payload = await getPayload()

  // Determine mime type from base64 header or filename
  let mimeType = 'image/jpeg'
  let cleanData = base64Data

  if (base64Data.startsWith('data:')) {
    const headerMatch = base64Data.match(/^data:([^;]+);base64,/)
    if (headerMatch) {
      mimeType = headerMatch[1]
      cleanData = base64Data.replace(/^data:[^;]+;base64,/, '')
    }
  }

  const buffer = Buffer.from(cleanData, 'base64')

  // Sanitize filename
  const safeName = filename
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')

  const mediaDir = path.resolve(process.cwd(), 'media')
  const filePath = path.join(mediaDir, safeName)

  // Write file to disk
  await fs.writeFile(filePath, buffer)

  // Create media record via Payload
  const media = await payload.create({
    collection: 'media',
    filePath,
    data: {
      alt,
    },
  })

  return media.id as number
}

// ---------------------------------------------------------------------------
// GET /api/blog — List published posts (or all with ?status=all)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  if (!(await authenticate(req))) return unauthorized()

  try {
    const payload = await getPayload()
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status') || 'published'
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 250)
    const page = parseInt(searchParams.get('page') || '1', 10)

    const result = await payload.find({
      collection: 'posts',
      where: status !== 'all' ? { status: { equals: status } } : {},
      limit,
      page,
      sort: '-createdAt',
    })

    return NextResponse.json({
      posts: result.docs.map((post) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        status: post.status,
        author: post.author,
        publishedAt: post.publishedAt,
        featuredImage: post.featuredImage
          ? typeof post.featuredImage === 'object'
            ? { id: post.featuredImage.id, url: post.featuredImage.url, alt: 'alt' in post.featuredImage ? post.featuredImage.alt : '' }
            : { id: post.featuredImage }
          : null,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
    })
  } catch (error) {
    console.error('[Blog API] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// POST /api/blog — Create a new blog post
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  if (!(await authenticate(req))) return unauthorized()

  try {
    const body = await req.json()
    const {
      title,
      slug,
      excerpt,
      content,
      contentFormat = 'html',
      status = 'draft',
      author,
      publishedAt,
      featuredImage,
      meta,
    } = body as {
      title: string
      slug?: string
      excerpt?: string
      content: string | object
      contentFormat?: 'html' | 'lexical'
      status?: 'draft' | 'published'
      author?: string
      publishedAt?: string
      featuredImage?: { base64: string; filename: string; alt: string } | number
      meta?: { metaTitle?: string; metaDescription?: string }
    }

    // --- Validation ---
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: title, content' },
        { status: 400 },
      )
    }

    const postSlug = slug || slugify(title)

    // --- Convert content to Lexical JSON ---
    let lexicalContent: Post['content']
    if (contentFormat === 'lexical') {
      lexicalContent = (typeof content === 'string' ? JSON.parse(content) : content) as Post['content']
    } else {
      lexicalContent = htmlToLexical(content as string)
    }

    // --- Auto-generate excerpt if not provided ---
    let postExcerpt = excerpt
    if (!postExcerpt && content) {
      if (contentFormat === 'html' && typeof content === 'string') {
        postExcerpt = generateExcerpt(content)
      } else {
        const lexical = (typeof content === 'string' ? JSON.parse(content) : content) as Post['content']
        const plainText = lexicalToPlainText(lexical)
        if (plainText) postExcerpt = generateExcerpt(plainText)
      }
    }

    // --- Handle featured image ---
    let featuredImageId: number | undefined
    if (featuredImage) {
      if (typeof featuredImage === 'number') {
        // Reference an existing media ID
        featuredImageId = featuredImage
      } else if (featuredImage.base64 && featuredImage.filename) {
        // Upload new image from base64
        featuredImageId = await uploadImage(
          featuredImage.base64,
          featuredImage.filename,
          featuredImage.alt || title,
        )
      }
    }

    // --- Create the post ---
    const payload = await getPayload()
    const post = await payload.create({
      collection: 'posts',
      data: {
        title,
        slug: postSlug,
        excerpt: postExcerpt || undefined,
        content: lexicalContent,
        status,
        author: author || undefined,
        publishedAt: publishedAt || (status === 'published' ? new Date().toISOString() : undefined),
        featuredImage: featuredImageId || undefined,
        meta: meta
          ? {
              metaTitle: meta.metaTitle || title,
              metaDescription: meta.metaDescription || excerpt || undefined,
            }
          : undefined,
      },
    })

    return NextResponse.json(
      {
        success: true,
        post: {
          id: post.id,
          title: post.title,
          slug: post.slug,
          status: post.status,
          url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`,
          createdAt: post.createdAt,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error('[Blog API] POST error:', error)
    const message = error instanceof Error ? error.message : 'Failed to create post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/blog — Update an existing post (by id or slug)
// ---------------------------------------------------------------------------
export async function PATCH(req: NextRequest) {
  if (!(await authenticate(req))) return unauthorized()

  try {
    const body = await req.json()
    const { id, slug: lookupSlug, ...updates } = body as {
      id?: number
      slug?: string
      title?: string
      excerpt?: string
      content?: string | object
      contentFormat?: 'html' | 'lexical'
      status?: 'draft' | 'published'
      author?: string
      publishedAt?: string
      featuredImage?: { base64: string; filename: string; alt: string } | number
      meta?: { metaTitle?: string; metaDescription?: string }
    }

    if (!id && !lookupSlug) {
      return NextResponse.json(
        { error: 'Provide either id or slug to identify the post to update' },
        { status: 400 },
      )
    }

    const payload = await getPayload()

    // Find the post
    let postId: number
    if (id) {
      postId = id
    } else {
      const found = await payload.find({
        collection: 'posts',
        where: { slug: { equals: lookupSlug } },
        limit: 1,
      })
      if (!found.docs.length) {
        return NextResponse.json({ error: `Post not found with slug: ${lookupSlug}` }, { status: 404 })
      }
      postId = found.docs[0].id as number
    }

    // Build update data -- use Record for flexibility, cast at usage
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: Record<string, any> = {}

    if (updates.title) data.title = updates.title
    if (updates.excerpt !== undefined) data.excerpt = updates.excerpt
    if (updates.status) data.status = updates.status
    if (updates.author !== undefined) data.author = updates.author
    if (updates.publishedAt) data.publishedAt = updates.publishedAt

    // Handle content
    if (updates.content) {
      const format = updates.contentFormat || 'html'
      if (format === 'lexical') {
        data.content = (typeof updates.content === 'string' ? JSON.parse(updates.content as string) : updates.content) as Post['content']
      } else {
        data.content = htmlToLexical(updates.content as string)
      }

      // Auto-generate excerpt if content was updated and no excerpt was explicitly provided
      if (updates.excerpt === undefined) {
        if (format === 'html' && typeof updates.content === 'string') {
          data.excerpt = generateExcerpt(updates.content as string)
        } else {
          const plainText = lexicalToPlainText(data.content)
          if (plainText) data.excerpt = generateExcerpt(plainText)
        }
      }
    }

    // Handle slug update
    if (updates.title && !body.slug) {
      // Don't auto-change slug on title update unless explicitly provided
    }
    if (body.slug) {
      data.slug = body.slug
    }

    // Handle featured image
    if (updates.featuredImage) {
      if (typeof updates.featuredImage === 'number') {
        data.featuredImage = updates.featuredImage
      } else if (updates.featuredImage.base64 && updates.featuredImage.filename) {
        data.featuredImage = await uploadImage(
          updates.featuredImage.base64,
          updates.featuredImage.filename,
          updates.featuredImage.alt || (updates.title as string) || 'Blog image',
        )
      }
    }

    // Handle meta
    if (updates.meta) {
      data.meta = {
        metaTitle: updates.meta.metaTitle,
        metaDescription: updates.meta.metaDescription,
      }
    }

    const updated = await payload.update({
      collection: 'posts',
      id: postId,
      data,
    })

    return NextResponse.json({
      success: true,
      post: {
        id: updated.id,
        title: updated.title,
        slug: updated.slug,
        status: updated.status,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${updated.slug}`,
        updatedAt: updated.updatedAt,
      },
    })
  } catch (error) {
    console.error('[Blog API] PATCH error:', error)
    const message = error instanceof Error ? error.message : 'Failed to update post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/blog — Delete a post by id or slug
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  if (!(await authenticate(req))) return unauthorized()

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')

    if (!id && !slug) {
      return NextResponse.json(
        { error: 'Provide either id or slug query parameter' },
        { status: 400 },
      )
    }

    const payload = await getPayload()

    let postId: number
    if (id) {
      postId = parseInt(id, 10)
    } else {
      const found = await payload.find({
        collection: 'posts',
        where: { slug: { equals: slug } },
        limit: 1,
      })
      if (!found.docs.length) {
        return NextResponse.json({ error: `Post not found with slug: ${slug}` }, { status: 404 })
      }
      postId = found.docs[0].id as number
    }

    await payload.delete({ collection: 'posts', id: postId })

    return NextResponse.json({ success: true, deletedId: postId })
  } catch (error) {
    console.error('[Blog API] DELETE error:', error)
    const message = error instanceof Error ? error.message : 'Failed to delete post'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
