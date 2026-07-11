import type { DateRouteKind, SupportedDateSite } from '@/utils/site-date-routes'

export interface SiteDateCapability {
  site: SupportedDateSite
  routes: DateRouteKind[]
  latestRoutes: DateRouteKind[]
  scales: Record<DateRouteKind, ('day' | 'week' | 'month' | 'year')[]>
}

const allScales = ['day', 'week', 'month', 'year'] as const
const moeScales = {
  home: [...allScales],
  random: [...allScales],
  popular: [...allScales],
  viewed: [],
  ranked: [],
  updated: [],
}

export const siteCapabilities: Record<SupportedDateSite, SiteDateCapability> = {
  'yandere': {
    site: 'yandere',
    routes: ['home', 'random', 'popular'],
    latestRoutes: ['popular'],
    scales: moeScales,
  },
  'konachan-com': {
    site: 'konachan-com',
    routes: ['home', 'random', 'popular'],
    latestRoutes: ['popular'],
    scales: moeScales,
  },
  'konachan-net': {
    site: 'konachan-net',
    routes: ['home', 'random', 'popular'],
    latestRoutes: ['popular'],
    scales: moeScales,
  },
  'danbooru': {
    site: 'danbooru',
    routes: ['home', 'popular', 'viewed', 'ranked'],
    latestRoutes: ['ranked'],
    scales: {
      home: [...allScales],
      random: [],
      popular: [...allScales],
      viewed: [...allScales],
      ranked: [...allScales],
      updated: [],
    },
  },
  'gelbooru': {
    site: 'gelbooru',
    routes: [],
    latestRoutes: [],
    scales: {
      home: [...allScales],
      random: [],
      popular: [],
      viewed: [],
      ranked: [...allScales],
      updated: [...allScales],
    },
  },
}

export function currentDateSite(): SupportedDateSite | null {
  if (location.hostname === 'yande.re') return 'yandere'
  if (location.hostname === 'konachan.com') return 'konachan-com'
  if (location.hostname === 'konachan.net') return 'konachan-net'
  if (location.hostname === 'danbooru.donmai.us') return 'danbooru'
  if (location.hostname === 'gelbooru.com') return 'gelbooru'
  return null
}

export function currentRouteKind(): DateRouteKind | null {
  const path = location.pathname
  const tags = new URLSearchParams(location.search).get('tags') || ''
  if (/\/post\/popular_/.test(path)) return 'popular'
  if (path === '/explore/posts/viewed') return 'viewed'
  if (path === '/explore/posts/popular') return 'popular'
  if (/order:(rank|score)/.test(tags) || /sort:score/.test(tags)) return 'ranked'
  if (/sort:updated/.test(tags)) return 'updated'
  if (/order:random/.test(tags)) return 'random'
  if (path === '/post' || path === '/posts' || location.hostname === 'gelbooru.com') return 'home'
  return null
}
