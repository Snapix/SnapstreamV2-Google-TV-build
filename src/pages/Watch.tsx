import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Maximize2, ChevronDown, Play, Pause } from 'lucide-react'
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
]

export default function Watch() {
  const navigate = useNavigate()
  const { type, id } = useParams<{ type: string; id: string }>()
  const mediaType = type === 'tv' ? 'tv' : 'movie'
  const mediaId = Number(id)

  const [sourceIdx] = useState(0)
  const [fullscreen, setFullscreen] = useState(false)
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [showEpisodePicker, setShowEpisodePicker] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { data: details } = useTMDB<any>(`${mediaType}/${mediaId}`, null)

  const source = EMBED_SOURCES[sourceIdx]
  const embedUrl = source?.url(mediaId, mediaType, season, episode) ?? ''
  const title = details?.title ?? details?.name ?? 'Loading…'

  const playerContainerRef = useRef<HTMLDivElement>(null)

  // ── FIX: was missing entirely → ReferenceError when button clicked ──
  const handleFullscreen = useCallback(() => {
    const el = playerContainerRef.current
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(err => console.warn('Fullscreen error:', err))
    } else {
      document.exitFullscreen()
    }
  }, [])

  // Sync fullscreen state from browser API
  useEffect(() => {
    const handleFsChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', handleFsChange)
    return () => document.removeEventListener('fullscreenchange', handleFsChange)
  }, [])

  // Auto-fullscreen on TV after content is ready – guarded with delay
  useEffect(() => {
    if (!mediaId || isNaN(mediaId)) return
    // Small delay so the DOM and iframe are mounted first
    const timer = setTimeout(() => {
      const el = playerContainerRef.current
      if (el && !document.fullscreenElement) {
        el.requestFullscreen().catch(() => {
          // Fullscreen may be blocked on some devices – silently fail
        })
      }
      setIsLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [mediaId])

  // Android TV back-button / keyboard handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // BACK (keyCode 4 on Android TV), Escape, Backspace
      if (e.key === 'Escape' || e.key === 'Backspace' || e.keyCode === 4) {
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          navigate(-1)
        }
        e.preventDefault()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigate])

  // ── Validate params early – prevents blank screen ──
  if (!id || isNaN(mediaId)) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6 text-white">
        <p className="text-zinc-400 text-lg">Content not found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-8 py-3 rounded-2xl bg-[#00f3ff] text-black font-black uppercase tracking-widest"
        >
          Back to Home
        </button>
      </div>
    )
  }

  // Fullscreen mode – minimal chrome
  if (fullscreen) {
    return (
      <div
        className="fixed inset-0 z-[9999] bg-black"
        ref={playerContainerRef}
      >
        <PlayerWrapper embedUrl={embedUrl} title={title} />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-black text-white">
      <div className="max-w-[1800px] mx-auto px-6 sm:px-12 py-8 pt-24">
        {/* Back + title row */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest hover:bg-white/10 focus:bg-[#00f3ff] focus:text-black transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]"
          >
            <ArrowLeft className="w-5 h-5" /> Back
          </button>

          <div className="text-right hidden sm:block">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter truncate max-w-lg">
              {title}
            </h1>
            <p className="text-[10px] font-black text-[#00f3ff] uppercase tracking-widest mt-1 opacity-60">
              Playing on {source.name}
            </p>
          </div>
        </div>

        {/* Player + fullscreen button */}
        <div className="relative" ref={playerContainerRef}>
          {isLoading && (
            <div className="absolute inset-0 z-10 bg-black rounded-3xl flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          <div className="aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.9)] bg-zinc-950">
            <PlayerWrapper embedUrl={embedUrl} title={title} />
          </div>

          {/* Fullscreen toggle – TV-reachable */}
          <button
            onClick={handleFullscreen}
            aria-label="Toggle fullscreen"
            className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl hover:bg-white/20 focus:bg-[#00f3ff] focus:text-black transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]"
          >
            <Maximize2 className="w-6 h-6" />
          </button>
        </div>

        {/* Episode picker (TV shows) */}
        {mediaType === 'tv' && details?.seasons && (
          <FadeContent delay={0.2} className="mt-8">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative">
                <button
                  onClick={() => setShowEpisodePicker(v => !v)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white/5 border border-white/10 text-sm font-black uppercase tracking-widest hover:bg-white/10 focus:bg-[#00f3ff] focus:text-black transition-all outline-none"
                >
                  Season {season}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showEpisodePicker ? 'rotate-180' : ''}`} />
                </button>
                {showEpisodePicker && (
                  <div className="absolute top-full mt-2 left-0 z-50 w-48 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl">
                    {details.seasons.map((s: any) => (
                      <button
                        key={s.id}
                        onClick={() => { setSeason(s.season_number ?? 1); setShowEpisodePicker(false) }}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors focus:outline-none focus:bg-[#00f3ff]/20 ${season === (s.season_number ?? 1) ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'hover:bg-white/5 text-white/70'}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 20 }, (_, i) => i + 1).map(ep => (
                  <button
                    key={ep}
                    onClick={() => setEpisode(ep)}
                    className={`w-10 h-10 rounded-xl text-sm font-black transition-all outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff] ${episode === ep ? 'bg-[#00f3ff] text-black' : 'bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400'}`}
                  >
                    {ep}
                  </button>
                ))}
              </div>
            </div>
          </FadeContent>
        )}

        {/* Details */}
        {details && (
          <FadeContent delay={0.3} className="mt-10 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2">
                {details.genres?.map((g: any) => (
                  <span key={g.id} className="px-4 py-1.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-[#00f3ff]">
                    {g.name}
                  </span>
                ))}
              </div>
              <p className="text-lg text-zinc-400 font-medium leading-relaxed">
                {details.overview}
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-4 self-start">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Stream Info</h3>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 font-semibold">Rating</span>
                <span className="font-black text-white">★ {details.vote_average?.toFixed(1)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500 font-semibold">Type</span>
                <span className="font-black text-white capitalize">{mediaType}</span>
              </div>
              {details.runtime && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 font-semibold">Runtime</span>
                  <span className="font-black text-white">{details.runtime} min</span>
                </div>
              )}
              {(details.release_date || details.first_air_date) && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500 font-semibold">Year</span>
                  <span className="font-black text-white">
                    {(details.release_date || details.first_air_date).slice(0, 4)}
                  </span>
                </div>
              )}
            </div>
          </FadeContent>
        )}
      </div>
    </div>
  )
}