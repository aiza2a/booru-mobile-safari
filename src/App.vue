<template>
  <v-app :class="{ 'mobile-only-notice-app': !isMobile }">
    <template v-if="isMobile">
      <AppBar />
      <NavDrawer />
      <ImmersiveExit />
      <MobileSearchFab />
      <v-main app>
        <AppContainer />
        <SettingsDrawer />
      </v-main>
    </template>
    <main v-else class="mobile-only-notice">
      <section class="mobile-only-notice__card">
        <p class="mobile-only-notice__eyebrow">Mobile only</p>
        <h1>Booru Mobile Safari</h1>
        <p class="mobile-only-notice__lead">此版本仅支持 iPhone Safari / Stay</p>
        <p class="mobile-only-notice__description">
          本仓库是手机端专用精简版，桌面端 UI 已不再维护。请在 iPhone Safari 或 Stay 中使用。
        </p>
        <a href="https://github.com/aiza2a/booru-mobile-safari" target="_blank" rel="noreferrer">查看项目主页</a>
      </section>
    </main>
  </v-app>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import { watch } from 'vue'
import AppBar from './components/AppBar.vue'
import NavDrawer from './components/NavDrawer.vue'
// Mobile page shortcuts live in the settings drawer.
import ImmersiveExit from './components/ImmersiveExit.vue'
import MobileSearchFab from './components/MobileSearchFab.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import AppContainer from './components/AppContainer.vue'
import { useVuetify } from './plugins/vuetify'
import { settings } from './store'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const vuetify = useVuetify()

function syncThemeChrome(mode: typeof settings.darkMode) {
  vuetify.theme.dark = mode === 'dark'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark' ? '#111318' : '#f2f2f7')
}

watch(() => settings.darkMode, syncThemeChrome, { immediate: true })

watch(() => settings, val => {
  localStorage.setItem('YM_APP_SETTINGS', JSON.stringify(val))
}, { deep: true })
</script>
