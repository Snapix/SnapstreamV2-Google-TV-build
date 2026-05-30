import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, Maximize2, ChevronDown, ListVideo
} from 'lucide-react'
import { useTMDB } from '../hooks/useTMDB'
import { PlayerWrapper } from '../components/PlayerWrapper'
import { FadeContent } from '../components/FadeContent'

const EMBED_SOURCES = [
  {
    id: 'vidking',
    name: 'Vidking',
    label: 'Fast - High Quality',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://www.vidking.net/embed/tv/${id}/${season ?? 1}/${episode ?? 1}?color=00f3ff&autoPlay=true`
        : `https://www.vidking.net/embed/movie/${id}?color=00f3ff&autoPlay=true`,
  },
  {
    id: 'vidlink',
    name: 'VidLink',
    label: 'Fast - Minimal Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://vidlink.pro/tv/${id}/${season ?? 1}/${episode ?? 1}`
        : `https://vidlink.pro/movie/${id}`,
  },
  {
    id: 'vidify',
    name: 'Vidify',
    label: 'Premium - No Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://player.vidify.top/embed/tv/${id}/${season ?? 1}/${episode ?? 1}?primarycolor=00f3ff&autoplay=false&poster=true`
        : `https://player.vidify.top/embed/movie/${id}?primarycolor=00f3ff&autoplay=false&poster=true`,
  },
  {
    id: 'vidsrc-me',
    name: 'VidSrc.me',
    label: 'Fewer Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://vidsrc.me/embed/tv?tmdb=${id}&s=${season ?? 1}&e=${episode ?? 1}`
        : `https://vidsrc.me/embed/movie?tmdb=${id}`,
  },
  {
    id: 'vidsrc-cc',
    name: 'VidSrc.cc',
    label: 'Fewer Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://vidsrc.cc/v2/embed/tv/${id}/${season ?? 1}/${episode ?? 1}`
        : `https://vidsrc.cc/v2/embed/movie/${id}`,
  },
  {
    id: 'smashy',
    name: 'SmashyStream',
    label: 'Reliable - No Audio?',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://player.smashy.stream/tv/${id}?s=${season ?? 1}&e=${episode ?? 1}`
        : `https://player.smashy.stream/movie/${id}`,
  },
  {
    id: 'vidsrc-to',
    name: 'VidSrc.to',
    label: 'Standard - More Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://vidsrc.to/embed/tv/${id}`
        : `https://vidsrc.to/embed/movie/${id}`,
  },
  {
    id: '2embed',
    name: '2Embed',
    label: 'Classic - Lots of Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://www.2embed.cc/embedtv/${id}&s=${season ?? 1}&e=${episode ?? 1}`
        : `https://www.2embed.cc/embed/${id}`,
  },
  {
    id: 'superembed',
    name: 'SuperEmbed',
    label: 'Lots of Ads',
    url: (id: number, type: string, season?: number, episode?: number) =>
      type === 'tv'
        ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${season ?? 1}&e=${episode ?? 1}`
        : `https://multiembed.mov/?video_id=${id}&tmdb=1`,
  },
]

