import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Star, Maximize2, ChevronDown, ListVideo, Play, Pause, FastForward, Rewind
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
  }
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
  
  const { data: details } = useTMDB<any>(`${mediaType}/${mediaId}`, null)
  const { data: credits } = useTMDB<any>(`${mediaType}/${mediaId}/credits`, null)

  const source = EMBED_SOURCES[sourceIdx]
  const embedUrl = source?.url(mediaId, mediaType, season, episode) ?? ''

  const title = details?.title ?? details?.name ?? ''
  const poster = details?.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : '/placeholder.svg'

  const playerContainerRef = useRef<HTMLDivElement>(null)

  // Vidking Progress Tracking Integration
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data
        if (payload?.type === 'PLAYER_EVENT') {
          const { event: eventName, currentTime, progress } = payload.data
          console.log(`[Vidking] ${eventName}: ${currentTime}s (${progress}%)`)
          
          // Save progress locally for "Continue Watching"
          if (eventName === 'timeupdate' || eventName === 'pause') {
            const history = JSON.parse(localStorage.getItem('snap_watch_history') || '{}')
            history[mediaId] = {
              timestamp: Date.now(),
              currentTime,
              progress,
              mediaType,
              season,
              episode,
              title,
              image: poster
            }
            localStorage.setItem('snap_watch_history', JSON.stringify(history))
          }
        }
      } catch (e) {
        // Not a Vidking event or malformed JSON
      }
    }

    window.addEventListener("message", handleMessage)
    return () => window.removeEventListener("message", handleMessage)
  }, [mediaId, mediaType, season, episode, title, poster])

  const handleFullscreen = () => {
    const container = playerContainerRef.current
    if (!container) return
    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => console.error(err))
    } else {
      document.exitFullscreen()
    }
  }

  useEffect(() => {
    const handleFs = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFs)
    return () => document.removeEventListener('fullscreenchange', handleFs)
  }, [])

  // Android TV Global Key Catchers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
       if (e.key === 'Backspace' || e.keyCode === 4) {
          if (fullscreen) {
             document.exitFullscreen()
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
    <div className="relative min-h-screen bg-black text-white">
      <div className={`max-w-[1800px] mx-auto px-12 py-8 ${fullscreen ? 'p-0' : ''}`}>
        {!fullscreen && (
          <div className="mb-8 flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest focus:bg-[#00f3ff] focus:text-black transition-all outline-none"
            >
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </button>
            <div className="text-right">
               <h1 className="text-3xl font-black uppercase tracking-tighter">{title}</h1>
               <p className="text-[10px] font-black text-[#00f3ff] uppercase tracking-widest mt-1 opacity-60">Playing on {source.name}</p>
            </div>
          </div>
        )}

        <div className={`relative ${fullscreen ? 'fixed inset-0 z-[9999]' : 'aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)]'}`} ref={playerContainerRef}>
           <PlayerWrapper embedUrl={embedUrl} title={title} />
           
           {!fullscreen && (
             <div className="absolute top-6 right-6 flex gap-4">
                <button 
                  onClick={handleFullscreen}
                  className="bg-white/10 backdrop-blur-2xl border border-white/20 p-4 rounded-2xl hover:bg-white/20 focus:bg-[#00f3ff] focus:text-black transition-all outline-none shadow-2xl"
                >
                  <Maximize2 className="w-6 h-6" />
                </button>
             </div>
           )}
        </div>

        {!fullscreen && (
          <div className="mt-12 grid grid-cols-[1fr_400px] gap-12">
             <div className="space-y-8">
                <div className="flex gap-4">
                   {details?.genres?.map((g: any) => (
                      <span key={g.id} className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00f3ff]">{g.name}</span>
                   ))}
                </div>
                <p className="text-xl text-zinc-400 font-medium leading-relaxed">{details?.overview}</p>
             </div>
             
             <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6 self-start">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4">
                   {mediaType === 'tv' && (
                      <button className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest focus:bg-[#00f3ff] focus:text-black transition-all outline-none">
                         <span>Episodes</span>
                         <ChevronDown className="w-4 h-4" />
                      </button>
                   )}
                   <button className="flex items-center justify-between px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest focus:bg-[#00f3ff] focus:text-black transition-all outline-none">
                      <span>Server</span>
                      <span className="text-[#00f3ff] group-focus:text-black">{source.name}</span>
                   </button>
                </div>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
