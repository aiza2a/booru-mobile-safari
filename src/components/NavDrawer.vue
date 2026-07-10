<template>
  <v-navigation-drawer v-model="store.showDrawer" class="nav_drawer mobile-site-drawer" app temporary>
    <v-list-item class="drawer-title-row">
      <v-list-item-content>
        <v-list-item-title class="title">选择站点</v-list-item-title>
        <v-list-item-subtitle>常用图站与浏览器</v-list-item-subtitle>
      </v-list-item-content>
      <v-list-item-action>
        <v-btn icon aria-label="关闭" @click="store.showDrawer = false">
          <v-icon>{{ mdiClose }}</v-icon>
        </v-btn>
      </v-list-item-action>
    </v-list-item>
    <v-divider />
    <v-list v-if="store.isYKSite" dense nav class="drawer-shortcuts">
      <v-subheader>快捷入口</v-subheader>
      <v-list-item link @click="openSite('/post?_wf=1')">
        <v-list-item-icon class="mr-3"><v-icon>{{ mdiHome }}</v-icon></v-list-item-icon>
        <v-list-item-content><v-list-item-title>首页</v-list-item-title></v-list-item-content>
      </v-list-item>
      <v-list-item link @click="openSite('/post/popular_recent?period=1d&_wf=1')">
        <v-list-item-icon class="mr-3"><v-icon>{{ mdiFire }}</v-icon></v-list-item-icon>
        <v-list-item-content><v-list-item-title>人气作品</v-list-item-title></v-list-item-content>
      </v-list-item>
      <v-list-item link @click="openSite('/post?tags=order%3Arandom&page=1&_wf=1')">
        <v-list-item-icon class="mr-3"><v-icon>{{ mdiShuffle }}</v-icon></v-list-item-icon>
        <v-list-item-content><v-list-item-title>随机作品</v-list-item-title></v-list-item-content>
      </v-list-item>
      <v-list-item link @click="openSite('/pool?page=1&_wf=1')">
        <v-list-item-icon class="mr-3"><v-icon>{{ mdiImageMultiple }}</v-icon></v-list-item-icon>
        <v-list-item-content><v-list-item-title>图集</v-list-item-title></v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list v-if="isDanbooru" dense nav class="drawer-shortcuts">
      <v-subheader>Danbooru 浏览</v-subheader>
      <v-list-item v-for="item in danbooruShortcuts" :key="item.url" link @click="openSite(item.url)">
        <v-list-item-icon class="mr-3"><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
        <v-list-item-content><v-list-item-title>{{ item.label }}</v-list-item-title></v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list v-if="isGelbooru" dense nav class="drawer-shortcuts">
      <v-subheader>Gelbooru 浏览</v-subheader>
      <v-list-item v-for="item in gelbooruShortcuts" :key="item.url" link @click="openSite(item.url)">
        <v-list-item-icon class="mr-3"><v-icon>{{ item.icon }}</v-icon></v-list-item-icon>
        <v-list-item-content><v-list-item-title>{{ item.label }}</v-list-item-title></v-list-item-content>
      </v-list-item>
    </v-list>
    <v-divider v-if="store.isYKSite || isDanbooru || isGelbooru" />
    <v-list dense nav class="site-switch-list">
      <v-subheader>站点列表</v-subheader>
      <v-list-item
        v-for="site in sites"
        :key="site.url"
        :class="{ 'site-switch-active': site.host === locationHost }"
        link
        @click="openSite(site.url)"
      >
        <v-list-item-icon class="mr-3">
          <img :src="site.icon" class="site_icon" loading="lazy" referrerpolicy="no-referrer">
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>{{ site.label }}</v-list-item-title>
          <v-list-item-subtitle v-if="site.note">{{ site.note }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { mdiClose, mdiEye, mdiFire, mdiHome, mdiImageMultiple, mdiShuffle, mdiStar, mdiTrendingUp } from '@mdi/js'
import { store } from '@/store'

const locationHost = location.hostname
const isDanbooru = locationHost === 'danbooru.donmai.us'
const isGelbooru = locationHost === 'gelbooru.com'
const danbooruShortcuts = [
  { label: '首页', url: 'https://danbooru.donmai.us/posts?_wf=1', icon: mdiHome },
  { label: '最多观看', url: 'https://danbooru.donmai.us/explore/posts/viewed?_wf=1', icon: mdiEye },
  { label: '最受欢迎', url: 'https://danbooru.donmai.us/explore/posts/popular?_wf=1', icon: mdiStar },
  { label: '热度最高', url: 'https://danbooru.donmai.us/posts?d=1&tags=order%3Arank&_wf=1', icon: mdiTrendingUp },
  { label: '画集', url: 'https://danbooru.donmai.us/pools/gallery', icon: mdiImageMultiple },
]
const gelbooruShortcuts = [
  { label: '首页', url: 'https://gelbooru.com/index.php?page=post&s=list&_wf=1', icon: mdiHome },
  { label: '评分最高', url: 'https://gelbooru.com/index.php?page=post&s=list&tags=sort%3Ascore%3Adesc&_wf=1', icon: mdiStar },
  { label: '最近更新', url: 'https://gelbooru.com/index.php?page=post&s=list&tags=sort%3Aupdated%3Adesc&_wf=1', icon: mdiTrendingUp },
  { label: '画集', url: 'https://gelbooru.com/index.php?page=pool&s=list', icon: mdiImageMultiple },
]
const iconProxy = (host: string) => `https://kwc.cocomi.eu.org/https://${host}/favicon.ico`
const konachanIcon = 'https://upload-bbs.miyoushe.com/upload/2023/01/14/190122060/cbd0b71ead30e0777e5b023170ba415c_4819570566325089051.png'
const rule34Icon = 'https://upload-bbs.miyoushe.com/upload/2025/03/29/190122060/76ba90d4350a1455f899d2a1500fca69_8344852329496206545.png'

const sites = [
  { label: 'Yande.re', host: 'yande.re', url: 'https://yande.re/post?_wf=1', icon: iconProxy('yande.re') },
  { label: 'Konachan', host: 'konachan.com', url: 'https://konachan.com/post?_wf=1', icon: konachanIcon },
  { label: 'Konachan Safe', host: 'konachan.net', url: 'https://konachan.net/post?_wf=1', icon: konachanIcon },
  { label: 'Danbooru', host: 'danbooru.donmai.us', url: 'https://danbooru.donmai.us/posts?_wf=1', icon: iconProxy('danbooru.donmai.us') },
  { label: 'Gelbooru', host: 'gelbooru.com', url: 'https://gelbooru.com/index.php?page=post&s=list&_wf=1', icon: iconProxy('gelbooru.com') },
  { label: 'Rule34', host: 'rule34.xxx', url: 'https://rule34.xxx/index.php?page=post&s=list&_wf=1', icon: rule34Icon },
  { label: 'Safebooru', host: 'safebooru.org', url: 'https://safebooru.org/index.php?page=post&s=list&_wf=1', icon: iconProxy('safebooru.org') },
  { label: 'Zerochan', host: 'www.zerochan.net', url: 'https://www.zerochan.net/', icon: iconProxy('www.zerochan.net') },
  { label: 'Pixiv Viewer', host: 'pixiv.pictures', url: 'https://pixiv.pictures/', icon: 'https://pixiv.pictures/favicon.ico', note: 'Pixiv 浏览器' },
  { label: 'Moeview', host: 'moeview.app', url: 'https://moeview.app/', icon: 'https://moeview.app/favicon.ico', note: '图片聚合浏览' },
]

function openSite(url: string) {
  store.showDrawer = false
  location.href = url
}
</script>
