import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { getPayload } from '@/lib/payload'

// ---------------------------------------------------------------------------
// Auth helper — validates the Payload admin session cookie
// ---------------------------------------------------------------------------
async function getAuthenticatedUser(req: NextRequest) {
  const payload = await getPayload()
  try {
    const result = await payload.auth({ headers: req.headers })
    return result.user
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// GET /api/api-keys — List all keys (masked — no hash returned)
// ---------------------------------------------------------------------------
export async function GET(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const payload = await getPayload()
  const result = await payload.find({
    collection: 'api-keys',
    sort: '-createdAt',
    limit: 100,
  })

  return NextResponse.json({
    keys: result.docs.map((key) => ({
      id: key.id,
      label: key.label,
      keyPrefix: key.keyPrefix,
      createdBy: key.createdBy,
      createdAt: key.createdAt,
    })),
  })
}

// ---------------------------------------------------------------------------
// POST /api/api-keys — Generate a new API key
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { label } = body as { label: string }

  if (!label || !label.trim()) {
    return NextResponse.json({ error: 'Label is required' }, { status: 400 })
  }

  // Generate crypto-safe random key with recognizable prefix
  const rawBytes = crypto.randomBytes(32)
  const rawKey = `sfp_${rawBytes.toString('base64url')}`

  // SHA-256 hash for storage
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex')

  // First 12 chars as prefix for identification (sfp_ + 8 chars)
  const keyPrefix = rawKey.substring(0, 12)

  const payload = await getPayload()
  const doc = await payload.create({
    collection: 'api-keys',
    data: {
      label: label.trim(),
      keyHash,
      keyPrefix,
      createdBy: user.id,
    },
  })

  // Return the raw key ONCE — it will never be retrievable again
  return NextResponse.json(
    {
      key: {
        id: doc.id,
        label: doc.label,
        keyPrefix,
        rawKey,
        createdAt: doc.createdAt,
      },
    },
    { status: 201 },
  )
}

// ---------------------------------------------------------------------------
// DELETE /api/api-keys — Revoke (delete) a key by id
// ---------------------------------------------------------------------------
export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Provide the key id to delete' }, { status: 400 })
  }

  const payload = await getPayload()
  await payload.delete({
    collection: 'api-keys',
    id: Number(id),
  })

  return NextResponse.json({ success: true, deletedId: id })
}
