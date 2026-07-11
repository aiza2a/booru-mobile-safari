<template>
  <div v-if="visible" class="mobile-date-filter">
    <v-btn-toggle v-if="hasLatestMode" v-model="dateFilter.mode" mandatory dense class="date-mode-toggle">
      <v-btn value="latest" small>最近</v-btn>
      <v-btn value="date" small>日期</v-btn>
    </v-btn-toggle>
    <v-menu offset-y>
      <template #activator="{ on, attrs }">
        <v-btn small text v-bind="attrs" v-on="on">{{ scaleLabel }}</v-btn>
      </template>
      <v-list dense>
        <v-list-item v-for="scale in scales" :key="scale" @click="setScale(scale)">
          <v-list-item-title>{{ labels[scale] }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <template v-if="dateFilter.mode === 'date' || !hasLatestMode">
      <v-btn icon small @click="move(-1)"><v-icon>{{ mdiChevronLeft }}</v-icon></v-btn>
      <v-menu v-model="showPicker" :close-on-content-click="false" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn class="date-display" small text v-bind="attrs" v-on="on">{{ displayDate }}</v-btn>
        </template>
        <v-date-picker v-model="dateFilter.date" :max="today" no-title @input="showPicker = false" />
      </v-menu>
      <v-btn icon small :disabled="!canMoveNext" @click="move(1)"><v-icon>{{ mdiChevronRight }}</v-icon></v-btn>
    </template>
    <v-btn icon small aria-label="应用日期筛选" @click="apply"><v-icon>{{ mdiCheck }}</v-icon></v-btn>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { mdiCheck, mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { currentDateSite, currentRouteKind, siteCapabilities } from '@/config/site-capabilities'
import { dateFilter, updateDateFilter } from '@/store/date-filter'
import { buildDateRoute } from '@/utils/site-date-routes'
import { type DateScale, clampFutureDate, formatDateDisplay, formatISODate, shiftDate } from '@/utils/date-filter'

const site = currentDateSite()
const routeKind = currentRouteKind()
const capability = site ? siteCapabilities[site] : null
const visible = !!(site && routeKind && capability?.routes.includes(routeKind))
const hasLatestMode = computed(() => !!(routeKind && capability?.latestRoutes.includes(routeKind)))
const scales = computed(() => routeKind && capability ? capability.scales[routeKind] : [])
const labels: Record<DateScale, string> = { day: '日', week: '周', month: '月', year: '年' }
const scaleLabel = computed(() => labels[dateFilter.scale])
const displayDate = computed(() => formatDateDisplay(dateFilter.date, dateFilter.scale))
const today = formatISODate(new Date())
const showPicker = ref(false)
const canMoveNext = computed(() => shiftDate(dateFilter.date, dateFilter.scale, 1) <= today)

if (routeKind) updateDateFilter({ routeKind })
if (!hasLatestMode.value) updateDateFilter({ mode: 'date' })
if (!scales.value.includes(dateFilter.scale)) updateDateFilter({ scale: scales.value[0] || 'day' })

function setScale(scale: DateScale) {
  updateDateFilter({ scale })
}
function move(offset: number) {
  updateDateFilter({ date: clampFutureDate(shiftDate(dateFilter.date, dateFilter.scale, offset)) })
}
function apply() {
  if (!site || !routeKind) return
  location.assign(buildDateRoute({ site, kind: routeKind, date: dateFilter.date, scale: dateFilter.scale, mode: dateFilter.mode }))
}
watch(() => dateFilter.mode, mode => {
  if (mode === 'latest') apply()
})
</script>
