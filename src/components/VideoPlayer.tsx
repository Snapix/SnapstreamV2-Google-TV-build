import { useState } from 'react'

interface VideoPlayerProps {
  title: string
  src: string
  poster?: string
}

export default function VideoPlayer({ title, src, poster }: VideoPlayerProps) {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden cyber-glow bg-black relative">
      {!loaded && poster && (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${poster})` }} />
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      <iframe
        src={src}
        title={title}
        className="w-full h-full"
        allowFullScreen
        allow="autoplay; encrypted-media; fullscreen"
        onLoad={() => setLoaded(true)}
        style={{ border: 0 }}
      />
    </div>
  )
}
