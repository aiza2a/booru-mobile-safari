<template>
  <div
    v-if="visible"
    class="mobile-date-filter"
    :class="{
      'date-filter--compact': dateFilter.mode === 'all',
      'date-filter--recent': dateFilter.mode === 'latest',
      'date-filter--expanded': dateFilter.mode === 'date',
      'date-filter--gelbooru': site === 'gelbooru',
    }"
  >
    <v-btn-toggle v-if="showModeToggle" v-model="selectedMode" mandatory dense class="date-mode-toggle" :class="{ 'gelbooru-mode-toggle': site === 'gelbooru' }" :disabled="gelbooruLoading">
      <template v-if="site === 'gelbooru'">
        <v-btn value="all" icon small aria-label="全部结果" title="全部结果"><v-icon>{{ mdiViewGridOutline }}</v-icon></v-btn>
        <v-btn value="latest" icon small :aria-label="primaryLabel" :title="primaryLabel"><v-icon>{{ mdiFire }}</v-icon></v-btn>
      </template>
      <template v-else>
        <v-btn :value="primaryMode" icon small :aria-label="primaryLabel" :title="primaryLabel"><v-icon>{{ primaryIcon }}</v-icon></v-btn>
        <v-btn :value="secondaryMode" icon small :aria-label="secondaryLabel" :title="secondaryLabel"><v-icon>{{ secondaryIcon }}</v-icon></v-btn>
      </template>
    </v-btn-toggle>
    <v-progress-circular v-if="gelbooruLoading" class="gelbooru-recent-loading" :size="22" :width="2" indeterminate />
    <v-menu v-if="showScale" :content-class="site === 'gelbooru' ? 'gelbooru-scale-menu' : ''" offset-y>
      <template #activator="{ on, attrs }"><v-btn class="scale-button" :class="{ 'gelbooru-scale-button': site === 'gelbooru' }" small text v-bind="attrs" v-on="on">{{ scaleButtonLabel }}</v-btn></template>
      <v-list dense><v-list-item v-for="scale in scales" :key="scale" @click="setScale(scale)"><v-list-item-title>{{ labels[scale] }}</v-list-item-title></v-list-item></v-list>
    </v-menu>
    <v-btn
      v-if="site === 'gelbooru' && dateFilter.mode === 'latest'"
      class="gelbooru-range-button"
      small
      text
      @click="dateFilter.scale === 'range' && openRangePicker()"
    >{{ recentRangeDisplay }}</v-btn>
    <template v-if="dateFilter.mode === 'date' || (site === 'gelbooru' && dateFilter.scale === 'range')">
      <template v-if="dateFilter.mode === 'date' && dateFilter.scale !== 'range'">
        <v-btn class="date-nav-button" icon small @click="move(-1)"><v-icon>{{ mdiChevronLeft }}</v-icon></v-btn>
        <div v-if="dateFilter.scale !== 'year'" class="native-date-trigger">
          <v-btn class="date-display" small text tabindex="-1">{{ displayDate }}</v-btn>
          <input
            :value="nativePickerValue"
            :type="nativePickerType"
            :max="nativePickerMax"
            :aria-label="pickerTitle"
            @input="onNativeDateInput"
            @change="onNativeDateChange"
          >
        </div>
        <v-btn v-else class="date-display" small text @click="showYearPicker = true">{{ displayDate }}</v-btn>
        <v-btn class="date-nav-button" icon small :disabled="!canMoveNext" @click="move(1)"><v-icon>{{ mdiChevronRight }}</v-icon></v-btn>
      </template>
      <v-btn v-if="site !== 'gelbooru' && dateFilter.scale === 'range'" class="date-display range-display" small text @click="openRangePicker">{{ rangeDisplay }}</v-btn>
      <v-dialog v-model="showRangePicker" content-class="ios-date-dialog">
        <v-card class="ios-date-sheet native-range-sheet">
          <v-card-title>{{ rangeStep === 'start' ? '选择开始日期' : '选择结束日期' }}</v-card-title>
          <div class="native-range-input">
            <input
              :value="rangeNativeValue"
              type="date"
              :min="rangeStep === 'end' ? dateFilter.rangeStart : undefined"
              :max="today"
              @input="onRangeNativeInput"
              @change="onRangeNativeChange"
            >
          </div>
          <div class="range-selection-summary">
            <span>开始：{{ dateFilter.rangeStart || '未选择' }}</span>
            <span>结束：{{ dateFilter.rangeEnd || '未选择' }}</span>
          </div>
          <v-card-actions>
            <v-btn v-if="site !== 'gelbooru'" text @click="resetRange">重置</v-btn><v-spacer />
            <v-btn text @click="cancelRangePicker">取消</v-btn>
            <v-btn text :disabled="!rangeComplete" @click="applyRange">查看结果</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <v-dialog v-model="showYearPicker" content-class="ios-date-dialog">
        <v-card class="ios-date-sheet">
          <v-card-title>选择年份</v-card-title>
          <div class="ios-year-picker"><v-btn v-for="year in years" :key="year" text @click="onYearSelected(year)">{{ year }}</v-btn></div>
          <v-card-actions><v-spacer /><v-btn text @click="showYearPicker = false">取消</v-btn></v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mdiCalendarMonthOutline, mdiCalendarStar, mdiChevronLeft, mdiChevronRight, mdiFire, mdiViewGridOutline } from '@mdi/js'