export default function Watch() {
  const navigate = useNavigate()
  const { type, id } = useParams<{ type: string; id: string }>()
  const mediaType = type === 'tv' ? 'tv' : 'movie'
  const mediaId = Number(id)

  const [sourceIdx, setSourceIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [showSeasonPicker, setShowSeasonPicker] = useState(false)
  const [showProviderMenu, setShowProviderMenu] = useState(false)

  const { data: details } = useTMDB<any>(`${mediaType}/${mediaId}`, null)
  const { data: credits } = useTMDB<any>(`${mediaType}/${mediaId}/credits`, null)

  const source = EMBED_SOURCES[sourceIdx]
  const embedUrl = source?.url(mediaId, mediaType, season, episode) ?? ''

  const director = credits?.crew?.find((c: any) => c.job === 'Director')?.name
  const cast = credits?.cast?.slice(0, 8).map((c: any) => c.name).join(', ') ?? ''
  const title = details?.title ?? details?.name ?? ''
  const poster = details?.poster_path
    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
    : '/placeholder.svg'

  const seasonsList = (details as any)?.seasons ?? []
  const seasonCount = seasonsList.length

  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Fullscreen Handler (Natively handles standard fullscreen without redirects)
  const handleFullscreen = () => {
    const container = playerContainerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setFullscreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Android TV Keyboard navigation overrides
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       // Escape to exit fullscreen or go back
       if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 4) {
          if (fullscreen) {
             if (document.exitFullscreen) document.exitFullscreen()
             e.preventDefault()
          } else {
             navigate(-1)
             e.preventDefault()
          }
       }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [fullscreen, navigate])


  return (
    <div className={`relative min-h-screen pt-16 sm:pt-20 ${fullscreen ? '!pt-0' : ''}`}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-12 py-4">
        {!fullscreen && (
          <button
            onClick={() => navigate(-1)}
            tabIndex={0}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-6 group focus:outline-none focus:text-[#00f3ff] focus:bg-[#00f3ff]/10 px-3 py-1.5 rounded-lg"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
        )}

        <FadeContent delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
            
            {/* Left: Player Section */}
            <div className={`space-y-6 ${fullscreen ? 'fixed inset-0 z-[9999] bg-black m-0' : ''}`}>
              <div className="relative group/player h-full" ref={playerContainerRef}>
                <PlayerWrapper embedUrl={embedUrl} title={title} />
                
                {!fullscreen && (
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Provider Dropdown */}
                      <div className="relative">
                        <button
                          tabIndex={0}
                          onClick={() => setShowProviderMenu(!showProviderMenu)}
                          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/90 hover:bg-white/10 focus:bg-[#00f3ff]/20 focus:border-[#00f3ff]/40 focus:outline-none transition-all shadow-xl"
                        >
                          <ListVideo className="w-4 h-4 text-[#00f3ff]" />
                          Server: {source.name}
                          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showProviderMenu ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {showProviderMenu && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowProviderMenu(false)} />
                            <div className="absolute bottom-full mb-2 left-0 z-50 w-[280px] bg-[#111] border border-white/10 rounded-2xl p-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                              <p className="text-[10px] font-black text-zinc-500 uppercase px-3 py-2 tracking-widest border-b border-white/5 mb-1">
                                Select Stream Server
                              </p>
                              <div className="max-h-[300px] overflow-y-auto scrollbar-hide">
                                {EMBED_SOURCES.map((s, i) => (
                                  <button
                                    key={s.id}
                                    tabIndex={0}
                                    onClick={() => {
                                      setSourceIdx(i)
                                      setShowProviderMenu(false)
                                    }}
                                    className={`w-full flex flex-col items-start gap-0.5 px-3 py-2.5 rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#00f3ff] ${
                                      i === sourceIdx
                                        ? 'bg-[#00f3ff]/10 border border-[#00f3ff]/30'
                                        : 'hover:bg-white/5 border border-transparent'
                                    }`}
                                  >
                                    <span className={`text-sm font-bold ${i === sourceIdx ? 'text-[#00f3ff]' : 'text-white/80'}`}>
                                      {s.name}
                                    </span>
                                    <span className="text-[10px] text-zinc-500 font-medium italic">
                                      - {s.label}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {mediaType === 'tv' && seasonCount > 0 && (
                        <div className="relative">
                          <button
                            tabIndex={0}
                            onClick={() => setShowSeasonPicker(!showSeasonPicker)}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/90 hover:bg-white/10 focus:bg-[#00f3ff]/20 focus:border-[#00f3ff]/40 focus:outline-none transition-all shadow-xl"
                          >
                            S{season} • E{episode}
                            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${showSeasonPicker ? 'rotate-180' : ''}`} />
                          </button>
                          {showSeasonPicker && (
                            <>
                              <div className="fixed inset-0 z-40" onClick={() => setShowSeasonPicker(false)} />
                              <div className="absolute bottom-full mb-2 left-0 z-50 bg-[#111] border border-white/10 rounded-2xl p-4 shadow-2xl min-w-[280px] max-h-[400px] overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
                                {seasonsList.map((s_info: any, s_idx: number) => (
                                  <div key={s_info.id} className="mb-4 last:mb-0">
                                    <p className="text-xs font-black text-zinc-500 uppercase mb-2 px-1 tracking-widest">
                                      {s_info.name || `Season ${s_idx + 1}`}
                                    </p>
                                    <div className="grid grid-cols-5 gap-1.5">
                                      {Array.from({ length: s_info.episode_count || 12 }, (_, e) => (
                                        <button
                                          key={e}
                                          tabIndex={0}
                                          onClick={() => {
                                            setSeason(s_info.season_number || s_idx + 1)
                                            setEpisode(e + 1)
                                            setShowSeasonPicker(false)
                                          }}
                                          className={`w-10 h-10 rounded-lg text-xs font-bold transition-all border focus:outline-none focus:ring-2 focus:ring-[#00f3ff] focus:scale-110 ${
                                            season === (s_info.season_number || s_idx + 1) && episode === e + 1
                                              ? 'bg-white text-black border-white'
                                              : 'bg-white/5 text-zinc-400 border-transparent hover:bg-white/10 hover:text-white'
                                          }`}
                                        >
                                          {e + 1}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      tabIndex={0}
                      onClick={handleFullscreen}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm font-bold text-white/90 hover:bg-white/10 focus:bg-[#00f3ff]/20 focus:border-[#00f3ff]/40 focus:outline-none transition-all"
                    >
                      <Maximize2 className="w-4 h-4" />
                      Fullscreen
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Info Section */}
            {!fullscreen && (
              <div className="space-y-6">
                <div className="flex gap-4 items-start">
                  <div className="relative w-24 flex-shrink-0 aspect-[2/3] rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                    <img src={poster} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h1 className="font-display text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tighter">
                      {title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#107c10]/20 border border-[#107c10]/40">
                        <Star className="w-3.5 h-3.5 text-[#107c10] fill-[#107c10]" />
                        <span className="text-xs font-black text-white">{details?.vote_average?.toFixed(1)}</span>
                      </div>
                      {details?.release_date && (
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                          {details.release_date.slice(0, 4)}
                        </span>
                      )}
                      {details?.runtime && (
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{details.runtime}m</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-5 pt-6 border-t border-white/5">
                  {details?.genres && (
                    <div className="flex flex-wrap gap-2">
                      {details.genres.map((g: any) => (
                        <span
                          key={g.id}
                          className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00f3ff] px-3 py-1.5 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/20 shadow-[0_0_15px_rgba(0,243,255,0.05)]"
                        >
                          {g.name}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 gap-4">
                    {director && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Director</span>
                        <p className="text-sm font-bold text-white/90">{director}</p>
                      </div>
                    )}
                    {cast && (
                      <div className="flex flex-col gap-1">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Lead Cast</span>
                        <p className="text-sm font-bold text-white/80 leading-relaxed">{cast}</p>
                      </div>
                    )}
                  </div>

                  {details?.overview && (
                    <div className="pt-2">
                      <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2 block font-display">Overview</span>
                      <p className="text-[13px] font-medium text-zinc-400 leading-relaxed line-clamp-8 hover:line-clamp-none transition-all duration-500 cursor-default bg-white/5 p-4 rounded-2xl border border-white/5">
                        {details.overview}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </FadeContent>
      </div>
    </div>
  )
}
