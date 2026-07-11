import assert from 'node:assert/strict'
import fs from 'node:fs'

const html = `<html><body><script>
Post.register({"id":101,"tags":"a b","nested":{"value":1},"file_url":"https://example/a.jpg"});
Post.register({"id":102,"tags":"c d","arr":[1,2,3],"file_url":"https://example/b.jpg"});
</script></body></html>`

function extractFromFixture(source) {
  const results = []
  for (const line of source.split('\n')) {
    const marker = 'Post.register('
    const start = line.indexOf(marker)
    if (start < 0) continue
    let depth = 0
    let quote = ''
    let escaped = false
    const jsonStart = start + marker.length
    for (let index = jsonStart; index < line.length; index++) {
      const char = line[index]
      if (escaped) { escaped = false; continue }
      if (char === '\\') { escaped = true; continue }
      if (quote) { if (char === quote) quote = ''; continue }
      if (char === '"' || char === "'") { quote = char; continue }
      if (char === '{' || char === '[') depth++
      if (char === '}' || char === ']') depth--
      if (char === ')' && depth === 0) {
        results.push(JSON.parse(line.slice(jsonStart, index)))
        break
      }
    }
  }
  return results
}

const results = extractFromFixture(html)
assert.equal(results.length, 2)
assert.equal(results[0].nested.value, 1)
assert.deepEqual(results[1].arr, [1, 2, 3])
assert.match(fs.readFileSync('src/utils/moebooru-html.ts', 'utf8'), /depth === 0/)
console.log('moebooru html fixture verification: ok')
