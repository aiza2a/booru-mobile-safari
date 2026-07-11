export type DateScale = 'day' | 'week' | 'month' | 'year'

export interface DateRange {
  date: string
  start: string
  end: string
  scale: DateScale
}

function pad(value: number) {
  return value.toString().padStart(2, '0')
}

export function formatISODate(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

export function getDateRange(dateText: string, scale: DateScale): DateRange {
  const date = new Date(`${dateText}T12:00:00`)
  const start = new Date(date)
  const end = new Date(date)
  if (scale === 'week') {
    const day = (date.getDay() + 6) % 7
    start.setDate(date.getDate() - day)
    end.setDate(start.getDate() + 6)
  } else if (scale === 'month') {
    start.setDate(1)
    end.setMonth(start.getMonth() + 1, 0)
  } else if (scale === 'year') {
    start.setMonth(0, 1)
    end.setMonth(11, 31)
  }
  return {
    date: formatISODate(date),
    start: formatISODate(start),
    end: formatISODate(end),
    scale,
  }
}

export function shiftDate(dateText: string, scale: DateScale, offset: number) {
  const date = new Date(`${dateText}T12:00:00`)
  if (scale === 'day') date.setDate(date.getDate() + offset)
  if (scale === 'week') date.setDate(date.getDate() + offset * 7)
  if (scale === 'month') date.setMonth(date.getMonth() + offset)
  if (scale === 'year') date.setFullYear(date.getFullYear() + offset)
  return formatISODate(date)
}

export function clampFutureDate(dateText: string, today = new Date()) {
  const value = new Date(`${dateText}T12:00:00`)
  const max = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12)
  return formatISODate(value > max ? max : value)
}

export function formatDateDisplay(dateText: string, scale: DateScale) {
  const range = getDateRange(dateText, scale)
  const slash = (value: string) => value.slice(5).replace('-', '/')
  if (scale === 'day') return slash(range.date)
  if (scale === 'week') {
    const start = slash(range.start)
    const end = slash(range.end)
    return range.start.slice(5, 7) === range.end.slice(5, 7)
      ? `${start}–${end.slice(-2)}`
      : `${start}–${end}`
  }
  if (scale === 'month') return range.date.slice(0, 7).replace('-', '/')
  return range.date.slice(0, 4)
}

export function parseDateFilterParams(params: URLSearchParams, fallbackDate = formatISODate(new Date())) {
  const scale = params.get('date_scale') as DateScale
  return {
    date: clampFutureDate(params.get('date') || fallbackDate),
    scale: ['day', 'week', 'month', 'year'].includes(scale) ? scale : 'day' as DateScale,
  }
}

export function buildDateTags(dateText: string, scale: DateScale) {
  const range = getDateRange(dateText, scale)
  return scale === 'day' ? `date:${range.date}` : `date:>=${range.start} date:<=${range.end}`
}
