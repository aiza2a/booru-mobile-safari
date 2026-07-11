import { execFileSync } from 'node:child_process'

const checks = [
  ['Yande.re 日', 'https://yande.re/post.json?limit=2&tags=date%3A2026-06-01', 'json'],
  ['Yande.re 周', 'https://yande.re/post.json?limit=2&tags=date%3A%3E%3D2026-06-01%20date%3A%3C%3D2026-06-07', 'json'],
  ['Danbooru Viewed 日', 'https://danbooru.donmai.us/explore/posts/viewed.json?date=2026-07-07&scale=day', 'json'],
  ['Danbooru Viewed 周', 'https://danbooru.donmai.us/explore/posts/viewed.json?date=2026-07-07&scale=week', 'json'],
  ['Danbooru Popular 月', 'https://danbooru.donmai.us/explore/posts/popular.json?date=2026-07-07&scale=month', 'json'],
  ['Danbooru Rank', 'https://danbooru.donmai.us/posts.json?limit=2&tags=order%3Ascore%20date%3A%3E%3D2026-06-01%20date%3A%3C%3D2026-06-30', 'json'],
  ['Gelbooru 首页日期', 'https://gelbooru.com/index.php?page=post&s=list&tags=date%3A2026-07-07', 'html'],
  ['Gelbooru 评分周', 'https://gelbooru.com/index.php?page=post&s=list&tags=sort%3Ascore%3Adesc%20date%3A%3E%3D2026-07-01%20date%3A%3C%3D2026-07-07', 'html'],
  ['Gelbooru 更新周', 'https://gelbooru.com/index.php?page=post&s=list&tags=sort%3Aupdated%3Adesc%20date%3A%3E%3D2026-07-01%20date%3A%3C%3D2026-07-07', 'html'],
]

let failed = false
for (const [name, url, type] of checks) {
  try {
    const output = execFileSync('curl', ['-LfsS', '--retry', '2', '--max-time', '30', url], { maxBuffer: 8 * 1024 * 1024 })
    const text = output.toString()
    if (type === 'json') {
      const value = JSON.parse(text)
      if (!Array.isArray(value) || value.length === 0) throw new Error('empty JSON array')
      console.log(`PASS ${name}: ${value.length} items`)
    } else {
      if (!/Gelbooru|thumbnail|post-list|Nobody here/i.test(text)) throw new Error('unexpected HTML')
      console.log(`PASS ${name}: ${text.length} bytes`)
    }
  } catch (error) {
    failed = true
    console.error(`FAIL ${name}: ${error.message}`)
  }
}

if (failed) process.exit(1)
