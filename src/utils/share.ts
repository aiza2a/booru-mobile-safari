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

export async function shareUrl(url: string, title: string): Promise<boolean> {
  if (!url) return false
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return true
    }
    await navigator.clipboard.writeText(url)
    showMsg({ msg: '链接已复制', type: 'success' })
    return true
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return false
    try {
      await navigator.clipboard.writeText(url)
      showMsg({ msg: '链接已复制', type: 'success' })
      return true
    } catch (_copyError) {
      const textarea = document.createElement('textarea')
      textarea.value = url
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      textarea.remove()
      showMsg({ msg: '链接已复制', type: 'success' })
      return true
    }
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
