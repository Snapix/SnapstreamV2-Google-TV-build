import { motion } from 'motion/react'

export default function MovieRow({ title, children }: any) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black text-white/90 tracking-tight uppercase">
          {title}
        </h2>
      </div>
      <div className="relative group">
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-8 scrollbar-hide snap-x px-1">
          {Array.isArray(children) ? children.map((child: any, i: number) => (
            <motion.div
              key={child.key || i}
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ 
                duration: 0.5, 
                delay: Math.min(i * 0.05, 0.4),
                ease: [0.23, 1, 0.32, 1]
              }}
              className="flex-shrink-0 snap-start"
            >
              {child}
            </motion.div>
          )) : children}
        </div>
      </div>
    </div>
  )
}
