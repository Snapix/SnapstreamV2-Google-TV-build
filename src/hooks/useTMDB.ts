import { useState, useEffect } from 'react'
import { tmdb, type TMDBMovie, type TMDBShow, type TMDBMovieDetails, type TMDBShowDetails } from '../lib/api'

export function useTrending() {
  const [data, setData] = useState<(TMDBMovie | TMDBShow)[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    tmdb.trending().then(res => { setData(res.results); setLoading(false) }).catch(() => setLoading(false))
  }, [])
  return { data, loading }
}

export function usePopular() {
  const [data, setData] = useState<TMDBMovie[]>([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    tmdb.popular().then(res => { setData(res.results); setLoading(false) }).catch(() => setLoading(false))
  }, [])
  return { data, loading }
}

export function useSearch(query: string) {
  const [data, setData] = useState<(TMDBMovie | TMDBShow)[]>([])
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!query.trim()) { setData([]); return }
    setLoading(true)
    const timer = setTimeout(() => {
      tmdb.search(query).then(res => { setData(res.results); setLoading(false) }).catch(() => setLoading(false))
    }, 400)
    return () => clearTimeout(timer)
  }, [query])
  return { data, loading }
}

export function useMovieDetails(id: number) {
  const [data, setData] = useState<TMDBMovieDetails | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    tmdb.movieDetails(id).then(res => { setData(res); setLoading(false) }).catch(() => setLoading(false))
  }, [id])
  return { data, loading }
}

export function useShowDetails(id: number) {
  const [data, setData] = useState<TMDBShowDetails | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    setLoading(true)
    tmdb.showDetails(id).then(res => { setData(res); setLoading(false) }).catch(() => setLoading(false))
  }, [id])
  return { data, loading }
}

export function useTMDB<T>(endpoint: string | null, fallback: T, params?: Record<string, string | number>) {
  const [data, setData] = useState<T>(fallback)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!endpoint) {
      setData(fallback)
      return
    }
    setLoading(true)
    tmdb.fetch<any>(endpoint, params as Record<string, string>)
      .then(res => {
        if (Array.isArray(fallback) && res && res.results) {
          setData(res.results)
        } else {
          setData(res)
        }
        setLoading(false)
      })
      .catch(() => { setData(fallback); setLoading(false) })
  }, [endpoint, JSON.stringify(params)])

  return { data, loading }
}
