import { useMemo, useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useTMDB } from '../hooks/useTMDB'
import { FadeContent } from '../components/FadeContent'
import { tmdb } from '../lib/api'
import { useNavigate } from 'react-router-dom'
import { getLiveTVChannels } from '../lib/iptv'

interface HomeProps {
  mediaType?: 'video' | 'apps' | 'livetv'
}

interface TVRow {
  title: string
  items: any[]
}

export default function Home({ mediaType = 'video' }: HomeProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const [liveTVChannels, setLiveTVChannels] = useState<any[]>([])
  const navigate = useNavigate()
  
  // D-Pad Focus State: [rowIndex, colIndex]
  const [focusedPos, setFocusedPos] = useState<[number, number]>([0, 0])
  const containerRef = useRef<HTMLDivElement>(null)

  // TMDB Data
  const { data: trendingWorld } = useTMDB<any[]>('trending/all/day', [], { page: 1 })
  const { data: trendingIndia } = useTMDB<any[]>('discover/movie', [], { with_origin_country: 'IN', sort_by: 'popularity.desc' })
  const { data: kidsContent } = useTMDB<any[]>('discover/movie', [], { with_genres: '16', sort_by: 'popularity.desc' })
  const { data: topMovies } = useTMDB<any[]>('movie/top_rated', [], { page: 1 })
  const { data: topTV } = useTMDB<any[]>('tv/top_rated', [], { page: 1 })

  // Auto-switch UI mode and load data
  useEffect(() => {
    setFocusedPos([0, 0])
    if (mediaType === 'livetv') {
      getLiveTVChannels().then(channels => setLiveTVChannels(channels))
    }
  }, [mediaType])

  // Map data to TV Rows
  const tvRows: TVRow[] = useMemo(() => {
    if (searchQuery && searchResults.length > 0) {
      return [{ title: 'Search Results', items: searchResults }]
    }

    if (mediaType === 'livetv') {
      return [
        { title: 'Live TV Channels', items: liveTVChannels }
      ]
    }

    if (mediaType === 'video') {
      return [
        { title: 'Trending Worldwide', items: trendingWorld || [] },
        { title: 'Trending in India', items: trendingIndia || [] },
        { title: 'Kids & Family', items: kidsContent || [] },
        { title: 'Top Movies', items: topMovies || [] },
        { title: 'Top TV Series', items: topTV || [] }
      ].filter(r => r.items.length > 0)
    }

    return []
  }, [mediaType, searchResults, trendingWorld, trendingIndia, kidsContent, topMovies, topTV, liveTVChannels, searchQuery])

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
          setSearchResults(liveTVChannels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())))
        }
        setFocusedPos([0, 0])
      } catch (err) {
        console.error(err)
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, mediaType, liveTVChannels])

  const handleItemClick = (item: any) => {
    if (mediaType === 'livetv') {
      navigate(`/live/${encodeURIComponent(item.url)}/${encodeURIComponent(item.name)}`)
    } else {
      navigate(`/watch/${item.media_type || 'movie'}/${item.id}`)
    }
  }

  // Android TV Key Handling (D-PAD)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const [r, c] = focusedPos
      const maxRows = tvRows.length
      if (maxRows === 0) return

      const currentRowItems = tvRows[r].items.length

      if (e.key === 'ArrowRight' || e.keyCode === 22) {
        setFocusedPos([r, Math.min(c + 1, currentRowItems - 1)])
        e.preventDefault()
      } else if (e.key === 'ArrowLeft' || e.keyCode === 21) {
        setFocusedPos([r, Math.max(c - 1, 0)])
        e.preventDefault()
      } else if (e.key === 'ArrowDown' || e.keyCode === 20) {
        const nextR = Math.min(r + 1, maxRows - 1)
        const nextRowItems = tvRows[nextR].items.length
        setFocusedPos([nextR, Math.min(c, nextRowItems - 1)])
        e.preventDefault()
      } else if (e.key === 'ArrowUp' || e.keyCode === 19) {
        const prevR = Math.max(r - 1, 0)
        const prevRowItems = tvRows[prevR].items.length
        setFocusedPos([prevR, Math.min(c, prevRowItems - 1)])
        e.preventDefault()
      } else if (e.key === 'Enter' || e.keyCode === 23) {
        const item = tvRows[r].items[c]
        if (item) handleItemClick(item)
        e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedPos, tvRows])

  // Scroll active row/item into view
  useEffect(() => {
    if (containerRef.current) {
      const activeElement = document.getElementById(`tv-item-${focusedPos[0]}-${focusedPos[1]}`)
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
      }
    }
  }, [focusedPos])

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#000000] text-white antialiased selection:bg-transparent">
      
      {/* Header */}
      <div className="absolute top-10 inset-x-0 z-50 px-12 flex items-center justify-between pointer-events-none">
         <div className="flex items-center gap-4 opacity-50">
            <h1 className="font-display text-3xl font-black text-white tracking-widest uppercase">SnapStream TV</h1>
            <div className="h-8 w-px bg-white/20" />
            <p className="text-sm font-black text-[#00f3ff] uppercase tracking-[0.3em]">{mediaType === 'video' ? 'Movies & TV' : 'Live TV'}</p>
        </div>
      </div>

      <FadeContent delay={0.1} className="h-full w-full">
        <div ref={containerRef} className="h-full w-full overflow-y-auto pt-32 pb-20 px-12 scrollbar-hide">
          <div className="space-y-12">
            
            {tvRows.map((row, rIdx) => (
              <div key={rIdx} className="space-y-4">
                <h2 className={`text-lg font-black uppercase tracking-[0.2em] transition-colors duration-300 ${focusedPos[0] === rIdx ? 'text-[#00f3ff]' : 'text-zinc-500'}`}>
                  {row.title}
                </h2>
                
                <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-8 pt-4 -mx-12 px-12">
                  {row.items.map((item, cIdx) => {
                    const isFocused = focusedPos[0] === rIdx && focusedPos[1] === cIdx
                    const image = mediaType === 'livetv' ? item.logo : (item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : 'https://picsum.photos/780/440?grayscale')
                    const title = item.title || item.name

                    return (
                      <div 
                        key={cIdx} 
                        id={`tv-item-${rIdx}-${cIdx}`}
                        onClick={() => {
                          setFocusedPos([rIdx, cIdx])
                          handleItemClick(item)
                        }} 
                        className={`flex-none w-[320px] transition-all duration-300 transform-gpu ${isFocused ? 'scale-110 z-10' : 'scale-100 opacity-50'}`}
                      >
                        <div className={`relative aspect-video rounded-xl overflow-hidden border-4 transition-colors duration-300 ${isFocused ? 'border-[#00f3ff] shadow-[0_0_40px_rgba(0,243,255,0.4)]' : 'border-transparent shadow-2xl bg-zinc-900'}`}>
                           <img src={image} alt={title} className={`w-full h-full ${mediaType === 'livetv' ? 'object-contain bg-zinc-950 p-6' : 'object-cover'}`} />
                           
                           <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent transition-opacity duration-300 ${isFocused ? 'opacity-100' : 'opacity-0'}`} />
                           
                           {isFocused && (
                             <div className="absolute inset-x-0 bottom-0 p-4 transform translate-y-0 transition-transform duration-300">
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