<template>
  <div v-if="visible" class="mobile-date-filter">
    <v-btn-toggle v-if="showModeToggle" v-model="dateFilter.mode" mandatory dense class="date-mode-toggle">
      <v-btn :value="primaryMode" icon small :aria-label="primaryLabel" :title="primaryLabel">
        <v-icon>{{ primaryIcon }}</v-icon>
      </v-btn>
      <v-btn value="date" icon small :aria-label="secondaryLabel" :title="secondaryLabel">
        <v-icon>{{ secondaryIcon }}</v-icon>
      </v-btn>
    </v-btn-toggle>
    <template v-if="showScale">
      <v-menu offset-y>
        <template #activator="{ on, attrs }">
          <v-btn class="scale-button" small text v-bind="attrs" v-on="on">{{ scaleLabel }}</v-btn>
        </template>
        <v-list dense>
          <v-list-item v-for="scale in scales" :key="scale" @click="setScale(scale)">
            <v-list-item-title>{{ labels[scale] }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </template>
    <template v-if="dateFilter.mode === 'date'">
      <template v-if="dateFilter.scale !== 'range'">
        <v-btn icon small @click="move(-1)"><v-icon>{{ mdiChevronLeft }}</v-icon></v-btn>
        <v-btn class="date-display" small text @click="openPicker">{{ displayDate }}</v-btn>
        <v-btn v-if="canMoveNext" icon small @click="move(1)"><v-icon>{{ mdiChevronRight }}</v-icon></v-btn>
      </template>
      <v-btn v-else class="date-display range-display" small text @click="openPicker">{{ rangeDisplay }}</v-btn>
      <v-dialog v-model="showPicker" content-class="ios-date-dialog">
        <v-card class="ios-date-sheet">
          <v-card-title>{{ pickerTitle }}</v-card-title>
          <v-date-picker
            v-if="pickerMounted && (dateFilter.scale === 'day' || dateFilter.scale === 'week')"
            v-model="dateFilter.date"
            :max="today"
            full-width
            no-title
            @input="onDateSelected"
          />
          <v-date-picker
            v-else-if="pickerMounted && dateFilter.scale === 'month'"
            v-model="pickerMonth"
            :max="today.slice(0, 7)"
            type="month"
            full-width
            no-title
            @input="onMonthSelected"
          />
          <template v-else-if="dateFilter.scale === 'range'">
            <div class="ios-range-picker">
              <div><div class="range-label">开始日期</div><v-date-picker v-if="pickerMounted" v-model="dateFilter.rangeStart" :max="dateFilter.rangeEnd || today" no-title /></div>
              <div><div class="range-label">结束日期</div><v-date-picker v-if="pickerMounted" v-model="dateFilter.rangeEnd" :min="dateFilter.rangeStart" :max="today" no-title /></div>
            </div>
            <v-card-actions>
              <v-btn text @click="resetRange">清除</v-btn><v-spacer />
              <v-btn text @click="applyRange">查看结果</v-btn>
            </v-card-actions>
          </template>
          <div v-else class="ios-year-picker">
            <v-btn v-for="year in years" :key="year" text @click="onYearSelected(year)">{{ year }}</v-btn>
          </div>
          <v-card-actions v-if="dateFilter.scale !== 'range'"><v-spacer /><v-btn text @click="showPicker = false">取消</v-btn></v-card-actions>
        </v-card>
      </v-dialog>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
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
const allowRange = computed(() => dateFilter.mode === 'date' && (routeKind === 'home' || (site === 'danbooru' && routeKind === 'ranked')))
const scales = computed(() => {
  const values = routeKind && capability ? [...capability.scales[routeKind]] : []
  if (allowRange.value) values.push('range')
  return values
})
const labels: Record<DateScale, string> = { day: '日', week: '周', month: '月', year: '年', range: '范围' }
const scaleLabel = computed(() => labels[dateFilter.scale])
const displayDate = computed(() => formatDateDisplay(dateFilter.date, dateFilter.scale))
const rangeDisplay = computed(() => {
  const start = dateFilter.rangeStart.slice(5).replace('-', '/')
  const end = dateFilter.rangeEnd.slice(5).replace('-', '/')
  return `${start}–${end}`
})
const today = formatISODate(new Date())
const showPicker = ref(false)
const pickerMounted = ref(false)
const pickerMonth = ref(dateFilter.date.slice(0, 7))
const pickerTitle = computed(() => ({ day: '选择日期', week: '选择周所在日期', month: '选择月份', year: '选择年份', range: '自定义日期范围' })[dateFilter.scale])
const currentYear = Number(today.slice(0, 4))
const years = Array.from({ length: 30 }, (_, index) => currentYear - index)
const canMoveNext = computed(() => shiftDate(dateFilter.date, dateFilter.scale, 1) <= today)

if (routeKind) updateDateFilter({ routeKind })
if (!showModeToggle.value) updateDateFilter({ mode: 'date' })
if (!scales.value.includes(dateFilter.scale)) updateDateFilter({ scale: scales.value[0] || 'day' })

function openPicker() {
  pickerMounted.value = false
  showPicker.value = true
  nextTick(() => {
    pickerMounted.value = true
  })
}
function resetRange() {
  updateDateFilter({ rangeStart: dateFilter.date, rangeEnd: dateFilter.date })
}
function applyRange() {
  if (dateFilter.rangeStart > dateFilter.rangeEnd) {
    const start = dateFilter.rangeEnd
    updateDateFilter({ rangeStart: start, rangeEnd: dateFilter.rangeStart })
  }
  showPicker.value = false
  navigate()
}
function navigate() {
  if (!site || !routeKind) return
  location.assign(buildDateRoute({
    site,
    kind: routeKind,
    date: dateFilter.date,
    scale: dateFilter.scale,
    mode: dateFilter.mode,
    rangeStart: dateFilter.rangeStart,
    rangeEnd: dateFilter.rangeEnd,
  }))
}
function setScale(scale: DateScale) {
  updateDateFilter({ scale })
  if (scale === 'range') openPicker()
  else navigate()
}
function move(offset: number) {
  updateDateFilter({ date: clampFutureDate(shiftDate(dateFilter.date, dateFilter.scale, offset)) })
  navigate()
}
function onDateSelected() {
  showPicker.value = false
  navigate()
}
function onMonthSelected(month: string) {
  updateDateFilter({ date: `${month}-01` })
  showPicker.value = false
  navigate()
}
function onYearSelected(year: number) {
  updateDateFilter({ date: `${year}-01-01` })
  showPicker.value = false
  navigate()
}
watch(() => dateFilter.mode, mode => {
  if (mode === primaryMode.value) navigate()
})
</script>
