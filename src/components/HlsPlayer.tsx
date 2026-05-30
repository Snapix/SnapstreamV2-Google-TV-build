import { memo, useRef, useState, useEffect } from 'react'
import { Play, Pause, Maximize, Volume2, VolumeX, ArrowDownToLine, ArrowUpToLine, Activity, Settings2 } from 'lucide-react'
import ElasticSlider from './ElasticSlider'
import { motion, AnimatePresence } from 'framer-motion'
import Hls from 'hls.js'

interface HlsPlayerProps {
  streamUrl: string
  title: string
}

export const HlsPlayer = memo(function HlsPlayer({ streamUrl, title }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [controlsPosition, setControlsPosition] = useState<'overlay' | 'bottom'>('overlay')
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const [volume, setVolume] = useState(100)
  const [isLive, setIsLive] = useState(true)
  const [errorCount, setErrorCount] = useState(0)
  const [isFullScreen, setIsFullScreen] = useState(false)
  
  // Audio Track State
  const [audioTracks, setAudioTracks] = useState<any[]>([])
  const [currentAudioIndex, setCurrentAudioIndex] = useState(-1)
  const [showAudioMenu, setShowAudioMenu] = useState(false)

  const initPlayer = () => {
    const video = videoRef.current
    if (!video || !streamUrl) return

    if (hlsRef.current) hlsRef.current.destroy()

    if (Hls.isSupported()) {
      const hls = new Hls({
        maxBufferLength: 30,
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      })
      hlsRef.current = hls

      hls.loadSource(streamUrl)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, function () {
        video.play().catch(e => console.warn("Autoplay blocked", e))
        
        const tracks = hls.audioTracks
        if (tracks.length > 0) {
          setAudioTracks(tracks)
          setCurrentAudioIndex(hls.audioTrack)
        }
      })

      hls.on(Hls.Events.AUDIO_TRACK_SWITCHED, function () {
        setCurrentAudioIndex(hls.audioTrack)
      })

      hls.on(Hls.Events.LEVEL_UPDATED, (e, data) => setIsLive(data.details.live))

      hls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          setErrorCount(prev => prev + 1)
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad()
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break;
            default:
              hls.destroy()
              break;
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl
      video.load()
      video.play().catch(e => console.warn("Autoplay blocked native", e))
    }
  }

  useEffect(() => {
    initPlayer()
    const video = videoRef.current
    if (!video) return

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)

    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)

    return () => {
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      if (hlsRef.current) hlsRef.current.destroy()
    }
  }, [streamUrl])

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100
      videoRef.current.muted = volume === 0
    }
  }, [volume])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause()
      else videoRef.current.play()
    }
  }

  const wakeControls = () => {
    if (!controlsEnabled || controlsPosition === 'bottom') return
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000)
  }

  // Fullscreen Handler (Works natively without redirects)
  const handleFullscreen = () => {
    const container = containerRef.current
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
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  // Android TV Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      wakeControls()
      
      // DPAD_CENTER / ENTER (23, 13)
      if (e.key === 'Enter' || e.keyCode === 23) {
        // If focus is on document body, default to play/pause
        if (document.activeElement === document.body || document.activeElement === containerRef.current) {
          togglePlay()
          e.preventDefault()
        }
      }
      
      // KEYCODE_MEDIA_PLAY_PAUSE (85)
      if (e.keyCode === 85 || e.key === 'MediaPlayPause') {
         togglePlay()
         e.preventDefault()
      }
    }

    // Capture keys globally when player is visible
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  const switchAudioTrack = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index
      setShowAudioMenu(false)
      
      // Refocus audio button for TV navigation continuity
      document.getElementById('audio-btn')?.focus()
    }
  }

  return (
    <div className={`flex flex-col gap-4 w-full ${isFullScreen ? 'h-screen fixed inset-0 z-[9999] bg-black p-0' : ''}`} ref={containerRef}>
      
      {!isFullScreen && (
        <div className="flex flex-wrap items-center justify-between gap-3 w-full p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#107c10]/20 text-[#107c10] border border-[#107c10]/40 shadow-lg uppercase tracking-widest">
              <Activity className="w-3 h-3 animate-pulse" />
              Live Feed
            </div>
          </div>

          <div className="flex items-center gap-3">
             {audioTracks.length > 1 && (
               <div className="relative">
                  <button 
                    id="audio-btn"
                    tabIndex={0}
                    onClick={() => setShowAudioMenu(!showAudioMenu)}
                    className="focus:outline-none focus:ring-2 focus:ring-[#00f3ff] flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 shadow-lg transition-all"
                  >
                    <Settings2 className="w-3 h-3" />
                    Audio: {audioTracks[currentAudioIndex]?.name || 'Auto'}
                  </button>
                  {showAudioMenu && (
                    <div className="absolute top-full mt-2 right-0 z-50 w-48 bg-zinc-900 border border-white/10 rounded-xl p-1 shadow-2xl animate-in fade-in slide-in-from-top-2">
                       <p className="text-[8px] font-black text-zinc-500 uppercase px-3 py-2 border-b border-white/5">Switch Audio</p>
                       {audioTracks.map((track, i) => (
                         <button 
                           key={i} 
                           tabIndex={0}
                           onClick={() => switchAudioTrack(i)}
                           className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[#00f3ff] focus:bg-[#00f3ff]/20 ${currentAudioIndex === i ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'hover:bg-white/5 text-white/70'}`}
                         >
                           {track.name}
                         </button>
                       ))}
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      )}

      <div 
        tabIndex={0} // Make container focusable for TV
        className={`relative w-full aspect-video bg-black overflow-hidden group focus:outline-none ${!isFullScreen ? 'rounded-2xl border border-white/[.1] shadow-[0_0_40px_rgba(0,0,0,0.9)] max-h-[80vh]' : 'h-full border-none shadow-none rounded-none'}`}
        onMouseMove={wakeControls}
        onMouseLeave={() => setShowControls(false)}
        onClick={() => togglePlay()}
      >
        <video ref={videoRef} className="absolute inset-0 w-full h-full z-0 object-contain" />

        {errorCount > 0 && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <button 
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); setErrorCount(0); initPlayer(); }}
                className="px-10 py-4 rounded-full bg-[#00f3ff] text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,243,255,0.5)] focus:scale-110 active:scale-95 transition-all outline-none"
              >
                Retry Stream
              </button>
           </div>
        )}

        {controlsEnabled && (
          <AnimatePresence>
            {showControls && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
                <div className="h-32 bg-gradient-to-b from-black/90 to-transparent" />
                
                <div className="flex-1 flex items-center justify-center">
                  <button 
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                    className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 focus:bg-[#00f3ff]/20 focus:border-[#00f3ff] focus:scale-110 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-auto outline-none"
                  >
                    {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-2" />}
                  </button>
                </div>

                <div className="h-40 bg-gradient-to-t from-black to-transparent flex items-end p-8">
                  <div className="w-full flex items-center gap-8 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl px-8 py-4 pointer-events-auto shadow-2xl">
                    <button 
                      tabIndex={0}
                      onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                      className="hover:text-[#00f3ff] focus:text-[#00f3ff] focus:scale-125 transition-all outline-none"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                    </button>
                    
                    <div className="flex-1 flex flex-col justify-center px-4">
                       <p className="font-black tracking-widest text-white text-sm uppercase truncate">{title}</p>
                       <p className="text-[10px] text-[#00f3ff] font-bold uppercase tracking-widest mt-1">Live Broadcast</p>
                    </div>

                    <div className="flex items-center gap-6">
                      <button 
                         tabIndex={0}
                         onClick={(e) => { e.stopPropagation(); handleFullscreen(); }} 
                         className="hover:text-[#00f3ff] focus:text-[#00f3ff] focus:scale-125 transition-all outline-none bg-white/10 p-2 rounded-xl"
                      >
                         <Maximize className="w-6 h-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
})