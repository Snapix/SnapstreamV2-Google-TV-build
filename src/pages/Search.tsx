import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useTMDB } from '../hooks/useTMDB'
import { MovieCard } from '../components/MovieCard'
import GlassSurface from '../components/GlassSurface'
import { FadeContent } from '../components/FadeContent'

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [input, setInput] = useState(q)
  const [debounced, setDebounced] = useState(q)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), 300)
    return () => clearTimeout(t)
  }, [input])

  useEffect(() => {
    if (debounced.trim()) {
      setSearchParams({ q: debounced.trim() })
    } else {
      setSearchParams({})
    }
  }, [debounced])

  const { data: results, loading } = useTMDB<any[]>(
    debounced.trim() ? 'search/multi' : null,
    [],
    { query: debounced.trim(), page: 1 },
  )

  const filtered = results?.filter(
    (r: any) => r.media_type === 'movie' || r.media_type === 'tv',
  ) ?? []

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24 pb-16">
      <GlassSurface />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeContent delay={0.1}>
          <div className="relative mb-8">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-zinc-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Search movies, shows, anime…"
              className="w-full pl-12 pr-12 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-zinc-500 text-lg font-medium outline-none focus:border-white/30 focus:bg-white/[0.07] transition-all"
              autoFocus
            />
            {input && (
              <button
                onClick={() => setInput('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            )}
          </div>
        </FadeContent>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {debounced && !loading && filtered.length === 0 && (
          <FadeContent delay={0.2}>
            <div className="text-center py-20">
              <p className="text-zinc-500 text-lg">No results found</p>
            </div>
          </FadeContent>
        )}

        {!debounced && (
          <FadeContent delay={0.2}>
            <p className="text-zinc-500 text-center py-20">Start typing to find movies & shows…</p>
          </FadeContent>
        )}

        <AnimatePresence mode="wait">
          {debounced && !loading && filtered.length > 0 && (
            <motion.div
              key={debounced}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {filtered.slice(0, 30).map((item: any) => (
                <MovieCard key={item.id} item={item} mediaType={item.media_type} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
