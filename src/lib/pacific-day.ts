// Visitor analytics count a "day" as the Pacific calendar day (America/Los_Angeles),
// not the UTC day (which rolls over at 4-5 pm Pacific). Pure functions with no
// server-only imports, so the admin dashboard (client) and the API routes share them.
//
// The stored page-views.sessionDate / analytics-summary.date values are day LABELS:
// `${pacificDay}T00:00:00.000Z`. They are not the instant a Pacific day began, so
// no query needs a Pacific-midnight instant; the labels are compared as labels.

const PACIFIC_TIME_ZONE = 'America/Los_Angeles'

const pacificDateFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: PACIFIC_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Pacific calendar date ('YYYY-MM-DD') of an instant. Handles PST/PDT automatically. */
export function getPacificDay(instant: Date = new Date()): string {
  // formatToParts rather than relying on the exact string en-CA happens to produce.
  const parts = pacificDateFormat.formatToParts(instant)
  const get = (type: 'year' | 'month' | 'day') => parts.find((p) => p.type === type)?.value
  const year = get('year')
  const month = get('month')
  const day = get('day')
  if (!year || !month || !day) {
    throw new RangeError(`Cannot compute Pacific day for ${String(instant)}`)
  }
  return `${year}-${month}-${day}`
}

/**
 * The calendar date `days` days before a 'YYYY-MM-DD' date (negative `days` goes
 * forward). Pure calendar arithmetic on the date string in UTC, so it is independent
 * of the process time zone and of daylight-saving changes (a Pacific day is 23 or 25
 * hours long twice a year, but it is still exactly one calendar day).
 */
export function pacificDaysBefore(dateStr: string, days: number): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (!match) throw new RangeError(`Expected YYYY-MM-DD, got ${dateStr}`)
  const [, y, m, d] = match
  const shifted = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d) - days))
  return shifted.toISOString().slice(0, 10)
}
