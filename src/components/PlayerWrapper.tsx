import { memo, useRef, useState, useEffect } from 'react'
import { Play, Pause, Rewind, FastForward, Maximize, Volume2, VolumeX, ArrowDownToLine, ArrowUpToLine, Shield, ShieldOff } from 'lucide-react'
import ElasticSlider from './ElasticSlider'
import { motion, AnimatePresence } from 'motion/react'

interface PlayerWrapperProps {
  embedUrl: string
  title: string
}

export const PlayerWrapper = memo(function PlayerWrapper({ embedUrl, title }: PlayerWrapperProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [hasInteracted, setHasInteracted] = useState(false)
  const [controlsPosition, setControlsPosition] = useState<'overlay' | 'bottom'>('overlay')
  const [shieldEnabled, setShieldEnabled] = useState(false)
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  const [volume, setVolume] = useState(100)

  const sendCommand = (command: string, args?: any) => {
    if (iframeRef.current?.contentWindow) {
      // Multiple API attempts
      const target = '*'
      const win = iframeRef.current.contentWindow
      
      // Standard lowercase
      win.postMessage({ type: command, ...args }, target)
      
      // Uppercase VidLink
      let data = args
      if (args?.time) data = args.time
      if (args?.volume !== undefined) data = args.volume
      win.postMessage({ type: command.toUpperCase(), data }, target)
      
      // Method format
      win.postMessage({ method: command, value: data }, target)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
    sendCommand(isPlaying ? 'pause' : 'play')
  }

  const handleMouseMove = () => {
    if (!controlsEnabled || controlsPosition === 'bottom') return
    setShowControls(true)
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
  }

  const handleDoubleTapLeft = () => sendCommand('seek', { time: -10 })
  const handleDoubleTapRight = () => sendCommand('seek', { time: 10 })

  useEffect(() => {
    handleMouseMove()
    const handleBlur = () => {
      if (document.activeElement === iframeRef.current) setHasInteracted(true)
    }
    window.addEventListener('blur', handleBlur)
    return () => {
      clearTimeout(controlsTimeoutRef.current)
      window.removeEventListener('blur', handleBlur)
    }
  }, [controlsPosition, controlsEnabled])

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center justify-between gap-3 w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShieldEnabled(!shieldEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shadow-lg uppercase tracking-widest ${
              shieldEnabled 
                ? 'bg-[#107c10]/20 text-[#107c10] border-[#107c10]/40' 
                : 'bg-red-500/20 text-red-500 border-red-500/40'
            }`}
          >
            {shieldEnabled ? <Shield className="w-3 h-3" /> : <ShieldOff className="w-3 h-3" />}
            {shieldEnabled ? 'Shield Active' : 'Shield Off'}
          </button>

          <button
            onClick={() => setControlsEnabled(!controlsEnabled)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all border shadow-lg uppercase tracking-widest ${
              controlsEnabled 
                ? 'bg-[#00f3ff]/20 text-[#00f3ff] border-[#00f3ff]/40' 
                : 'bg-zinc-800 text-zinc-400 border-white/5'
            }`}
          >
            {controlsEnabled ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
            {controlsEnabled ? 'Controls On' : 'Controls Off'}
          </button>
          
          <span className="text-[9px] text-zinc-500 uppercase tracking-tighter max-w-[200px] leading-tight hidden sm:block">
            {shieldEnabled 
              ? "Blocking popups. Video might not load." 
              : "Shield Off. All players will work."}
          </span>
        </div>

        <button
          onClick={() => setControlsPosition(p => p === 'overlay' ? 'bottom' : 'overlay')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-[10px] font-bold text-white uppercase tracking-widest transition-colors border border-white/10 shadow-lg"
        >
          {controlsPosition === 'overlay' ? (
            <><ArrowDownToLine className="w-3 h-3" /> Dock Controls</>
          ) : (
            <><ArrowUpToLine className="w-3 h-3" /> Overlay Controls</>
          )}
        </button>
      </div>

      <div 
        className="relative w-full aspect-video max-h-[80vh] bg-black overflow-hidden rounded-2xl border border-white/[.1] shadow-[0_0_40px_rgba(0,0,0,0.9)] group"
        onMouseMove={handleMouseMove}
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
          sandbox={shieldEnabled ? "allow-scripts allow-same-origin allow-forms allow-presentation" : undefined}
          className={`absolute inset-0 w-full h-full border-none z-0 ${!controlsEnabled ? 'pointer-events-auto' : (hasInteracted ? 'pointer-events-auto' : 'pointer-events-none')}`}
          title={title}
        />

        {controlsPosition === 'overlay' && controlsEnabled && (
          <AnimatePresence>
            {showControls && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none"
              >
                <div className="h-24 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
                <div className={`flex-1 flex items-center justify-between px-12 ${!hasInteracted ? 'opacity-0' : ''}`}>
                  <div className="w-1/4 h-full cursor-pointer flex items-center justify-start opacity-0 hover:opacity-100 transition-opacity pointer-events-auto" onDoubleClick={handleDoubleTapLeft}>
                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-full border border-white/10"><Rewind className="w-10 h-10 text-white" /></div>
                  </div>
                  <button onClick={togglePlay} className="w-24 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all shadow-[0_0_40px_rgba(0,243,255,0.4)] pointer-events-auto">
                    {isPlaying ? <Pause className="w-10 h-10 text-white fill-white" /> : <Play className="w-10 h-10 text-white fill-white ml-2" />}
                  </button>
                  <div className="w-1/4 h-full cursor-pointer flex items-center justify-end opacity-0 hover:opacity-100 transition-opacity pointer-events-auto" onDoubleClick={handleDoubleTapRight}>
                    <div className="bg-white/10 backdrop-blur-xl p-5 rounded-full border border-white/10"><FastForward className="w-10 h-10 text-white" /></div>
                  </div>
                </div>
                <div className={`h-28 bg-gradient-to-t from-black to-transparent flex items-end p-8 ${!hasInteracted ? 'opacity-0' : ''}`}>
                  <div className="w-full flex items-center gap-8 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl px-8 py-4 pointer-events-auto">
                    <button onClick={togglePlay} className="hover:text-[#00f3ff] transition-colors">{isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}</button>
                    <div className="flex-1"><ElasticSlider startingValue={0} defaultValue={0} maxValue={100} leftIcon={null} rightIcon={null} className="w-full !max-w-none [&_.slider-root]:max-w-none" /></div>
                    <div className="flex items-center gap-4">
                      {volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                      <div className="w-32"><ElasticSlider startingValue={0} defaultValue={volume} maxValue={100} onChange={setVolume} leftIcon={null} rightIcon={null} /></div>
                      <button className="hover:text-[#00f3ff] transition-colors"><Maximize className="w-5 h-5" /></button>
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
          <div className="flex-1 flex items-center gap-6">
            <button onClick={handleDoubleTapLeft} className="hover:text-[#00f3ff] transition-colors opacity-60 hover:opacity-100"><Rewind className="w-5 h-5" /></button>
            <ElasticSlider startingValue={0} defaultValue={0} maxValue={100} leftIcon={null} rightIcon={null} className="w-full !max-w-none [&_.slider-root]:max-w-none" />
            <button onClick={handleDoubleTapRight} className="hover:text-[#00f3ff] transition-colors opacity-60 hover:opacity-100"><FastForward className="w-5 h-5" /></button>
          </div>
          <div className="flex items-center gap-4">
            {volume === 0 ? <VolumeX className="w-5 h-5 text-zinc-500" /> : <Volume2 className="w-5 h-5 text-zinc-500" />}
            <div className="w-32"><ElasticSlider startingValue={0} defaultValue={volume} maxValue={100} onChange={setVolume} leftIcon={null} rightIcon={null} /></div>
          </div>
        </div>
      )}
    </div>
  )
})
