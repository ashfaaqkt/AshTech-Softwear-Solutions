import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LuChevronDown, LuGlobe } from 'react-icons/lu'

const languages = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'ar', label: 'العربية', short: 'AR' },
  { code: 'ml', label: 'മലയാളം', short: 'ML' },
  { code: 'hi', label: 'हिन्दी', short: 'HI' },
  { code: 'ta', label: 'தமிழ்', short: 'TA' },
  { code: 'te', label: 'తెలుగు', short: 'TE' }
]

export default function LanguageSwitcher({ language, onChange, inMobileMenu = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  const activeLang = languages.find((l) => l.code === language) || languages[0]

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative z-50 ${inMobileMenu ? 'w-full' : ''}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`interactive flex h-11 items-center rounded-full border border-black/20 bg-white/75 px-4 text-sm font-semibold tracking-wide backdrop-blur-md dark:border-white/20 dark:bg-white/10 ${
          inMobileMenu ? 'w-full justify-between' : 'gap-2'
        }`}
        aria-label="Select language"
      >
        <div className="flex items-center gap-2">
          <LuGlobe size={16} className="opacity-70 dark:opacity-100 dark:text-white" />
          <span className="min-w-[20px] text-left dark:text-white">{inMobileMenu ? activeLang.label : activeLang.short}</span>
        </div>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} className="opacity-50 dark:opacity-100 dark:text-white">
          <LuChevronDown size={14} />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={inMobileMenu ? { height: 0, opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            animate={inMobileMenu ? { height: 'auto', opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={inMobileMenu ? { height: 0, opacity: 0 } : { opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={
              inMobileMenu
                ? "mt-2 w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
                : "absolute right-0 top-[calc(100%+0.5rem)] w-40 overflow-hidden rounded-2xl border border-black/10 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#111] rtl:left-0 rtl:right-auto"
            }
          >
            <div className={inMobileMenu ? "p-1.5" : ""}>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    onChange(lang.code)
                    setIsOpen(false)
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                    language === lang.code
                      ? 'bg-black text-white font-bold dark:bg-white dark:text-black'
                      : 'text-black/70 hover:bg-black/5 hover:text-black dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white'
                  }`}
                >
                  <span>{lang.label}</span>
                  <span className={`text-[10px] tracking-wider opacity-60 uppercase ${language === lang.code ? 'opacity-100' : ''}`}>
                    {lang.short}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
