import { search, sites } from '@himeka/booru'
import { settings, store } from '@/store'

const supportedHosts = new Set(['yande.re', 'konachan.com', 'konachan.net', 'danbooru.donmai.us', 'gelbooru.com'])
export const isBooruSite = () => supportedHosts.has(location.host)

export const siteDomains = [...supportedHosts]
export const isSupportTagSearch = isBooruSite()
export const notPartialSupportSite = isBooruSite()

export const defCompTags = (() => {
  if (store.isYKSite) {
    return ['rating:s', 'rating:q', 'rating:e', 'order:score', 'order:vote', 'order:mpixels', 'order:landscape', 'order:portrait']
  }
  if (location.host.includes('danbooru')) {
    return ['order:rank', 'order:score', 'order:favcount', 'order:none', 'order:upvotes', 'rating:general', 'rating:questionable', 'rating:explicit', 'rating:sensitive', 'order:landscape', 'order:portrait', 'order:mpixels']
  }
  if (location.host === 'gelbooru.com') {
    return ['rating:safe', 'rating:questionable', 'rating:explicit', 'sort:score']
  }
  return []
})()

const specTitleMap: Record<string, string> = {
  'yande.re': 'yande.re',
  'konachan.com': 'Koanchan',
  'konachan.net': 'Koanchan(Safe)',
  'sakugabooru.com': 'sakugabooru'.toUpperCase(),
  'behoimi.org': '3dbooru',
  'rule34.paheal.net': 'Rule34.Paheal',
  'booru.allthefallen.moe': 'ATFBooru',
  'aibooru.online': 'AIBooru',
  'sankaku.app': 'Sankaku APP',
  'www.sankakucomplex.com': 'Sankaku Complex',
  'chan.sankakucomplex.com': 'Sankaku Complex',
  'www.idolcomplex.com': 'Idol Complex',
  'anime-pictures.net': 'Anime Pictures',
  'allgirl.booru.org': 'All girl',
  'booru.eu': 'Hentai Booru',
  'rule34hentai.net': 'Rule34Hentai',
}

export function getSiteTitle(domain: string = location.host) {
  const host = domain.toLowerCase().replace('www.', '')
  return specTitleMap[host] || (host[0].toUpperCase() + host.slice(1).split('.')[0])
}

const defaultLimitMap: Record<string, number> = {
  'yande.re': 40,
  'konachan.com': 21,
  'konachan.net': 21,
  'danbooru.donmai.us': 20,
  'gelbooru.com': 42,
  'rule34.xxx': 42,
  'safebooru.org': 40,
  'tbib.org': 42,
  'xbooru.com': 42,
  'rule34.paheal.net': 70,
  'realbooru.com': 42,
}

export const BOORU_PAGE_LIMIT = defaultLimitMap[location.host] || 40

export const isPidSite = () => sites[location.host]?.paginate === 'pid'

export async function searchBooru(page: number, tags: string | null) {
  if (!tags || tags === 'all') tags = ''
  return search(location.host, tags, {
    page,
    limit: BOORU_PAGE_LIMIT,
    credentials: {
      query: settings.credentialQuery,
    },
  })
}

export const booruAction = {
  is: isBooruSite,
  posts: async (page: number, tags: string | null) => {
    if (settings.isHoldsFalse) tags = `holds:false ${tags || ''}`.trim()
    const results = await searchBooru(page, tags)
    return results
  },
}
