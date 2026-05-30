import { useRef, type ReactNode } from 'react'

interface ClickSparkProps {
  children: ReactNode
}

export default function ClickSpark({ children }: ClickSparkProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const handleClick = (e: React.MouseEvent) => {
    const parent = parentRef.current
    if (!parent) return

    const rect = parent.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    for (let i = 0; i < 8; i++) {
      const spark = document.createElement('div')
      const angle = (i / 8) * Math.PI * 2
      const dist = 30 + Math.random() * 20
      spark.style.cssText = `
        position: absolute; left: ${x}px; top: ${y}px; width: 4px; height: 4px;
        border-radius: 50%; background: #00f3ff; pointer-events: none; z-index: 9999;
        transition: all 0.6s cubic-bezier(0, 0.5, 0.5, 1); opacity: 1;
      `
      parent.appendChild(spark)
      requestAnimationFrame(() => {
        spark.style.transform = `translate(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px)`
        spark.style.opacity = '0'
      })
      setTimeout(() => spark.remove(), 600)
    }
  }

  return (
    <div ref={parentRef} className="relative inline-block" onClick={handleClick}>
      {children}
    </div>
  )
}
