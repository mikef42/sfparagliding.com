import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ANALYTICS_CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
  const payload = await getPayload()
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const dateStr = yesterday.toISOString().split('T')[0]

  const rawEvents = await payload.find({
    collection: 'page-views',
    where: {
      sessionDate: { equals: `${dateStr}T00:00:00.000Z` },
    },
    limit: 10000,
    pagination: false,
  })

  const pathMap = new Map<
    string,
    {
      views: number
      visitors: Set<string>
      referrers: Record<string, number>
      devices: Record<string, number>
    }
  >()

  for (const event of rawEvents.docs) {
    const path = event.path as string
    if (!pathMap.has(path)) {
      pathMap.set(path, {
        views: 0,
        visitors: new Set(),
        referrers: {},
        devices: { desktop: 0, mobile: 0, tablet: 0 },
      })
    }
    const agg = pathMap.get(path)!
    agg.views++
    agg.visitors.add(event.visitorHash as string)

    const ref = (event.referrer as string) || '(direct)'
    agg.referrers[ref] = (agg.referrers[ref] || 0) + 1

    const device = (event.device as string) || 'desktop'
    agg.devices[device] = (agg.devices[device] || 0) + 1
  }

  for (const [path, data] of pathMap) {
    const existing = await payload.find({
      collection: 'analytics-summary',
      where: {
        and: [
          { date: { equals: `${dateStr}T00:00:00.000Z` } },
          { path: { equals: path } },
        ],
      },
      limit: 1,
    })

    const summaryData = {
      date: `${dateStr}T00:00:00.000Z`,
      path,
      views: data.views,
      uniqueVisitors: data.visitors.size,
      topReferrers: data.referrers,
      deviceBreakdown: data.devices,
    }

    if (existing.docs.length > 0) {
      await payload.update({
        collection: 'analytics-summary',
        id: existing.docs[0].id,
        data: summaryData,
      })
    } else {
      await payload.create({
        collection: 'analytics-summary',
        data: summaryData,
      })
    }
  }

  return NextResponse.json({
    ok: true,
    date: dateStr,
    pathsProcessed: pathMap.size,
    totalEvents: rawEvents.docs.length,
  })
  } catch (error) {
    console.error('[Analytics Rollup] Error processing rollup:', error)
    return NextResponse.json(
      { error: 'Failed to process analytics rollup' },
      { status: 500 },
    )
  }
}
