import { type DateScale, clampFutureDate, formatISODate, getDateRange } from './date-filter'
import type { DateFilterMode, DateRouteKind } from '@/store/date-filter'

export interface ParsedDateRoute {
  mode: DateFilterMode
  scale: DateScale
  date: string
  routeKind: DateRouteKind
}

const periodScale: Record<string, DateScale> = { '1d': 'day', '1w': 'week', '1m': 'month', '1y': 'year' }
const pathScale: Record<string, DateScale> = { day: 'day', week: 'week', month: 'month', year: 'year' }
const dScale: Record<string, DateScale> = { 1: 'day', 7: 'week', 30: 'month', 365: 'year' }

function parseTagDate(tags: string) {
  const exact = tags.match(/(?:^|\s)date:(\d{4}-\d{2}-\d{2})(?:\s|$)/)?.[1]
  const start = tags.match(/date:>=(\d{4}-\d{2}-\d{2})/)?.[1]
  const end = tags.match(/date:<=(\d{4}-\d{2}-\d{2})/)?.[1]
  if (exact) return { date: exact, scale: 'day' as DateScale }
  if (!start || !end) return null
  const startDate = new Date(`${start}T12:00:00`)
  const endDate = new Date(`${end}T12:00:00`)
  const days = Math.round((endDate.valueOf() - startDate.valueOf()) / 86400000) + 1
  const scale: DateScale = days <= 7 ? 'week' : days <= 31 ? 'month' : 'year'
  return { date: start, scale }
}

export function parseDateRoute(url = new URL(location.href)): ParsedDateRoute {
  const params = url.searchParams
  const tags = params.get('tags') || ''
  const today = formatISODate(new Date())
  let routeKind: DateRouteKind = 'home'
  let mode: DateFilterMode = 'all'
  let scale: DateScale = 'day'
  let date = params.get('date') || params.get('date_filter') || today

  if (/\/post\/popular_recent/.test(url.pathname)) {
    routeKind = 'popular'
    mode = 'latest'
    scale = periodScale[params.get('period') || '1d'] || 'day'
  } else if (/\/post\/popular_by_/.test(url.pathname)) {
    routeKind = 'popular'
    mode = 'date'
    scale = pathScale[url.pathname.match(/popular_by_(\w+)/)?.[1] || 'day'] || 'day'
    const year = params.get('year') || today.slice(0, 4)
    const month = (params.get('month') || '1').padStart(2, '0')
    const day = (params.get('day') || '1').padStart(2, '0')
    date = `${year}-${month}-${day}`
  } else if (url.pathname === '/explore/posts/viewed' || url.pathname === '/explore/posts/popular') {
    routeKind = url.pathname.endsWith('viewed') ? 'viewed' : 'popular'
    mode = 'date'
    scale = pathScale[params.get('scale') || 'day'] || 'day'
  } else {
    if (/order:random/.test(tags)) routeKind = 'random'
    if (/order:(rank|score)/.test(tags) || /sort:score/.test(tags)) routeKind = 'ranked'
    if (/sort:updated/.test(tags)) routeKind = 'updated'
    const parsedTags = parseTagDate(tags)
    if (parsedTags) {
      mode = 'date'
      date = parsedTags.date
      scale = parsedTags.scale
    }
    if (/order:rank/.test(tags) && params.get('d')) {
      mode = 'latest'
      scale = dScale[params.get('d') || '1'] || 'day'
    }
  }

  const explicitScale = params.get('date_scale') as DateScale
  if (['day', 'week', 'month', 'year'].includes(explicitScale)) scale = explicitScale
  const explicitMode = params.get('date_mode') as DateFilterMode
  if (['all', 'latest', 'date'].includes(explicitMode)) mode = explicitMode
  date = clampFutureDate(date)
  return { mode, scale, date, routeKind }
}

export function rangeAnchor(date: string, scale: DateScale) {
  return getDateRange(date, scale).start
}
