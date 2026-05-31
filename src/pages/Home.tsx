import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { Film, MonitorPlay, Gamepad2 } from 'lucide-react'
import { useTMDB } from '../hooks/useTMDB'
import { FadeContent } from '../components/FadeContent'
import { tmdb } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { getLiveTVChannels } from '../lib/iptv'
import { motion, AnimatePresence } from 'framer-motion'

// ── Static games for apps section ──
const STATIC_GAME_ITEMS = [
  {
    id: 'pvz-goty',
    title: 'Plants vs. Zombies GOTY',
    overview: 'Get ready to soil your plants! A mob of fun-loving zombies is about to invade your home.',
    backdrop_path: null,
    poster_path: null,
    vote_average: 9.6,
    media_type: 'game',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3590/header.jpg',
  },
  {
    id: 'gta-5-enhanced',
    title: 'GTA 5 Enhanced',
    overview: 'Experience the world of Los Santos and Blaine County in the ultimate Grand Theft Auto V experience.',
    backdrop_path: null,
    poster_path: null,
    vote_average: 9.9,
    media_type: 'game',
    thumb: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/header.jpg',
  },
]

interface HomeProps {
  // ── FIX: was missing 'apps' variant – caused unhandled prop from App.tsx ──
  mediaType?: 'video' | 'livetv' | 'apps'
}

interface TVRow {
  id: string
  title: string
  items: any[]
}

