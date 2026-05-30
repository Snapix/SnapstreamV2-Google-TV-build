import { motion } from 'motion/react'

export const FadeContent = ({ children, delay = 0, duration = 0.8, y = 20, blur = 10, className = "" }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: "-50px" }}
      className={className}
      transition={{ 
        duration, 
        delay, 
        ease: [0.23, 1, 0.32, 1] 
      }}
    >
      {children}
    </motion.div>
  )
}
