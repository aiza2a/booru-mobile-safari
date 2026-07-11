<template>
  <v-fab-transition>
    <v-btn
      v-show="visible"
      class="mobile-search-fab"
      fixed
      fab
      aria-label="搜索标签"
      @click="store.showMobileSearch = true"
    >
      <v-icon>{{ mdiMagnify }}</v-icon>
    </v-btn>
  </v-fab-transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mdiMagnify } from '@mdi/js'
import { isSupportTagSearch } from '@/api/booru'
import { store } from '@/store'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const visible = computed(() => isMobile
  && isSupportTagSearch
  && store.showPostList
  && !store.showImageSelected
  && !store.showDrawer
  && !store.showSettings
  && !store.showMobileSearch
  && !store.isImmersive)
</script>
