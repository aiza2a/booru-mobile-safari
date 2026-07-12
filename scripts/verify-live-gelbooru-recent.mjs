import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'

const origin = 'https://gelbooru.com'
const scale = process.argv[2] || 'week'
const postsPerDay = 7600
const days = { day: 1, week: 7, month: 30, year: 365 }[scale]
const safetyDays = { day: 1, week: 2, month: 5, year: 30 }[scale]
let requests = 0

function fetchText(url) {
  requests += 1
  return execFileSync('curl', ['-LfsS', '--retry', '2', '--max-time', '30', url], { maxBuffer: 8 * 1024 * 1024 }).toString()
}

function firstPostId(html) {
  const id = Number(html.match(/class="thumbnail-preview"[\s\S]*?s=view(?:&amp;|&)id=(\d+)/i)?.[1])
  return Number.isFinite(id) && id > 0 ? id : null
}

function firstIdForTags(tags) {
  return firstPostId(fetchText(`${origin}/index.php?page=post&s=list&tags=${encodeURIComponent(tags)}`))
}

const latestId = firstIdForTags('sort:id:desc')
assert.ok(latestId, 'latest Gelbooru post ID missing')
const startId = Math.max(1, Math.floor(latestId - postsPerDay * (days + safetyDays)))

for (const order of ['sort:score:desc', 'sort:updated:desc']) {
  const html = fetchText(`${origin}/index.php?page=post&s=list&tags=${encodeURIComponent(`id:>=${startId} ${order}`)}`)
  assert.doesNotMatch(html, /Nobody here but us chickens!/i)
  const thumbnails = (html.match(/thumbnail-preview/g) || []).length
  assert.ok(thumbnails > 0, `${order} returned no thumbnails`)
  console.log(`PASS ${order}: ${thumbnails} thumbnails`)
}
console.log(`Gelbooru ${scale} estimate ${latestId} -> ${startId}, ${requests} requests`)
