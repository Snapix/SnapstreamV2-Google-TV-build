import { useState, lazy, Suspense } from 'react'
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Dock from './components/Dock'
import { Home as HomeIcon, Search, Film, Tv, Settings, Info } from 'lucide-react'
import SettingsModal from './components/AboutModal'
import CreditsModal from './components/CreditsModal'
import GlassSurface from './components/GlassSurface'
import SplashScreen from './components/SplashScreen'
import Cursor from './components/Cursor'
import { motion, AnimatePresence } from 'motion/react'

const Home = lazy(() => import('./pages/Home'))
const Watch = lazy(() => import('./pages/Watch'))
const SearchPage = lazy(() => import('./pages/Search'))
const GameDetails = lazy(() => import('./pages/GameDetails'))
const LivePlayer = lazy(() => import('./pages/LivePlayer'))

function AppFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent">
      <div className="w-8 h-8 border-2 border-[#00f3ff] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function AnimatedRoutes({ mediaType }: { mediaType: 'video' | 'apps' | 'livetv' }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname + mediaType}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home mediaType={mediaType} />} />
          <Route path="/watch/:type/:id" element={<Watch />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/game/:id" element={<GameDetails />} />
          <Route path="/live/:url/:name" element={<LivePlayer />} />
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="font-display text-6xl font-black text-white/20">404</h1>
                  <p className="text-zinc-500 mt-2">Page not found</p>
                </div>
              </div>
            }
          />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  const [splashDone, setSplashDone] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [creditsOpen, setCreditsOpen] = useState(false)
  const [cursorEnabled, setCursorEnabled] = useState(true)
  const [mediaType, setMediaType] = useState<'video' | 'apps' | 'livetv'>('video')
  const navigate = useNavigate()

  if (!splashDone) {
    return <SplashScreen onFinish={() => setSplashDone(true)} />
  }

  const dockItems = [
    { icon: <HomeIcon className="w-5 h-5" />, label: 'Home', onClick: () => navigate('/') },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', onClick: () => setAboutOpen(true) },
  ]

  return (
    <div className={`relative min-h-screen bg-black text-white antialiased overflow-x-hidden`}>
      <GlassSurface />

      {cursorEnabled && <Cursor />}

      {/* Top Navigation Bar */}
      <div className="fixed top-0 inset-x-0 z-[100] h-20 px-4 sm:px-8 flex items-center justify-between pointer-events-none">
        {/* Left: Logo Placeholder */}
        <div className="flex-1 opacity-0 pointer-events-none hidden sm:block">Logo</div>

        {/* Center: Media Toggle */}
        <div className="flex items-center p-1.5 rounded-[2rem] bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] scale-75 sm:scale-100 transition-all pointer-events-auto origin-top sm:origin-center mt-4 sm:mt-0">
          <button
            onClick={() => { setMediaType('video'); navigate('/'); }}
            className={`px-4 sm:px-6 py-2 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${mediaType === 'video' ? 'bg-[#00f3ff] text-black shadow-[0_0_25px_rgba(0,243,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}
          >
            Movies & TV
          </button>
          <button
            onClick={() => { setMediaType('livetv'); navigate('/'); }}
            className={`px-4 sm:px-6 py-2 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${mediaType === 'livetv' ? 'bg-[#00f3ff] text-black shadow-[0_0_25px_rgba(0,243,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}
          >
            Live TV
          </button>
          <button
            onClick={() => { setMediaType('apps'); navigate('/'); }}
            className={`px-4 sm:px-6 py-2 rounded-[1.8rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-500 ${mediaType === 'apps' ? 'bg-[#00f3ff] text-black shadow-[0_0_25px_rgba(0,243,255,0.4)]' : 'text-zinc-500 hover:text-white'}`}
          >
            Games & Apps
          </button>
        </div>

        {/* Right: About Creator */}
        <div className="flex-1 flex justify-end pointer-events-auto">
          <button
            onClick={() => setCreditsOpen(true)}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black uppercase tracking-widest text-white transition-all shadow-xl active:scale-95"
          >
            <Info className="w-3.5 h-3.5 text-[#00f3ff]" />
            About Creator
          </button>
        </div>
      </div>

      <main className="transition-all duration-300">
        <Suspense fallback={<AppFallback />}>
          <AnimatedRoutes mediaType={mediaType} />
        </Suspense>
      </main>

      <Dock 
        items={dockItems}
        panelHeight={60}
        baseItemSize={40}
        magnification={70}
      />

      <SettingsModal 
        isOpen={aboutOpen} 
        onClose={() => setAboutOpen(false)} 
        cursorEnabled={cursorEnabled}
        setCursorEnabled={setCursorEnabled}
      />

      <CreditsModal
        isOpen={creditsOpen}
        onClose={() => setCreditsOpen(false)}
      />
    </div>
  )
}
