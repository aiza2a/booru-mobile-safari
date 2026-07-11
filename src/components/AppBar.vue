<template>
  <v-app-bar app dense flat :elevation="2">
    <v-app-bar-nav-icon @click="toggleDrawer()" />
    <MobileDateFilter v-if="isMobile" />
    <div v-if="!isMobile && store.isYKSite && showPopAction" style="display:flex" class="align-center">
      <v-toolbar-title class="mr-4 hidden-md-and-down" v-text="popTitle" />
      <v-switch v-model="isPopSearchByDate" class="hidden-sm-and-down" hide-details :label="isPopSearchByDate ? $t('nd4UjZy2ILsc-iW9iu7xR') : $t('elkBQ9moOZ-KMcy5bt_Ts')" />
      <v-btn v-if="isMobile" class="mobile-pop-mode" small icon @click="isPopSearchByDate = !isPopSearchByDate">
        <v-icon>{{ isPopSearchByDate ? mdiCalendar : mdiFire }}</v-icon>
      </v-btn>
      <v-menu transition="slide-y-transition" offset-y>
        <template #activator="{ on, attrs }">
          <v-btn small class="ml-4" v-bind="attrs" v-on="on">
            <v-icon left>{{ mdiCalendarSearch }}</v-icon>
            <span style="margin-bottom:2px">{{ isMobile && isPopSearchByDate ? periodComputedMap[recentPeriod][0].slice(-1) : periodComputedMap[recentPeriod][0] }}</span>
          </v-btn>
        </template>
        <v-list dense>
          <v-list-item v-for="(val, key) in periodComputedMap" :key="key" dense @click="selPeriod(key)">
            <v-list-item-title>
              <v-icon left>{{ val[1] }}</v-icon>
              <span>{{ val[0] }}</span>
            </v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
      <v-menu
        v-model="showPopDatePicker"
        :close-on-content-click="false"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template #activator="{ on, attrs }">
          <div v-show="isPopSearchByDate" class="ml-1 align-center mobile-pop-date" style="display: flex;">
            <v-btn icon @click="loadPrevPeriod()">
              <v-icon>{{ mdiChevronLeft }}</v-icon>
            </v-btn>
            <v-text-field
              :value="isMobile ? popSearchDate.slice(5) : popSearchDate"
              :prepend-icon="mdiCalendar"
              readonly
              hide-details
              v-bind="attrs"
              v-on="on"
            />
            <v-btn icon @click="loadNextPeriod()">
              <v-icon>{{ mdiChevronRight }}</v-icon>
            </v-btn>
          </div>
        </template>
        <v-date-picker
          v-model="popSearchDate"
          no-title
          locale="zh-cn"
          :weekday-format="() => ''"
          @input="showPopDatePicker = false"
        />
      </v-menu>
      <v-btn class="ml-3 hidden-sm-and-down" icon href="/post?_wf=1">
        <v-icon>{{ mdiHome }}</v-icon>
      </v-btn>
    </div>
    <div v-else-if="!isMobile && store.showPostList" style="display:flex" class="align-center">
      <v-toolbar-title class="hidden-md-and-down" v-text="title" />
      <input
        v-if="true"
        :value="store.currentPage"
        class="ml-1 mr-2 text-center rounded"
        :style="{ width: '40px', height: '30px', border: '1px solid #bbb', color: 'inherit' }"
        @keyup="goToPage($event)"
      >
      <template v-if="store.isYKSite">
        <v-btn v-if="userName" class="hidden-sm-and-down" :title="$t('HzMBcS2oNGVIoLiHWprim')" icon @click="fetchTaggedPosts(`vote:3:${userName} order:vote`)">
          <v-icon>{{ mdiStar }}</v-icon>
        </v-btn>
        <v-btn class="hidden-sm-and-down" :title="$t('DXEhXAQbkiCMU_l252jo_')" icon @click="showPool()">
          <v-icon :size="20">{{ mdiImageMultiple }}</v-icon>
        </v-btn>
        <v-btn class="hidden-sm-and-down" :title="$t('9juZMc0gPIgvMPKVORpJ1')" icon @click="goToPopularPage()">
          <v-icon>{{ mdiFire }}</v-icon>
        </v-btn>
        <v-btn class="hidden-sm-and-down" :title="$t('6acPWiYq2-OdySa2_xqDu')" icon @click="fetchTaggedPosts('order:random')">
          <v-icon>{{ mdiShuffle }}</v-icon>
        </v-btn>
      </template>
      <template v-if="isMobile && isSupportTagSearch">
        <v-btn class="mobile-search-trigger" title="搜索标签" icon @click="store.showMobileSearch = true">
          <v-icon>{{ mdiMagnify }}</v-icon>
        </v-btn>
      </template>
      <template v-else-if="isSupportTagSearch">
        <v-menu
          v-model="searchState.showMenu"
          :max-width="200"
          max-height="80vh"
          transition="slide-y-transition"
          nudge-bottom="5px"
          offset-y
        >
          <template #activator="{ on }">
            <v-slide-x-transition>
              <div v-show="searchState.showInput" class="app-bar-tag-input ml-4" style="width: 200px">
                <v-text-field
                  v-model="searchState.searchTerm"
                  hide-details
                  v-on="on"
                  @input="onSearchTermInput"
                  @click="searchState.showMenu = true"
                  @blur="searchState.showMenu = false"
                  @keydown="onSearchTermKeydown"
                />
              </div>
            </v-slide-x-transition>
          </template>
          <v-list v-if="searchState.searchItems.length" class="ac_tags_list" dense>
            <v-progress-linear :active="searchState.loading" :height="4" indeterminate absolute top />
            <v-list-item v-for="item in searchState.searchItems" :key="item" dense @click="selectTag(item)">
              <v-list-item-title v-text="item" />
            </v-list-item>
          </v-list>
        </v-menu>
        <v-btn :title="$t('ZztrWbSaaaas3v0cHtSmh')" icon @click="showTagsInput()">
          <v-icon>{{ mdiMagnify }}</v-icon>
        </v-btn>
      </template>
    </div>
    <div v-else-if="store.showPoolList" style="display:flex" class="align-center">
      <v-toolbar-title v-if="store.showPoolList" class="mr-3 hidden-md-and-down">Pools</v-toolbar-title>
      <v-text-field
        v-model="poolQueryTerm"
        hide-details
        :append-icon="mdiMagnify"
        @keyup.enter="searchPool"
      />
      <v-btn class="ml-3" icon href="/post?_wf=1">
        <v-icon>{{ mdiHome }}</v-icon>
      </v-btn>
      <v-btn class="hidden-sm-and-down" :title="$t('9juZMc0gPIgvMPKVORpJ1')" icon @click="goToPopularPage()">
        <v-icon>{{ mdiFire }}</v-icon>
      </v-btn>
    </div>
    <v-spacer />
    <v-btn v-if="!isMobile" :title="$t('u8mEnSo4mxDRUbj7FeAll')" icon @click="toggleDarkmode">
      <v-icon>{{ mdiBrightness6 }}</v-icon>
    </v-btn>
    <v-btn class="hidden-md-and-down" :title="$t('OrwwNKZ7I70-ecpspE8d_')" icon @click="toggleFullscreen">
      <v-icon :size="30">{{ store.isFullscreen ? mdiFullscreenExit : mdiFullscreen }}</v-icon>
    </v-btn>
    <v-menu transition="slide-y-transition" offset-y>
      <template #activator="{ on, attrs }">
        <v-btn class="hidden-md-and-down" title="Language" icon v-bind="attrs" v-on="on">
          <v-icon>{{ mdiTranslate }}</v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item-group :value="settings.lang" color="primary">
          <v-list-item v-for="lang in langList" :key="lang.value" :value="lang.value" dense @click="selectLang(lang.value)">
            <v-list-item-title>{{ lang.label }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
    </v-menu>
    <!-- Mobile immersive control lives in SettingsDrawer to preserve date capsule space. -->
    <v-btn
      v-if="isMobile"
      class="mobile-settings-btn"
      :title="$t('UxxldE9xRwmQctrvba5Y8')"
      icon
      @click="store.showSettings = true"
    >
      <v-icon :size="22">{{ mdiCog }}</v-icon>
    </v-btn>
    <v-btn v-else :title="$t('UxxldE9xRwmQctrvba5Y8')" icon @click="store.showSettings = true">
      <v-icon :size="22">{{ mdiCog }}</v-icon>
    </v-btn>
    <v-btn class="hidden-md-and-down" :title="$t('ClZdL9hGweOokP7Mn_Ptq')" icon @click="exitMasonry">
      <v-icon>{{ mdiLocationExit }}</v-icon>
    </v-btn>
    <v-dialog
      v-model="store.showMobileSearch"
      fullscreen
      content-class="mobile-search-dialog"
      :transition="false"
      overlay-color="transparent"
      :overlay-opacity="0"
    >
      <v-card class="mobile-search-sheet">
        <v-toolbar flat>
          <v-btn icon @click="store.showMobileSearch = false">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
          <v-text-field
            v-model="searchState.searchTerm"
            class="mobile-search-input"
            placeholder="输入英文标签"
            autofocus
            clearable
            hide-details
            @input="onSearchTermInput"
            @keydown.enter="submitMobileSearch"
          />
          <v-btn text @click="submitMobileSearch">搜索</v-btn>
        </v-toolbar>
        <v-list v-if="searchState.searchItems.length" class="mobile-search-suggestions" dense>
          <v-list-item v-for="item in searchState.searchItems" :key="item" @click="selectMobileTag(item)">
            <v-list-item-title v-text="item" />
          </v-list-item>
        </v-list>
      </v-card>
    </v-dialog>
    <v-progress-linear
      v-if="!isMobile"
      :active="store.requestLoading"
      :height="6"
      indeterminate
      absolute
      bottom
    />
  </v-app-bar>
</template>

<script setup lang="ts">
import {
  mdiBrightness6,
  mdiCalendar,
  mdiCalendarMonth,
  mdiCalendarSearch,
  mdiCalendarText,
  mdiCalendarToday,
  mdiCalendarWeek,
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiCog,
  mdiFire,
  mdiFullscreen,
  mdiFullscreenExit,
  mdiHome,
  mdiImageMultiple,
  mdiLocationExit,
  mdiMagnify,
  mdiShuffle,
  mdiStar,
  mdiTranslate,
} from '@mdi/js'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import MobileDateFilter from './MobileDateFilter.vue'
import { useVuetify } from '@/plugins/vuetify'
import { addDate, debounce, eventBus, formatDate, subDate } from '@/utils'
import { settings, store, toggleDrawer } from '@/store'
import { langList } from '@/store/settings'
import { loadPostsByPage, loadPostsByTags } from '@/store/actions/post'
import { getRecentTags, getUsername, isPopularPage } from '@/api/moebooru'
import { defCompTags, getSiteTitle, isSupportTagSearch } from '@/api/booru'
import { fetchAutocomplete, isAutocompleteAct } from '@/api/autocomplete'

import i18n from '@/utils/i18n'

const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const title = computed(() => `${getSiteTitle()} - ${store.imageList.length} Posts - Page `)

const tagsQuery = new URLSearchParams(location.search).get('tags')
const searchState = reactive({
  showInput: !!tagsQuery,
  showMenu: false,
  searchTerm: tagsQuery || '',
  searchItems: store.isYKSite ? defCompTags.concat(getRecentTags()) : defCompTags,
  loading: false,
})

const onSearchTermInput = debounce(async () => {
  if (!isAutocompleteAct) return
  const val = searchState.searchTerm
  const lastTag = val?.split(/\s+/).slice(-1)[0]
  if (!lastTag) {
    searchState.showMenu = false
    searchState.searchItems = defCompTags
    return
  }
  searchState.loading = true
  searchState.showMenu = true
  searchState.searchItems = await fetchAutocomplete(lastTag)
  searchState.loading = false
}, 500)

function selectTag(tag: string) {
  const termArr = searchState.searchTerm.split(/\s+/)
  searchState.searchTerm = termArr.slice(0, -1).concat(tag).join(' ')
  searchState.showMenu = false
  searchState.searchItems = defCompTags
}

const userName = ref('')
onMounted(async () => {
  if (store.isYKSite) {
    const name = await getUsername()
    if (name) userName.value = name
  }
})

function fetchTaggedPosts(tags: string) {
  const url = new URL(location.href)
  url.searchParams.set('tags', tags)
  history.pushState('', '', url)
  searchState.searchTerm = tags
  loadPostsByTags(tags)
}

function selectMobileTag(tag: string) {
  selectTag(tag)
  searchState.showMenu = false
}

function submitMobileSearch() {
  store.showMobileSearch = false
  fetchTaggedPosts(searchState.searchTerm)
}

function showTagsInput() {
  if (searchState.showInput) {
    if (!searchState.searchTerm) {
      searchState.showInput = false
    }
    fetchTaggedPosts(searchState.searchTerm)
  } else {
    searchState.showInput = true
  }
}

function onSearchTermKeydown(ev: KeyboardEvent) {
  if (ev.key != 'Enter') return
  if (searchState.showMenu && searchState.searchItems.length) {
    const item = document.querySelector<HTMLElement>('.ac_tags_list .v-list-item--highlighted')
    if (item) {
      selectTag(item.innerText)
      return
    }
    searchState.showMenu = false
    fetchTaggedPosts(searchState.searchTerm)
  } else {
    fetchTaggedPosts(searchState.searchTerm)
  }
}

const showPopAction = ref(isPopularPage())

const periodMap: Record<string, string[]> = {
  '1d': [i18n.t('Mt3-hyoH7f_pW2gnfxyur').toString(), mdiCalendarToday, 'day'],
  '1w': [i18n.t('riciqzr6ILBnpPc7KtG-C').toString(), mdiCalendarWeek, 'week'],
  '1m': [i18n.t('PQhFo-g7sgagimkleVoZR').toString(), mdiCalendarMonth, 'month'],
  '1y': [i18n.t('ze1PaiGdX4ufmoOLv_xw6').toString(), mdiCalendarText, 'year'],
}
const periodByDateMap = (() => {
  const map = { ...periodMap }
  delete map['1y']
  return map
})()

function getRecentPeriod() {
  const params = new URLSearchParams(location.search)
  let period: string | null | undefined = params.get('period')
  if (location.pathname.includes('popular_by')) {
    period = location.pathname.match(/\/post\/popular_by_(.*)/)?.[1]
    period = Object.keys(periodByDateMap).find(e => periodByDateMap[e][2] == period)
  }
  return period || '1d'
}
function isPopularRecent() {
  return location.pathname.includes('popular_recent')
}
function getPopTitle() {
  if (isPopularRecent()) {
    return `Popular Recent ${getRecentPeriod()}`
  }
  return location.pathname.split('/').pop()?.replace(/_/g, ' ').toUpperCase()
}

const popTitle = ref(getPopTitle())
const isPopSearchByDate = ref(!isPopularRecent())
const recentPeriod = ref(getRecentPeriod())
const periodComputedMap = computed(() => {
  return isPopSearchByDate.value ? periodByDateMap : periodMap
})

const showPopDatePicker = ref(false)
const popSearchDate = ref((() => {
  const params = new URLSearchParams(location.search)
  const y = params.get('year')
  const m = params.get('month')
  const d = params.get('day')
  if (y && m && d) return formatDate(new Date(`${y}-${m}-${d}`))
  return subDate(1, 'days')
})())

function fetchPopularPosts(type: string) {
  let url = `/post/popular_recent?period=${type}&_wf=1`
  if (isPopSearchByDate.value) {
    const [year, month, day] = popSearchDate.value.split('-')
    url = `/post/popular_by_${periodMap[type][2]}?day=${day}&month=${month}&year=${year}&_wf=1`
  }
  location.assign(url)
}

function selPeriod(key: string) {
  recentPeriod.value = key
  fetchPopularPosts(key)
}

watch(popSearchDate, val => {
  if (!val) return
  fetchPopularPosts(recentPeriod.value)
})

watch(isPopSearchByDate, val => {
  recentPeriod.value = '1d'
  if (val) popSearchDate.value = subDate(1, 'days')
  fetchPopularPosts('1d')
})

function loadPrevPeriod() {
  const duration = periodMap[recentPeriod.value][2]
  popSearchDate.value = subDate(1, `${duration}s`, new Date(popSearchDate.value))
}
function loadNextPeriod() {
  const duration = periodMap[recentPeriod.value][2]
  popSearchDate.value = addDate(1, `${duration}s`, new Date(popSearchDate.value))
}

function goToPopularPage() {
  location.href = '/post/popular_recent?period=1d&_wf=1'
}

function showPool() {
  store.showPostList = false
  store.showPoolList = true
  history.pushState('', '', '/pool')
}

const poolQueryTerm = ref('')
function searchPool() {
  eventBus.$emit('loadPoolsByQuery', poolQueryTerm.value)
}

const vuetify = useVuetify()
function toggleDarkmode() {
  vuetify.theme.dark = !vuetify.theme.dark
  settings.darkMode = vuetify.theme.dark ? 'dark' : 'light'
}

const keyActions: Record<string, Function> = {
  Enter: (cur: number) => loadPostsByPage(cur.toString()),
  ArrowUp: (cur: number) => cur > 1 && keyActions.Enter(--cur),
  ArrowDown: (cur: number) => keyActions.Enter(++cur),
  ArrowLeft: (cur: number) => keyActions.ArrowUp(cur),
  ArrowRight: (cur: number) => keyActions.ArrowDown(cur),
}
function goToPage(ev: KeyboardEvent) {
  const action = keyActions[ev.key]
  if (!action) return
  const input = ev.target as HTMLInputElement
  action(input?.value || 0)
}

function exitMasonry() {
  const url = new URL(location.href)
  url.searchParams.delete('_wf')
  location.assign(url)
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
    } else {
      await document.documentElement.requestFullscreen()
    }
  } catch (error) {
    console.log('toggleFullscreen error: ', error)
  }
}

function selectLang(val: typeof settings.lang) {
  settings.lang = val
  i18n.locale = val
}

onMounted(() => {
  eventBus.$on('mobileSearch', () => {
    store.showMobileSearch = true
  })
  document.addEventListener('fullscreenchange', () => {
    store.isFullscreen = !!document.fullscreenElement
  })
})
</script>
