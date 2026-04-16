import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'
import crypto from 'crypto'

interface TrackEvent {
  path: string
  visitorHash: string
  referrer: string
  userAgent: string
  device: 'desktop' | 'mobile' | 'tablet'
  sessionDate: string
}

const buffer: TrackEvent[] = []
let flushTimer: ReturnType<typeof setTimeout> | null = null
const FLUSH_INTERVAL = 5000
const MAX_BUFFER = 20

function getDeviceType(ua: string): 'desktop' | 'mobile' | 'tablet' {
  if (/tablet|ipad/i.test(ua)) return 'tablet'
  if (/mobile|iphone|android(?!.*tablet)/i.test(ua)) return 'mobile'
  return 'desktop'
}

function getDailySalt(): string {
  const today = new Date().toISOString().split('T')[0]
  return `sfp-${today}-${process.env.PAYLOAD_SECRET || 'salt'}`
}

function hashVisitor(ip: string, ua: string): string {
  return crypto
    .createHash('sha256')
    .update(`${ip}|${ua}|${getDailySalt()}`)
    .digest('hex')
    .substring(0, 16)
}

async function flushBuffer() {
  if (buffer.length === 0) return
  const events = buffer.splice(0, buffer.length)

  try {
    const payload = await getPayload()
    await Promise.all(
      events.map((event) =>
        payload.create({
          collection: 'page-views',
          data: {
            path: event.path,
            visitorHash: event.visitorHash,
            referrer: event.referrer,
            userAgent: event.userAgent,
            device: event.device,
            sessionDate: event.sessionDate,
          },
        }),
      ),
    )
  } catch (error) {
    console.error('[Analytics] Flush error:', error)
  }
}

function scheduleFlush() {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    flushTimer = null
    await flushBuffer()
  }, FLUSH_INTERVAL)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { path, ip, userAgent, referrer } = body

    if (!path) {
      return NextResponse.json({ error: 'Missing path' }, { status: 400 })
    }

    const today = new Date().toISOString().split('T')[0]

    buffer.push({
      path,
      visitorHash: hashVisitor(ip || 'unknown', userAgent || ''),
      referrer: referrer || '',
      userAgent: (userAgent || '').substring(0, 256),
      device: getDeviceType(userAgent || ''),
      sessionDate: `${today}T00:00:00.000Z`,
    })

    if (buffer.length >= MAX_BUFFER) {
      await flushBuffer()
    } else {
      scheduleFlush()
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Track failed' }, { status: 500 })
  }
}
