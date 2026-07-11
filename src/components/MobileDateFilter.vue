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
const scales = computed<DateScale[]>(() => routeKind && capability ? [...capability.scales[routeKind]] : [])
const labels: Record<DateScale, string> = { day: '日', week: '周', month: '月', year: '年', range: '范围' }
const scaleLabel = computed(() => labels[dateFilter.scale])
const displayDate = computed(() => formatDateDisplay(dateFilter.date, dateFilter.scale))
const today = formatISODate(new Date())
const showYearPicker = ref(false)
const pendingNativeValue = ref('')
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
  location.assign(buildDateRoute({ site, kind: routeKind, date: dateFilter.date, scale: dateFilter.scale, mode: dateFilter.mode }))
}
function setScale(scale: DateScale) {
  updateDateFilter({ scale })
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
