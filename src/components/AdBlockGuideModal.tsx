import { X, ShieldAlert } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'

interface AdBlockGuideModalProps { isOpen: boolean; onClose: () => void }

export function AdBlockGuideModal({ isOpen, onClose }: AdBlockGuideModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={e => e.stopPropagation()}
            className="bg-[#111] border border-white/10 rounded-2xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-red-500/20 rounded-xl border border-red-500/30">
                  <ShieldAlert className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-white">Block Ads & Popups Globally</h2>
                  <p className="text-zinc-400 text-sm mt-1">Recommended for the best streaming experience</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-zinc-400 hover:text-white" />
              </button>
            </div>
            <div className="space-y-6 text-zinc-300 leading-relaxed">
              <div className="bg-white/5 border border-white/10 p-5 rounded-xl">
                <h3 className="text-lg font-semibold text-white mb-2">What is AdGuard DNS?</h3>
                <p className="text-sm">AdGuard DNS blocks ads, trackers, and malicious domains at network level without installing apps.</p>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-4 text-white">
                  <h3 className="text-lg font-semibold">Setup instructions</h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                    <h4 className="font-semibold text-white mb-3">Android</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Settings → Network & Internet → Private DNS</li>
                      <li>Select "Private DNS provider hostname"</li>
                      <li>Type <code className="text-primary text-xs bg-white/10 px-1.5 py-0.5 rounded">dns.adguard-dns.com</code></li>
                      <li>Tap Save</li>
                    </ol>
                  </div>
                  <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                    <h4 className="font-semibold text-white mb-3">Windows</h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>Control Panel → Network and Sharing Center</li>
                      <li>Change adapter settings → Properties</li>
                      <li>Select IPv4 → Use DNS <code className="text-primary text-xs bg-white/10 px-1.5 py-0.5 rounded">94.140.14.14</code> / <code className="text-primary text-xs bg-white/10 px-1.5 py-0.5 rounded">94.140.15.15</code></li>
                    </ol>
                  </div>
                  <div className="bg-black/50 border border-white/5 p-4 rounded-xl">
                    <h4 className="font-semibold text-white mb-3">iOS & macOS</h4>
                    <p className="text-sm">Download the free AdGuard app from the App Store to enable DNS protection system-wide.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
