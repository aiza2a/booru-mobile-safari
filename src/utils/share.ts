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

export async function sharePost(post?: Post): Promise<boolean> {
  if (!post) return false
  const url = canonicalPostUrl(post)
  const title = `${location.hostname} #${post.id}`
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      return true
    }
    await navigator.clipboard.writeText(url)
    showMsg({ msg: '作品链接已复制', type: 'success' })
    return true
  } catch (error) {
    if ((error as DOMException)?.name === 'AbortError') return false
    try {
      await navigator.clipboard.writeText(url)
      showMsg({ msg: '作品链接已复制', type: 'success' })
      return true
    } catch (_copyError) {
      window.prompt('复制作品链接', url)
      return false
    }
  }
}
