import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export default function SplashScreen({ onFinish }: { onFinish: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 25 + 25; // Faster loading
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(currentProgress);
        clearInterval(interval);
        setTimeout(onFinish, 150); // Faster exit
      } else {
        setProgress(currentProgress);
      }
    }, 80);

    return () => clearInterval(interval);
  }, [onFinish]);

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        {/* SnapStream Logo Text */}
        <div className="flex space-x-1 overflow-hidden font-display font-black tracking-tighter text-6xl md:text-8xl mb-8">
          {['S', 'N', 'A', 'P', 'S', 'T', 'R', 'E', 'A', 'M', ' ', 'V', '2'].map((letter, i) => (
            <motion.span
              key={i}
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.4,
                delay: i * 0.04,
                ease: [0.2, 0.6, 0.3, 1]
              }}
              className={i < 4 ? "text-[#00f3ff]" : "text-white"}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.span>
          ))}
        </div>

        {/* Fake Loading Bar */}
        <div className="w-64 md:w-96 h-1 mt-4 relative bg-white/10 rounded overflow-hidden">
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#00f3ff]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ ease: "linear", duration: 0.1 }}
          />
        </div>
        
        <motion.div 
          className="mt-4 text-[#00f3ff]/60 text-[10px] tracking-[0.4em] uppercase font-bold"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          Initializing... {Math.floor(progress)}%
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
