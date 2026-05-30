import { useState, useEffect, useRef } from 'react'

export default function Magnet({
  children,
  padding = 100,
  disabled = false,
  magnetStrength = 2,
  activeTransition = 'transform 0.3s ease-out',
  inactiveTransition = 'transform 0.5s ease-in-out',
  wrapperClassName = '',
  innerClassName = '',
  ...props
}: {
  children?: React.ReactNode
  padding?: number
  disabled?: boolean
  magnetStrength?: number
  activeTransition?: string
  inactiveTransition?: string
  wrapperClassName?: string
  innerClassName?: string
  [key: string]: any
}) {
  const [isActive, setIsActive] = useState(false)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (disabled) { setPos({ x: 0, y: 0 }); return }
    const handler = (e: MouseEvent) => {
      if (!ref.current) return
      const r = ref.current.getBoundingClientRect()
      const cx = r.left + r.width / 2
      const cy = r.top + r.height / 2
      const dx = Math.abs(cx - e.clientX)
      const dy = Math.abs(cy - e.clientY)
      if (dx < r.width / 2 + padding && dy < r.height / 2 + padding) {
        setIsActive(true)
        setPos({ x: (e.clientX - cx) / magnetStrength, y: (e.clientY - cy) / magnetStrength })
      } else {
        setIsActive(false)
        setPos({ x: 0, y: 0 })
      }
    }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [padding, disabled, magnetStrength])

  return (
    <div ref={ref} className={wrapperClassName} style={{ position: 'relative', display: 'inline-block' }} {...props}>
      <div
        className={innerClassName}
        style={{
          transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
          transition: isActive ? activeTransition : inactiveTransition,
          willChange: 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}
