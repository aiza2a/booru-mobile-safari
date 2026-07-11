import type { Post } from '@himeka/booru'
import { booruAction, danbooruExplore, gelbooru, moebooru } from '@/api'

interface FetchPostsAction {
  is: () => boolean
  posts: (page: number, tags: string | null) => Promise<Post[]>
}

export const fetchPostsActions: FetchPostsAction[] = [
  moebooru.popular,
  moebooru.pool,
  moebooru.yanderehtml,
  danbooruExplore,
  gelbooru,
  booruAction,
  { is: () => true, posts: async () => [] },
]

export const fetchDetailActions: never[] = []
