import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Starfield() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const stars = useMemo(() => {
    const count = isMobile ? 120 : 300
    return Array.from({ length: count }).map((_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4,
    }))
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {stars.map((star) => (
        <motion.div
          key={star.id}
          initial={{ opacity: 0.2 }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [0.7, 1.3, 0.7],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: "easeInOut",
          }}
          className="absolute rounded-full bg-black dark:bg-white"
          style={{
            width: star.size,
            height: star.size,
            top: star.top,
            left: star.left,
          }}
        />
      ))}
    </div>
  )
}
