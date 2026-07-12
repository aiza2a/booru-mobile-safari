import { searchTagsByName } from './moebooru'

async function fetchDanbooruAutocomplete(term: string) {
  const response = await fetch(`https://danbooru.donmai.us/autocomplete.json?search[query]=${term}&search[type]=tag_query&version=1&limit=20`)
  if (!response.ok) {
    return []
  }
  const result: any[] = await response.json()
  return result.map(e => e.value as string)
}

async function fetchGelbooruAutocomplete(term: string) {
  const response = await fetch(`https://gelbooru.com/index.php?page=autocomplete2&term=${term}&type=tag_query&limit=10`)
  if (!response.ok) {
    return []
  }
  const result: any[] = await response.json()
  return result.map(e => e.value as string)
}

const autocompleteActions: Record<string, (term: string) => Promise<string[]>> = {
  'yande.re': async term => searchTagsByName(term),
  'konachan.com': async term => searchTagsByName(term),
  'konachan.net': async term => searchTagsByName(term),
  'danbooru.donmai.us': fetchDanbooruAutocomplete,
  'gelbooru.com': fetchGelbooruAutocomplete,
}

export const isAutocompleteAct = Object.keys(autocompleteActions).includes(location.hostname)
export const fetchAutocomplete = autocompleteActions[location.hostname] || (() => {})