export default function Home({ mediaType: mediaProp = 'video' }: HomeProps) {
  // ── FIX: local state was never synced with prop changes (tab switching broke) ──
  // Solution: remove redundant local state, derive directly from prop
  const mediaType = mediaProp

  const [liveTVChannels, setLiveTVChannels] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()

  // D-Pad Focus: [rowIndex, colIndex]
  const [focusedPos, setFocusedPos] = useState<[number, number]>([0, 0])
  const containerRef = useRef<HTMLDivElement>(null)

  // TMDB Rows
  const { data: trendingWorld } = useTMDB<any[]>('trending/all/day', [], { page: '1' })
  const { data: trendingIndia } = useTMDB<any[]>('discover/movie', [], { with_origin_country: 'IN', sort_by: 'popularity.desc' })
  const { data: kidsContent } = useTMDB<any[]>('discover/movie', [], { with_genres: '16', sort_by: 'popularity.desc' })
  const { data: topMovies } = useTMDB<any[]>('movie/top_rated', [], { page: '1' })
  const { data: topTV } = useTMDB<any[]>('tv/top_rated', [], { page: '1' })

  // Hero state
  const [focusedItemDetails, setFocusedItemDetails] = useState<any>(null)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)

  // Reset focus when mediaType changes
  useEffect(() => {
    setFocusedPos([0, 0])
    setTrailerKey(null)
    setFocusedItemDetails(null)
  }, [mediaType])

  // Load live channels only when needed
  useEffect(() => {
    if (mediaType === 'livetv') {
      getLiveTVChannels().then(setLiveTVChannels)
    }
  }, [mediaType])

  const tvRows: TVRow[] = useMemo(() => {
    if (mediaType === 'livetv') {
      return [{ id: 'live', title: 'Live TV Channels', items: liveTVChannels }]
    }
    // ── FIX: apps case was completely unhandled ──
    if (mediaType === 'apps') {
      return [{ id: 'games', title: 'Games & Apps', items: STATIC_GAME_ITEMS }]
    }
    // Default: video (movies & TV)
    return [
      { id: 'trending-world', title: 'Trending Worldwide', items: trendingWorld ?? [] },
      { id: 'trending-india', title: 'Trending in India', items: trendingIndia ?? [] },
      { id: 'kids', title: 'Kids & Family', items: kidsContent ?? [] },
      { id: 'movies', title: 'Top Rated Movies', items: topMovies ?? [] },
      { id: 'tv', title: 'Top TV Series', items: topTV ?? [] },
    ].filter(r => r.items.length > 0)
  }, [mediaType, liveTVChannels, trendingWorld, trendingIndia, kidsContent, topMovies, topTV])

  // Fetch trailer for focused item (debounced 1.5s to avoid API spam on D-pad)
  useEffect(() => {
    const currentItem = tvRows[focusedPos[0]]?.items[focusedPos[1]]
    if (!currentItem || mediaType !== 'video') {
      setFocusedItemDetails(currentItem ?? null)
      setTrailerKey(null)
      return
    }
    setFocusedItemDetails(currentItem)

    const type: 'movie' | 'tv' =
      currentItem.media_type === 'tv' || currentItem.first_air_date ? 'tv' : 'movie'

    const timer = setTimeout(async () => {
      try {
        const res = await tmdb.getVideos(currentItem.id, type)
        const trailer =
          res.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube') ??
          res.results?.[0]
        setTrailerKey(trailer?.key ?? null)
      } catch {
        setTrailerKey(null)
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [focusedPos, tvRows, mediaType])

  // Navigate to content on selection
  const activateItem = useCallback(
    (item: any) => {
      if (!item) return
      if (mediaType === 'livetv') {
        navigate(`/live/${encodeURIComponent(item.url)}/${encodeURIComponent(item.name)}`)
      } else if (mediaType === 'apps') {
        navigate(`/game/${item.id}`)
      } else {
        const type =
          item.media_type === 'tv' || item.first_air_date ? 'tv' : 'movie'
        navigate(`/watch/${type}/${item.id}`)
      }
    },
    [navigate, mediaType],
  )

  // Android TV D-pad keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close drawer with Right or Escape
      if (drawerOpen) {
        if (e.key === 'ArrowRight' || e.keyCode === 22 || e.key === 'Escape') {
          setDrawerOpen(false)
          e.preventDefault()
        }
        return
      }

      const [r, c] = focusedPos
      const maxRows = tvRows.length
      if (maxRows === 0) return
      const currentRowLen = tvRows[r]?.items.length ?? 0

      switch (true) {
        case e.key === 'ArrowRight' || e.keyCode === 22:
          setFocusedPos([r, Math.min(c + 1, currentRowLen - 1)])
          e.preventDefault()
          break
        case e.key === 'ArrowLeft' || e.keyCode === 21:
          if (c === 0) setDrawerOpen(true)
          else setFocusedPos([r, Math.max(c - 1, 0)])
          e.preventDefault()
          break
        case e.key === 'ArrowDown' || e.keyCode === 20: {
          const nextR = Math.min(r + 1, maxRows - 1)
          setFocusedPos([nextR, Math.min(c, (tvRows[nextR]?.items.length ?? 1) - 1)])
          e.preventDefault()
          break
        }
        case e.key === 'ArrowUp' || e.keyCode === 19: {
          const prevR = Math.max(r - 1, 0)
          setFocusedPos([prevR, Math.min(c, (tvRows[prevR]?.items.length ?? 1) - 1)])
          e.preventDefault()
          break
        }
        // DPAD_CENTER (23) or Enter
        case e.key === 'Enter' || e.keyCode === 23:
          activateItem(tvRows[r]?.items[c])
          e.preventDefault()
          break
        // MEDIA_PLAY_PAUSE (85)
        case e.keyCode === 85 || e.key === 'MediaPlayPause':
          activateItem(tvRows[r]?.items[c])
          e.preventDefault()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedPos, tvRows, drawerOpen, activateItem])

  // Scroll focused card into view
  useEffect(() => {
    const el = document.getElementById(`tv-item-${focusedPos[0]}-${focusedPos[1]}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }, [focusedPos])

  // Derived hero image
  const heroImg = focusedItemDetails?.backdrop_path
    ? `https://image.tmdb.org/t/p/original${focusedItemDetails.backdrop_path}`
    : focusedItemDetails?.thumb ?? null

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black text-white antialiased">

      {/* ── Side Navigation Drawer ── */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[90] bg-black/60 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: -360 }}
              animate={{ x: 0 }}
              exit={{ x: -360 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 left-0 z-[100] w-[320px] bg-zinc-950/98 backdrop-blur-2xl border-r border-white/10 p-10 flex flex-col gap-8 shadow-[50px_0_100px_rgba(0,0,0,0.9)]"
            >
              <div>
                <h1 className="font-display text-2xl font-black tracking-tighter text-[#00f3ff]">SNAPSTREAM</h1>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Google TV Edition</p>
              </div>

              <nav className="space-y-3">
                {[
                  { label: 'Movies & TV', icon: <Film className="w-5 h-5" />, value: 'video' as const },
                  { label: 'Live TV', icon: <MonitorPlay className="w-5 h-5" />, value: 'livetv' as const },
                  { label: 'Games & Apps', icon: <Gamepad2 className="w-5 h-5" />, value: 'apps' as const },
                ].map(item => (
                  <button
                    key={item.value}
                    onClick={() => {
                      navigate('/')
                      setDrawerOpen(false)
                    }}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-sm font-black uppercase tracking-widest ${
                      mediaType === item.value
                        ? 'bg-[#00f3ff] text-black shadow-[0_0_30px_rgba(0,243,255,0.3)]'
                        : 'text-zinc-500 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-700 text-center">
                Press Back to close
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Immersive Hero / Trailer Area ── */}
      <div className="absolute inset-x-0 top-0 h-[68vh] pointer-events-none overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={focusedItemDetails?.id ?? 'idle'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            {trailerKey && !drawerOpen ? (
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1`}
                className="absolute inset-0 w-[120%] h-[120%] -translate-x-[10%] -translate-y-[10%] pointer-events-none"
                allow="autoplay"
                title="trailer"
              />
            ) : heroImg ? (
              <img
                src={heroImg}
                alt=""
                className="w-full h-full object-cover opacity-70 scale-105"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
            )}
            {/* Cinematic scrim */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* Hero text — TV-safe left margin, no text overlap */}
        <div className="absolute bottom-14 left-12 max-w-2xl space-y-4 z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={focusedItemDetails?.id ?? 'idle-text'}
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-3"
            >
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tighter leading-tight drop-shadow-2xl">
                {focusedItemDetails?.title ?? focusedItemDetails?.name ?? 'SnapStream'}
              </h1>

              <div className="flex items-center gap-3 text-xs font-black text-[#00f3ff] uppercase tracking-widest">
                {(focusedItemDetails?.release_date || focusedItemDetails?.first_air_date) && (
                  <>
                    <span>
                      {(focusedItemDetails.release_date ?? focusedItemDetails.first_air_date).slice(0, 4)}
                    </span>
                    <span className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full" />
                  </>
                )}
                {focusedItemDetails?.vote_average && (
                  <>
                    <span>★ {focusedItemDetails.vote_average.toFixed(1)}</span>
                    <span className="w-1.5 h-1.5 bg-[#00f3ff] rounded-full" />
                  </>
                )}
                <span className="px-2 py-0.5 rounded border border-[#00f3ff]/40 bg-[#00f3ff]/10 text-white text-[9px]">
                  {mediaType === 'livetv' ? 'LIVE' : mediaType === 'apps' ? 'GAME' : 'HD'}
                </span>
              </div>

              {focusedItemDetails?.overview && (
                <p className="text-zinc-300 text-base font-medium leading-relaxed line-clamp-2 drop-shadow-lg max-w-xl">
                  {focusedItemDetails.overview}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Content Rows ── */}
      <FadeContent delay={0.1} className="h-full w-full">
        <div
          ref={containerRef}
          className="h-full w-full overflow-y-auto pt-[60vh] pb-32 scrollbar-hide"
        >
          <div className="space-y-14 px-12">
            {tvRows.length === 0 && (
              <div className="flex items-center justify-center h-40">
                <div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {tvRows.map((row, rIdx) => (
              <div key={row.id} className="space-y-5">
                <h2
                  className={`text-xl font-black uppercase tracking-[0.3em] transition-colors duration-300 px-2 ${
                    focusedPos[0] === rIdx ? 'text-[#00f3ff]' : 'text-zinc-600'
                  }`}
                >
                  {row.title}
                </h2>

                <div className="flex gap-5 overflow-x-auto scrollbar-hide pb-6 pt-2 -mx-12 px-12">
                  {row.items.map((item, cIdx) => {
                    const isFocused = focusedPos[0] === rIdx && focusedPos[1] === cIdx
                    const image =
                      mediaType === 'livetv'
                        ? item.logo
                        : item.thumb ??
                          (item.backdrop_path
                            ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                            : null)
                    const itemTitle = item.title ?? item.name ?? item.label ?? ''

                    return (
                      <button
                        key={`${row.id}-${cIdx}`}
                        id={`tv-item-${rIdx}-${cIdx}`}
                        onClick={() => activateItem(item)}
                        className={`flex-none transition-all duration-300 transform-gpu outline-none ${
                          isFocused ? 'scale-105 z-10' : 'scale-100 opacity-40 hover:opacity-70'
                        }`}
                      >
                        <div
                          className={`relative rounded-2xl overflow-hidden border-4 transition-all duration-300 ${
                            isFocused
                              ? 'border-[#00f3ff] shadow-[0_0_50px_rgba(0,243,255,0.5)]'
                              : 'border-transparent shadow-xl bg-zinc-950'
                          }`}
                          style={{ width: 360, aspectRatio: '16/9' }}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={itemTitle}
                              className={`w-full h-full ${
                                mediaType === 'livetv' ? 'object-contain p-6' : 'object-cover'
                              }`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                              <span className="text-zinc-700 text-sm font-bold">{itemTitle}</span>
                            </div>
                          )}

                          {/* Focused overlay */}
                          {isFocused && (
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                              <p className="text-sm font-black uppercase tracking-widest truncate text-white drop-shadow-lg">
                                {itemTitle}
                              </p>
                            </div>
                          )}

                          {/* Rating badge */}
                          {item.vote_average && mediaType !== 'livetv' && (
                            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-bold text-yellow-400">
                              ★ {item.vote_average.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </FadeContent>
    </div>
  )
}
