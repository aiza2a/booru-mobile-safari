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
  const generatedIds = [url.searchParams.get('recent_start_id'), url.searchParams.get('range_start_id'), url.searchParams.get('range_end_id')].filter(Boolean)
  const terms = (url.searchParams.get('tags') || '').split(/\s+/).filter(Boolean)
    .filter(term => !/^sort:(score|updated)(?::(?:asc|desc))?$/i.test(term))
    .filter(term => !generatedIds.some(id => term === `id:>=${id}` || term === `id:<=${id}`))
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

function estimate(latestId, scale) {
  const postsPerDay = 7600
  const days = { day: 1, week: 7, month: 30, year: 365 }[scale]
  const safetyDays = { day: 1, week: 2, month: 5, year: 30 }[scale]
  return Math.max(1, Math.floor(latestId - postsPerDay * (days + safetyDays)))
}

const latestId = 14477965
assert.equal(estimate(latestId, 'day'), 14462765)
assert.equal(estimate(latestId, 'week'), 14409565)
assert.equal(estimate(latestId, 'month'), 14211965)
assert.equal(estimate(latestId, 'year'), 11475965)

function estimateRange(latestId, startDate, endDate, now = new Date('2026-07-12T12:00:00')) {
  const anchors = [
    ['2024-01-01', 9425769], ['2025-01-01', 11229486], ['2026-01-01', 13222588], [formatISODate(now), latestId],
  ]
  const value = date => new Date(`${date}T12:00:00`).valueOf()
  const estimateDate = date => {
    const target = value(date)
    for (let index = 0; index < anchors.length - 1; index += 1) {
      const lower = anchors[index]; const upper = anchors[index + 1]
      if (target < value(lower[0]) || target > value(upper[0])) continue
      const ratio = (target - value(lower[0])) / (value(upper[0]) - value(lower[0]))
      const dailyRate = (upper[1] - lower[1]) / ((value(upper[0]) - value(lower[0])) / 86400000)
      return { id: Math.round(lower[1] + (upper[1] - lower[1]) * ratio), dailyRate }
    }
    return { id: latestId, dailyRate: 7600 }
  }
  const start = estimateDate(startDate); const end = estimateDate(endDate)
  return { startId: Math.max(1, start.id - Math.max(1000, Math.round(start.dailyRate * 2))), endId: Math.min(latestId, end.id + Math.max(1000, Math.round(end.dailyRate * 2))) }
}

const range = estimateRange(latestId, '2026-07-01', '2026-07-10')
assert.ok(range.startId < range.endId)
assert.ok(range.endId <= latestId)
const rangeInput = new URL(`https://gelbooru.com/index.php?page=post&s=list&tags=id%3A%3E%3D14400000%20id%3A%3C%3D14470000%20sort%3Ascore%3Adesc&range_start_id=14400000&range_end_id=14470000`)
const rangeTerms = normaliseTags(rangeInput, 'ranked')
rangeTerms.unshift(`id:>=${range.startId}`, `id:<=${range.endId}`)
assert.match(rangeTerms.join(' '), /^id:>=\d+ id:<=\d+ sort:score:desc$/)

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
