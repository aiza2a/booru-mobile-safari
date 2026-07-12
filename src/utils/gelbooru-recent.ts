import type { DateScale } from './date-filter'
import type { DateRouteKind } from '@/store/date-filter'

const CACHE_KEY = 'BMS_GELBOORU_RECENT_ID_V2'
const LATEST_CACHE_KEY = 'BMS_GELBOORU_LATEST_ID_V1'
const CACHE_TTL = 6 * 60 * 60 * 1000
const LATEST_CACHE_TTL = 6 * 60 * 60 * 1000
const REQUEST_TIMEOUT = 6000
const GELBOORU_ORIGIN = 'https://gelbooru.com'

type RecentKind = Extract<DateRouteKind, 'ranked' | 'updated'>

interface CachedBoundary {
  id: number
  checkedAt: number
}

interface BoundaryCache {
  [date: string]: CachedBoundary
}

interface LatestPostCache {
  id: number
  checkedAt: number
}

const pendingBoundaries = new Map<string, Promise<number>>()

function readCache(): BoundaryCache {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}')
  } catch (_error) {
    return {}
  }
}

function writeCache(cache: BoundaryCache) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch (_error) {}
}

function readLatestCache(): LatestPostCache | null {
  try {
    return JSON.parse(localStorage.getItem(LATEST_CACHE_KEY) || 'null')
  } catch (_error) {
    return null
  }
}

function writeLatestCache(id: number) {
  try {
    localStorage.setItem(LATEST_CACHE_KEY, JSON.stringify({ id, checkedAt: Date.now() }))
  } catch (_error) {}
}

function formatISODate(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

const gelbooruDateAnchors = [
  ['2007-07-16', 1], ['2008-01-01', 132204], ['2009-01-01', 407581],
  ['2010-01-01', 676805], ['2011-01-01', 1020436], ['2012-01-01', 1382384],
  ['2013-01-01', 1757245], ['2014-01-01', 2116687], ['2015-01-01', 2536659],
  ['2016-01-01', 2994708], ['2017-01-01', 3497715], ['2018-01-01', 4038325],
  ['2019-01-01', 4550300], ['2020-01-01', 5065398], ['2021-01-01', 5781187],
  ['2022-01-01', 6790766], ['2023-01-01', 8084028], ['2024-01-01', 9425769],
  ['2025-01-01', 11229486], ['2026-01-01', 13222588],
] as const

function dateValue(dateText: string) {
  return new Date(`${dateText}T12:00:00`).valueOf()
}

function estimateDateId(latestId: number, dateText: string, now = new Date()) {
  const anchors = [...gelbooruDateAnchors, [formatISODate(now), latestId] as const]
  const target = dateValue(dateText)
  if (target <= dateValue(anchors[0][0])) return { id: 1, dailyRate: 1000 }
  if (target >= dateValue(anchors[anchors.length - 1][0])) return { id: latestId, dailyRate: 7600 }

  for (let index = 0; index < anchors.length - 1; index += 1) {
    const lower = anchors[index]
    const upper = anchors[index + 1]
    const lowerDate = dateValue(lower[0])
    const upperDate = dateValue(upper[0])
    if (target < lowerDate || target > upperDate) continue
    const ratio = (target - lowerDate) / (upperDate - lowerDate)
    const spanDays = Math.max(1, (upperDate - lowerDate) / 86400000)
    const dailyRate = (upper[1] - lower[1]) / spanDays
    return { id: Math.round(lower[1] + (upper[1] - lower[1]) * ratio), dailyRate }
  }
  return { id: latestId, dailyRate: 7600 }
}

export function estimateGelbooruDateRangeIds(latestId: number, startDate: string, endDate: string, now = new Date()) {
  const start = estimateDateId(latestId, startDate, now)
  const end = estimateDateId(latestId, endDate, now)
  const startSafety = Math.max(1000, Math.round(start.dailyRate * 2))
  const endSafety = Math.max(1000, Math.round(end.dailyRate * 2))
  return {
    startId: Math.max(1, start.id - startSafety),
    endId: Math.min(latestId, end.id + endSafety),
  }
}

export function getGelbooruRecentStartDate(scale: DateScale, now = new Date()) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const days = { day: 1, week: 7, month: 30, year: 365, range: 1 }[scale]
  start.setDate(start.getDate() - days)
  return formatISODate(start)
}

async function requestText(url: string) {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  try {
    const response = await fetch(url, { signal: controller.signal, credentials: 'same-origin' })
    if (!response.ok) throw new Error(`Gelbooru request failed: ${response.status}`)
    return await response.text()
  } finally {
    window.clearTimeout(timeout)
  }
}

function parseFirstPostId(html: string) {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const href = doc.querySelector<HTMLAnchorElement>('.thumbnail-container .thumbnail-preview a[href*="s=view"]')?.href
    || doc.querySelector<HTMLAnchorElement>('.thumbnail-preview a[href*="s=view"]')?.href
  const id = Number(href?.match(/[?&]id=(\d+)/)?.[1])
  return Number.isFinite(id) && id > 0 ? id : null
}

