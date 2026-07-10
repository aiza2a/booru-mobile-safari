<template>
  <div v-if="showImageList" :style="settings.masonryLayout === 'virtual' ? 'height:93vh' : ''">
    <virtual-waterfall
      v-if="settings.masonryLayout === 'virtual'"
      class="virtual-waterfall"
      :class="{ 'wf-no-fit-screen': notFitScreen }"
      :gap="10"
      :preload-screen-count="[1, 1]"
      :item-min-width="300"
      :items="store.imageList"
      :max-column-count="virtualMaxCol"
      :calc-item-height="calcItemHeight"
      style="min-height: 93vh"
    >
      <template #default="{ item, index }">
        <div class="posts-image-card">
          <img
            class="post-image-v"
            alt=""
            loading="lazy"
            :src="getImgSrc(item)"
            role="button"
            tabindex="0"
            @click="onImageClick(index)"
            @touchstart="onPostTouchStart($event, item)"
            @touchmove="onPostTouchMove"
            @touchend="onPostTouchEnd"
            @touchcancel="cancelPostLongPress"
            @contextmenu="onCtxMenu($event, item)"
            @error="onImageLoadError(item?.id || '')"
          >
          <template v-if="store.isYKSite">
            <v-icon
              v-if="//@ts-ignore
                item?.data?.has_children"
              class="posts-image-type"
              dense
            >
              {{ mdiFileTree }}
            </v-icon>
            <v-icon
              v-if="//@ts-ignore
                item?.data?.parent_id"
              class="posts-image-type"
              dense
            >
              {{ mdiFolderNetwork }}
            </v-icon>
          </template>
          <v-icon
            v-if="item?.fileExt.toLowerCase() === 'gif'"
            class="posts-image-type"
          >
            {{ mdiFileGifBox }}
          </v-icon>
          <v-icon
            v-if="['mp4', 'webm'].includes(item?.fileExt.toLowerCase())"
            class="posts-image-type"
          >
            {{ mdiVideo }}
          </v-icon>
          <div v-if="!isR34Fav && settings.showPostCheckbox" class="posts-image-checkbox">
            <v-checkbox class="ma-0 pa-0" :value="isPostChecked(item?.id)" hide-details @change="onPostCheckboxChange($event, item)" />
          </div>
          <div v-if="settings.showListPostReso" class="posts-image-wh">{{ item?.width }} × {{ item?.height }}</div>
          <div v-if="!isR34Fav" class="posts-image-actions">
            <v-btn icon color="#fff" :title="$t('EsiorRgoeHI8h7IHMLDA4')" :href="item?.postView" target="_blank" rel="noreferrer">
              <v-icon>{{ mdiLinkVariant }}</v-icon>
            </v-btn>
            <v-btn v-if="notPartialSupportSite" icon color="#fff" :title="$t('hVmfDxXoj8vkgVQabEOSr')" @click.stop="addToSelectedList(item)">
              <v-icon>{{ mdiPlaylistPlus }}</v-icon>
            </v-btn>
            <v-btn v-if="notPartialSupportSite" icon color="#fff" :title="$t('VpuyxZtIoDF9-YyOm0tK_')" @click.stop="downloadCtxPost(item)">
              <v-icon>{{ mdiDownload }}</v-icon>
            </v-btn>
            <v-btn v-if="isFavBtnShow" icon color="#fff" :title="$t('Dnnio9m9RZA6bkTLytc99')" @click.stop="addFavorite(item?.id)">
              <v-icon>{{ mdiHeartPlusOutline }}</v-icon>
            </v-btn>
          </div>
        </div>
      </template>
    </virtual-waterfall>
    <wf-layout v-else>
      <v-card
        v-for="(image, index) in store.imageList"
        :key="index"
        class="posts-image-card"
        :style="imgCardStyle(image)"
      >
        <template v-if="settings.masonryLayout === 'justified'">
          <img
            class="post-image"
            alt=""
            loading="lazy"
            :src="getImgSrc(image)"
            role="button"
            tabindex="0"
            @click="onImageClick(index)"
            @touchstart="onPostTouchStart($event, image)"
            @touchmove="onPostTouchMove"
            @touchend="onPostTouchEnd"
            @touchcancel="cancelPostLongPress"
            @contextmenu="onCtxMenu($event, image)"
            @error="onImageLoadError(image?.id || '')"
          >
        </template>
        <v-img
          v-else
          transition="scroll-y-transition"
          :src="getImgSrc(image)"
          :aspect-ratio="image?.aspectRatio"
          @click="onImageClick(index)"
          @touchstart="onPostTouchStart($event, image)"
          @touchmove="onPostTouchMove"
          @touchend="onPostTouchEnd"
          @touchcancel="cancelPostLongPress"
          @contextmenu="onCtxMenu($event, image)"
          @error="onImageLoadError(image?.id)"
        >
          <template #placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate color="deep-purple" />
            </v-row>
          </template>
        </v-img>
        <template v-if="store.isYKSite">
          <v-icon
            v-if="//@ts-ignore
              image?.data?.has_children"
            class="posts-image-type"
            dense
          >
            {{ mdiFileTree }}
          </v-icon>
          <v-icon
            v-if="//@ts-ignore
              image?.data?.parent_id"
            class="posts-image-type"
            dense
          >
            {{ mdiFolderNetwork }}
          </v-icon>
          <!-- Mobile actions are available through long press. -->
        </template>
        <v-icon
          v-if="image?.fileExt.toLowerCase() === 'gif'"
          class="posts-image-type"
        >
          {{ mdiFileGifBox }}
        </v-icon>
        <v-icon
          v-if="['mp4', 'webm'].includes(image?.fileExt.toLowerCase())"
          class="posts-image-type"
        >
          {{ mdiVideo }}
        </v-icon>
        <div v-if="!isR34Fav && settings.showPostCheckbox" class="posts-image-checkbox">
          <v-checkbox class="ma-0 pa-0" :value="isPostChecked(image?.id)" hide-details @change="onPostCheckboxChange($event, image)" />
        </div>
        <div v-if="settings.showListPostReso" class="posts-image-wh">{{ image?.width }} × {{ image?.height }}</div>
        <div v-if="!isR34Fav" class="posts-image-actions">
          <v-btn icon color="#fff" :title="$t('EsiorRgoeHI8h7IHMLDA4')" :href="image?.postView" target="_blank" rel="noreferrer">
            <v-icon>{{ mdiLinkVariant }}</v-icon>
          </v-btn>
          <v-btn v-if="notPartialSupportSite" class="hidden-md-and-down" icon color="#fff" :title="$t('hVmfDxXoj8vkgVQabEOSr')" @click.stop="addToSelectedList(image)">
            <v-icon>{{ mdiPlaylistPlus }}</v-icon>
          </v-btn>
          <v-btn v-if="notPartialSupportSite" icon color="#fff" :title="$t('VpuyxZtIoDF9-YyOm0tK_')" @click.stop="downloadCtxPost(image)">
            <v-icon>{{ mdiDownload }}</v-icon>
          </v-btn>
          <v-btn v-if="isFavBtnShow" icon color="#fff" :title="$t('Dnnio9m9RZA6bkTLytc99')" @click.stop="addFavorite(image?.id)">
            <v-icon>{{ mdiHeartPlusOutline }}</v-icon>
          </v-btn>
        </div>
      </v-card>
    </wf-layout>
    <div class="d-flex justify-center">
      <v-btn v-show="store.requestLoading" color="primary" text>
        {{ $t('RN4dt81l_fZMWODsskZob') }}...
      </v-btn>
      <v-btn v-show="showLoadMore" color="primary" text @click="searchPosts()">
        {{ $t('fC8XNfCl04zK7vgeaRZMQ') }}
      </v-btn>
      <v-btn v-show="showNoMore" class="mt-2" color="primary" text>
        {{ $t('Z4pa8GhgE63OGGvCqAld0') }}...
      </v-btn>
    </div>
    <v-menu v-model="showMenu" :position-x="x" :position-y="y" absolute offset-y>
      <v-list>
        <v-list-item v-if="ctxActPost" @click="sharePost(ctxActPost)">
          <v-list-item-title>分享作品链接</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isFavBtnShow" @click="addFavorite()">
          <v-list-item-title>{{ $t('Dnnio9m9RZA6bkTLytc99') }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="notPartialSupportSite" @click="downloadCtxPost()">
          <v-list-item-title>{{ $t('VpuyxZtIoDF9-YyOm0tK_') }}</v-list-item-title>
        </v-list-item>
        <v-list-item @click="openDetail()">
          <v-list-item-title>{{ $t('EsiorRgoeHI8h7IHMLDA4') }}</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="notPartialSupportSite" class="hidden-md-and-down" @click="addToSelectedList()">
          <v-list-item-title>{{ $t('hVmfDxXoj8vkgVQabEOSr') }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <PostDetail />
  </div>
</template>

<script setup lang="ts">
import { mdiDownload, mdiFileGifBox, mdiFileTree, mdiFolderNetwork, mdiHeartPlusOutline, mdiLinkVariant, mdiPlaylistPlus, mdiVideo } from '@mdi/js'
import { computed, nextTick, onMounted, onUnmounted, ref, set, watch } from 'vue'
import type { Post } from '@himeka/booru'
import PostDetail from './PostDetail.vue'
import { downloadFile, fancyboxShow, notReachBottom, showMsg, throttleScroll } from '@/utils'
import { sharePost } from '@/utils/share'
import { notPartialSupportSite } from '@/api/booru'
import { addPostToFavorites, isFavBtnShow } from '@/api/fav'
import { isRule34FavPage } from '@/api/rule34'
import { isGelbooruFavPage } from '@/api/gelbooru'
import { isR34PahealHome } from '@/api/r34-paheal'
import { initPosts, searchPosts } from '@/store/actions/post'
import { removeFromSelectedList, settings, store, addToSelectedList as storeAddToSelectedList } from '@/store'
import i18n from '@/utils/i18n'

const notFitScreen = ref(localStorage.getItem('__fitScreen') == '0')
const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const isR34Fav = ref(isRule34FavPage() || isGelbooruFavPage())
const showImageList = ref(true)
let longPressTimer: number | undefined
let longPressStartX = 0
let longPressStartY = 0
let longPressTriggered = false

watch(
  () => settings.selectedColumn,
  () => {
    showImageList.value = false
    nextTick(() => {
      showImageList.value = true
    })
  },
)

const showNoMore = computed(() => !store.requestLoading && store.requestStop)
const showLoadMore = computed(() => !store.requestLoading && !store.requestStop)

const ctxActPost = ref<Post>()
const showMenu = ref(false)
const x = ref(0)
const y = ref(0)

const maxHeightStyle = computed(() => {
  const num = +settings.selectedColumn
  if (num == 0 || num > 3) return 'max-height: 60vh;overflow: hidden'
  return ''
})

function imgCardStyle(image: Post) {
  if (settings.masonryLayout !== 'justified') return maxHeightStyle
  let style = `--w:${image?.width};--h:${image?.height};`
  if (settings.justifiedBaseWidth) style += `--jstf-w:${settings.justifiedBaseWidth};`
  return style
}

function getImgSrc(img?: Post) {
  let src = img?.previewUrl
  if (!/\.(mp4|webm)$/i.test(img?.fileUrl || '')) {
    const num = +settings.selectedColumn
    if (settings.isThumbSampleUrl || (num != 0 && num < 7)) {
      src = img?.sampleUrl
    }
    if (location.hostname === 'danbooru.donmai.us' && src) {
      src = src.replace(/(.*)\/180x180\/(.*)jpg/, '$1/720x720/$2webp')
    }
  }
  return src || img?.fileUrl || void 0
}

function openPostMenu(img: Post, xPos: number, yPos: number) {
  showMenu.value = false
  x.value = xPos
  y.value = yPos
  nextTick(() => {
    ctxActPost.value = img
    showMenu.value = true
  })
}

function cancelPostLongPress() {
  if (longPressTimer) window.clearTimeout(longPressTimer)
  longPressTimer = undefined
}

function onPostTouchStart(ev: TouchEvent, img: Post) {
  if (!isMobile || ev.touches.length !== 1) return
  const touch = ev.touches[0]
  longPressStartX = touch.clientX
  longPressStartY = touch.clientY
  longPressTriggered = false
  cancelPostLongPress()
  longPressTimer = window.setTimeout(() => {
    longPressTriggered = true
    if (settings.longPressDirectShare) sharePost(img)
    else openPostMenu(img, touch.clientX, touch.clientY)
  }, 520)
}

function onPostTouchMove(ev: TouchEvent) {
  const touch = ev.touches[0]
  if (!touch) return
  if (Math.abs(touch.clientX - longPressStartX) > 12 || Math.abs(touch.clientY - longPressStartY) > 12) {
    cancelPostLongPress()
  }
}

function onPostTouchEnd(ev: TouchEvent) {
  if (longPressTriggered) ev.preventDefault()
  cancelPostLongPress()
}

function onImageClick(index: number) {
  if (longPressTriggered) {
    longPressTriggered = false
    return
  }
  showImgModal(index)
}

function onCtxMenu(ev: MouseEvent, img: Post) {
  if (isR34Fav.value) return
  ev.preventDefault()
  if (isMobile && settings.longPressDirectShare) {
    sharePost(img)
    return
  }
  openPostMenu(img, ev.clientX, ev.clientY)
}

function showImgModal(index: number) {
  if (settings.useFancybox) {
    fancyboxShow(store.imageList, index)
    return
  }
  store.imageSelectedIndex = index
  store.showImageSelected = true
}

function openDetail(post?: Post) {
  const img = post || ctxActPost.value
  img && window.open(img.postView, '_blank', 'noreferrer')
}

function addToSelectedList(post?: Post) {
  const img = post || ctxActPost.value
  img && storeAddToSelectedList(img)
}

function addFavorite(id?: string) {
  if (!isFavBtnShow) return
  const imgId = id || ctxActPost.value?.id
  imgId && addPostToFavorites(imgId)
}

async function downloadCtxPost(post?: Post) {
  const img = post || ctxActPost.value
  if (!img) return
  let { fileDownloadName } = img
  if (!img.fileUrl) return
  if (store.isYKSite) {
    fileDownloadName = `${location.hostname} ${img.id} ${img.tags.join(' ')}`
  }
  if (isR34PahealHome()) {
    // @ts-expect-error protected prop
    fileDownloadName = `${fileDownloadName}.${img.data.file_name.split('.').pop()}`
  }
  try {
    await downloadFile(img.fileUrl, fileDownloadName)
  } catch (error) {
    showMsg({ msg: `${i18n.t('FAqj5ONm50QMfIt9Vq2p1')}: ${error}`, type: 'error' })
  }
}

function isPostChecked(id?: string) {
  return store.selectedImageList.some(e => e.id === id)
}
function onPostCheckboxChange(e: any, image: Post) {
  e ? storeAddToSelectedList(image) : removeFromSelectedList(image.id)
}

function onImageLoadError(id: string) {
  const item = store.imageList.find(e => e.id == id)
  if (!item) return
  if (item.previewUrl) {
    set(item, 'previewUrl', null)
    set(item, 'sampleUrl', null)
    return
  }
  if (location.hostname != 'rule34.xxx') return
  const { fileUrl } = item
  if (!fileUrl) return
  if (fileUrl.includes('.jpeg')) {
    set(item, 'fileUrl', fileUrl.replace(/\.jpeg(\?\d+)?$/, '.jpg'))
  } else if (fileUrl.includes('.jpg')) {
    set(item, 'fileUrl', fileUrl.replace(/\.jpg(\?\d+)?$/, '.png'))
  } else {
    set(item, 'fileUrl', fileUrl.replace(/\.png(\?\d+)?$/, '.gif'))
  }
}

const virtualMaxCol = computed(() => {
  const num = Number(settings.selectedColumn)
  return num > 0 ? num : undefined
})
function calcItemHeight(item: any, itemWidth: number) {
  return item.height * (itemWidth / item.width)
}

const scrollFn = throttleScroll(_scroll => {
  if (store.requestStop) return
  if (store.requestLoading) return
  notReachBottom() && searchPosts(true)
})

onMounted(async () => {
  await initPosts()
  window.addEventListener('scroll', scrollFn)
})

onUnmounted(() => {
  window.removeEventListener('scroll', scrollFn)
})
</script>
