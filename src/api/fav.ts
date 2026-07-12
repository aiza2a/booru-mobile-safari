import { addPostToFavorites as addFavoriteMoebooru } from './moebooru'
import { addFavoriteDanbooru } from './danbooru'
import { addFavoriteGelbooru } from './gelbooru'

const favActions: Record<string, (id: string) => Promise<boolean>> = {
  'yande.re': addFavoriteMoebooru,
  'konachan.com': addFavoriteMoebooru,
  'konachan.net': addFavoriteMoebooru,
  'danbooru.donmai.us': addFavoriteDanbooru,
  'gelbooru.com': addFavoriteGelbooru,
}

export const isFavBtnShow = Object.keys(favActions).includes(location.hostname)
export const addPostToFavorites = favActions[location.hostname] || (() => {})
