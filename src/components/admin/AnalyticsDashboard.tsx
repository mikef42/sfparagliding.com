'use client'

import React, { useEffect, useState } from 'react'

interface DashboardData {
  totalViews: number
  totalUniqueVisitors: number
  todayViews: number
  todayUnique: number
  topPages: { path: string; views: number }[]
  topReferrers: { referrer: string; count: number }[]
  dailySeries: { date: string; views: number; unique: number }[]
}

export default function AnalyticsDashboard() {
  const [days, setDays] = useState(30)
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics/dashboard?days=${days}`)
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [days])

  const maxViews = data ? Math.max(...data.dailySeries.map((d) => d.views), 1) : 1
  const chartHeight = 160
  const barWidth = data ? Math.max(8, Math.min(40, Math.floor(600 / (data.dailySeries.length || 1)) - 4)) : 20

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const avgPagesPerVisit =
    data && data.totalUniqueVisitors > 0
      ? (data.totalViews / data.totalUniqueVisitors).toFixed(1)
      : '0'

  return (
    <div className="analytics-dashboard">
      <div className="analytics-dashboard__header">
        <h2 className="analytics-dashboard__title">Site Analytics</h2>
        <div className="analytics-period-tabs">
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              className={`analytics-period-tab${days === d ? ' analytics-period-tab--active' : ''}`}
              onClick={() => setDays(d)}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="analytics-loading">Loading analytics...</div>
      ) : !data ? (
        <div className="analytics-loading">No data available</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="analytics-stats-grid">
            <div className="analytics-stat-card">
              <div className="analytics-stat-card__label">Total Views</div>
              <div className="analytics-stat-card__value">
                {data.totalViews.toLocaleString()}
              </div>
            </div>
            <div className="analytics-stat-card">
              <div className="analytics-stat-card__label">Unique Visitors</div>
              <div className="analytics-stat-card__value">
                {data.totalUniqueVisitors.toLocaleString()}
              </div>
            </div>
            <div className="analytics-stat-card">
              <div className="analytics-stat-card__label">Today</div>
              <div className="analytics-stat-card__value">
                {data.todayViews.toLocaleString()}
              </div>
            </div>
            <div className="analytics-stat-card">
              <div className="analytics-stat-card__label">Pages / Visit</div>
              <div className="analytics-stat-card__value">{avgPagesPerVisit}</div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="analytics-chart">
            <div className="analytics-chart__title">Views Over Time</div>
            <svg
              width="100%"
              height={chartHeight + 30}
              viewBox={`0 0 ${data.dailySeries.length * (barWidth + 4) + 20} ${chartHeight + 30}`}
              preserveAspectRatio="xMaxYMid meet"
            >
              {data.dailySeries.map((d, i) => {
                const h = (d.views / maxViews) * chartHeight
                const x = i * (barWidth + 4) + 10
                const isToday = d.date === new Date().toISOString().split('T')[0]
                return (
                  <g key={d.date}>
                    <rect
                      x={x}
                      y={chartHeight - h}
                      width={barWidth}
                      height={Math.max(h, 1)}
                      rx={3}
                      fill={isToday ? 'var(--sfp-amber)' : 'var(--sfp-accent)'}
                      opacity={isToday ? 1 : 0.8}
                    />
                    {d.views > 0 && (
                      <text
                        x={x + barWidth / 2}
                        y={chartHeight - h - 4}
                        textAnchor="middle"
                        fontSize="10"
                        fill="var(--theme-elevation-400)"
                      >
                        {d.views}
                      </text>
                    )}
                    {(i % Math.ceil(data.dailySeries.length / 10) === 0 ||
                      i === data.dailySeries.length - 1) && (
                        <text
                          x={x + barWidth / 2}
                          y={chartHeight + 18}
                          textAnchor="middle"
                          fontSize="9"
                          fill="var(--theme-elevation-400)"
                        >
                          {formatDate(d.date)}
                        </text>
                      )}
                  </g>
                )
              })}
            </svg>
          </div>

          {/* Tables */}
          <div className="analytics-two-col">
            <div className="analytics-table">
              <div className="analytics-table__header">Top Pages</div>
              {data.topPages.length === 0 ? (
                <div className="analytics-table__row">
                  <span>No page data yet</span>
                </div>
              ) : (
                data.topPages.map((p) => (
                  <div key={p.path} className="analytics-table__row">
                    <span className="analytics-table__path">{p.path}</span>
                    <span className="analytics-table__count">{p.views}</span>
                  </div>
                ))
              )}
            </div>
            <div className="analytics-table">
              <div className="analytics-table__header">Top Referrers</div>
              {data.topReferrers.length === 0 ? (
                <div className="analytics-table__row">
                  <span>No referrer data yet</span>
                </div>
              ) : (
                data.topReferrers.map((r) => (
                  <div key={r.referrer} className="analytics-table__row">
                    <span className="analytics-table__path">
                      {r.referrer.length > 40
                        ? r.referrer.substring(0, 40) + '...'
                        : r.referrer}
                    </span>
                    <span className="analytics-table__count">{r.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
