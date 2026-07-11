import assert from 'node:assert/strict'

const pad = value => value.toString().padStart(2, '0')
const formatISODate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
function getDateRange(dateText, scale) {
  const date = new Date(`${dateText}T12:00:00`)
  const start = new Date(date)
  const end = new Date(date)
  if (scale === 'week') {
    const day = (date.getDay() + 6) % 7
    start.setDate(date.getDate() - day)
    end.setDate(start.getDate() + 6)
  } else if (scale === 'month') {
    start.setDate(1); end.setMonth(start.getMonth() + 1, 0)
  } else if (scale === 'year') {
    start.setMonth(0, 1); end.setMonth(11, 31)
  }
  return { date: formatISODate(date), start: formatISODate(start), end: formatISODate(end), scale }
}
const buildDateTags = (date, scale) => {
  const range = getDateRange(date, scale)
  return scale === 'day' ? `date:${range.date}` : `date:>=${range.start} date:<=${range.end}`
}
const encodedTags = tags => encodeURIComponent(tags).replace(/%20/g, '+')
function buildDateRoute({ site, kind, date, scale, mode }) {
  const range = getDateRange(date, scale)
  if (site === 'yandere' || site.startsWith('konachan')) {
    const origin = site === 'yandere' ? 'https://yande.re' : site === 'konachan-com' ? 'https://konachan.com' : 'https://konachan.net'
    if (kind === 'popular') {
      if (mode === 'latest') return `${origin}/post/popular_recent?period=${{ day: '1d', week: '1w', month: '1m', year: '1y' }[scale]}&_wf=1`
      const [year, month, day] = range.date.split('-')
      return `${origin}/post/popular_by_${scale === 'year' ? 'month' : scale}?day=${Number(day)}&month=${Number(month)}&year=${year}&_wf=1`
    }
    return `${origin}/post?tags=${encodedTags([kind === 'random' ? 'order:random' : '', buildDateTags(date, scale)].filter(Boolean).join(' '))}&_wf=1`
  }
  if (site === 'danbooru') {
    if (kind === 'popular' || kind === 'viewed') return `https://danbooru.donmai.us/explore/posts/${kind}?date=${range.date}&scale=${scale}&_wf=1`
    return `https://danbooru.donmai.us/posts?tags=${encodedTags(`${kind === 'ranked' ? 'order:score ' : ''}${buildDateTags(date, scale)}`)}&_wf=1`
  }
  const order = kind === 'ranked' ? 'sort:score:desc ' : kind === 'updated' ? 'sort:updated:desc ' : ''
  return `https://gelbooru.com/index.php?page=post&s=list&tags=${encodedTags(`${order}${buildDateTags(date, scale)}`)}&_wf=1`
}

assert.deepEqual(getDateRange('2024-02-15', 'month'), { date: '2024-02-15', start: '2024-02-01', end: '2024-02-29', scale: 'month' })
assert.deepEqual(getDateRange('2026-07-08', 'week'), { date: '2026-07-08', start: '2026-07-06', end: '2026-07-12', scale: 'week' })
assert.equal(buildDateTags('2026-07-07', 'week'), 'date:>=2026-07-06 date:<=2026-07-12')
assert.equal(buildDateRoute({ site: 'yandere', kind: 'popular', date: '2026-07-07', scale: 'week', mode: 'latest' }), 'https://yande.re/post/popular_recent?period=1w&_wf=1')
assert.equal(buildDateRoute({ site: 'konachan-com', kind: 'random', date: '2026-07-07', scale: 'day' }), 'https://konachan.com/post?tags=order%3Arandom+date%3A2026-07-07&_wf=1')
assert.equal(buildDateRoute({ site: 'danbooru', kind: 'viewed', date: '2026-07-07', scale: 'month' }), 'https://danbooru.donmai.us/explore/posts/viewed?date=2026-07-07&scale=month&_wf=1')
assert.equal(buildDateRoute({ site: 'gelbooru', kind: 'ranked', date: '2026-07-07', scale: 'week' }), 'https://gelbooru.com/index.php?page=post&s=list&tags=sort%3Ascore%3Adesc+date%3A%3E%3D2026-07-06+date%3A%3C%3D2026-07-12&_wf=1')
console.log('date route verification: ok')
