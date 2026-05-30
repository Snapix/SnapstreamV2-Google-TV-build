import { memo, useRef, useState, useEffect } from 'react'
import { Play, Pause, Rewind, FastForward, Maximize, Volume2, VolumeX } from 'lucide-react'
import ElasticSlider from './ElasticSlider'
import { motion, AnimatePresence } from 'framer-motion'

interface PlayerWrapperProps {
  embedUrl: string
  title: string
}

export const PlayerWrapper = memo(function PlayerWrapper({ embedUrl, title }: PlayerWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const [volume, setVolume] = useState(100)

  const sendCommand = (command: string, args?: any) => {
    if (iframeRef.current?.contentWindow) {
      const target = '*'
      const win = iframeRef.current.contentWindow
      win.postMessage({ type: command, ...args }, target)
      let data = args
      if (args?.time) data = args.time
      if (args?.volume !== undefined) data = args.volume
      win.postMessage({ type: command.toUpperCase(), data }, target)
      win.postMessage({ method: command, value: data }, target)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    sendCommand(isPlaying ? 'pause' : 'play')
  }

  const handleDoubleTapLeft = () => sendCommand('seek', { time: -10 })
  const handleDoubleTapRight = () => sendCommand('seek', { time: 10 })

  const wakeControls = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 4000)
  }

  useEffect(() => {
    wakeControls()
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) setHasInteracted(true)
    }
    window.addEventListener('blur', handleBlur)
    return () => {
      clearTimeout(controlsTimeoutRef.current)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  // Android TV Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      wakeControls()
      
      // Right Arrow (Seek +10s)
      if (e.key === 'ArrowRight' || e.keyCode === 22) {
        handleDoubleTapRight()
        e.preventDefault()
      } 
      // Left Arrow (Seek -10s)
      else if (e.key === 'ArrowLeft' || e.keyCode === 21) {
        handleDoubleTapLeft()
        e.preventDefault()
      }
      // Enter / Center (Play/Pause)
      else if (e.key === 'Enter' || e.keyCode === 23) {
        if (document.activeElement === document.body || document.activeElement === containerRef.current) {
          togglePlay()
          e.preventDefault()
        }
      }
      // Media Play Pause
      else if (e.keyCode === 85 || e.key === 'MediaPlayPause') {
         togglePlay()
         e.preventDefault()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying])

  return (
    <div className="flex flex-col gap-4 w-full h-full" ref={containerRef}>
      <div 
        tabIndex={0}
        className="relative w-full h-full bg-black overflow-hidden rounded-2xl group focus:outline-none focus:ring-2 focus:ring-[#00f3ff]"
        onMouseMove={wakeControls}
        onMouseLeave={() => setShowControls(false)}
        onClick={() => { if (!hasInteracted) setHasInteracted(true) }}
      >
        <iframe
          ref={iframeRef}
          src={embedUrl}
          width="100%"
          height="100%"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          className="absolute inset-0 w-full h-full border-none z-0 pointer-events-auto"
          title={title}
        />

        <AnimatePresence>
          {showControls && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none"
            >
              <div className="h-32 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
              
              <div className={`flex-1 flex items-center justify-between px-12 ${!hasInteracted ? 'opacity-0' : ''}`}>
                <div className="w-1/4 h-full cursor-pointer flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity pointer-events-auto" onDoubleClick={handleDoubleTapLeft}>
                  <div className="bg-white/10 backdrop-blur-xl p-5 rounded-full border border-white/10"><Rewind className="w-10 h-10 text-white" /></div>
                </div>
                <button 
                   tabIndex={0}
                   onClick={(e) => { e.stopPropagation(); togglePlay(); }} 
                   className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 focus:bg-[#00f3ff]/20 focus:border-[#00f3ff] focus:scale-110 transition-all shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-auto outline-none"
                >
                  {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-2" />}
                </button>
                <div className="w-1/4 h-full cursor-pointer flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity pointer-events-auto" onDoubleClick={handleDoubleTapRight}>
                  <div className="bg-white/10 backdrop-blur-xl p-5 rounded-full border border-white/10"><FastForward className="w-10 h-10 text-white" /></div>
                </div>
              </div>

              <div className={`h-40 bg-gradient-to-t from-black to-transparent flex items-end p-8 ${!hasInteracted ? 'opacity-0' : ''}`}>
                <div className="w-full flex items-center gap-8 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-2xl px-8 py-4 pointer-events-auto shadow-2xl">
                  <button onClick={(e) => { e.stopPropagation(); togglePlay(); }} className="hover:text-[#00f3ff] focus:text-[#00f3ff] transition-all outline-none">
                     {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                  </button>
                  
                  <div className="flex-1 flex flex-col justify-center px-4">
                     <p className="font-black tracking-widest text-white text-sm uppercase truncate">{title}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {volume === 0 ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                    <div className="w-32"><ElasticSlider startingValue={0} defaultValue={volume} maxValue={100} onChange={setVolume} leftIcon={null} rightIcon={null} /></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
})
