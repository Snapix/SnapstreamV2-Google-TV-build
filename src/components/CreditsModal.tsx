import { X, Youtube, Instagram, Link as LinkIcon, Heart } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface CreditsModalProps { 
  isOpen: boolean; 
  onClose: () => void;
}

export default function CreditsModal({ isOpen, onClose }: CreditsModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#060606]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[0_0_40px_rgba(0,0,0,0.8)] relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-[#00f3ff]/20 to-purple-500/20 blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between relative z-10 mb-6">
              <button onClick={onClose} className="p-2 -ml-2 -mt-2 hover:bg-white/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]">
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            <div className="flex flex-col items-center relative z-10 mb-8">
              <div className="relative mb-4">
                <img 
                  src="/profile.jpg" 
                  alt="Snappy" 
                  className="w-24 h-24 rounded-full object-cover border-2 border-white/10 shadow-[0_0_20px_rgba(0,243,255,0.2)]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://picsum.photos/200/200?blur=2'; // Fallback if no profile.jpg
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-[#111] rounded-full p-1 border border-white/10">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </div>
              </div>
              <h2 className="font-display text-3xl font-black text-white tracking-wide">
                SNAPPY
              </h2>
              <p className="text-sm text-[#00f3ff] font-medium tracking-widest uppercase mt-1">
                Creator
              </p>
            </div>

            <div className="space-y-3 relative z-10">
              <a 
                href="https://www.youtube.com/@snappy4yt" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]"
              >
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 group-hover:bg-red-500/20 transition-colors">
                  <Youtube className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">YouTube</p>
                  <p className="text-xs text-zinc-500 mt-0.5">@snappy4yt</p>
                </div>
              </a>

              <a 
                href="https://www.instagram.com/snapix_yt" 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-colors group outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]"
              >
                <div className="p-2 rounded-lg bg-pink-500/10 border border-pink-500/20 group-hover:bg-pink-500/20 transition-colors">
                  <Instagram className="w-5 h-5 text-pink-500" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Instagram</p>
                  <p className="text-xs text-zinc-500 mt-0.5">@snapix_yt</p>
                </div>
              </a>

              <div className="pt-4 mt-4 border-t border-white/10 grid grid-cols-2 gap-3">
                <a 
                  href="https://snapstreamme.vercel.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]"
                >
                  <LinkIcon className="w-4 h-4 text-zinc-400" />
                  <p className="text-[10px] font-semibold text-zinc-300 text-center leading-tight">Old SnapStream</p>
                </a>
                <a 
                  href="https://touchlesstouch.vercel.app" 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/10 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]"
                >
                  <LinkIcon className="w-4 h-4 text-zinc-400" />
                  <p className="text-[10px] font-semibold text-zinc-300 text-center leading-tight">TouchlessTouch</p>
                </a>
              </div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
