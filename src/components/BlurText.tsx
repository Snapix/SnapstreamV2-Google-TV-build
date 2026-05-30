import { useRef } from 'react'
import { motion, useInView } from 'motion/react'

export function BlurText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-10%' })
  return (
    <div ref={ref} className={`overflow-hidden inline-block ${className ?? ''}`}>
      <motion.div
        initial={{ filter: 'blur(10px)', opacity: 0, y: 10 }}
        animate={inView ? { filter: 'blur(0px)', opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay, ease: 'easeOut' }}
        className="inline-block"
      >
        {text}
      </motion.div>
    </div>
  )
}
