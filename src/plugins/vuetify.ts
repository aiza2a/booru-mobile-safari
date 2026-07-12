// Styles
// import '@mdi/font/css/materialdesignicons.css'
// import 'vuetify/dist/vuetify.min.css'

import Vue, { getCurrentInstance } from 'vue'
import Vuetify from 'vuetify'
// import { loadFonts } from './webfontloader'

// loadFonts()

function installVuetify() {
  Vue.use(Vuetify)
  return new Vuetify({
    icons: {
      iconfont: 'mdiSvg',
    },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#7b4db2',
          secondary: '#65558f',
          accent: '#8e5bc7',
          background: '#f2f2f7',
          surface: '#ffffff',
          anchor: '#68409a',
        },
        dark: {
          primary: '#d8b4fe',
          secondary: '#a78bfa',
          accent: '#f0abfc',
          background: '#08090c',
          surface: '#14161b',
          anchor: '#c4b5fd',
        },
      },
    },
  })
}

export default installVuetify

/** Get vuetify instance (For Composition api) */
export function useVuetify() {
  /** Get Instance */
  const instance = getCurrentInstance()
  if (!instance) {
    throw new Error('Should be used in setup().')
  }
  return instance.proxy.$vuetify
}
