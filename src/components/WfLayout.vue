<template>
  <div class="wf-layout" :class="wfClass">
    <true-masonry
      v-if="wfType === 'masonry2'"
      class="true-masonry"
      :gap="{ default: 8 }"
      :cols="columnCount2"
    >
      <slot></slot>
    </true-masonry>
    <masonry v-else-if="isMasonry" :cols="columnCount" gutter="8px">
      <slot></slot>
    </masonry>
    <div v-else class="justified-container">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { settings } from '@/store'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches

const wfType = computed(() => settings.masonryLayout || 'masonry')
const isMasonry = computed(() => ['masonry', 'grid'].includes(wfType.value))
const wfClass = computed(() => ({
  'wf-grid': wfType.value == 'grid',
  'wf-no-fit-screen': !settings.isFitScreen,
}))
const columnCount = computed(() => {
  return settings.selectedColumn === '0'
    ? settings.isFitScreen
      ? {
          300: 1,
          600: 2,
          900: 3,
          1200: 4,
          1600: 6,
          1920: 7,
          2400: 8,
          2700: 9,
          3000: 10,
          default: 6,
        }
      : {
          300: 1,
          1050: 2,
          1500: 3,
          1920: 4,
          default: 4,
        }
    : +settings.selectedColumn
})
const responsiveDefaultColumn = () => {
  const width = window.innerWidth
  if (settings.isFitScreen) {
    if (width <= 300) return 1
    if (width <= 600) return 2
    if (width <= 900) return 3
    if (width <= 1200) return 4
    if (width <= 1600) return 6
    if (width <= 1920) return 7
    if (width <= 2400) return 8
    if (width <= 2700) return 9
    return 10
  }
  if (width <= 300) return 1
  if (width <= 1050) return 2
  if (width <= 1500) return 3
  return 4
}
const columnCount2 = computed(() => {
  if (typeof columnCount.value == 'number') return { default: columnCount.value }
  if (isMobile) return { default: 2 }
  return { ...columnCount.value, default: responsiveDefaultColumn() }
})
</script>
