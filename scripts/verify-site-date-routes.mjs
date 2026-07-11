import assert from 'node:assert/strict'

const pad = value => value.toString().padStart(2, '0')
const formatISODate = date => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
function getDateRange(dateText, scale) {
  const date = new Date(`${dateText}T12:00:00`); const start = new Date(date); const end = new Date(date)
  if (scale === 'week') { const day = (date.getDay() + 6) % 7; start.setDate(date.getDate() - day); end.setDate(start.getDate() + 6) }
  else if (scale === 'month') { start.setDate(1); end.setMonth(start.getMonth() + 1, 0) }
  else if (scale === 'year') { start.setMonth(0, 1); end.setMonth(11, 31) }
  return { date: formatISODate(date), start: formatISODate(start), end: formatISODate(end), scale }
}
function formatDateDisplay(dateText, scale) {
  const range = getDateRange(dateText, scale); const slash = value => value.slice(5).replace('-', '/')
  if (scale === 'day') return slash(range.date)
  if (scale === 'week') { const start = slash(range.start); const end = slash(range.end); return range.start.slice(5, 7) === range.end.slice(5, 7) ? `${start}–${end.slice(-2)}` : `${start}–${end}` }
  if (scale === 'month') return range.date.slice(0, 7).replace('-', '/')
  return range.date.slice(0, 4)
}
const buildDateTags = (date, scale) => { const range = getDateRange(date, scale); return scale === 'day' ? `date:${range.date}` : `date:>=${range.start} date:<=${range.end}` }

assert.deepEqual(getDateRange('2024-02-15', 'month'), { date: '2024-02-15', start: '2024-02-01', end: '2024-02-29', scale: 'month' })
assert.deepEqual(getDateRange('2026-07-08', 'week'), { date: '2026-07-08', start: '2026-07-06', end: '2026-07-12', scale: 'week' })
assert.equal(buildDateTags('2026-07-07', 'week'), 'date:>=2026-07-06 date:<=2026-07-12')
assert.equal(formatDateDisplay('2026-07-07', 'day'), '07/07')
assert.equal(formatDateDisplay('2026-07-08', 'week'), '07/06–12')
assert.equal(formatDateDisplay('2026-06-30', 'week'), '06/29–07/05')
assert.equal(formatDateDisplay('2026-07-07', 'month'), '2026/07')
console.log('date route verification: ok')
