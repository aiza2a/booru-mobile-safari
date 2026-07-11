import { type DateScale, buildDateTags, getDateRange } from './date-filter'

export type SupportedDateSite = 'yandere' | 'konachan-com' | 'konachan-net' | 'danbooru' | 'gelbooru'
export type DateRouteKind = 'home' | 'random' | 'popular' | 'viewed' | 'ranked' | 'updated'

export interface DateRouteInput {
  site: SupportedDateSite
  kind: DateRouteKind
  date: string
  scale: DateScale
  mode?: 'all' | 'latest' | 'date'
  rangeStart?: string
  rangeEnd?: string
}

export const siteDateCapabilities: Record<SupportedDateSite, DateRouteKind[]> = {
  'yandere': ['home', 'random', 'popular'],
  'konachan-com': ['home', 'random', 'popular'],
  'konachan-net': ['home', 'random', 'popular'],
  'danbooru': ['home', 'popular', 'viewed', 'ranked'],
  'gelbooru': ['home', 'ranked', 'updated'],
}

const moeOrigin = (site: SupportedDateSite) => {
  if (site === 'yandere') return 'https://yande.re'
  if (site === 'konachan-com') return 'https://konachan.com'
  return 'https://konachan.net'
}

const encodedTags = (tags: string) => encodeURIComponent(tags).replace(/%20/g, '+')

export function buildDateRoute(input: DateRouteInput) {
  const { site, kind, date, scale } = input
  const range = getDateRange(date, scale)
  if (!siteDateCapabilities[site].includes(kind)) {
    throw new Error(`${site} does not support ${kind} date routes`)
  }

  if (input.mode === 'date' && scale === 'range') {
    const start = input.rangeStart || date
    const end = input.rangeEnd || date
    const tags = `date:>=${start} date:<=${end}`
    if (site === 'yandere' || site.startsWith('konachan')) return `${moeOrigin(site)}/post?tags=${encodedTags(tags)}&_wf=1`
    if (site === 'danbooru') {
      const order = kind === 'ranked' ? 'order:score ' : ''
      return `https://danbooru.donmai.us/posts?tags=${encodedTags(`${order}${tags}`)}&_wf=1`
    }
  }

  if (input.mode === 'all') {
    if (site === 'yandere') return 'https://yande.re/post?_wf=1'
    if (site === 'konachan-com') return 'https://konachan.com/post?_wf=1'
    if (site === 'konachan-net') return 'https://konachan.net/post?_wf=1'
    if (site === 'danbooru') return 'https://danbooru.donmai.us/posts?_wf=1'
  }

  if (site === 'yandere' || site.startsWith('konachan')) {
    const origin = moeOrigin(site)
    if (kind === 'popular') {
      if (input.mode === 'latest') {
        const period = { day: '1d', week: '1w', month: '1m', year: '1y' }[scale]
        return `${origin}/post/popular_recent?period=${period}&_wf=1`
      }
      const pathScale = scale === 'year' ? 'month' : scale
      const [year, month, day] = range.date.split('-')
      return `${origin}/post/popular_by_${pathScale}?day=${Number(day)}&month=${Number(month)}&year=${year}&_wf=1`
    }
    const terms = [kind === 'random' ? 'order:random' : '', buildDateTags(date, scale)].filter(Boolean).join(' ')
    return `${origin}/post?tags=${encodedTags(terms)}&_wf=1`
  }

  if (site === 'danbooru') {
    if (kind === 'ranked' && input.mode === 'latest') {
      const days = { day: 1, week: 7, month: 30, year: 365 }[scale]
      return `https://danbooru.donmai.us/posts?tags=order%3Arank&d=${days}&date_mode=latest&date_scale=${scale}&_wf=1`
    }
    if (kind === 'popular' || kind === 'viewed') {
      const explore = kind === 'viewed' ? 'viewed' : 'popular'
      return `https://danbooru.donmai.us/explore/posts/${explore}?date=${range.date}&scale=${scale}&_wf=1`
    }
    const order = kind === 'ranked' ? 'order:score ' : ''
    return `https://danbooru.donmai.us/posts?tags=${encodedTags(`${order}${buildDateTags(date, scale)}`)}&_wf=1`
  }

  const order = kind === 'ranked' ? 'sort:score:desc ' : kind === 'updated' ? 'sort:updated:desc ' : ''
  return `https://gelbooru.com/index.php?page=post&s=list&tags=${encodedTags(`${order}${buildDateTags(date, scale)}`)}&_wf=1`
}
