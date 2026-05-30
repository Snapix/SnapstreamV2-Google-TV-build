const TMDB_BASE = 'https://api.themoviedb.org/3'
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY
const IMG_BASE = 'https://image.tmdb.org/t/p'

if (!TMDB_KEY) {
  console.warn('VITE_TMDB_API_KEY is not set. Using fallback key.')
}

const key = TMDB_KEY || '5d171c3c2129745de5276e5a575ffcf6'

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${endpoint}`)
  url.searchParams.set('api_key', key)
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`)
  return res.json()
}

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  genre_ids: number[]
  media_type?: string
}

export interface TMDBShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  vote_average: number
  genre_ids: number[]
  media_type?: string
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime: number
  genres: { id: number; name: string }[]
  tagline: string
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
  }
  videos: {
    results: { key: string; site: string; type: string }[]
  }
}

export interface TMDBShowDetails extends TMDBShow {
  seasons: { id: number; name: string; episode_count: number; poster_path: string | null }[]
  number_of_seasons: number
  genres: { id: number; name: string }[]
  tagline: string
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
  }
}

export interface TMDBPaginated<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export const tmdb = {
  fetch: <T>(endpoint: string, params?: Record<string, string>) =>
    tmdbFetch<T>(`/${endpoint.replace(/^\//, '')}`, params ?? {}),
  trending: (page = 1) =>
    tmdbFetch<TMDBPaginated<TMDBMovie & TMDBShow>>('/trending/all/week', { page: String(page) }),

  popular: (page = 1) =>
    tmdbFetch<TMDBPaginated<TMDBMovie>>('/movie/popular', { page: String(page) }),

  topRated: (page = 1) =>
    tmdbFetch<TMDBPaginated<TMDBMovie>>('/movie/top_rated', { page: String(page) }),

  search: (query: string, page = 1) =>
    tmdbFetch<TMDBPaginated<TMDBMovie & TMDBShow>>('/search/multi', { query, page: String(page) }),

  movieDetails: (id: number) =>
    tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, { append_to_response: 'credits,videos' }),

  showDetails: (id: number) =>
    tmdbFetch<TMDBShowDetails>(`/tv/${id}`, { append_to_response: 'credits,videos' }),

  similar: (id: number, type: 'movie' | 'tv') =>
    tmdbFetch<TMDBPaginated<TMDBMovie>>(`/${type}/${id}/similar`),

  genres: () =>
    tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),

  byGenre: (genreId: number, page = 1) =>
    tmdbFetch<TMDBPaginated<TMDBMovie>>('/discover/movie', {
      with_genres: String(genreId),
      page: String(page),
    }),
}

export function imgUrl(path: string | null, size: 'w500' | 'original' | 'w300' | 'w780' = 'w500') {
  if (!path) return '/placeholder.svg'
  return `${IMG_BASE}/${size}${path}`
}
