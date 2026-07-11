import type { Post } from '@himeka/booru'
import { showMsg } from '@/utils'

function canonicalPostUrl(post: Post): string {
  const id = String(post.id)
  const host = location.hostname
  if (host === 'yande.re') return `https://yande.re/post/show/${id}`
  if (host === 'konachan.com') return `https://konachan.com/post/show/${id}`
  if (host === 'konachan.net') return `https://konachan.net/post/show/${id}`
  if (host === 'danbooru.donmai.us') return `https://danbooru.donmai.us/posts/${id}`
  if (host === 'gelbooru.com') return `https://gelbooru.com/index.php?page=post&s=view&id=${id}`
  return post.postView || location.href
}

async function copyUrl(url: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(url)
    showMsg({ msg: '链接已复制', type: 'success' })
    return true
  } catch (_error) {
    const textarea = document.createElement('textarea')
    textarea.value = url
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const copied = document.execCommand('copy')
    textarea.remove()
    if (copied) showMsg({ msg: '链接已复制', type: 'success' })
    return copied
  }
}

export async function shareUrl(url: string, title: string): Promise<boolean> {
  if (!url) return false
  if (!navigator.share) return copyUrl(url)

  const shareData: ShareData = { title, url }
  if (navigator.canShare && !navigator.canShare(shareData)) return false
  try {
    await navigator.share(shareData)
    return true
  } catch (_error) {
    // Stay/Safari can reject an otherwise valid request when native sharing is
    // temporarily unavailable. Do not start a second clipboard permission flow
    // or show a false failure banner; the long-press state restores normally.
    return false
  }
}

export async function sharePost(post?: Post): Promise<boolean> {
  if (!post) return false
  return shareUrl(canonicalPostUrl(post), `${location.hostname} #${post.id}`)
}

export function sourceLabel(sourceUrl?: string | null): string {
  if (!sourceUrl) return '来源'
  try {
    const host = new URL(sourceUrl).hostname.replace(/^www\./, '')
    if (host === 'x.com' || host === 'twitter.com') return 'X'
    if (host.endsWith('pixiv.net')) return 'Pixiv'
    if (host.endsWith('fanbox.cc')) return 'FANBOX'
    if (host.endsWith('fantia.jp')) return 'Fantia'
    return host
  } catch (_error) {
    return '来源'
  }
}