async function fetchFirstPostId(tags: string) {
  const url = new URL('/index.php', GELBOORU_ORIGIN)
  url.searchParams.set('page', 'post')
  url.searchParams.set('s', 'list')
  url.searchParams.set('tags', tags)
  return parseFirstPostId(await requestText(url.href))
}

export function estimateGelbooruRecentStartId(latestId: number, scale: DateScale) {
  const postsPerDay = 7600
  const days = { day: 1, week: 7, month: 30, year: 365, range: 1 }[scale]
  const safetyDays = { day: 1, week: 2, month: 5, year: 30, range: 1 }[scale]
  return Math.max(1, Math.floor(latestId - postsPerDay * (days + safetyDays)))
}

async function getLatestPostId() {
  const cached = readLatestCache()
  if (cached && Date.now() - cached.checkedAt < LATEST_CACHE_TTL) return cached.id
  const id = await fetchFirstPostId('sort:id:desc')
  if (!id) throw new Error('Gelbooru latest post was not found')
  writeLatestCache(id)
  return id
}

async function findBoundaryId(scale: DateScale) {
  return estimateGelbooruRecentStartId(await getLatestPostId(), scale)
}

export async function getGelbooruRecentStartId(scale: DateScale) {
  const cacheKey = scale
  const cache = readCache()
  const cached = cache[cacheKey]
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL) return cached.id

  const pending = pendingBoundaries.get(cacheKey)
  if (pending) return pending

  const request = findBoundaryId(scale)
    .then(id => {
      cache[cacheKey] = { id, checkedAt: Date.now() }
      writeCache(cache)
      return id
    })
    .finally(() => pendingBoundaries.delete(cacheKey))
  pendingBoundaries.set(cacheKey, request)
  return request
}

function normaliseTags(url: URL, kind: RecentKind) {
  const generatedIds = [
    url.searchParams.get('recent_start_id'),
    url.searchParams.get('range_start_id'),
    url.searchParams.get('range_end_id'),
  ].filter(Boolean)
  const terms = (url.searchParams.get('tags') || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter(term => !/^sort:(score|updated)(?::(?:asc|desc))?$/i.test(term))
    .filter(term => !generatedIds.some(id => term === `id:>=${id}` || term === `id:<=${id}`))
  terms.push(kind === 'ranked' ? 'sort:score:desc' : 'sort:updated:desc')
  return terms
}

export function buildGelbooruAllRoute(kind: RecentKind, currentUrl = new URL(location.href)) {
  const url = new URL('/index.php', GELBOORU_ORIGIN)
  url.searchParams.set('page', 'post')
  url.searchParams.set('s', 'list')
  url.searchParams.set('tags', normaliseTags(currentUrl, kind).join(' '))
  url.searchParams.set('date_mode', 'all')
  url.searchParams.set('_wf', '1')
  return url.href
}

export function buildGelbooruRecentRouteWithId(kind: RecentKind, scale: DateScale, startId: number, currentUrl = new URL(location.href)) {
  const url = new URL('/index.php', GELBOORU_ORIGIN)
  const terms = normaliseTags(currentUrl, kind)
  terms.unshift(`id:>=${startId}`)
  url.searchParams.set('page', 'post')
  url.searchParams.set('s', 'list')
  url.searchParams.set('tags', terms.join(' '))
  url.searchParams.set('date_mode', 'latest')
  url.searchParams.set('date_scale', scale)
  url.searchParams.set('recent_start_id', `${startId}`)
  url.searchParams.set('_wf', '1')
  return url.href
}

export async function buildGelbooruRecentRoute(kind: RecentKind, scale: DateScale, currentUrl = new URL(location.href)) {
  const startId = await getGelbooruRecentStartId(scale)
  return buildGelbooruRecentRouteWithId(kind, scale, startId, currentUrl)
}

export async function buildGelbooruRangeRoute(kind: RecentKind, rangeStart: string, rangeEnd: string, currentUrl = new URL(location.href)) {
  const latestId = await getLatestPostId()
  const [startDate, endDate] = [rangeStart, rangeEnd].sort()
  const { startId, endId } = estimateGelbooruDateRangeIds(latestId, startDate, endDate)
  const url = new URL('/index.php', GELBOORU_ORIGIN)
  const terms = normaliseTags(currentUrl, kind)
  terms.unshift(`id:>=${startId}`, `id:<=${endId}`)
  url.searchParams.set('page', 'post')
  url.searchParams.set('s', 'list')
  url.searchParams.set('tags', terms.join(' '))
  url.searchParams.set('date_mode', 'latest')
  url.searchParams.set('date_scale', 'range')
  url.searchParams.set('range_start', startDate)
  url.searchParams.set('range_end', endDate)
  url.searchParams.set('range_start_id', `${startId}`)
  url.searchParams.set('range_end_id', `${endId}`)
  url.searchParams.set('_wf', '1')
  return url.href
}
