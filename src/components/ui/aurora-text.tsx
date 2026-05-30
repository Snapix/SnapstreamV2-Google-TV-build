import { memo } from 'react'

interface AuroraTextProps {
  children: React.ReactNode
  className?: string
  colors?: string[]
  speed?: number
}

export const AuroraText = memo(function AuroraText({
  children,
  className = '',
  colors = ['#ffffff', '#00f3ff', '#ffffff'],
  speed = 1,
}: AuroraTextProps) {
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="sr-only">{children}</span>
      <span
        className="animate-aurora relative bg-[length:200%_auto] bg-clip-text text-transparent"
        style={{
          backgroundImage: `linear-gradient(135deg, ${colors.join(', ')}, ${colors[0]})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          animationDuration: `${10 / speed}s`,
        }}
        aria-hidden="true"
      >
        {children}
      </span>
    </span>
  )
})
