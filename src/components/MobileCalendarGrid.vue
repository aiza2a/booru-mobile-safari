<template>
  <div class="mobile-calendar-grid">
    <div class="calendar-toolbar">
      <v-btn icon small aria-label="上个月" @click="shiftMonth(-1)"><v-icon>{{ mdiChevronLeft }}</v-icon></v-btn>
      <strong>{{ monthTitle }}</strong>
      <v-btn v-if="canMoveNextMonth" icon small aria-label="下个月" @click="shiftMonth(1)"><v-icon>{{ mdiChevronRight }}</v-icon></v-btn>
      <span v-else class="calendar-nav-spacer"></span>
    </div>
    <div class="calendar-weekdays" aria-hidden="true">
      <span v-for="weekday in weekdays" :key="weekday">{{ weekday }}</span>
    </div>
    <div class="calendar-days" role="grid" :aria-label="monthTitle">
      <button
        v-for="cell in cells"
        :key="cell.date"
        type="button"
        role="gridcell"
        class="calendar-day"
        :class="{ 'is-outside': !cell.currentMonth, 'is-selected': cell.date === value, 'is-disabled': cell.disabled }"
        :disabled="cell.disabled"
        :aria-label="cell.date"
        :aria-selected="cell.date === value"
        @click="selectDate(cell.date)"
      >
        {{ cell.day }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mdiChevronLeft, mdiChevronRight } from '@mdi/js'
import { formatISODate } from '@/utils/date-filter'

export default Vue.extend({
  name: 'MobileCalendarGrid',
  props: {
    value: { type: String, required: true },
    max: { type: String, required: true },
    min: { type: String, default: '' },
  },
  data() {
    return {
      weekdays: ['日', '一', '二', '三', '四', '五', '六'],
      visibleMonth: (this.value || this.max).slice(0, 7),
      mdiChevronLeft,
      mdiChevronRight,
    }
  },
  computed: {
    monthTitle(): string {
      const parts = this.visibleMonth.split('-').map(Number)
      return `${parts[0]}年${parts[1]}月`
    },
    canMoveNextMonth(): boolean {
      return this.visibleMonth < this.max.slice(0, 7)
    },
    cells(): Array<{ date: string; day: number; currentMonth: boolean; disabled: boolean }> {
      const parts = this.visibleMonth.split('-').map(Number)
      const year = parts[0]
      const month = parts[1]
      const first = new Date(year, month - 1, 1, 12)
      const gridStart = new Date(first)
      gridStart.setDate(first.getDate() - first.getDay())
      return Array.from({ length: 42 }, (_, index) => {
        const date = new Date(gridStart)
        date.setDate(gridStart.getDate() + index)
        const iso = formatISODate(date)
        return {
          date: iso,
          day: date.getDate(),
          currentMonth: date.getMonth() === month - 1,
          disabled: iso > this.max || (!!this.min && iso < this.min),
        }
      })
    },
  },
  watch: {
    value(value: string) {
      if (value) this.visibleMonth = value.slice(0, 7)
    },
  },
  methods: {
    shiftMonth(offset: number) {
      const parts = this.visibleMonth.split('-').map(Number)
      this.visibleMonth = formatISODate(new Date(parts[0], parts[1] - 1 + offset, 1, 12)).slice(0, 7)
    },
    selectDate(value: string) {
      this.$emit('input', value)
      this.$emit('select', value)
    },
  },
})
</script>

<style scoped>
.mobile-calendar-grid { display: block; width: 100%; padding: 0 12px 12px; color: var(--ios-label); }
.calendar-toolbar { display: grid; grid-template-columns: 44px 1fr 44px; align-items: center; min-height: 48px; text-align: center; }
.calendar-nav-spacer { width: 44px; height: 44px; }
.calendar-weekdays, .calendar-days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); width: 100%; }
.calendar-weekdays span { padding: 4px 0 8px; color: var(--ios-secondary-label); font-size: 12px; text-align: center; }
.calendar-day { appearance: none; min-width: 0; height: 40px; padding: 0; border: 0; border-radius: 20px; color: inherit; background: transparent; font: inherit; }
.calendar-day.is-outside { color: var(--ios-secondary-label); opacity: .52; }
.calendar-day.is-selected { color: #fff; background: #8e5bc7; }
.calendar-day.is-disabled { opacity: .22; }
</style>
