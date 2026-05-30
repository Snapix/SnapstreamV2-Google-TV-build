import { X, MousePointer2, Image as ImageIcon } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface SettingsModalProps { 
  isOpen: boolean; 
  onClose: () => void;
  cursorEnabled: boolean;
  setCursorEnabled: (v: boolean) => void;
}

export default function SettingsModal({ 
  isOpen, 
  onClose,
  cursorEnabled,
  setCursorEnabled
}: SettingsModalProps) {
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
            className="bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_40px_rgba(0,0,0,0.8)]"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div>
                <h2 className="font-display text-2xl font-black text-white">
                  Settings
                </h2>
                <p className="text-xs text-zinc-500 mt-1 tracking-wide uppercase">
                  Customize your experience
                </p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#00f3ff]">
                <X className="w-5 h-5 text-zinc-400 hover:text-white" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <MousePointer2 className="w-5 h-5 text-[#00f3ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Custom Cursor</p>
                    <p className="text-xs text-zinc-500 mt-0.5">Toggle the interactive custom cursor</p>
                  </div>
                </div>
                <button
                  onClick={() => setCursorEnabled(!cursorEnabled)}
                  className={`w-12 h-6 rounded-full transition-colors relative outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#111] ${cursorEnabled ? 'bg-[#00f3ff]' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 bottom-1 w-4 bg-black rounded-full transition-transform duration-300 ${cursorEnabled ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-zinc-600 text-center mt-8 uppercase tracking-widest font-semibold">
              SnapStream V2 &middot; OS Interface
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
