import { reactive } from 'vue'
import { clampFutureDate } from '@/utils/date-filter'
import { parseDateRoute } from '@/utils/parse-date-route'

export type DateFilterMode = 'all' | 'latest' | 'date'
export type DateRouteKind = 'home' | 'random' | 'popular' | 'viewed' | 'ranked' | 'updated'

const parsed = parseDateRoute()

export const dateFilter = reactive({
  mode: parsed.mode,
  scale: parsed.scale,
  date: parsed.date,
  rangeStart: parsed.rangeStart,
  rangeEnd: parsed.rangeEnd,
  routeKind: parsed.routeKind,
})

export function updateDateFilter(values: Partial<typeof dateFilter>) {
  Object.assign(dateFilter, values)
  dateFilter.date = clampFutureDate(dateFilter.date)
}
