<template>
  <v-bottom-navigation
    v-if="isMobile && store.showPostList && !store.showImageSelected"
    app
    fixed
    grow
    class="mobile-bottom-nav"
    color="primary"
  >
    <v-btn @click="goHome">
      <span>首页</span>
      <v-icon>{{ mdiHome }}</v-icon>
    </v-btn>
    <v-btn v-if="store.isYKSite" @click="goPopular">
      <span>人气</span>
      <v-icon>{{ mdiFire }}</v-icon>
    </v-btn>
    <v-btn @click="openSearch">
      <span>搜索</span>
      <v-icon>{{ mdiMagnify }}</v-icon>
    </v-btn>
    <v-btn :disabled="!currentPost" @click="shareCurrent">
      <span>分享</span>
      <v-icon>{{ mdiShareVariant }}</v-icon>
    </v-btn>
    <v-btn @click="store.showSettings = true">
      <span>更多</span>
      <v-icon>{{ mdiDotsHorizontal }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { mdiDotsHorizontal, mdiFire, mdiHome, mdiMagnify, mdiShareVariant } from '@mdi/js'
import { eventBus } from '@/utils'
import { sharePost } from '@/utils/share'
import { store } from '@/store'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const currentPost = computed(() => store.imageList[store.imageSelectedIndex] || store.imageList[0])

function goHome() {
  location.href = store.isYKSite ? '/post?_wf=1' : location.pathname
}

function goPopular() {
  location.href = '/post/popular_recent?period=1d&_wf=1'
}

function openSearch() {
  eventBus.$emit('mobileSearch')
}

function shareCurrent() {
  sharePost(currentPost.value)
}
</script>
