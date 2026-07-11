import { reactive } from 'vue'
import { clampFutureDate, formatISODate, parseDateFilterParams, type DateScale } from '@/utils/date-filter'

export type DateFilterMode = 'latest' | 'date'
export type DateRouteKind = 'home' | 'random' | 'popular' | 'viewed' | 'ranked' | 'updated'

const params = new URLSearchParams(location.search)
const parsed = parseDateFilterParams(params)

export const dateFilter = reactive({
  mode: (params.get('date_mode') === 'latest' ? 'latest' : 'date') as DateFilterMode,
  scale: parsed.scale as DateScale,
  date: parsed.date || formatISODate(new Date()),
  routeKind: 'home' as DateRouteKind,
})

export function updateDateFilter(values: Partial<typeof dateFilter>) {
  Object.assign(dateFilter, values)
  dateFilter.date = clampFutureDate(dateFilter.date)
}
