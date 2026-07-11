export function extractRegisteredPosts(html: string): any[] {
  const doc = new DOMParser().parseFromString(html, 'text/html')
  const scripts = [...doc.querySelectorAll<HTMLScriptElement>('script:not([src])')]
  const results: any[] = []
  for (const script of scripts) {
    const text = script.textContent || ''
    for (const line of text.split('\n')) {
      const marker = 'Post.register('
      const start = line.indexOf(marker)
      if (start < 0) continue
      let depth = 0
      let quote = ''
      let escaped = false
      const jsonStart = start + marker.length
      for (let index = jsonStart; index < line.length; index++) {
        const char = line[index]
        if (escaped) {
          escaped = false
          continue
        }
        if (char === '\\') {
          escaped = true
          continue
        }
        if (quote) {
          if (char === quote) quote = ''
          continue
        }
        if (char === '\"' || char === '\'') {
          quote = char
          continue
        }
        if (char === '{' || char === '[') depth++
        if (char === '}' || char === ']') depth--
        if (char === ')' && depth === 0) {
          const raw = line.slice(jsonStart, index)
          try {
            results.push(JSON.parse(raw))
          } catch (_error) {}
          break
        }
      }
    }
  }
  return results
}
