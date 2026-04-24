import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import {
  LuChevronRight,
  LuHouse,
  LuSparkles,
  LuMessageSquareQuote,
  LuUser,
  LuZap,
  LuMoonStar,
  LuSunMedium,
  LuX,
} from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'
import { useProtectedAsset } from '../hooks/useProtectedAsset'

const navItems = [
  { key: 'home', id: 'home', icon: LuHouse },
  { key: 'about', id: 'about', icon: LuSparkles },
  { key: 'services', id: 'services', icon: LuChevronRight },
  { key: 'founder', id: 'founder', icon: LuUser },
  { key: 'comingSoon', id: 'coming-soon', icon: LuZap },
  { key: 'contact', id: 'contact', icon: LuMessageSquareQuote },
]

export default function Navbar({ theme, onToggleTheme, language, onLanguageChange }) {
  const [open, setOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const { t } = useTranslation()
  const isArabic = language === 'ar'
  const desktopLogo = useProtectedAsset(theme === 'dark' ? 'Logo-NB-Dark.png' : 'Logo-NB-Light.png')
  const mobileLogo = useProtectedAsset(theme === 'dark' ? 'Logo-NB-Dark-D.png' : 'Logo-NB-Light-D.png')

  // Scroll Spy Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.find(entry => entry.isIntersecting)
        if (intersecting) {
          setActiveSection(intersecting.target.id)
        }
      },
      { threshold: 0.3, rootMargin: '-10% 0px -20% 0px' }
    )

    const observeElements = () => {
      navItems.forEach((item) => {
        const el = document.getElementById(item.id)
        if (el) observer.observe(el)
      })
    }

    // Small delay to ensure DOM is ready
    const timeoutId = setTimeout(observeElements, 500)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const [isSidebarHovered, setIsSidebarHovered] = useState(false)
  const hoverTimeoutRef = useRef(null)

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    setIsSidebarHovered(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsSidebarHovered(false)
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
    }
  }, [])

  const onNavigate = (target) => {
    document.getElementById(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div className="section-shell pt-3 md:pt-4">
          <div className="surface flex h-16 items-center justify-between rounded-full px-3 md:h-18 md:px-4 shadow-lg">
            {/* Logo */}
            <button type="button" onClick={() => onNavigate('home')} className="interactive shrink-0 rounded-full px-2 py-1">
              {mobileLogo ? <img src={mobileLogo} alt="AshTech" className="h-8 w-auto md:hidden" /> : <span className="block h-8 w-24 md:hidden" />}
              {desktopLogo ? <img src={desktopLogo} alt="AshTech" className="hidden h-10 w-auto md:block" /> : <span className="hidden h-10 w-28 md:block" />}
            </button>

            {/* Right Side Tools */}
            <div className="hidden items-center gap-2 md:flex">
                <LanguageSwitcher language={language} onChange={onLanguageChange} />
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="interactive surface grid h-11 w-11 place-items-center rounded-full transition-colors hover:text-blue-500 overflow-hidden"
                  aria-label="Toggle theme"
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={theme}
                      initial={{ y: -20, opacity: 0, rotate: -90 }}
                      animate={{ y: 0, opacity: 1, rotate: 0 }}
                      exit={{ y: 20, opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.24, ease: "circOut" }}
                      className="absolute"
                    >
                      {theme === 'dark' ? <LuSunMedium size={18} /> : <LuMoonStar size={18} />}
                    </motion.div>
                  </AnimatePresence>
                </button>
            </div>

            {/* Mobile Hamburger (Only visible on mobile) */}
            <button
              type="button"
              className="interactive relative grid h-11 w-11 place-items-center rounded-full border border-black/20 bg-white/75 md:hidden dark:border-white/20 dark:bg-white/8 overflow-hidden"
              onClick={() => setOpen(!open)}
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <div className="flex flex-col gap-1.5 items-center justify-center">
                <motion.span
                  animate={open ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }}
                  className="h-0.5 w-6 rounded-full bg-current"
                />
                <motion.span
                  animate={open ? { opacity: 0, x: -10 } : { opacity: 1, x: 0 }}
                  className="h-0.5 w-6 rounded-full bg-current"
                />
                <motion.span
                  animate={open ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }}
                  className="h-0.5 w-6 rounded-full bg-current"
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar Trigger Zone */}
      <div 
        className="fixed top-0 bottom-0 w-12 z-30 hidden md:block end-0"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />

      {/* Futuristic Edge Indicator */}
      <motion.div
        className="fixed top-1/2 -translate-y-1/2 z-30 hidden md:flex flex-col gap-4 p-2 pointer-events-none end-0"
        initial={false}
        animate={{ 
          opacity: isSidebarHovered ? 0 : 1,
          x: isSidebarHovered ? (isArabic ? -20 : 20) : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <div key={`indicator-${item.key}`} className="flex items-center justify-center h-12 w-2">
               <motion.div 
                 animate={{ 
                   height: isActive ? 32 : 8, 
                   opacity: isActive ? 1 : 0.3,
                 }}
                 className={`w-1 rounded-full transition-colors duration-500 ${isActive ? 'bg-black shadow-[0_0_8px_rgba(0,0,0,0.6)] dark:bg-white dark:shadow-[0_0_8px_rgba(255,255,255,0.6)]' : 'bg-black/30 dark:bg-white/30'}`}
               />
            </div>
          )
        })}
      </motion.div>

      {/* Desktop Vertical Sidebar Navigation (Right Side in LTR, Left Side in RTL) */}
      <motion.nav 
        className="fixed end-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-4 md:flex"
        initial={false}
        animate={{ 
          x: isSidebarHovered ? 0 : (isArabic ? -100 : 100),
          opacity: isSidebarHovered ? 1 : 0,
          filter: isSidebarHovered ? 'blur(0px)' : 'blur(8px)',
          pointerEvents: isSidebarHovered ? 'auto' : 'none'
        }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id
          const isComingSoon = item.key === 'comingSoon'
          
          return (
            <button
              key={item.key}
              type="button"
              className="group flex items-center gap-3 transition-all outline-none"
              onClick={() => onNavigate(item.id)}
            >
              <AnimatePresence>
                {isActive && (
                  <motion.span
                    initial={{ opacity: 0, x: isArabic ? -12 : 12, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, x: isArabic ? -12 : 12, filter: 'blur(4px)' }}
                    className="surface rounded-full px-4 py-2 text-[12px] font-black uppercase tracking-[0.15em] text-black shadow-2xl backdrop-blur-xl dark:text-white border border-black/5 dark:border-white/5"
                  >
                    {t(`nav.${item.key}`)}
                  </motion.span>
                )}
              </AnimatePresence>
              <div className="relative">
                {isComingSoon && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 2.5 }}
                    className="absolute inset-0 rounded-full bg-blue-500 blur-md"
                  />
                )}
                <div className={`interactive grid h-12 w-12 place-items-center rounded-full shadow-xl transition-all duration-500 ${
                  isActive 
                    ? 'bg-black text-white dark:bg-white dark:text-black scale-110 rotate-[360deg]' 
                    : 'surface opacity-40 hover:opacity-100 backdrop-blur-md hover:scale-105'
                } ${isComingSoon ? 'ring-2 ring-blue-500/30' : ''}`}>
                  <Icon size={20} />
                </div>
              </div>
            </button>
          )
        })}
      </motion.nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/55 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.aside
              initial={{ opacity: 0, x: isArabic ? -24 : 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isArabic ? -24 : 24 }}
              transition={{ duration: 0.24 }}
              className={`panel-grid fixed top-3 bottom-3 z-50 flex w-[min(88vw,360px)] flex-col rounded-[2rem] border border-black/15 bg-white/92 p-4 shadow-2xl dark:border-white/15 dark:bg-black/92 ${
                isArabic ? 'left-3' : 'right-3'
              }`}
            >
              <div className="mb-6 flex items-center justify-between">
                {mobileLogo ? <img src={mobileLogo} alt="AshTech" className="h-8 w-auto" /> : <span className="block h-8 w-24" />}
                <button
                  type="button"
                  className="interactive grid h-11 w-11 place-items-center rounded-full border border-black/20 bg-white/75 md:hidden dark:border-white/20 dark:bg-white/8"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                >
                  <div className="relative h-5 w-5">
                    <motion.span className="absolute top-1/2 left-0 h-0.5 w-5 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                    <motion.span className="absolute top-1/2 left-0 h-0.5 w-5 -translate-y-1/2 -rotate-45 rounded-full bg-current" />
                  </div>
                </button>
              </div>

              <div className="mb-5 flex items-start gap-2">
                <div className="flex-1">
                  <LanguageSwitcher language={language} onChange={onLanguageChange} inMobileMenu={true} />
                </div>
                <button
                  type="button"
                  onClick={onToggleTheme}
                  className="interactive grid h-11 w-11 shrink-0 place-items-center rounded-full border border-black/20 bg-white/75 transition-colors hover:text-blue-500 dark:border-white/20 dark:bg-white/8"
                  aria-label="Toggle theme"
                >
                  {theme === 'dark' ? <LuSunMedium size={18} /> : <LuMoonStar size={18} />}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pe-2 -me-2">
                {navItems.map((item, index) => {
                  const Icon = item.icon
                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      initial={{ opacity: 0, x: isArabic ? -14 : 14 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="interactive surface flex w-full items-center justify-between rounded-2xl px-4 py-4 text-left"
                      onClick={() => onNavigate(item.id)}
                    >
                      <span className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded-full border border-black/15 dark:border-white/15">
                          <Icon size={18} />
                        </span>
                        <span className="font-semibold">{t(`nav.${item.key}`)}</span>
                      </span>
                      <LuChevronRight size={18} className={isArabic ? 'rotate-180' : ''} />
                    </motion.button>
                  )
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
