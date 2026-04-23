import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronsDown } from 'react-icons/fi'
import { useProtectedAsset } from '../hooks/useProtectedAsset'
import { useTranslation } from 'react-i18next'

export default function Hero({ theme }) {
  const { t } = useTranslation()
  const isDark = theme === 'dark'
  const desktopVideoSrc = useProtectedAsset(isDark ? 'Title-Home-Dark.mp4' : 'Title-Home-Light.mp4')
  const mobileVideoSrc = useProtectedAsset(isDark ? 'Title-Home-Dark-D.mp4' : 'Title-Home-Light-D.mp4')
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches)
  const videoSrc = isMobile ? mobileVideoSrc : desktopVideoSrc

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)')
    const onChange = (event) => setIsMobile(event.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  const scrollNext = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="home" className="relative h-[100svh] overflow-hidden bg-white dark:bg-black md:h-screen">
      {videoSrc ? (
        <video
          key={videoSrc}
          className="absolute inset-0 h-full w-full object-cover object-center scale-[1.18] md:scale-100"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src={videoSrc} type="video/mp4" />
        </video>
      ) : null}
      <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-5 md:bottom-10">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="interactive rounded-full bg-black px-8 py-4 text-sm font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 dark:bg-white dark:text-black"
          >
            {t('hero.cta')}
          </button>
          <button
            type="button"
            onClick={() => document.getElementById('coming-soon')?.scrollIntoView({ behavior: 'smooth' })}
            className="interactive rounded-full border border-black/20 bg-white/50 px-8 py-4 text-sm font-bold text-black backdrop-blur-md transition-all hover:bg-black hover:text-white dark:border-white/20 dark:bg-black/50 dark:text-white dark:hover:bg-white dark:hover:text-black"
          >
            {t('hero.cta2')}
          </button>
        </div>
        <motion.button
          type="button"
          onClick={scrollNext}
          aria-label="Scroll down"
          animate={{ y: [0, 10, 0], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.6, repeat: Number.POSITIVE_INFINITY }}
          className="grid h-11 w-11 place-items-center rounded-full border border-white/30 bg-black/40 text-white backdrop-blur-md dark:border-white/20 dark:bg-black/60"
        >
          <FiChevronsDown size={18} />
        </motion.button>
      </div>
    </section>
  )
}
