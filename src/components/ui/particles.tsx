import { useEffect, useRef, useState, type ComponentPropsWithoutRef } from 'react'

interface MousePosition { x: number; y: number }

function useMousePosition(): MousePosition {
  const [pos, setPos] = useState<MousePosition>({ x: 0, y: 0 })
  useEffect(() => {
    const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])
  return pos
}

interface ParticlesProps extends ComponentPropsWithoutRef<'div'> {
  className?: string
  quantity?: number
  staticity?: number
  ease?: number
  size?: number
  refresh?: boolean
  color?: string
  vx?: number
  vy?: number
}

function hexToRgb(hex: string): number[] {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c + c).join('')
  const n = parseInt(hex, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

type Circle = {
  x: number; y: number; translateX: number; translateY: number
  size: number; alpha: number; targetAlpha: number
  dx: number; dy: number; magnetism: number
}

export function Particles({
  className = '', quantity = 100, staticity = 50, ease = 50,
  size = 0.4, refresh = false, color = '#ffffff', vx = 0, vy = 0, ...props
}: ParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const circlesRef = useRef<Circle[]>([])
  const mouse = useRef({ x: 0, y: 0 })
  const canvasSize = useRef({ w: 0, h: 0 })
  const mousePos = useMousePosition()
  const dpr = window.devicePixelRatio || 1
  const rafId = useRef<number>(0)

  const rgb = hexToRgb(color)

  const circleParams = (): Circle => ({
    x: Math.floor(Math.random() * canvasSize.current.w),
    y: Math.floor(Math.random() * canvasSize.current.h),
    translateX: 0, translateY: 0,
    size: Math.floor(Math.random() * 2) + size,
    alpha: 0,
    targetAlpha: parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
    dx: (Math.random() - 0.5) * 0.1,
    dy: (Math.random() - 0.5) * 0.1,
    magnetism: 0.1 + Math.random() * 4,
  })

  const drawCircle = (circle: Circle, update = false) => {
    const ctx = ctxRef.current
    if (!ctx) return
    const { x, y, translateX, translateY, size, alpha } = circle
    ctx.translate(translateX, translateY)
    ctx.beginPath()
    ctx.arc(x, y, size, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(${rgb.join(', ')}, ${alpha})`
    ctx.fill()
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!update) circlesRef.current.push(circle)
  }

  const clearCtx = () => {
    ctxRef.current?.clearRect(0, 0, canvasSize.current.w, canvasSize.current.h)
  }

  const initCanvas = () => {
    const container = containerRef.current
    const canvas = canvasRef.current
    const ctx = ctxRef.current
    if (!container || !canvas || !ctx) return
    canvasSize.current = { w: container.offsetWidth, h: container.offsetHeight }
    canvas.width = canvasSize.current.w * dpr
    canvas.height = canvasSize.current.h * dpr
    canvas.style.width = `${canvasSize.current.w}px`
    canvas.style.height = `${canvasSize.current.h}px`
    ctx.scale(dpr, dpr)
    circlesRef.current = []
    for (let i = 0; i < quantity; i++) drawCircle(circleParams())
  }

  const animate = () => {
    clearCtx()
    circlesRef.current.forEach((circle, i) => {
      const edge = [
        circle.x + circle.translateX - circle.size,
        canvasSize.current.w - circle.x - circle.translateX - circle.size,
        circle.y + circle.translateY - circle.size,
        canvasSize.current.h - circle.y - circle.translateY - circle.size,
      ]
      const closest = edge.reduce((a, b) => Math.min(a, b))
      const remapped = Math.max(0, ((closest - 0) * (1 - 0)) / (20 - 0) + 0)
      circle.alpha = remapped > 1
        ? Math.min(circle.alpha + 0.02, circle.targetAlpha)
        : circle.targetAlpha * remapped
      circle.x += circle.dx + vx
      circle.y += circle.dy + vy
      circle.translateX += (mouse.current.x / (staticity / circle.magnetism) - circle.translateX) / ease
      circle.translateY += (mouse.current.y / (staticity / circle.magnetism) - circle.translateY) / ease
      drawCircle(circle, true)
      if (circle.x < -circle.size || circle.x > canvasSize.current.w + circle.size || circle.y < -circle.size || circle.y > canvasSize.current.h + circle.size) {
        circlesRef.current.splice(i, 1)
        drawCircle(circleParams())
      }
    })
    rafId.current = requestAnimationFrame(animate)
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) ctxRef.current = canvas.getContext('2d')
    initCanvas()
    animate()
    const onResize = () => { initCanvas() }
    window.addEventListener('resize', onResize)
    return () => {
      cancelAnimationFrame(rafId.current)
      window.removeEventListener('resize', onResize)
    }
  }, [color, refresh])

  useEffect(() => {
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const { w, h } = canvasSize.current
      mouse.current = {
        x: mousePos.x - rect.left - w / 2,
        y: mousePos.y - rect.top - h / 2,
      }
    }
  }, [mousePos])

  return (
    <div ref={containerRef} className={`pointer-events-none ${className}`} aria-hidden="true" {...props}>
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