import { currentDateSite, currentRouteKind, siteCapabilities } from '@/config/site-capabilities'
import { type DateFilterMode, dateFilter, updateDateFilter } from '@/store/date-filter'
import { type DateScale, clampFutureDate, formatDateDisplay, formatISODate, getDateRange, shiftDate } from '@/utils/date-filter'
import { buildDateRoute } from '@/utils/site-date-routes'
import { buildGelbooruAllRoute, buildGelbooruRangeRoute, buildGelbooruRecentRoute, getGelbooruRecentStartDate } from '@/utils/gelbooru-recent'
import { showMsg } from '@/utils'

const site = currentDateSite()
const routeKind = currentRouteKind()
const capability = site ? siteCapabilities[site] : null
const visible = !!(site && routeKind && capability?.routes.includes(routeKind))
const hasLatestMode = computed(() => !!(routeKind && capability?.latestRoutes.includes(routeKind)))
const isHome = computed(() => routeKind === 'home')
const showModeToggle = computed(() => hasLatestMode.value || isHome.value)
const primaryMode = computed<DateFilterMode>(() => hasLatestMode.value ? 'latest' : 'all')
const secondaryMode = computed<DateFilterMode>(() => site === 'gelbooru' ? 'all' : 'date')
const gelbooruLoading = ref(false)
const showScale = computed(() => dateFilter.mode !== 'all')
const selectedMode = computed({
  get: () => dateFilter.mode,
  set: (mode: DateFilterMode) => {
    const previousMode = dateFilter.mode
    updateDateFilter({ mode })
    if (site === 'gelbooru') navigate(previousMode)
  },
})
const primaryLabel = computed(() => {
  if (!hasLatestMode.value) return '全部帖子'
  if (site === 'gelbooru') return routeKind === 'ranked' ? '近期评分最高' : '近期更新'
  return routeKind === 'ranked' ? '近期排名' : '最近人气'
})
const secondaryLabel = computed(() => site === 'gelbooru' ? '全部结果' : routeKind === 'ranked' ? '历史高分' : '指定日期')
const primaryIcon = computed(() => hasLatestMode.value ? mdiFire : mdiViewGridOutline)
const secondaryIcon = computed(() => site === 'gelbooru' ? mdiViewGridOutline : routeKind === 'ranked' ? mdiCalendarStar : mdiCalendarMonthOutline)
const scales = computed<DateScale[]>(() => {
  const values = routeKind && capability ? [...capability.scales[routeKind]] : []
  if (site === 'gelbooru') {
    if (!values.includes('range')) values.push('range')
  } else if (dateFilter.mode === 'date' && (routeKind === 'home' || (site === 'danbooru' && routeKind === 'ranked'))) {
    values.push('range')
  }
  return values
})
const labels: Record<DateScale, string> = { day: '日', week: '周', month: '月', year: '年', range: '域' }
const scaleLabel = computed(() => labels[dateFilter.scale])
const today = formatISODate(new Date())
const showYearPicker = ref(false)
const showRangePicker = ref(false)
const rangeStep = ref<'start' | 'end'>('start')
const pendingGelbooruScale = ref<DateScale | null>(null)
const pendingNativeValue = ref('')
const rangePendingValue = ref('')
const rangeComplete = computed(() => !!dateFilter.rangeStart && !!dateFilter.rangeEnd)
const rangeDisplay = computed(() => {
  if (!dateFilter.rangeStart || !dateFilter.rangeEnd) return '选域'
  const [start, end] = [dateFilter.rangeStart, dateFilter.rangeEnd].sort()
  const startMonth = start.slice(5, 7)
  const endMonth = end.slice(5, 7)
  const startText = start.slice(5).replace('-', '/')
  const endText = startMonth === endMonth ? end.slice(8) : end.slice(5).replace('-', '/')
  return `${startText}–${endText}`
})
const recentRangeDisplay = computed(() => {
  if (dateFilter.scale === 'range') return rangeDisplay.value
  const start = getGelbooruRecentStartDate(dateFilter.scale)
  const end = today
  const startYear = start.slice(2, 4)
  const endYear = end.slice(2, 4)
  const startMonth = start.slice(5, 7)
  const endMonth = end.slice(5, 7)
  if (dateFilter.scale === 'day') return `${start.slice(5).replace('-', '/')}–${end.slice(8)}`
  if (dateFilter.scale === 'week') {
    const endText = startMonth === endMonth ? end.slice(8) : end.slice(5).replace('-', '/')
    return `${start.slice(5).replace('-', '/')}–${endText}`
  }
  if (dateFilter.scale === 'month') return `${start.slice(5).replace('-', '/')}–${end.slice(5).replace('-', '/')}`
  return `${startYear}/${startMonth}–${endYear}/${endMonth}`
})
const scaleButtonLabel = computed(() => scaleLabel.value)
const displayDate = computed(() => {
  const { start, end } = getDateRange(dateFilter.date, dateFilter.scale)
  if (dateFilter.scale === 'week') {
    const startMonth = start.slice(5, 7)
    const endText = startMonth === end.slice(5, 7) ? end.slice(8) : end.slice(5).replace('-', '/')
    return `${start.slice(5).replace('-', '/')}–${endText}`
  }
  return formatDateDisplay(dateFilter.date, dateFilter.scale).replace('-', '/')
})
const rangeNativeValue = computed(() => rangeStep.value === 'start' ? (dateFilter.rangeStart || dateFilter.date) : (dateFilter.rangeEnd || dateFilter.rangeStart))
const nativePickerType = computed(() => dateFilter.scale === 'month' ? 'month' : 'date')
const nativePickerValue = computed(() => dateFilter.scale === 'month' ? dateFilter.date.slice(0, 7) : dateFilter.date)
const nativePickerMax = computed(() => dateFilter.scale === 'month' ? today.slice(0, 7) : today)
const pickerTitle = computed(() => dateFilter.scale === 'month' ? '选择月份' : dateFilter.scale === 'week' ? '选择周所在日期' : '选择日期')
const currentYear = Number(today.slice(0, 4))
const years = Array.from({ length: 30 }, (_, index) => currentYear - index)
const canMoveNext = computed(() => shiftDate(dateFilter.date, dateFilter.scale, 1) <= today)

