<template>
  <v-bottom-navigation
    v-if="isMobile && store.showPostList && !store.showImageSelected && store.isYKSite"
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
    <v-btn @click="goPopular">
      <span>人气</span>
      <v-icon>{{ mdiFire }}</v-icon>
    </v-btn>
    <v-btn @click="goRandom">
      <span>随机</span>
      <v-icon>{{ mdiShuffle }}</v-icon>
    </v-btn>
    <v-btn @click="goPool">
      <span>图集</span>
      <v-icon>{{ mdiImageMultiple }}</v-icon>
    </v-btn>
  </v-bottom-navigation>
</template>

<script setup lang="ts">
import { mdiFire, mdiHome, mdiImageMultiple, mdiShuffle } from '@mdi/js'
import { store } from '@/store'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches

function goHome() {
  location.href = '/post?_wf=1'
}

function goPopular() {
  location.href = '/post/popular_recent?period=1d&_wf=1'
}

function goRandom() {
  location.href = '/post?tags=order%3Arandom&page=1&_wf=1'
}

function goPool() {
  location.href = '/pool?page=1&_wf=1'
}
</script>
