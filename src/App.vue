<template>
  <v-app>
    <AppBar />
    <NavDrawer />
    <MobileBottomNav />
    <ImmersiveExit />
    <v-main app>
      <AppContainer />
      <SettingsDrawer />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup

import { onMounted, watch } from 'vue'
import AppBar from './components/AppBar.vue'
import NavDrawer from './components/NavDrawer.vue'
import MobileBottomNav from './components/MobileBottomNav.vue'
import ImmersiveExit from './components/ImmersiveExit.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import AppContainer from './components/AppContainer.vue'
import { useVuetify } from './plugins/vuetify'
import { settings } from './store'

const vuetify = useVuetify()
vuetify.theme.dark = settings.darkMode !== 'light'

watch(() => settings, val => {
  localStorage.setItem('YM_APP_SETTINGS', JSON.stringify(val))
}, { deep: true })

onMounted(() => {
  vuetify.theme.dark = settings.darkMode === 'dark'
})
</script>
