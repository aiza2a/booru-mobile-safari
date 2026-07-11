<template>
  <div
    v-if="isMobile && store.showPostList && !store.showImageSelected"
    class="mobile-status-backdrop"
    :style="backdropStyle"
    aria-hidden="true"
  ></div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { store } from '@/store'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const firstPreview = computed(() => {
  const post = store.imageList[0]
  if (!post) return ''
  return post.previewUrl || post.sampleUrl || post.fileUrl || ''
})
const backdropStyle = computed(() => firstPreview.value
  ? { backgroundImage: `url("${firstPreview.value.replace(/"/g, '\\"')}")` }
  : {})
</script>
