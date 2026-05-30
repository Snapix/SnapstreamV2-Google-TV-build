import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, Star, Download, Info, Shield, CheckCircle2, AlertCircle
} from 'lucide-react'
import { FadeContent } from '../components/FadeContent'

// For now using static data for Plants vs Zombies as requested
const STATIC_GAMES: Record<string, any> = {
  'pvz-goty': {
    title: 'Plants vs Zombies GOTY Edition',
    description: 'Get ready to soil your plants! A mob of fun-loving zombies is about to invade your home, and your only defense is an arsenal of 49 zombie-zapping plants. Use peashooters, wall-nuts, cherry bombs and more to mulchify 26 types of zombies before they can reach your front door.',
    rating: 4.8,
    releaseDate: '2010',
    poster: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/3590/library_600x900.jpg',
    downloadUrl: 'https://download141.uploadhaven.com/1/application/zip/A2VMWjmHLqz2v0MtWOpNOTRFfJspqiumltY4AitL.zip?key=n7OXnEfw4WwaDb6MH30yEA&expire=1779876081&filename=Plants.Vs.Zombies.GOTY.zip',
    additionalInfo: "If you see missing DLL errors, check the _Redist folder inside and install what's needed.",
    category: 'Games'
  },
  'gta-5-enhanced': {
    title: 'GTA 5 Enhanced',
    description: 'Experience the world of Los Santos and Blaine County in the ultimate Grand Theft Auto V experience. Featuring a range of technical upgrades and enhancements for new and returning players, including improved resolution, increased draw distance, and more.',
    rating: 4.9,
    releaseDate: '2026 (Enhanced)',
    poster: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg',
    downloadUrl: 'https://download191.uploadhaven.com/1/application/x-bittorrent/bRyi2ngb7Q38CK7jrgvY1fWjA0C6uQdtNRerkGT2.torrent?key=c2DNplpcPFDLhO1RMLvFmA&expire=1780051391&filename=GTA.V.Enhanced.v2026.01.27.zip.torrent',
    additionalInfo: "Use trusted toreents such as qbittorrent ktorrent to download the game the the torrent recived file is is 90 gb make sure you have space in ur disk !and a decent pc to run the game",
    category: 'Games'
  }
}

export default function GameDetails() {
  const { id } = useParams<{ id: string }>()
  const game = STATIC_GAMES[id || ''] || STATIC_GAMES['pvz-goty'] // Default to PvZ for demo

  return (
    <div className="relative min-h-screen pt-20 sm:pt-24 bg-black text-white antialiased">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Library
        </Link>

        <FadeContent delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-12">
            
            {/* Left: Poster & Download */}
            <div className="space-y-8">
              <div className="relative aspect-[2/3] rounded-3xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] group">
                <img src={game.poster} alt={game.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              <div className="space-y-4">
                <a
                  href={game.downloadUrl}
                  className="flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-[#00f3ff] text-black font-display font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(0,243,255,0.3)] hover:scale-[1.02] active:scale-95 transition-all"
                >
                  <Download className="w-5 h-5" />
                  Download Now
                </a>
                
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex gap-3">
                  <Info className="w-5 h-5 text-[#00f3ff] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                    {game.additionalInfo}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Info Section */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                   <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
                     {game.category}
                   </span>
                   <span className="px-3 py-1 rounded-full bg-[#00f3ff]/10 border border-[#00f3ff]/20 text-[10px] font-black uppercase tracking-widest text-[#00f3ff]">
                     Verified Clean
                   </span>
                </div>
                <h1 className="font-display text-5xl sm:text-7xl font-black text-white leading-tight uppercase tracking-tighter">
                  {game.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 mt-6">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-lg font-black text-white">{game.rating}</span>
                  </div>
                  <div className="h-6 w-px bg-white/10" />
                  <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
                    Released: {game.releaseDate}
                  </span>
                </div>
              </div>

              <div className="space-y-6 pt-8 border-t border-white/10">
                <div>
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-4 block font-display">Overview</span>
                  <p className="text-lg text-zinc-400 leading-relaxed font-medium bg-white/[0.02] p-8 rounded-3xl border border-white/5">
                    {game.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="p-6 rounded-3xl bg-green-500/5 border border-green-500/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-green-500/10 flex items-center justify-center">
                         <Shield className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Security</p>
                         <p className="text-sm font-bold text-white">Scanned for Malware</p>
                      </div>
                   </div>
                   <div className="p-6 rounded-3xl bg-[#00f3ff]/5 border border-[#00f3ff]/10 flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-[#00f3ff]/10 flex items-center justify-center">
                         <CheckCircle2 className="w-5 h-5 text-[#00f3ff]" />
                      </div>
                      <div>
                         <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Mirror</p>
                         <p className="text-sm font-bold text-white">Coming Soon</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>

          </div>
        </FadeContent>
      </div>
    </div>
  )
}
