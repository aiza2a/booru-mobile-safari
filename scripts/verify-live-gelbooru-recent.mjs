import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const origin = 'https://gelbooru.com'
const targetDate = process.argv[2] || new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)
let requests = 0

function fetchText(url) {
  requests += 1
  return execFileSync('curl', ['-LfsS', '--retry', '2', '--max-time', '30', url], { maxBuffer: 8 * 1024 * 1024 }).toString()
}

function firstPostId(html) {
  const id = Number(html.match(/class="thumbnail-preview"[\s\S]*?s=view(?:&amp;|&)id=(\d+)/i)?.[1])
  return Number.isFinite(id) && id > 0 ? id : null
}

function postedDate(html) {
  return html.match(/Posted:\s*(\d{4}-\d{2}-\d{2})/)?.[1] || null
}

function postDate(id) {
  return postedDate(fetchText(`${origin}/index.php?page=post&s=view&id=${id}`))
}

function firstIdForTags(tags) {
  return firstPostId(fetchText(`${origin}/index.php?page=post&s=list&tags=${encodeURIComponent(tags)}`))
}

function postAtOrAfter(id) {
  const exactDate = postDate(id)
  if (exactDate) return { id, date: exactDate }
  const nextId = firstIdForTags(`id:>=${id} sort:id:asc`)
  if (!nextId) return null
  const nextDate = postDate(nextId)
  return nextDate ? { id: nextId, date: nextDate } : null
}

const latestId = firstIdForTags('sort:id:desc')
assert.ok(latestId, 'latest Gelbooru post ID missing')
let low = 1
let high = latestId
let iterations = 0
while (low < high && iterations < 32) {
  iterations += 1
  const middle = Math.floor((low + high) / 2)
  const post = postAtOrAfter(middle)
  if (!post) high = middle
  else if (post.date < targetDate) low = post.id + 1
  else high = middle
}
const boundary = postAtOrAfter(low)
assert.ok(boundary, 'Gelbooru boundary post missing')
assert.ok(boundary.date >= targetDate, `boundary ${boundary.date} precedes ${targetDate}`)

for (const order of ['sort:score:desc', 'sort:updated:desc']) {
  const html = fetchText(`${origin}/index.php?page=post&s=list&tags=${encodeURIComponent(`id:>=${boundary.id} ${order}`)}`)
  assert.doesNotMatch(html, /Nobody here but us chickens!/i)
  const thumbnails = (html.match(/thumbnail-preview/g) || []).length
  assert.ok(thumbnails > 0, `${order} returned no thumbnails`)
  console.log(`PASS ${order}: ${thumbnails} thumbnails`)
}
console.log(`Gelbooru boundary ${targetDate} -> ${boundary.id} (${boundary.date}), ${iterations} iterations, ${requests} requests`)
