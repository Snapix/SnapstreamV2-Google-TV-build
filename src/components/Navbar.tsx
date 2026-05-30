import { useState, useEffect, useCallback, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Search, X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { AuroraText } from './ui/aurora-text'

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '#about' },
]

interface NavbarProps { onAboutClick: () => void }

export default function Navbar({ onAboutClick }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 120)
      return () => clearTimeout(t)
    }
    setSearchQuery('')
  }, [searchOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.21, 0.47, 0.32, 0.98] }}
        className={`fixed top-0 inset-x-0 z-50 h-16 sm:h-20 transition-all duration-300 ${
          scrolled
            ? 'bg-black/40 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_32px_rgba(0,0,0,.5)]'
            : 'bg-black/20 backdrop-blur-md border-b border-transparent'
        }`}
      >
        {scrolled && (
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[.06] to-transparent pointer-events-none" />
        )}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center gap-4 lg:gap-8">
          <Link to="/" className="flex items-center flex-shrink-0 group" aria-label="SnapStream Home">
            <AuroraText
              className="px-2 py-1 text-xl sm:text-3xl font-black tracking-tighter font-display italic uppercase drop-shadow-[0_0_8px_rgba(0,243,255,.4)] group-hover:drop-shadow-[0_0_15px_rgba(0,243,255,.6)] transition-all"
              colors={['#ffffff', '#00f3ff', '#ffffff']}
            >
              SnapStream
            </AuroraText>
          </Link>

          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, href }) => {
              const isActive = location.pathname === href
              return (
                <Link
                  key={label}
                  to={href}
                  onClick={e => {
                    if (href === '#about') { e.preventDefault(); onAboutClick?.() }
                  }}
                  className={`group relative px-3 py-2 rounded-md text-sm font-semibold tracking-wide transition-colors duration-200 ${
                    isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 rounded-md bg-white/[.06] border border-white/[.06]"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="flex-1" />

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 border border-white/10 bg-black/20 hover:bg-white/10 transition-all rounded-full flex items-center justify-center"
              aria-label="Open search"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-300" />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex flex-col"
            style={{ backdropFilter: 'blur(24px)', background: 'rgba(0,0,0,.85)' }}
          >
            <div className="flex items-center gap-3 px-4 pt-safe pt-6 pb-4 border-b border-white/[.06]">
              <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" aria-hidden />
              <form onSubmit={handleSubmit} className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search movies, shows, anime…"
                  className="w-full bg-transparent border-none outline-none text-lg text-white placeholder-zinc-500 font-medium"
                  aria-label="Mobile search"
                />
              </form>
              <button onClick={() => setSearchOpen(false)} className="p-2 rounded-full hover:bg-white/[.06] transition-colors" aria-label="Close search">
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>
            {!searchQuery && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="px-6 py-8 text-center"
              >
                <p className="text-zinc-500 text-sm">Start typing to search…</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
