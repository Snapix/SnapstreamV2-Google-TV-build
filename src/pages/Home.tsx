import { useMemo, useState, useEffect, useRef } from 'react'
import { Search, Loader2, Play, Film, Tv, MonitorPlay, Settings, Info, History } from 'lucide-react'
import { useTMDB } from '../hooks/useTMDB'
import { FadeContent } from '../components/FadeContent'
import { tmdb } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { getLiveTVChannels } from '../lib/iptv'
import { motion, AnimatePresence } from 'framer-motion'

interface HomeProps {
  mediaType?: 'video' | 'livetv'
}

interface TVRow {
  id: string
  title: string
  items: any[]
}

export default function Home({ mediaType: initialMediaType = 'video' }: HomeProps) {
  const [mediaType, setMediaType] = useState<'video' | 'livetv'>(initialMediaType)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const [liveTVChannels, setLiveTVChannels] = useState<any[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  
  // D-Pad Focus State: [rowIndex, colIndex]
  // Row -1 is the Search/Top buttons (if needed), Row 0+ are content rows
  const [focusedPos, setFocusedPos] = useState<[number, number]>([0, 0])
  const containerRef = useRef<HTMLDivElement>(null)

  // TMDB Data for Rows
  const { data: trendingWorld } = useTMDB<any[]>('trending/all/day', [], { page: 1 })
  const { data: trendingIndia } = useTMDB<any[]>('discover/movie', [], { with_origin_country: 'IN', sort_by: 'popularity.desc' })
  const { data: kidsContent } = useTMDB<any[]>('discover/movie', [], { with_genres: '16', sort_by: 'popularity.desc' })
  const { data: topMovies } = useTMDB<any[]>('movie/top_rated', [], { page: 1 })
  const { data: topTV } = useTMDB<any[]>('tv/top_rated', [], { page: 1 })

  // Trailer/Immersive State
  const [focusedItemDetails, setFocusedItemDetails] = useState<any>(null)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)

  useEffect(() => {
    if (mediaType === 'livetv') {
      getLiveTVChannels().then(channels => setLiveTVChannels(channels))
    }
  }, [mediaType])

  const tvRows: TVRow[] = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      return [{ id: 'search', title: 'Search Results', items: searchResults }]
    }
    if (mediaType === 'livetv') {
      return [{ id: 'live', title: 'Live TV Channels', items: liveTVChannels }]
    }
    return [
      { id: 'trending-world', title: 'Trending Worldwide', items: trendingWorld || [] },
      { id: 'trending-india', title: 'Trending in India', items: trendingIndia || [] },
      { id: 'kids', title: 'Kids & Family', items: kidsContent || [] },
      { id: 'movies', title: 'Top Rated Movies', items: topMovies || [] },
      { id: 'tv', title: 'Top TV Series', items: topTV || [] }
    ].filter(r => r.items.length > 0)
  }, [mediaType, searchResults, trendingWorld, trendingIndia, kidsContent, topMovies, topTV, liveTVChannels, searchQuery])

  // Fetch Trailer for focused item
  useEffect(() => {
    const currentItem = tvRows[focusedPos[0]]?.items[focusedPos[1]]
    if (!currentItem || mediaType === 'livetv') {
      setFocusedItemDetails(currentItem || null)
      setTrailerKey(null)
      return
    }

    setFocusedItemDetails(currentItem)
    const type = currentItem.media_type || (currentItem.first_air_date ? 'tv' : 'movie')
    
    const timer = setTimeout(async () => {
      try {
        const res = await tmdb.getVideos(currentItem.id, type)
        const trailer = res.results?.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube') || res.results?.[0]
        setTrailerKey(trailer?.key || null)
      } catch (e) {
        setTrailerKey(null)
      }
    }, 1500) // 1.5s delay before playing trailer to avoid API spam while navigating

    return () => clearTimeout(timer)
  }, [focusedPos, tvRows, mediaType])

  // Android TV Key Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (drawerOpen) {
        if (e.key === 'ArrowRight' || e.keyCode === 22) {
          setDrawerOpen(false)
          e.preventDefault()
        } else if (e.key === 'ArrowDown' || e.keyCode === 20) {
          setMediaType(prev => prev === 'video' ? 'livetv' : 'video')
          e.preventDefault()
        } else if (e.key === 'ArrowUp' || e.keyCode === 19) {
          setMediaType(prev => prev === 'video' ? 'livetv' : 'video')
          e.preventDefault()
        } else if (e.key === 'Enter' || e.keyCode === 23) {
          setDrawerOpen(false)
          e.preventDefault()
        }
        return
      }

      const [r, c] = focusedPos
      const maxRows = tvRows.length
      if (maxRows === 0) return
      const currentRowItems = tvRows[r].items.length

      if (e.key === 'ArrowRight' || e.keyCode === 22) {
        setFocusedPos([r, Math.min(c + 1, currentRowItems - 1)])
        e.preventDefault()
      } else if (e.key === 'ArrowLeft' || e.keyCode === 21) {
        if (c === 0) {
          setDrawerOpen(true)
        } else {
          setFocusedPos([r, Math.max(c - 1, 0)])
        }
        e.preventDefault()
      } else if (e.key === 'ArrowDown' || e.keyCode === 20) {
        const nextR = Math.min(r + 1, maxRows - 1)
        setFocusedPos([nextR, Math.min(c, tvRows[nextR].items.length - 1)])
        e.preventDefault()
      } else if (e.key === 'ArrowUp' || e.keyCode === 19) {
        const prevR = Math.max(r - 1, 0)
        setFocusedPos([prevR, Math.min(c, tvRows[prevR].items.length - 1)])
        e.preventDefault()
      } else if (e.key === 'Enter' || e.keyCode === 23) {
        const item = tvRows[r].items[c]
        if (item) {
          if (mediaType === 'livetv') navigate(`/live/${encodeURIComponent(item.url)}/${encodeURIComponent(item.name)}`)
          else navigate(`/watch/${item.media_type || (item.first_air_date ? 'tv' : 'movie')}/${item.id}`)
        }
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedPos, tvRows, drawerOpen, mediaType])

  // Scroll active item into view
  useEffect(() => {
    const activeElement = document.getElementById(`tv-item-${focusedPos[0]}-${focusedPos[1]}`)
    if (activeElement) {
      activeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
    }
  }, [focusedPos])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000000] text-white antialiased">
      
      {/* Side Navigation Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div 
            initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
            className="absolute inset-y-0 left-0 z-[100] w-[300px] bg-zinc-950/95 backdrop-blur-2xl border-r border-white/10 p-10 flex flex-col gap-8 shadow-[50px_0_100px_rgba(0,0,0,0.9)]"
          >
             <div className="mb-8">
                <h1 className="font-display text-2xl font-black tracking-tighter text-[#00f3ff]">SNAPSTREAM</h1>
                <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest mt-1">Google TV Edition</p>
             </div>

             <div className="space-y-4">
                <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${mediaType === 'video' ? 'bg-[#00f3ff] text-black shadow-[0_0_30px_rgba(0,243,255,0.3)]' : 'text-zinc-500 hover:bg-white/5'}`}>
                   <Film className="w-6 h-6" />
                   <span className="font-black uppercase tracking-widest text-sm">Movies & TV</span>
                </button>
                <button className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all ${mediaType === 'livetv' ? 'bg-[#00f3ff] text-black shadow-[0_0_30px_rgba(0,243,255,0.3)]' : 'text-zinc-500 hover:bg-white/5'}`}>
                   <MonitorPlay className="w-6 h-6" />
                   <span className="font-black uppercase tracking-widest text-sm">Live TV</span>
                </button>
             </div>

             <div className="mt-auto opacity-30 text-[10px] font-bold uppercase tracking-widest text-center">
                Press Right to close
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Immersive Header / Trailer Area */}
      <div className="absolute inset-x-0 top-0 h-[65vh] pointer-events-none overflow-hidden">
         <AnimatePresence mode="wait">
            <motion.div 
              key={focusedItemDetails?.id || 'idle'}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0"
            >
               {trailerKey && !drawerOpen ? (
                 <iframe 
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}&rel=0`}
                    className="w-[120%] h-[120%] -translate-x-[10%] -translate-y-[10%] scale-110 opacity-40 blur-[2px]"
                    allow="autoplay"
                 />
               ) : (
                 <img 
                    src={focusedItemDetails?.backdrop_path ? `https://image.tmdb.org/t/p/original${focusedItemDetails.backdrop_path}` : 'https://picsum.photos/1920/1080?grayscale'}
                    className="w-full h-full object-cover opacity-30 scale-105"
                 />
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
               <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent" />
            </motion.div>
         </AnimatePresence>

         <div className="absolute bottom-20 left-12 max-w-2xl space-y-4">
            <motion.div 
               key={focusedItemDetails?.id}
               initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
               className="space-y-4"
            >
               <h1 className="text-6xl font-black uppercase tracking-tighter leading-none">{focusedItemDetails?.title || focusedItemDetails?.name || 'SnapStream'}</h1>
               <div className="flex items-center gap-4 text-xs font-black text-[#00f3ff] uppercase tracking-widest opacity-80">
                  <span>{focusedItemDetails?.release_date?.slice(0, 4) || focusedItemDetails?.first_air_date?.slice(0, 4) || '2026'}</span>
                  <div className="w-1 h-1 bg-[#00f3ff] rounded-full" />
                  <span>{mediaType === 'livetv' ? 'Live Stream' : (focusedItemDetails?.media_type || 'Content')}</span>
                  <div className="w-1 h-1 bg-[#00f3ff] rounded-full" />
                  <span className="px-2 py-0.5 rounded border border-[#00f3ff]/40 bg-[#00f3ff]/10">U/A 13+</span>
               </div>
               <p className="text-zinc-400 text-lg font-medium leading-relaxed line-clamp-3">
                  {focusedItemDetails?.overview || 'Explore the ultimate collection of premium movies, TV shows, and live channels optimized for your big screen.'}
               </p>
            </motion.div>
         </div>
      </div>

      {/* Main Content Rows */}
      <FadeContent delay={0.1} className="h-full w-full">
        <div ref={containerRef} className="h-full w-full overflow-y-auto pt-[60vh] pb-20 px-12 scrollbar-hide">
          <div className="space-y-12">
            
            {tvRows.map((row, rIdx) => (
              <div key={row.id} className="space-y-6">
                <h2 className={`text-xl font-black uppercase tracking-[0.3em] transition-colors duration-300 px-4 ${focusedPos[0] === rIdx ? 'text-[#00f3ff]' : 'text-zinc-700'}`}>
                  {row.title}
                </h2>
                
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-8 pt-2 -mx-12 px-12">
                  {row.items.map((item, cIdx) => {
                    const isFocused = focusedPos[0] === rIdx && focusedPos[1] === cIdx
                    const image = mediaType === 'livetv' ? item.logo : (item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : 'https://picsum.photos/780/440?grayscale')
                    const title = item.title || item.name

                    return (
                      <div 
                        key={`${row.id}-${cIdx}`} 
                        id={`tv-item-${rIdx}-${cIdx}`}
                        className={`flex-none w-[360px] transition-all duration-300 transform-gpu ${isFocused ? 'scale-105 z-10' : 'scale-100 opacity-40'}`}
                      >
                        <div className={`relative aspect-video rounded-2xl overflow-hidden border-4 transition-all duration-300 ${isFocused ? 'border-[#00f3ff] shadow-[0_0_60px_rgba(0,243,255,0.5)]' : 'border-white/5 shadow-2xl bg-zinc-950'}`}>
                           <img src={image} alt={title} className={`w-full h-full ${mediaType === 'livetv' ? 'object-contain p-8' : 'object-cover'}`} />
                           
                           {isFocused && (
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                                <p className="text-sm font-black uppercase tracking-widest truncate text-white">{title}</p>
                             </div>
                           )}
                        </div>
                      </div>
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
