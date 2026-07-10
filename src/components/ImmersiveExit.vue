<template>
  <button
    v-if="store.isImmersive"
    class="immersive-exit-button"
    type="button"
    aria-label="退出沉浸模式"
    @click="exitImmersive"
  >
    <v-icon>{{ mdiFullscreenExit }}</v-icon>
  </button>
</template>

<script setup lang="ts">
import { mdiFullscreenExit } from '@mdi/js'
import { store } from '@/store'

async function exitImmersive() {
  store.isImmersive = false
  document.documentElement.classList.remove('ym-immersive')
  if (document.fullscreenElement) {
    try {
      await document.exitFullscreen()
    } catch (_error) {}
  }
}
</script>