if (routeKind) updateDateFilter({ routeKind })
if (!showModeToggle.value) updateDateFilter({ mode: 'date' })
if (!scales.value.includes(dateFilter.scale)) updateDateFilter({ scale: scales.value[0] || 'day' })

async function navigate(previousMode?: DateFilterMode) {
  if (!site || !routeKind || gelbooruLoading.value) return
  if (site === 'gelbooru' && (routeKind === 'ranked' || routeKind === 'updated')) {
    try {
      gelbooruLoading.value = true
      const url = dateFilter.mode === 'all'
        ? buildGelbooruAllRoute(routeKind)
        : dateFilter.scale === 'range' && dateFilter.rangeStart && dateFilter.rangeEnd
          ? await buildGelbooruRangeRoute(routeKind, dateFilter.rangeStart, dateFilter.rangeEnd)
          : await buildGelbooruRecentRoute(routeKind, dateFilter.scale)
      location.assign(url)
    } catch (error) {
      console.error('Gelbooru recent route error:', error)
      if (previousMode) updateDateFilter({ mode: previousMode })
      showMsg({ msg: 'Gelbooru 近期范围计算失败，请稍后重试', type: 'error' })
      gelbooruLoading.value = false
    }
    return
  }
  location.assign(buildDateRoute({ site, kind: routeKind, date: dateFilter.date, scale: dateFilter.scale, mode: dateFilter.mode, rangeStart: dateFilter.rangeStart, rangeEnd: dateFilter.rangeEnd }))
}
function setScale(scale: DateScale) {
  const previousScale = dateFilter.scale
  updateDateFilter({ scale })
  if (scale === 'range') {
    if (site === 'gelbooru' && !rangeComplete.value) pendingGelbooruScale.value = previousScale
    openRangePicker()
  } else navigate()
}
function openRangePicker() {
  rangeStep.value = 'start'
  rangePendingValue.value = ''
  showRangePicker.value = true
}
function cancelRangePicker() {
  showRangePicker.value = false
  if (site === 'gelbooru' && !rangeComplete.value && pendingGelbooruScale.value) {
    updateDateFilter({ scale: pendingGelbooruScale.value })
  }
  pendingGelbooruScale.value = null
}
function resetRange() {
  updateDateFilter({ rangeStart: '', rangeEnd: '' })
  rangeStep.value = 'start'
  rangePendingValue.value = ''
}
function onRangeNativeInput(event: Event) {
  rangePendingValue.value = (event.target as HTMLInputElement).value
}
function onRangeNativeChange(event: Event) {
  const value = (event.target as HTMLInputElement).value || rangePendingValue.value
  if (!value) return
  if (rangeStep.value === 'start') {
    updateDateFilter({ rangeStart: value, rangeEnd: '' })
    rangeStep.value = 'end'
    rangePendingValue.value = ''
  } else {
    updateDateFilter({ rangeEnd: value })
  }
}
function applyRange() {
  if (!rangeComplete.value) return
  const [rangeStart, rangeEnd] = [dateFilter.rangeStart, dateFilter.rangeEnd].sort()
  updateDateFilter({ rangeStart, rangeEnd, scale: 'range', mode: site === 'gelbooru' ? 'latest' : dateFilter.mode })
  pendingGelbooruScale.value = null
  showRangePicker.value = false
  navigate()
}
function move(offset: number) {
  updateDateFilter({ date: clampFutureDate(shiftDate(dateFilter.date, dateFilter.scale, offset)) })
  navigate()
}
function onNativeDateInput(event: Event) {
  pendingNativeValue.value = (event.target as HTMLInputElement).value
}
function onNativeDateChange(event: Event) {
  const value = (event.target as HTMLInputElement).value || pendingNativeValue.value
  if (!value) return
  updateDateFilter({ date: dateFilter.scale === 'month' ? `${value}-01` : value })
  navigate()
}
function onYearSelected(year: number) {
  updateDateFilter({ date: `${year}-01-01` })
  showYearPicker.value = false
  navigate()
}
watch(() => dateFilter.mode, mode => {
  if (site !== 'gelbooru' && mode === primaryMode.value) navigate()
})
</script>
