import type { DateScale } from './date-filter'
import type { DateRouteKind } from '@/store/date-filter'

const CACHE_KEY = 'BMS_GELBOORU_RECENT_ID_V1'
const CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const REQUEST_TIMEOUT = 12000
const GELBOORU_ORIGIN = 'https://gelbooru.com'

type RecentKind = Extract<DateRouteKind, 'ranked' | 'updated'>

interface CachedBoundary {
  id: number
  checkedAt: number
}

interface BoundaryCache {
  [date: string]: CachedBoundary
}

interface GelbooruPostAnchor {
  id: number
  date: string
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

function formatISODate(date: Date) {
  const pad = (value: number) => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
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

function parsePostedDate(html: string) {
  const text = new DOMParser().parseFromString(html, 'text/html').body.textContent || ''
  return text.match(/Posted:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || null
}

async function fetchPostDate(id: number) {
  const html = await requestText(`${GELBOORU_ORIGIN}/index.php?page=post&s=view&id=${id}`)
  return parsePostedDate(html)
}

async function fetchFirstPostId(tags: string) {
  const url = new URL('/index.php', GELBOORU_ORIGIN)
  url.searchParams.set('page', 'post')
  url.searchParams.set('s', 'list')
  url.searchParams.set('tags', tags)
  return parseFirstPostId(await requestText(url.href))
}

async function resolvePostAtOrAfter(id: number): Promise<GelbooruPostAnchor | null> {
  const exactDate = await fetchPostDate(id)
  if (exactDate) return { id, date: exactDate }

  const nextId = await fetchFirstPostId(`id:>=${id} sort:id:asc`)
  if (!nextId) return null
  const nextDate = await fetchPostDate(nextId)
  return nextDate ? { id: nextId, date: nextDate } : null
}

async function getLatestPostId() {
  const id = await fetchFirstPostId('sort:id:desc')
  if (!id) throw new Error('Gelbooru latest post was not found')
  return id
}

async function findBoundaryId(targetDate: string) {
  let low = 1
  let high = await getLatestPostId()
  let iterations = 0

  while (low < high && iterations < 32) {
    iterations += 1
    const middle = Math.floor((low + high) / 2)
    const post = await resolvePostAtOrAfter(middle)
    if (!post) {
      high = middle
      continue
    }
    if (post.date < targetDate) low = post.id + 1
    else high = middle
  }

  const boundary = await resolvePostAtOrAfter(low)
  if (!boundary || boundary.date < targetDate) throw new Error('Gelbooru recent boundary was not found')
  return boundary.id
}

export async function getGelbooruRecentStartId(scale: DateScale) {
  const targetDate = getGelbooruRecentStartDate(scale)
  const cache = readCache()
  const cached = cache[targetDate]
  if (cached && Date.now() - cached.checkedAt < CACHE_TTL) return cached.id

  const pending = pendingBoundaries.get(targetDate)
  if (pending) return pending

  const request = findBoundaryId(targetDate)
    .then(id => {
      cache[targetDate] = { id, checkedAt: Date.now() }
      writeCache(cache)
      return id
    })
    .finally(() => pendingBoundaries.delete(targetDate))
  pendingBoundaries.set(targetDate, request)
  return request
}

function normaliseTags(url: URL, kind: RecentKind) {
  const previousBoundary = url.searchParams.get('recent_start_id')
  const terms = (url.searchParams.get('tags') || '')
    .split(/\s+/)
    .filter(Boolean)
    .filter(term => !/^sort:(score|updated)(?::(?:asc|desc))?$/i.test(term))
    .filter(term => !previousBoundary || term !== `id:>=${previousBoundary}`)
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
