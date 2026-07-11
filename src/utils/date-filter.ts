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

export function buildDateTags(dateText: string, scale: DateScale) {
  const range = getDateRange(dateText, scale)
  return scale === 'day' ? `date:${range.date}` : `date:>=${range.start} date:<=${range.end}`
}
