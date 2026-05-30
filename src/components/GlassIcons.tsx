import type { ReactNode } from 'react'

interface GlassIconsProps {
  items: Array<{
    icon: ReactNode
    label: string
    onClick?: () => void
  }>
  className?: string
}

export default function GlassIcons({ items, className }: GlassIconsProps) {
  return (
    <div className={`flex flex-wrap gap-3 ${className ?? ''}`}>
      {items.map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          aria-label={item.label}
          className="group relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center
            bg-white/[0.04] border border-white/[0.06] backdrop-blur-xl
            hover:bg-white/[0.08] hover:border-white/[0.12] hover:scale-105
            active:scale-95
            transition-all duration-200"
          style={{
            boxShadow:
              '0 4px 24px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          <div className="text-white/70 group-hover:text-white/90 transition-colors duration-200 [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
            {item.icon}
          </div>
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent pointer-events-none" />
        </button>
      ))}
    </div>
  )
}
