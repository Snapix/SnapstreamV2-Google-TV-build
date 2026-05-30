import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, MonitorPlay, Zap, Info } from 'lucide-react'
import { FadeContent } from '../components/FadeContent'
import { HlsPlayer } from '../components/HlsPlayer'

// Curated backup sources for History TV 18 HD
const CHANNEL_MIRRORS: Record<string, string[]> = {
  'History TV18 HD': [
    'http://66.102.120.18:8000/play/a01q/index.m3u8',
    'https://n18syndication.akamaized.net/bpk-tv/History_HD_NW18_MOB/output01/History_HD_NW18_MOB-video=2297600.m3u8',
    'https://amg01448-amg01448c16-samsung-in-3495.playouts.now.amagi.tv/playlist/amg01448-samsungindia-historychannelenglish-samsungin/playlist.m3u8'
  ]
}

export default function LivePlayer() {
  const { url: initialUrl, name: initialName } = useParams<{ url: string; name: string }>()
  
  const decodedUrl = decodeURIComponent(initialUrl || '')
  const decodedName = decodeURIComponent(initialName || 'Live Stream')

  const [currentUrl, setCurrentUrl] = useState(decodedUrl)
  const [showMirrorMenu, setShowMirrorMenu] = useState(false)
  const [playerType, setPlayerType] = useState<'hls' | 'native'>('hls')

  // Auto-proxy for Mixed Content (HTTP on HTTPS)
  const finalStreamUrl = useMemo(() => {
    if (currentUrl.startsWith('http://') && window.location.protocol === 'https:') {
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(currentUrl)}`
    }
    return currentUrl
  }, [currentUrl])

  const mirrors = CHANNEL_MIRRORS[decodedName] || []

  return (
    <div className="relative min-h-screen pt-16 sm:pt-24 bg-black text-white">
      <div className="max-w-[1800px] mx-auto px-4 sm:px-12 py-4">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <FadeContent delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8 max-w-[1700px] mx-auto">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.8)]" />
                    <h1 className="font-display text-2xl sm:text-4xl font-black text-white leading-tight uppercase tracking-tighter">
                      {decodedName}
                    </h1>
                </div>

                <div className="flex items-center gap-3">
                    {mirrors.length > 0 && (
                      <div className="relative">
                        <div className="flex flex-col gap-1">
                          <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">Source</span>
                          <button 
                            onClick={() => setShowMirrorMenu(!showMirrorMenu)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all min-w-[140px] justify-between"
                          >
                            <span className="flex items-center gap-2 truncate">
                              <Zap className="w-3 h-3 text-yellow-500" />
                              {mirrors.indexOf(currentUrl) !== -1 ? `Mirror ${mirrors.indexOf(currentUrl) + 1}` : 'Initial'}
                            </span>
                            <ChevronDown className={`w-3 h-3 transition-transform ${showMirrorMenu ? 'rotate-180' : ''}`} />
                          </button>
                        </div>

                        {showMirrorMenu && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setShowMirrorMenu(false)} />
                            <div className="absolute top-full mt-2 right-0 z-50 w-64 bg-zinc-900 border border-white/10 rounded-2xl p-2 shadow-2xl animate-in fade-in slide-in-from-top-2">
                               <p className="text-[9px] font-black text-zinc-500 uppercase px-3 py-2 border-b border-white/5 mb-1">Select Stream Source</p>
                               <button 
                                 onClick={() => { setCurrentUrl(decodedUrl); setShowMirrorMenu(false); }}
                                 className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${currentUrl === decodedUrl ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'hover:bg-white/5 text-white/70'}`}
                               >
                                 Source 1 (Multi-Audio)
                               </button>
                               {mirrors.map((m, i) => (
                                 <button 
                                   key={i}
                                   onClick={() => { setCurrentUrl(m); setShowMirrorMenu(false); }}
                                   className={`w-full text-left px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all ${currentUrl === m ? 'bg-[#00f3ff]/20 text-[#00f3ff]' : 'hover:bg-white/5 text-white/70'}`}
                                 >
                                   Source {i + 1}
                                 </button>
                               ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest px-1">Engine</span>
                      <select value={playerType} onChange={(e) => setPlayerType(e.target.value as any)} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[9px] font-black uppercase tracking-widest outline-none cursor-pointer">
                        <option value="hls" className="bg-[#111]">HLS.js</option>
                        <option value="native" className="bg-[#111]">Native</option>
                      </select>
                    </div>
                </div>
              </div>
              
              <div className="w-full relative shadow-[0_0_100px_rgba(0,0,0,0.8)] rounded-3xl overflow-hidden border border-white/10 bg-zinc-950 aspect-video">
                <HlsPlayer streamUrl={finalStreamUrl} title={decodedName} key={finalStreamUrl + playerType} />
              </div>

              <div className="p-6 rounded-3xl bg-white/5 border border-white/10 flex items-start gap-4">
                 <Info className="w-5 h-5 text-[#00f3ff] mt-0.5 flex-shrink-0" />
                 <div className="space-y-1">
                    <p className="text-[11px] font-black uppercase tracking-widest text-white">Multi-Audio HD Stream</p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      Use the <b>Settings</b> gear icon in the player top bar to switch between <b>English, Hindi, Tamil,</b> or <b>Telugu</b> audio tracks.
                    </p>
                 </div>
              </div>
            </div>

            <div className="hidden lg:block space-y-6">
               <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 mb-4 flex items-center gap-2">
                 <MonitorPlay className="w-3 h-3" /> Station Details
               </h2>
               <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 text-center space-y-6">
                  <div className="w-32 h-32 mx-auto rounded-3xl bg-zinc-950 border border-white/10 p-6 flex items-center justify-center">
                     <img src="https://jiotvimages.cdn.jio.com/dare_images/images/History_HD.png" alt="" className="w-full h-full object-contain" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{decodedName}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2">Network18 Media</p>
                  </div>
               </div>
            </div>

          </div>
        </FadeContent>
      </div>
    </div>
  )
}
