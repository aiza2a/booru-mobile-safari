import assert from 'node:assert/strict'

function parse(urlText) {
  const url = new URL(urlText)
  const params = url.searchParams
  const tags = params.get('tags') || ''
  const today = '2026-07-11'
  const periods = { '1d': 'day', '1w': 'week', '1m': 'month', '1y': 'year' }
  let mode = 'all'; let scale = 'day'; let date = params.get('date') || today; let routeKind = 'home'
  if (/\/post\/popular_recent/.test(url.pathname)) { routeKind = 'popular'; mode = 'latest'; scale = periods[params.get('period') || '1d'] }
  else if (/\/post\/popular_by_/.test(url.pathname)) {
    routeKind = 'popular'; mode = 'date'; scale = url.pathname.match(/popular_by_(\w+)/)[1]
    date = `${params.get('year')}-${params.get('month').padStart(2, '0')}-${params.get('day').padStart(2, '0')}`
  } else if (url.pathname.startsWith('/explore/posts/')) {
    routeKind = url.pathname.endsWith('viewed') ? 'viewed' : 'popular'; mode = 'date'; scale = params.get('scale') || 'day'
  } else {
    if (/order:(rank|score)/.test(tags)) routeKind = 'ranked'
    const exact = tags.match(/date:(\d{4}-\d{2}-\d{2})/)?.[1]
    if (exact) { mode = 'date'; date = exact }
    if (/order:rank/.test(tags) && params.get('d')) { mode = 'latest'; scale = ({ '1': 'day', '7': 'week', '30': 'month', '365': 'year' })[params.get('d')] }
  }
  return { mode, scale, date, routeKind }
}

assert.deepEqual(parse('https://yande.re/post?tags=date%3A2026-07-07&_wf=1'), { mode: 'date', scale: 'day', date: '2026-07-07', routeKind: 'home' })
assert.deepEqual(parse('https://yande.re/post/popular_recent?period=1w&_wf=1'), { mode: 'latest', scale: 'week', date: '2026-07-11', routeKind: 'popular' })
assert.deepEqual(parse('https://yande.re/post/popular_by_month?day=7&month=6&year=2026&_wf=1'), { mode: 'date', scale: 'month', date: '2026-06-07', routeKind: 'popular' })
assert.deepEqual(parse('https://danbooru.donmai.us/explore/posts/viewed?date=2026-07-07&scale=month&_wf=1'), { mode: 'date', scale: 'month', date: '2026-07-07', routeKind: 'viewed' })
assert.deepEqual(parse('https://danbooru.donmai.us/posts?tags=order%3Arank&d=30&_wf=1'), { mode: 'latest', scale: 'month', date: '2026-07-11', routeKind: 'ranked' })
console.log('date route parser verification: ok')
