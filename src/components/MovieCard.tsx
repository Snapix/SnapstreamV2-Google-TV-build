import { memo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Play } from 'lucide-react'
import { cn } from '../lib/utils'

interface MovieCardProps {
  item: {
    id: number
    title?: string
    name?: string
    poster_path: string | null
    backdrop_path: string | null
    vote_average: number
    media_type?: string
  }
  size?: 'sm' | 'md'
  mediaType?: string
}

export const MovieCard = memo(function MovieCard({ item, size = 'md', mediaType }: MovieCardProps) {
  const [loaded, setLoaded] = useState(false)
  const posterUrl = item.poster_path
    ? `https://image.tmdb.org/t/p/w780${item.poster_path}`
    : '/placeholder.svg'
  const linkPath = `/watch/${mediaType || item.media_type || 'movie'}/${item.id}`
  const title = item.title ?? item.name ?? 'Untitled'

  return (
    <Link
      to={linkPath}
      className={cn(
        'group relative flex-shrink-0 rounded-xl overflow-hidden border border-white/[.06]',
        'transition-all duration-300 hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,243,255,0.08)]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        size === 'sm' ? 'w-16 md:w-20' : 'w-20 md:w-28',
      )}
      aria-label={`Watch ${title}`}
    >
      <div className={cn(
        'relative overflow-hidden',
        size === 'sm' ? 'aspect-[2/3]' : 'aspect-[2/3]',
      )}>
        {!loaded && (
          <div className="absolute inset-0 bg-white/[.03] shimmer" />
        )}
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={cn(
            'w-full h-full object-cover transition-all duration-500',
            'group-hover:scale-110 group-hover:brightness-110',
            loaded ? 'opacity-100' : 'opacity-0',
          )}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
        </div>

        <div className="absolute top-2 right-2 z-10">
          <span className="inline-flex items-center gap-0.5 text-[11px] font-bold text-white px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur border border-white/[.06]">
            <span className="text-yellow-500">★</span>
            {item.vote_average?.toFixed(1)}
          </span>
        </div>

        <div className={cn(
          'absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent',
          'opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300',
        )}>
          <p className="text-xs font-semibold text-white leading-tight truncate">
            {title}
          </p>
        </div>
      </div>
    </Link>
  )
})
