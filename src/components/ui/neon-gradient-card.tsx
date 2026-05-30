import { CSSProperties, ReactElement, ReactNode, useEffect, useRef, useState } from 'react'

interface NeonColorsProps { firstColor: string; secondColor: string }

interface NeonGradientCardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: ReactElement
  className?: string
  children?: ReactNode
  borderSize?: number
  borderRadius?: number
  neonColors?: NeonColorsProps
}

export const NeonGradientCard: React.FC<NeonGradientCardProps> = ({
  className, children, borderSize = 2, borderRadius = 20,
  neonColors = { firstColor: '#ff00aa', secondColor: '#00FFF1' }, ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current
        setDims({ width: offsetWidth, height: offsetHeight })
      }
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div
      ref={containerRef}
      style={{
        '--border-size': `${borderSize}px`,
        '--border-radius': `${borderRadius}px`,
        '--neon-first-color': neonColors.firstColor,
        '--neon-second-color': neonColors.secondColor,
        '--card-width': `${dims.width}px`,
        '--card-height': `${dims.height}px`,
        '--card-content-radius': `${borderRadius - borderSize}px`,
        '--pseudo-element-background-image': `linear-gradient(0deg, ${neonColors.firstColor}, ${neonColors.secondColor})`,
        '--pseudo-element-width': `${dims.width + borderSize * 2}px`,
        '--pseudo-element-height': `${dims.height + borderSize * 2}px`,
        '--after-blur': `${dims.width / 3}px`,
      } as CSSProperties}
      className={`relative z-10 size-full rounded-[var(--border-radius)] ${className ?? ''}`}
      {...props}
    >
      <div
        className="relative size-full min-h-[inherit] rounded-[var(--card-content-radius)] bg-[#060810] p-6
          before:absolute before:-top-[var(--border-size)] before:-left-[var(--border-size)] before:-z-10 before:block
          before:h-[var(--pseudo-element-height)] before:w-[var(--pseudo-element-width)] before:rounded-[var(--border-radius)] before:content-['']
          before:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] before:bg-[length:100%_200%]
          before:animate-[background-position-spin_3s_linear_infinite]
          after:absolute after:-top-[var(--border-size)] after:-left-[var(--border-size)] after:-z-10 after:block
          after:h-[var(--pseudo-element-height)] after:w-[var(--pseudo-element-width)] after:rounded-[var(--border-radius)] after:blur-[var(--after-blur)] after:content-['']
          after:bg-[linear-gradient(0deg,var(--neon-first-color),var(--neon-second-color))] after:bg-[length:100%_200%] after:opacity-80
          after:animate-[background-position-spin_3s_linear_infinite]"
      >
        {children}
      </div>
    </div>
  )
}
