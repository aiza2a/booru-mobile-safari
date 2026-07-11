<template>
  <div v-if="visible" class="mobile-date-filter">
    <v-btn-toggle v-if="showModeToggle" v-model="dateFilter.mode" mandatory dense class="date-mode-toggle">
      <v-btn :value="primaryMode" icon small :aria-label="primaryLabel" :title="primaryLabel"><v-icon>{{ primaryIcon }}</v-icon></v-btn>
      <v-btn value="date" icon small :aria-label="secondaryLabel" :title="secondaryLabel"><v-icon>{{ secondaryIcon }}</v-icon></v-btn>
    </v-btn-toggle>
    <v-menu v-if="showScale" offset-y>
      <template #activator="{ on, attrs }"><v-btn class="scale-button" small text v-bind="attrs" v-on="on">{{ scaleLabel }}</v-btn></template>
      <v-list dense><v-list-item v-for="scale in scales" :key="scale" @click="setScale(scale)"><v-list-item-title>{{ labels[scale] }}</v-list-item-title></v-list-item></v-list>
    </v-menu>
    <template v-if="dateFilter.mode === 'date'">
      <template v-if="dateFilter.scale !== 'range'">
        <v-btn icon small @click="move(-1)"><v-icon>{{ mdiChevronLeft }}</v-icon></v-btn>
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
        <v-btn v-if="canMoveNext" icon small @click="move(1)"><v-icon>{{ mdiChevronRight }}</v-icon></v-btn>
      </template>
      <v-btn v-else class="date-display range-display" small text @click="openRangePicker">{{ rangeDisplay }}</v-btn>
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
            <v-btn text @click="resetRange">重置</v-btn><v-spacer />
            <v-btn text @click="showRangePicker = false">取消</v-btn>
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
import { type DateScale, clampFutureDate, formatDateDisplay, formatISODate, shiftDate } from '@/utils/date-filter'
import { buildDateRoute } from '@/utils/site-date-routes'

const site = currentDateSite()
const routeKind = currentRouteKind()
const capability = site ? siteCapabilities[site] : null
const visible = !!(site && routeKind && capability?.routes.includes(routeKind))
const hasLatestMode = computed(() => !!(routeKind && capability?.latestRoutes.includes(routeKind)))
const isHome = computed(() => routeKind === 'home')
const showModeToggle = computed(() => hasLatestMode.value || isHome.value)
const showScale = computed(() => dateFilter.mode !== 'all')
const primaryMode = computed<DateFilterMode>(() => hasLatestMode.value ? 'latest' : 'all')
const primaryLabel = computed(() => hasLatestMode.value ? (routeKind === 'ranked' ? '近期排名' : '最近人气') : '全部帖子')
const secondaryLabel = computed(() => routeKind === 'ranked' ? '历史高分' : '指定日期')
const primaryIcon = computed(() => hasLatestMode.value ? mdiFire : mdiViewGridOutline)
const secondaryIcon = computed(() => routeKind === 'ranked' ? mdiCalendarStar : mdiCalendarMonthOutline)
const scales = computed<DateScale[]>(() => {
  const values = routeKind && capability ? [...capability.scales[routeKind]] : []
  if (dateFilter.mode === 'date' && (routeKind === 'home' || (site === 'danbooru' && routeKind === 'ranked'))) values.push('range')
  return values
})
const labels: Record<DateScale, string> = { day: '日', week: '周', month: '月', year: '年', range: '范围' }
const scaleLabel = computed(() => labels[dateFilter.scale])
const displayDate = computed(() => formatDateDisplay(dateFilter.date, dateFilter.scale))
const today = formatISODate(new Date())
const showYearPicker = ref(false)
const showRangePicker = ref(false)
const rangeStep = ref<'start' | 'end'>('start')
const pendingNativeValue = ref('')
const rangePendingValue = ref('')
const rangeComplete = computed(() => !!dateFilter.rangeStart && !!dateFilter.rangeEnd)
const rangeDisplay = computed(() => dateFilter.rangeStart && dateFilter.rangeEnd ? `${dateFilter.rangeStart.slice(5).replace('-', '/')}–${dateFilter.rangeEnd.slice(5).replace('-', '/')}` : '选择范围')
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

function navigate() {
  if (!site || !routeKind) return
  location.assign(buildDateRoute({ site, kind: routeKind, date: dateFilter.date, scale: dateFilter.scale, mode: dateFilter.mode, rangeStart: dateFilter.rangeStart, rangeEnd: dateFilter.rangeEnd }))
}
function setScale(scale: DateScale) {
  updateDateFilter({ scale })
  if (scale === 'range') openRangePicker()
  else navigate()
}
function openRangePicker() {
  rangeStep.value = 'start'
  rangePendingValue.value = ''
  showRangePicker.value = true
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
watch(() => dateFilter.mode, mode => { if (mode === primaryMode.value) navigate() })
</script>
