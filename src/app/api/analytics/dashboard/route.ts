import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from '@/lib/payload'

export async function GET(req: NextRequest) {
  try {
  const payload = await getPayload()
  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') || '7', 10)

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)
  const startStr = startDate.toISOString().split('T')[0]

  const summaries = await payload.find({
    collection: 'analytics-summary',
    where: {
      date: { greater_than_equal: `${startStr}T00:00:00.000Z` },
    },
    limit: 10000,
    pagination: false,
    sort: 'date',
  })

  const todayStr = new Date().toISOString().split('T')[0]
  const todayEvents = await payload.find({
    collection: 'page-views',
    where: {
      sessionDate: { equals: `${todayStr}T00:00:00.000Z` },
    },
    limit: 10000,
    pagination: false,
  })

  let totalViews = 0
  const uniqueVisitorsSet = new Set<string>()
  const pageViewsMap: Record<string, number> = {}
  const referrerMap: Record<string, number> = {}
  const dailyMap: Record<string, { views: number; unique: number }> = {}

  for (const s of summaries.docs) {
    const dateKey = (s.date as string).split('T')[0]
    totalViews += (s.views as number) || 0

    const path = s.path as string
    pageViewsMap[path] = (pageViewsMap[path] || 0) + ((s.views as number) || 0)

    if (!dailyMap[dateKey]) dailyMap[dateKey] = { views: 0, unique: 0 }
    dailyMap[dateKey].views += (s.views as number) || 0
    dailyMap[dateKey].unique += (s.uniqueVisitors as number) || 0

    const refs = (s.topReferrers as Record<string, number>) || {}
    for (const [ref, count] of Object.entries(refs)) {
      referrerMap[ref] = (referrerMap[ref] || 0) + count
    }
  }

  for (const event of todayEvents.docs) {
    totalViews++
    uniqueVisitorsSet.add(event.visitorHash as string)

    const path = event.path as string
    pageViewsMap[path] = (pageViewsMap[path] || 0) + 1

    const ref = (event.referrer as string) || '(direct)'
    referrerMap[ref] = (referrerMap[ref] || 0) + 1
  }

  if (!dailyMap[todayStr]) dailyMap[todayStr] = { views: 0, unique: 0 }
  dailyMap[todayStr].views += todayEvents.docs.length
  dailyMap[todayStr].unique += uniqueVisitorsSet.size

  const topPages = Object.entries(pageViewsMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, views]) => ({ path, views }))

  const topReferrers = Object.entries(referrerMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([referrer, count]) => ({ referrer, count }))

  const dailySeries: { date: string; views: number; unique: number }[] = []
  for (let i = days; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    dailySeries.push({
      date: key,
      views: dailyMap[key]?.views || 0,
      unique: dailyMap[key]?.unique || 0,
    })
  }

  const totalUniqueVisitors = dailySeries.reduce((sum, d) => sum + d.unique, 0)

  return NextResponse.json({
    period: { days, start: startStr, end: todayStr },
    totalViews,
    totalUniqueVisitors,
    topPages,
    topReferrers,
    dailySeries,
    todayViews: todayEvents.docs.length,
    todayUnique: uniqueVisitorsSet.size,
  })
  } catch (error) {
    console.error('[Analytics Dashboard] Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 },
    )
  }
}
