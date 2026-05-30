import { useMemo, useState, useEffect, useRef } from 'react'
import { Search, Loader2, Play, Activity, History as HistoryIcon, Flame, Settings } from 'lucide-react'
import { useTMDB } from '../hooks/useTMDB'
import { FadeContent } from '../components/FadeContent'
import { tmdb } from '../lib/api'
import { tgdb } from '../lib/tgdb'
import { useNavigate } from 'react-router-dom'
import { getLiveTVChannels, IPTVChannel } from '../lib/iptv'

interface HomeProps {
  mediaType?: 'video' | 'apps' | 'livetv'
}

export default function Home({ mediaType = 'video' }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [appSubCategory, setAppSubCategory] = useState<'games' | 'apps'>('games')
  const [trendingGames, setTrendingGames] = useState<any[]>([])
  const [liveTVChannels, setLiveTVChannels] = useState<any[]>([])
  const [recentlyWatched, setRecentlyWatched] = useState<any[]>([])
  const navigate = useNavigate()
  
  // Android TV Spatial Navigation Focus State
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const gridRef = useRef<HTMLDivElement>(null)

  // Video Data
  const [randomPage] = useState(() => Math.floor(Math.random() * 5) + 1)
  const { data: trendingVideo } = useTMDB<any[]>('trending/all/day', [], { page: randomPage })

  // Static Data
  const pvzGame = useMemo(() => ({
    id: 'pvz-goty',
    title: 'Plants vs Zombies GOTY Edition',
    name: 'Plants vs Zombies GOTY Edition',
    overview: 'Get ready to soil your plants! A mob of fun-loving zombies is about to invade your home.',
    image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3590/library_600x900.jpg',
    media_type: 'game'
  }), [])

  const gtaGame = useMemo(() => ({
    id: 'gta-5-enhanced',
    title: 'GTA 5 Enhanced',
    name: 'GTA 5 Enhanced',
    overview: 'Experience the world of Los Santos and Blaine County in the ultimate Grand Theft Auto V experience.',
    image: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg',
    media_type: 'game'
  }), [])

  const staticApps = useMemo(() => [
    {
      id: 'snap-stream-tv',
      title: 'SnapStream TV',
      name: 'SnapStream TV',
      overview: 'The official SnapStream client for Android TV.',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=512&h=768&fit=crop',
      media_type: 'app'
    }
  ], [])

  // Auto-switch UI mode and load data
  useEffect(() => {
    setFocusedIndex(0) // Reset focus on media type change
    if (mediaType === 'livetv') {
      const saved = localStorage.getItem('snap_recently_watched')
      if (saved) setRecentlyWatched(JSON.parse(saved))
      
      setIsSearching(true)
      getLiveTVChannels().then(channels => {
        setLiveTVChannels(channels)
        setIsSearching(false)
      })
    }
  }, [mediaType])

  // Fetch Games
  useEffect(() => {
    if (mediaType === 'apps' && appSubCategory === 'games') {
      tgdb.getGamesByTrending().then(res => {
        if (res?.data?.games) setTrendingGames(res.data.games)
      })
    }
  }, [mediaType, appSubCategory])

  // Search Logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        if (mediaType === 'video') {
          const res = await tmdb.search(searchQuery)
          setSearchResults(res.results || [])
        } else if (mediaType === 'livetv') {
          const filtered = liveTVChannels.filter(c => 
            c.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
          setSearchResults(filtered)
        } else {
          const pool = appSubCategory === 'games' ? [pvzGame, gtaGame] : staticApps
          setSearchResults(pool.filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase())))
        }
        setFocusedIndex(0) // Reset focus on new search
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, mediaType, appSubCategory, staticApps, liveTVChannels, pvzGame, gtaGame])

  const handleItemClick = (item: any) => {
    if (mediaType === 'livetv') {
      const newRecent = [item, ...recentlyWatched.filter(i => i.title !== item.title)].slice(0, 12)
      setRecentlyWatched(newRecent)
      localStorage.setItem('snap_recently_watched', JSON.stringify(newRecent))
    }
    navigate(item.link)
  }

  const gridItems = useMemo(() => {
    if (mediaType === 'video') {
      const data = searchResults.length > 0 ? searchResults : (trendingVideo ?? [])
      return data.map(item => ({
        image: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : 'https://picsum.photos/500/750?grayscale',
        link: `/watch/${item.media_type || 'movie'}/${item.id}`,
        title: item.title || item.name || 'Untitled',
        description: item.overview || ''
      }))
    } else if (mediaType === 'livetv') {
      const data = searchResults.length > 0 ? searchResults : liveTVChannels
      return data.map(item => ({
        image: item.logo || 'https://picsum.photos/500/500?grayscale',
        link: `/live/${encodeURIComponent(item.url)}/${encodeURIComponent(item.name)}`,
        title: item.name,
        description: item.group,
        group: item.group
      }))
    } else {
      let pool = appSubCategory === 'games' ? [pvzGame, gtaGame] : staticApps
      if (appSubCategory === 'games' && trendingGames.length > 0) {
        pool = [...pool, ...trendingGames.map(g => ({
          id: g.id, title: g.game_title, image: `https://legacy.thegamesdb.net/banners/clearlogo/${g.id}.png`, media_type: 'game'
        }))]
      }
      if (searchResults.length > 0) pool = searchResults

      return pool.map(item => ({
        image: item.image,
        link: item.media_type === 'game' ? `/game/${item.id}` : '#',
        title: item.title || item.name,
        description: item.overview || 'Library Item'
      }))
    }
  }, [mediaType, searchResults, trendingVideo, liveTVChannels, trendingGames, appSubCategory, pvzGame, gtaGame, staticApps])

  // Android TV Key Handling (D-PAD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // DPAD_LEFT (21, 37) | DPAD_UP (19, 38) | DPAD_RIGHT (22, 39) | DPAD_DOWN (20, 40) | DPAD_CENTER (23, 13)
      if (e.key === 'ArrowRight' || e.keyCode === 22) {
        setFocusedIndex(prev => Math.min(prev + 1, gridItems.length - 1))
        e.preventDefault()
      } else if (e.key === 'ArrowLeft' || e.keyCode === 21) {
        setFocusedIndex(prev => Math.max(prev - 1, 0))
        e.preventDefault()
      } else if (e.key === 'ArrowDown' || e.keyCode === 20) {
        // Simple logic: jump down one row (assume 6 cols for TV landscape)
        setFocusedIndex(prev => Math.min(prev + 6, gridItems.length - 1))
        e.preventDefault()
      } else if (e.key === 'ArrowUp' || e.keyCode === 19) {
        setFocusedIndex(prev => Math.max(prev - 6, 0))
        e.preventDefault()
      } else if (e.key === 'Enter' || e.keyCode === 23) {
        if (focusedIndex >= 0 && gridItems[focusedIndex]) {
          handleItemClick(gridItems[focusedIndex])
        }
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [gridItems, focusedIndex])

  // Scroll active item into view
  useEffect(() => {
    if (gridRef.current && focusedIndex >= 0) {
      const activeEl = gridRef.current.children[focusedIndex] as HTMLElement
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }
  }, [focusedIndex])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000000] text-white antialiased selection:bg-transparent">
      
      {/* Dynamic Header */}
      <div className="absolute top-12 inset-x-0 z-50 px-12 flex items-center justify-between pointer-events-none">
         <div className="flex items-center gap-4 opacity-50">
            <h1 className="font-display text-2xl font-black text-white tracking-widest uppercase">SnapStream</h1>
            <div className="h-6 w-px bg-white/20" />
            <p className="text-xs font-black text-[#00f3ff] uppercase tracking-[0.3em]">{mediaType === 'video' ? 'Movies & TV' : mediaType === 'apps' ? 'Apps & Games' : 'Live TV'}</p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-6 py-3">
          <Search className="w-5 h-5 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 bg-transparent border-none outline-none text-lg font-medium text-white placeholder:text-zinc-600 pointer-events-auto"
          />
          {isSearching && <Loader2 className="w-4 h-4 text-[#00f3ff] animate-spin" />}
        </div>
      </div>

      <FadeContent delay={0.1} className="h-full w-full">
        <div className="h-full w-full overflow-y-auto pt-40 pb-20 px-12 scrollbar-hide">
          <div className="max-w-[2400px] mx-auto space-y-16">
            
            {/* Main TV Grid */}
            <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 sm:gap-8">
              {gridItems.map((item, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleItemClick(item)} 
                  onMouseEnter={() => setFocusedIndex(idx)}
                  className={`group cursor-pointer transition-all duration-300 transform-gpu ${focusedIndex === idx ? 'scale-110 z-10' : 'scale-100 opacity-60 hover:opacity-100'}`}
                >
                  <div className={`relative ${mediaType === 'livetv' ? 'aspect-video bg-zinc-950 p-4' : 'aspect-[2/3] bg-zinc-900'} rounded-2xl overflow-hidden border-4 transition-colors duration-300 ${focusedIndex === idx ? 'border-[#00f3ff] shadow-[0_0_50px_rgba(0,243,255,0.4)]' : 'border-transparent shadow-2xl'}`}>
                     <img src={item.image} alt={item.title} className={`w-full h-full ${mediaType === 'livetv' ? 'object-contain' : 'object-cover'}`} />
                     
                     <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${focusedIndex === idx ? 'opacity-100' : 'opacity-0'}`} />
                     
                     {focusedIndex === idx && (
                       <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-0 transition-transform duration-300">
                          <p className="text-sm font-black uppercase tracking-widest truncate text-white">{item.title}</p>
                          <p className="text-[10px] text-[#00f3ff] font-bold uppercase tracking-[0.2em] mt-1 truncate">
                            {mediaType === 'livetv' ? 'Live Stream' : 'Press OK to View'}
                          </p>
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </FadeContent>
    </div>
  )
}
