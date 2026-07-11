<template>
  <component
    :is="isMobile ? 'div' : 'v-dialog'"
    v-show="!isMobile || store.showImageSelected"
    v-model="store.showImageSelected"
    :fullscreen="!isMobile"
    :content-class="isMobile ? undefined : 'ios-detail-dialog'"
    :transition="false"
    overlay-color="transparent"
    :overlay-opacity="0"
    :class="isMobile ? ['mobile-detail-overlay', `mobile-detail-overlay--${detailVisualState}`] : undefined"
  >
    <div v-if="isMobile" class="mobile-detail-backdrop" aria-hidden="true" @click="close"></div>
    <div
      v-if="store.showImageSelected"
      class="img_detail_cont"
      @click="onDtlContClick"
      @touchstart.passive="onTouchStart"
      @touchend.passive="onTouchEnd"
    >
      <template v-if="isVideo">
        <DPlayer
          v-if="isVideoShow"
          :style="`width: ${imageSelectedWidth > imageSelected.width ? imageSelected.width : imageSelectedWidth}px`"
          :options="{ theme: '#8E24AA', autoplay: true, loop: true, video: { url: imageSelected.fileUrl } }"
        />
      </template>
      <div
        v-else
        :class="{ 'img_scale_scroll': scaleOn, 'img_scale_normal': !scaleOn, 'detail-media-stage': !scaleOn }"
        :style="!scaleOn ? detailColorStyle : undefined"
        draggable="false"
      >
        <img
          v-if="!scaleOn && imgLasySrc"
          class="detail-media-ambient"
          :src="imgLasySrc"
          alt=""
          aria-hidden="true"
        >
        <div v-if="!scaleOn" class="detail-media-shade" aria-hidden="true"></div>
        <v-row v-show="imgLoading" class="img_detail_loading" @click.stop="close">
          <img v-if="(showPreviewThumb && !scaleOn)" :src="imgLasySrc" :width="imageSelectedWidth" alt="">
          <v-progress-circular :size="100" :width="6" indeterminate color="deep-purple" />
        </v-row>
        <img
          v-if="!scaleOn"
          class="img_detail_sample"
          draggable="false"
          alt=""
          :src="imgSrc"
          :width="imgLoading ? 0 : imageSelectedWidth"
          @click.stop="close"
          @load="onDetailImageLoad"
          @error="onImageLoadError"
        >
        <img
          v-if="scaleOn"
          class="img_detail_scale"
          draggable="false"
          alt=""
          :src="scaleImgSrc"
          :style="scaleImgStyle"
          @load="imgLoading = false"
          @error="onScaleImgError"
        >
      </div>
    </div>
    <v-toolbar
      v-show="showImageToolbar && scaleOn && !isVideo"
      class="img-detail-toolbar img_detail_btn_color"
      :class="{ 'detail-buttons-bottom': settings.detailButtonsBottom }"
      color="transparent"
      height="auto"
      flat
    >
      <v-spacer />
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            class="mr-1 hidden-sm-and-down"
            v-on="on"
            @click.stop="imgScaleState = 'FitToPage'"
          >
            <v-icon>{{ mdiFitToScreenOutline }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('M-wISnLiQgM_DURMwKZGT') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="imgScaleState = 'FitToWidth'"
          >
            <v-icon>{{ mdiTableSplitCell }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('ad8lEoWap_nT9U69WBKen') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="imgScaleState = 'FitToHeight'"
          >
            <v-icon style="transform:rotate(90deg)">{{ mdiTableSplitCell }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('GjMNbm97OgVvpIYlkOisE') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="imgScaleState = 'Original'"
          >
            <v-icon>{{ mdiLoupe }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('KkkM-iz8RCVQoTrTfhS5j') }}</span>
      </v-tooltip>
      <v-tooltip v-if="!store.isFullscreen" bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            class="mr-1 hidden-sm-and-down"
            v-on="on"
            @click.stop="reqFullscreen"
          >
            <v-icon>{{ mdiFullscreen }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('XvOYJ5gHo37M1XztPl18z') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="rotateImg"
          >
            <v-icon>{{ mdiRotateRight }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('_bQs7o9oQSo7ao1G0cp3d') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="zoomOutImg()"
          >
            <v-icon>{{ mdiMagnifyMinusOutline }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('lPPsX2CZbXwC-EGN79Rki') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn fab small v-bind="attrs" v-on="on" @click.stop="close">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('t83UAY18UebTg1_-zFGP3') }}</span>
      </v-tooltip>
    </v-toolbar>
    <v-toolbar
      v-show="showImageToolbar && !scaleOn"
      class="img-detail-toolbar img_detail_btn_color"
      :class="{ 'detail-buttons-bottom': settings.detailButtonsBottom }"
      color="transparent"
      height="auto"
      flat
    >
      <v-chip
        class="hidden-xs-only"
        small
        role="button"
        tabindex="0"
        @click.stop="toDetailPage"
        v-text="`${imageSelected.rating?.toUpperCase()} ${imageSelected.id}`"
      />
      <v-chip
        v-if="imgCreateTime"
        class="ml-1 hidden-sm-and-down"
        small
        :title="imageSelected.createdTime"
        v-text="imgCreateTime"
      />
      <v-chip-group v-show="metaTags.length" column class="hidden-sm-and-down img_detail_tag_list img_meta_tag_list">
        <v-chip
          v-for="(item, i) in metaTags"
          :key="i"
          class="img_detail_tag"
          :class="`tag_type_${item.type}`"
          :color="item.color"
          :title="item.tagText"
          small
          text-color="#ffffff"
          role="button"
          tabindex="0"
          @click.stop="toTagsPage(item.tag)"
          v-text="item.tagText"
        />
      </v-chip-group>
      <v-spacer />
      <v-tooltip v-if="isFavBtnShow" bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            class="mr-1"
            v-on="on"
            @click.stop="addFavorite"
          >
            <v-icon>{{ postDetail.voted ? mdiHeart : mdiHeartPlusOutline }}</v-icon>
          </v-btn>
        </template>
        <span>{{ postDetail.voted ? $t('pEU9Y9K7DsODkocCDwq_O') : $t('2ZPEAvLkCbV3mC0iJAw9K') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            class="mr-1"
            :href="imageSelected.postView"
            target="_blank"
            rel="noreferrer"
            v-on="on"
          >
            <v-icon>{{ mdiLinkVariant }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('caFFJlrS1wa_F86uKPykd') }}</span>
      </v-tooltip>
      <v-tooltip v-if="imageSelected.sourceUrl" bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            v-bind="attrs"
            class="mr-1"
            v-on="on"
            @click.stop="toSourcePage"
          >
            <v-icon>{{ mdiLaunch }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('qSF4OLshg2EEX4CwtBE6r') }} {{ imageSelected.sourceUrl }}</span>
      </v-tooltip>
      <v-tooltip v-if="!isVideo" bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="zoomInImg()"
          >
            <v-icon>{{ mdiMagnifyPlusOutline }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('B_ptN5O-9PhmG5ymGGtc6') }}</span>
      </v-tooltip>
      <v-tooltip v-if="notPartialSupportSite && notR34Fav" bottom>
        <template #activator="{ on, attrs }">
          <v-btn
            fab
            small
            class="mr-1"
            v-bind="attrs"
            v-on="on"
            @click.stop="addToList"
          >
            <v-icon>{{ mdiPlaylistPlus }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('hVmfDxXoj8vkgVQabEOSr') }}</span>
      </v-tooltip>
      <v-tooltip bottom>
        <template #activator="{ on, attrs }">
          <v-btn fab small v-bind="attrs" v-on="on" @click.stop="close">
            <v-icon>{{ mdiClose }}</v-icon>
          </v-btn>
        </template>
        <span>{{ $t('t83UAY18UebTg1_-zFGP3') }}</span>
      </v-tooltip>
    </v-toolbar>
    <div v-show="showImageToolbar" class="img_detail_btn_color">
      <div class="img-detail-tags" :class="{ 'detail-buttons-bottom': settings.detailButtonsBottom }">
        <v-chip
          v-show="postDetail.tags?.length"
          small
          class="mr-1"
          role="button"
          tabindex="0"
          @click.stop="settings.showTagChipGroup = !settings.showTagChipGroup"
        >
          <v-icon left>{{ mdiTagMultiple }}</v-icon>
          <span>{{ settings.showTagChipGroup ? $t('gM92sLo0Cqfl2rCaXlOhc') : $t('l5W-EtJ_ar-SY2lF4H5Zm') }}</span>
        </v-chip>
        <template v-if="store.isYKSite">
          <v-chip
            v-if="//@ts-ignore
              imageSelected?.data?.parent_id"
            small
            class="mr-1"
            role="button"
            tabindex="0"
            @click.stop="//@ts-ignore
              toPidPage(imageSelected?.data?.parent_id)"
          >
            <v-icon small left>{{ mdiFolderNetwork }}</v-icon>
            <span>{{ $t('sMkrF8bqCTJZZ1kXTkT_R') }}</span>
          </v-chip>
          <v-chip
            v-if="//@ts-ignore
              imageSelected?.data?.has_children"
            small
            class="mr-1"
            role="button"
            tabindex="0"
            @click.stop="toTagsPage(`parent:${imageSelected?.id}&_wf=1`)"
          >
            <v-icon small left>{{ mdiFileTree }}</v-icon>
            <span>{{ $t('u0K7A_hv1RZSJl6TDR61A') }}</span>
          </v-chip>
        </template>
        <v-chip-group v-show="settings.showTagChipGroup" column class="img_detail_tag_list">
          <v-chip
            v-for="(item, i) in postDetail.tags || []"
            :key="i"
            small
            class="img_detail_tag mr-1"
            :class="`tag_type_${item.type}`"
            :color="item.color"
            text-color="#ffffff"
            role="button"
            tabindex="0"
            @click.stop="toTagsPage(item.tag)"
            v-text="item.tagText"
          />
        </v-chip-group>
      </div>
      <v-btn fab small class="poa_left_center hidden-sm-and-down" style="z-index: 10;" @click.stop="showPrevPost">
        <v-icon>{{ mdiChevronLeft }}</v-icon>
      </v-btn>
      <v-btn fab small class="poa_right_center hidden-sm-and-down" style="z-index: 10;" @click.stop="showNextPost">
        <v-icon>{{ mdiChevronRight }}</v-icon>
      </v-btn>
    </div>
    <div
      v-if="isMobile && store.showImageSelected && showImageToolbar"
      class="mobile-detail-nav"
      @click.stop
    >
      <v-btn icon aria-label="上一张" @click="showPrevPost">
        <v-icon>{{ mdiChevronLeft }}</v-icon>
      </v-btn>
      <v-btn icon aria-label="分享帖子链接" @click="sharePost(imageSelected)">
        <v-icon>{{ mdiShareVariant }}</v-icon>
      </v-btn>
      <v-btn
        icon
        :disabled="!validSourceUrl"
        :aria-label="`分享来源 ${sourceName}`"
        @click="shareSource"
      >
        <v-icon>{{ mdiLaunch }}</v-icon>
      </v-btn>
      <v-btn icon aria-label="下一张" @click="showNextPost">
        <v-icon>{{ mdiChevronRight }}</v-icon>
      </v-btn>
    </div>
  </component>
</template>

<script setup lang="ts">
import {
  mdiChevronLeft,
  mdiChevronRight,
  mdiClose,
  mdiFileTree,
  mdiFitToScreenOutline,
  mdiFolderNetwork,
  mdiFullscreen,
  mdiHeart,
  mdiHeartPlusOutline,
  mdiLaunch,
  mdiLinkVariant,
  mdiLoupe,
  mdiMagnifyMinusOutline,
  mdiMagnifyPlusOutline,
  mdiPlaylistPlus,
  mdiRotateRight,
  mdiShareVariant,
  mdiTableSplitCell,
  mdiTagMultiple,
} from '@mdi/js'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import DPlayer from './DPlayer.vue'
import { debounce, dragElement, formatRelativeTime, isURL } from '@/utils'
import { sharePost, shareUrl, sourceLabel } from '@/utils/share'
import { gelbooru, realbooru, rule34, zerochan } from '@/api'
import { type PostDetail } from '@/api/moebooru'
import { addPostToFavorites, isFavBtnShow } from '@/api/fav'
import { notPartialSupportSite } from '@/api/booru'
import { isDanbooruPage } from '@/api/danbooru'
import { getZerochanFileUrl } from '@/api/zerochan'
import { addToSelectedList, settings, store } from '@/store'
import { searchPosts } from '@/store/actions/post'
import { setPostDetail } from '@/store/actions/detail'
import i18n from '@/utils/i18n'

const notR34Fav = ref(!(
  rule34.fav.is()
  || rule34.firefox.is()
  || gelbooru.fav.is()
  || gelbooru.is()
  || zerochan.is()
  || realbooru.is()
))
const isMobile = window.matchMedia('(max-width: 959px), (pointer: coarse)').matches
const showImageToolbar = ref(true)
const detailVisualState = ref<'closed' | 'opening' | 'open' | 'closing'>('closed')
const detailColors = ref(['38, 40, 46', '24, 27, 34', '68, 62, 76'])
let detailLockedScrollY = 0
const detailImageRect = ref({ width: 0, height: 0 })
const detailColorStyle = computed(() => ({
  '--detail-color-a': detailColors.value[0],
  '--detail-color-b': detailColors.value[1],
  '--detail-color-c': detailColors.value[2],
  '--detail-media-width': `${detailImageRect.value.width}px`,
  '--detail-media-height': `${detailImageRect.value.height}px`,
}))
const imgLoading = ref(true)
const innerWidth = ref(window.innerWidth)
const innerHeight = ref(window.innerHeight)
const scaleOn = ref(false)

const imageSelected = computed(() => store.imageList[store.imageSelectedIndex] ?? {})
const isVideo = computed(() => {
  const { fileUrl, fileExt } = imageSelected.value
  if (!fileUrl) return false
  try {
    if (['mp4', 'webm'].includes(fileExt)) {
      return true
    }
    const url = new URL(fileUrl)
    return url.pathname.endsWith('.mp4') || url.pathname.endsWith('.webm')
  } catch (_error) {
    return false
  }
})
const imgSrc = computed(() => {
  if (isVideo.value) return void 0
  return imageSelected.value.sampleUrl
    ?? imageSelected.value.fileUrl
    ?? void 0
})
const imgLasySrc = computed(() => {
  if (isVideo.value) return void 0
  return imageSelected.value.previewUrl
    ?? imageSelected.value.sampleUrl
    ?? imageSelected.value.fileUrl
    ?? void 0
})

const imageSelectedWidth = computed(() => {
  const width = Number.parseInt(
    Math.min(
      innerWidth.value * 1,
      imageSelected.value.sampleWidth || innerWidth.value,
    ).toString(),
  )
  const height = Math.min(innerHeight.value * 1, imageSelected.value.sampleHeight || innerHeight.value)
  const width2 = Number.parseInt((height * imageSelected.value.aspectRatio).toString())
  return Math.min(width, width2)
})

const notYKSite = computed(() => {
  return ['konachan', 'yande'].every(e => !location.host.includes(e))
})

const imgCreateTime = computed(() => {
  return formatRelativeTime(imageSelected.value.createdAt)
})

let touchStartX = 0
let touchStartY = 0
let touchStartedAt = 0

function onTouchStart(ev: TouchEvent) {
  if (!isMobile || ev.touches.length !== 1 || scaleOn.value) return
  touchStartX = ev.touches[0].clientX
  touchStartY = ev.touches[0].clientY
  touchStartedAt = Date.now()
}

function onTouchEnd(ev: TouchEvent) {
  if (!isMobile || scaleOn.value || !touchStartedAt) return
  const touch = ev.changedTouches[0]
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  const elapsed = Date.now() - touchStartedAt
  touchStartedAt = 0
  if (elapsed > 700) return
  if (Math.abs(dx) > 64 && Math.abs(dx) > Math.abs(dy) * 1.35) {
    dx < 0 ? showNextPost() : showPrevPost()
    return
  }
  if (dy > 96 && Math.abs(dy) > Math.abs(dx) * 1.35) close()
}

function lockDetailScroll() {
  if (!isMobile || document.documentElement.classList.contains('mobile-detail-open')) return
  detailLockedScrollY = window.scrollY
  document.documentElement.classList.add('mobile-detail-open')
  document.body.style.top = `-${detailLockedScrollY}px`
}

function unlockDetailScroll() {
  if (!document.documentElement.classList.contains('mobile-detail-open')) return
  document.documentElement.classList.remove('mobile-detail-open')
  document.body.style.top = ''
  window.scrollTo(0, detailLockedScrollY)
}

function extractDetailColors(image: HTMLImageElement) {
  try {
    const canvas = document.createElement('canvas')
    canvas.width = 12
    canvas.height = 12
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return
    context.drawImage(image, 0, 0, 12, 12)
    const data = context.getImageData(0, 0, 12, 12).data
    const buckets = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
    for (let index = 0; index < data.length; index += 16) {
      if (data[index + 3] < 160) continue
      const luminance = data[index] * 0.299 + data[index + 1] * 0.587 + data[index + 2] * 0.114
      const bucket = luminance < 80 ? buckets[1] : luminance > 175 ? buckets[2] : buckets[0]
      bucket[0] += data[index]
      bucket[1] += data[index + 1]
      bucket[2] += data[index + 2]
      bucket[3]++
    }
    detailColors.value = buckets.map((bucket, index) => {
      if (!bucket[3]) return ['48, 50, 58', '24, 27, 34', '86, 78, 96'][index]
      return `${Math.round(bucket[0] / bucket[3])}, ${Math.round(bucket[1] / bucket[3])}, ${Math.round(bucket[2] / bucket[3])}`
    })
  } catch (_error) {
    detailColors.value = ['48, 50, 58', '24, 27, 34', '86, 78, 96']
  }
}

function updateDetailImageRect(image: HTMLImageElement) {
  const availableWidth = Math.max(0, innerWidth.value - 48)
  const availableHeight = Math.max(0, innerHeight.value - 110 - 64)
  const naturalWidth = image.naturalWidth || imageSelected.value.sampleWidth || availableWidth
  const naturalHeight = image.naturalHeight || imageSelected.value.sampleHeight || availableHeight
  const ratio = Math.min(availableWidth / naturalWidth, availableHeight / naturalHeight, 1)
  detailImageRect.value = {
    width: Math.round(naturalWidth * ratio),
    height: Math.round(naturalHeight * ratio),
  }
}

function onDetailImageLoad(event: Event) {
  const image = event.target as HTMLImageElement
  imgLoading.value = false
  updateDetailImageRect(image)
  extractDetailColors(image)
}

async function close() {
  if (detailVisualState.value === 'closing' || detailVisualState.value === 'closed') return
  detailVisualState.value = 'closing'
  await new Promise(resolve => window.setTimeout(resolve, 150))
  store.showImageSelected = false
}

function toggleToolbar() {
  if (scaleOn.value) return
  if (settings.closePopupOnImgClick) {
    close()
    return
  }
  showImageToolbar.value = !showImageToolbar.value
}

function toTagsPage(tag: string) {
  if (store.isYKSite) {
    window.open(`/post?tags=${tag}`, '_blank', 'noreferrer')
  }
  if (isDanbooruPage()) {
    window.open(`/posts?tags=${tag}`, '_blank', 'noreferrer')
  }
}

function toPidPage(pid: string) {
  if (notYKSite.value) return
  window.open(`/post/show/${pid}`, '_blank', 'noreferrer')
}

function toDetailPage() {
  window.open(imageSelected.value.postView, '_blank', 'noreferrer')
}

const validSourceUrl = computed(() => {
  const url = imageSelected.value.sourceUrl
  return url && isURL(url) ? url : ''
})
const sourceName = computed(() => sourceLabel(validSourceUrl.value))

async function shareSource() {
  if (!validSourceUrl.value) return
  await shareUrl(validSourceUrl.value, `来源：${sourceName.value}`)
}

function toSourcePage() {
  const { sourceUrl } = imageSelected.value
  if (!isURL(sourceUrl)) return
  window.open(sourceUrl, '_blank', 'noreferrer')
}

function addToList() {
  addToSelectedList(imageSelected.value)
}

function onDtlContClick(ev: Event) {
  const el = ev.target as HTMLElement
  if (el?.className?.includes?.('img_detail_cont')) {
    close()
  }
}

const postDetail = ref<PostDetail>({})
const metaTags = computed(() => postDetail.value.tags?.filter(e => e.type != 'general') || [])

async function addFavorite() {
  if (!isFavBtnShow || postDetail.value.voted) return
  const isSuccess = await addPostToFavorites(imageSelected.value.id)
  if (isSuccess) postDetail.value.voted = true
}

const preloadImgEl = new Image()
function preloadImg(src: string) {
  console.log('preloadImg: ', src)
  return new Promise((resolve, reject) => {
    preloadImgEl.src = src
    preloadImgEl.onload = resolve
    preloadImgEl.onerror = reject
  })
}

async function preloadNextImg() {
  if (!settings.isFullImgPreload) return
  if (isVideo.value) return
  for (let index = 1; index <= settings.imgPreloadNum; index++) {
    console.log('index: ', index)
    const next = store.imageList[store.imageSelectedIndex + index]
    if (!next) break
    const imgSrc = (scaleOn.value ? next.jpegUrl : next.sampleUrl) || next.fileUrl
    await preloadImg(imgSrc || '')
  }
}

const isVideoShow = ref(true)
async function toggleVideoShow() {
  isVideoShow.value = false
  await nextTick()
  isVideoShow.value = true
}

const showPreviewThumb = ref(true)

async function showPrevPost() {
  if (store.imageSelectedIndex == 0) return
  if (showPreviewThumb.value) {
    showPreviewThumb.value = false
  }
  imgLoading.value = true
  store.imageSelectedIndex--
  isVideo.value && toggleVideoShow()
  await setPostDetail(imageSelected, postDetail)
}

async function showNextPost() {
  if (showPreviewThumb.value) {
    showPreviewThumb.value = false
  }
  if (store.imageSelectedIndex >= store.imageList.length - 1) {
    if (store.requestLoading || store.requestStop) return
    await searchPosts()
  }
  imgLoading.value = true
  store.imageSelectedIndex++
  isVideo.value && toggleVideoShow()
  await setPostDetail(imageSelected, postDetail)
  preloadNextImg()
}

function onImageLoadError(ev: Event) {
  // imgLoading.value = false
  imageSelected.value.sampleUrl = null

  if (notR34Fav.value) {
    return
  }
  const { fileUrl } = imageSelected.value
  const el = ev.target as HTMLImageElement

  if (fileUrl && location.hostname.includes('zerochan')) {
    getZerochanFileUrl(imageSelected.value.id).then(url => {
      imageSelected.value.fileUrl = url
    })
    return
  }

  if (!el?.src.includes('/images/')) {
    el.src = imageSelected.value.fileUrl || ''
    return
  }
  if (fileUrl?.includes('.jpeg')) {
    imageSelected.value.fileUrl = fileUrl.replace(/\.jpeg(\?\d+)?$/, '.jpg')
    return
  }
  if (fileUrl?.includes('.jpg')) {
    imageSelected.value.fileUrl = fileUrl.replace(/\.jpg(\?\d+)?$/, '.png')
    return
  }
  if (fileUrl && (realbooru.is() || rule34.firefox.is())) {
    imageSelected.value.fileUrl = fileUrl.replace(/\.png(\?\d+)?$/, '.gif')
  }
}

const scaleImgSrc = computed(() => {
  return scaleOn.value
    ? (imageSelected.value.jpegUrl || imageSelected.value.fileUrl || void 0)
    : void 0
})

function onScaleImgError(ev: Event) {
  if (notR34Fav.value) {
    // @ts-expect-error data protected
    imageSelected.value.data.jpeg_url = null
    return
  }

  // imgLoading.value = false

  const img = ev.target as HTMLImageElement
  const { fileUrl } = imageSelected.value

  if (fileUrl && location.hostname.includes('zerochan')) {
    getZerochanFileUrl(imageSelected.value.id).then(url => {
      imageSelected.value.fileUrl = url
      img.src = url
    })
    return
  }
  if (fileUrl?.includes('.jpeg')) {
    imageSelected.value.fileUrl = fileUrl.replace(/\.jpeg(\?\d+)?$/, '.jpg')
    img.src = imageSelected.value.fileUrl
    return
  }
  if (fileUrl?.includes('.jpg')) {
    imageSelected.value.fileUrl = fileUrl.replace(/\.jpg(\?\d+)?$/, '.png')
    img.src = imageSelected.value.fileUrl
    return
  }
  if (fileUrl && (realbooru.is() || rule34.firefox.is())) {
    imageSelected.value.fileUrl = fileUrl.replace(/\.png(\?\d+)?$/, '.gif')
    img.src = imageSelected.value.fileUrl
  }
}

const scaleImgStyleMap = {
  FitToPage: { maxWidth: '100vw', maxHeight: '100vh' },
  FitToWidth: { width: '100vw' },
  FitToHeight: { height: '100vh' },
  Original: {},
}

type ImgScaleState = 'FitToPage' | 'FitToWidth' | 'FitToHeight' | 'Original'
const imgScaleState = ref<ImgScaleState>('Original')

const imgRotateDeg = ref(0)
function rotateImg() {
  imgScaleState.value = 'FitToPage'
  imgRotateDeg.value += 90
}

const scaleImgStyle = computed(() => ({
  ...scaleImgStyleMap[imgScaleState.value],
  'transform': `rotate(${imgRotateDeg.value}deg)`,
  'transform-origin': 'center center',
}))

let clearDragEv: (() => void) | undefined
async function zoomInImg() {
  scaleOn.value = true
  if (imageSelected.value.sampleUrl) {
    imgLoading.value = true
  }
  await nextTick()
  clearDragEv = dragElement('.img_scale_scroll', '.img_detail_scale')
}
function zoomOutImg() {
  scaleOn.value = false
  imgRotateDeg.value = 0
  clearDragEv?.()
}

async function reqFullscreen() {
  try {
    if (document.fullscreenElement) return
    const img = document.querySelector('.img_detail_scale')
    await img?.requestFullscreen()
  } catch (error) {
    console.log('toggleFullscreen error: ', error)
  }
}

watch(() => store.showImageSelected, async val => {
  if (val) {
    lockDetailScroll()
    detailVisualState.value = 'opening'
    imgLoading.value = true
    await nextTick()
    requestAnimationFrame(() => { detailVisualState.value = 'open' })
    await setPostDetail(imageSelected, postDetail)
    preloadNextImg()
  } else {
    detailVisualState.value = 'closed'
    unlockDetailScroll()
    scaleOn.value = false
    postDetail.value = {}
    await nextTick()
    showPreviewThumb.value = true
  }
})

function onResize() {
  innerWidth.value = window.innerWidth
  innerHeight.value = window.innerHeight
}

const isTriggerEvent = computed(() => {
  if (!store.showImageSelected) return false
  if (isVideo.value) return false
  if (scaleOn.value && imgScaleState.value !== 'FitToPage') return false
  return true
})

const onWheel = debounce((ev: WheelEvent) => {
  if (!isTriggerEvent.value) return
  ev.deltaY > 0 ? showNextPost() : showPrevPost()
}, 500, true)

const onKeyup = debounce((ev: KeyboardEvent) => {
  if (!isTriggerEvent.value) return
  ev.preventDefault()
  if (['ArrowLeft', 'a', 'A'].includes(ev.key)) {
    showPrevPost()
    return
  }
  if (['ArrowRight', 'd', 'D'].includes(ev.key)) {
    showNextPost()
    return
  }
  if (['f', 'F'].includes(ev.key)) {
    addFavorite()
  }
}, 500, true)

onMounted(() => {
  window.addEventListener('resize', onResize)
  settings.isListenWheelEvent && window.addEventListener('wheel', onWheel)
  settings.isListenKeyupEvent && window.addEventListener('keyup', onKeyup)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  settings.isListenWheelEvent && window.removeEventListener('wheel', onWheel)
  settings.isListenKeyupEvent && window.removeEventListener('keyup', onKeyup)
})
</script>
