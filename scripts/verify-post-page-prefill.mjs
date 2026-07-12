import assert from 'node:assert/strict'

function preloadPages(targetPage) {
  const loaded = []
  let nextQueryPage = targetPage
  for (let current = 1; current < targetPage; current += 1) {
    loaded.push(current)
  }
  return { loaded, nextQueryPage }
}

assert.deepEqual(preloadPages(1), { loaded: [], nextQueryPage: 1 })
assert.deepEqual(preloadPages(3), { loaded: [1, 2], nextQueryPage: 3 })
assert.deepEqual(preloadPages(5), { loaded: [1, 2, 3, 4], nextQueryPage: 5 })

function resetState(kind, value) {
  let initialPageTarget = 7
  let queryPage = 7
  if (kind === 'refresh' || kind === 'tags') {
    initialPageTarget = 1
    queryPage = 1
  } else if (kind === 'page') {
    initialPageTarget = value
    queryPage = value
  }
  return { initialPageTarget, queryPage }
}

assert.deepEqual(resetState('refresh'), { initialPageTarget: 1, queryPage: 1 })
assert.deepEqual(resetState('tags'), { initialPageTarget: 1, queryPage: 1 })
assert.deepEqual(resetState('page', 4), { initialPageTarget: 4, queryPage: 4 })
console.log('post page prefill verification: ok')
