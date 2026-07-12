import assert from 'node:assert/strict'

const formatISODate = date => {
  const pad = value => value.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function getRecentStartDate(scale, now) {
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12)
  const days = { day: 1, week: 7, month: 30, year: 365 }[scale]
  start.setDate(start.getDate() - days)
  return formatISODate(start)
}

function normaliseTags(url, kind) {
  const previousBoundary = url.searchParams.get('recent_start_id')
  const terms = (url.searchParams.get('tags') || '').split(/\s+/).filter(Boolean)
    .filter(term => !/^sort:(score|updated)(?::(?:asc|desc))?$/i.test(term))
    .filter(term => !previousBoundary || term !== `id:>=${previousBoundary}`)
  terms.push(kind === 'ranked' ? 'sort:score:desc' : 'sort:updated:desc')
  return terms
}

function build(kind, scale, startId, input) {
  const current = new URL(input)
  const url = new URL('/index.php', 'https://gelbooru.com')
  const terms = normaliseTags(current, kind)
  terms.unshift(`id:>=${startId}`)
  url.searchParams.set('page', 'post'); url.searchParams.set('s', 'list')
  url.searchParams.set('tags', terms.join(' ')); url.searchParams.set('date_mode', 'latest')
  url.searchParams.set('date_scale', scale); url.searchParams.set('recent_start_id', `${startId}`); url.searchParams.set('_wf', '1')
  return url
}

const now = new Date('2026-07-12T12:00:00')
assert.equal(getRecentStartDate('day', now), '2026-07-11')
assert.equal(getRecentStartDate('week', now), '2026-07-05')
assert.equal(getRecentStartDate('month', now), '2026-06-12')
assert.equal(getRecentStartDate('year', now), '2025-07-12')

const ranked = build('ranked', 'week', 14460000, 'https://gelbooru.com/index.php?page=post&s=list&tags=sort%3Ascore%3Adesc')
assert.equal(ranked.searchParams.get('tags'), 'id:>=14460000 sort:score:desc')
assert.equal(ranked.searchParams.get('date_mode'), 'latest')
assert.equal(ranked.searchParams.get('date_scale'), 'week')

const updated = build('updated', 'month', 14000000, 'https://gelbooru.com/index.php?page=post&s=list&tags=blue_hair%20sort%3Aupdated%3Adesc')
assert.equal(updated.searchParams.get('tags'), 'id:>=14000000 blue_hair sort:updated:desc')

const replaced = build('ranked', 'day', 14470000, 'https://gelbooru.com/index.php?page=post&s=list&tags=id%3A%3E%3D14460000%20sort%3Ascore%3Adesc&recent_start_id=14460000')
assert.equal(replaced.searchParams.get('tags'), 'id:>=14470000 sort:score:desc')
console.log('gelbooru recent route verification: ok')
