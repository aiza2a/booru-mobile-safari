const { defineTmHeader } = require('@himeka/vite-userscript')
const mobileSites = {
  'yande.re': { insecure: false },
  'konachan.com': { insecure: false },
  'konachan.net': { insecure: false },
  'danbooru.donmai.us': { insecure: false },
  'gelbooru.com': { insecure: false },
}

module.exports = defineTmHeader({
  "name": "Booru Mobile Safari",
  "name:zh": "Booru 手机瀑布流",
  "name:en": "Booru Mobile Safari",
  "namespace": "me.aiza2a.boorumobilesafari",
  "author": "asadahimeka, aiza2a",
  "description": "面向 iPhone Safari 的 Yande.re、Konachan、Danbooru、Gelbooru 瀑布流与快速分享",
  "description:zh": "面向 iPhone Safari 的 Yande.re、Konachan、Danbooru、Gelbooru 瀑布流与快速分享",
  "description:en": "Mobile-first masonry browsing and native sharing for Yande.re, Konachan, Danbooru and Gelbooru.",
  "homepage": "https://github.com/aiza2a/yandere-masonry",
  "source": "https://github.com/aiza2a/yandere-masonry",
  "icon": "https://upload-bbs.mihoyo.com/upload/2022/05/23/260511332/f1f6267537a5aff959ee63ec2c9e4e52_4821140735490026106.jpg",
  "license": "MIT",
  "match": Object.entries(mobileSites).map(([host, site]) => `http${site.insecure ? '' : 's'}://${host}/*`),
  "supportURL": "https://github.com/aiza2a/yandere-masonry/issues",
  "run-at": "document-end",
})
