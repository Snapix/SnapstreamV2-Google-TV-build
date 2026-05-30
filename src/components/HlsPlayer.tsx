import { memo, useRef, useState, useEffect } from 'react'
import { Play, Pause, Rewind, FastForward, Maximize, Volume2, VolumeX, ArrowDownToLine, ArrowUpToLine, Activity, Settings2 } from 'lucide-react'
import ElasticSlider from './ElasticSlider'
import { motion, AnimatePresence } from 'motion/react'
import Hls from 'hls.js'

interface HlsPlayerProps {
  streamUrl: string
  title: string
}

export const HlsPlayer = memo(function HlsPlayer({ streamUrl, title }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [controlsPosition, setControlsPosition] = useState<'overlay' | 'bottom'>('overlay')
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const [volume, setVolume] = useState(100)
  const [isLive, setIsLive] = useState(true)
  const [errorCount, setErrorCount] = useState(0)
  
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
        
        // Load Audio Tracks
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

  const handleMouseMove = () => {
    if (!controlsEnabled || controlsPosition === 'bottom') return
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
  }

  const handleFullscreen = () => {
    if (!document.fullscreenElement && videoRef.current?.parentElement) {
      videoRef.current.parentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const switchAudioTrack = (index: number) => {
    if (hlsRef.current) {
      hlsRef.current.audioTrack = index
      setShowAudioMenu(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-[#107c10]/20 text-[#107c10] border border-[#107c10]/40 shadow-lg uppercase tracking-widest">
            <Activity className="w-3 h-3 animate-pulse" />
            Live Feed
          </div>
          <button
            onClick={() => setControlsEnabled(!controlsEnabled)}
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shadow-lg uppercase tracking-widest ${
              controlsEnabled ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/40' : 'bg-zinc-800 text-zinc-400 border-white/5'
            }`}
          >
            {controlsEnabled ? 'Controls On' : 'Controls Off'}
          </button>
        </div>

        <div className="flex items-center gap-3">
           {/* Audio Track Selector */}
           {audioTracks.length > 1 && (
             <div className="relative">
                <button 
                  onClick={() => setShowAudioMenu(!showAudioMenu)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest border border-white/10 shadow-lg transition-all"
                >
                  <Settings2 className="w-3 h-3" />
                  Audio: {audioTracks[currentAudioIndex]?.name || 'Auto'}
                </button>
                {showAudioMenu && (
                  <div className="absolute bottom-full mb-2 right-0 z-50 w-48 bg-zinc-900 border border-white/10 rounded-xl p-1 shadow-2xl animate-in fade-in slide-in-from-bottom-2">
                     <p className="text-[8px] font-black text-zinc-500 uppercase px-3 py-2 border-b border-white/5">Switch Audio Language</p>
                     {audioTracks.map((track, i) => (
                       <button 
                         key={i} 
                         onClick={() => switchAudioTrack(i)}
                         className={`w-full text-left px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors ${currentAudioIndex === i ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'hover:bg-white/5 text-white/70'}`}
                       >
                         {track.name}
                       </button>
                     ))}
                  </div>
                )}
             </div>
           )}

           <button
             onClick={() => setControlsPosition(p => p === 'overlay' ? 'bottom' : 'overlay')}
             className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-colors border border-white/10 shadow-lg"
           >
             {controlsPosition === 'overlay' ? <ArrowDownToLine className="w-3 h-3" /> : <ArrowUpToLine className="w-3 h-3" />}
             {controlsPosition === 'overlay' ? 'Dock' : 'Overlay'}
           </button>
        </div>
      </div>

      <div 
        className="relative w-full aspect-video max-h-[80vh] bg-black overflow-hidden rounded-2xl border border-white/[.1] shadow-[0_0_40px_rgba(0,0,0,0.9)] group"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
        onClick={() => { if (!hasInteracted) setHasInteracted(true) }}
      >
        <video ref={videoRef} className="absolute inset-0 w-full h-full z-0 object-contain" onClick={() => !controlsEnabled && togglePlay()} />

        {(!isPlaying || errorCount > 0) && hasInteracted && (
           <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <button 
                onClick={() => { setErrorCount(0); initPlayer(); }}
                className="px-10 py-4 rounded-full bg-[#00f3ff] text-black font-black uppercase tracking-widest shadow-[0_0_30px_rgba(0,243,255,0.5)] active:scale-95 transition-all"
              >
                {errorCount > 0 ? 'Retry Stream' : 'Play Stream'}
              </button>
           </div>
        )}

        {controlsPosition === 'overlay' && controlsEnabled && (
          <AnimatePresence>
            {showControls && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
                <div className="h-24 bg-gradient-to-b from-black/90 to-transparent" />
                <div className={`flex-1 flex items-center justify-center ${!hasInteracted ? 'opacity-0' : ''}`}>
                  <button onClick={togglePlay} className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all shadow-[0_0_40px_rgba(0,243,255,0.4)] pointer-events-auto">
                    {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-2" />}
                  </button>
                </div>
                <div className={`h-28 bg-gradient-to-t from-black to-transparent flex items-end p-8 ${!hasInteracted ? 'opacity-0' : ''}`}>
                  <div className="w-full flex items-center gap-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-8 py-4 pointer-events-auto">
                    <button onClick={togglePlay} className="hover:text-[#00f3ff] transition-colors">{isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}</button>
                    <div className="flex-1 text-center font-black tracking-widest text-[#00f3ff] text-xs uppercase opacity-80">⏺ LIVE BROADCAST</div>
                    <div className="flex items-center gap-4">
                      {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      <div className="w-32"><ElasticSlider startingValue={0} defaultValue={volume} maxValue={100} onChange={setVolume} leftIcon={null} rightIcon={null} /></div>
                      <button onClick={handleFullscreen} className="hover:text-[#00f3ff] transition-colors"><Maximize className="w-5 h-5" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {controlsPosition === 'bottom' && controlsEnabled && (
        <div className="w-full flex items-center gap-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl px-10 py-5 shadow-2xl">
          <button onClick={togglePlay} className="hover:text-[#00f3ff] transition-colors scale-125">{isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}</button>
          <div className="flex-1 text-center font-black tracking-widest text-[#00f3ff] text-xs uppercase opacity-80">⏺ LIVE BROADCAST</div>
          <div className="flex items-center gap-4">
            {volume === 0 ? <VolumeX className="w-5 h-5 text-zinc-500" /> : <Volume2 className="w-5 h-5 text-zinc-500" />}
            <div className="w-32"><ElasticSlider startingValue={0} defaultValue={volume} maxValue={100} onChange={setVolume} leftIcon={null} rightIcon={null} /></div>
            <button onClick={handleFullscreen} className="hover:text-[#00f3ff] transition-colors ml-4"><Maximize className="w-5 h-5" /></button>
          </div>
        </div>
      )}
    </div>
  )
})
