import { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Play, Info } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '../lib/utils'

interface HeroBannerProps {
  items: Array<{
    id: number
    media_type: string
    title?: string
    name?: string
    backdrop_path: string | null
    poster_path: string | null
    vote_average: number
    overview: string
  }>
  interval?: number
}

export default function HeroBanner({ items, interval = 8000 }: HeroBannerProps) {
  const [idx, setIdx] = useState(0)
  const [dir, setDir] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval>>()

  const goTo = useCallback((i: number) => {
    setDir(i > idx ? 1 : -1)
    setIdx(i)
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        const n = (prev + 1) % items.length
        setDir(1)
        return n
      })
    }, interval)
  }, [idx, items.length, interval])

  useEffect(() => {
    if (!items.length) return
    timerRef.current = setInterval(() => {
      setIdx(prev => {
        const n = (prev + 1) % items.length
        setDir(1)
        return n
      })
    }, interval)
    return () => clearInterval(timerRef.current)
  }, [items.length, interval])

  if (!items.length) return null

  const item = items[idx]
  const title = item.title ?? item.name ?? ''
  const backdrop = item.backdrop_path
    ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
    : null

  return (
    <section className="relative w-full h-[75vh] min-h-[500px] overflow-hidden group">
      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={idx}
          custom={dir}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {backdrop && (
            <img src={backdrop} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" loading="lazy" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-[#060606]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#060606]/90 via-[#060606]/40 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="absolute inset-0 z-20 flex items-end pb-20 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto w-full">
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={idx}
              custom={dir}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="max-w-2xl"
            >
              <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-bold leading-tight text-white mb-3">
                {title}
              </h1>

              <div className="flex items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1 text-sm font-bold text-white px-2 py-1 rounded bg-[#107c10]/20 text-[#107c10] border border-[#107c10]/30">
                  <span className="text-[#107c10]">★</span> {item.vote_average?.toFixed(1)}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  {item.media_type === 'tv' ? 'Series' : 'Movie'}
                </span>
              </div>

              {item.overview && (
                <p className="text-base text-zinc-300 leading-relaxed line-clamp-3 mb-8 max-w-xl">
                  {item.overview}
                </p>
              )}

              <div className="flex items-center gap-4">
                <Link
                  to={`/watch/${item.media_type || 'movie'}/${item.id}`}
                  className="inline-flex items-center gap-2 px-8 py-3 rounded text-sm font-bold text-black bg-[#00f3ff] hover:bg-white transition-colors outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#060606]"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Play
                </Link>
                <button className="inline-flex items-center gap-2 px-8 py-3 rounded text-sm font-bold text-white bg-white/10 hover:bg-white/20 transition-colors outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#060606]">
                  <Info className="w-5 h-5" />
                  More Info
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-6 right-10 z-30 flex justify-end gap-2">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className={cn(
              'h-1 rounded transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]',
              i === idx ? 'w-8 bg-[#00f3ff]' : 'w-4 bg-white/20 hover:bg-white/40',
            )}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
