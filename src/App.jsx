import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import About from './components/About'
import Chatbot from './components/Chatbot'
import ComingSoon from './components/ComingSoon'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Founder from './components/Founder'
import Hero from './components/Hero'
import Navbar from './components/Navbar'
import Services from './components/Services'
import { useDirection } from './hooks/useDirection'
import { useProtectedAsset } from './hooks/useProtectedAsset'
import { useTheme } from './hooks/useTheme'

import Starfield from './components/Starfield'

function App() {
  const { i18n, t } = useTranslation()
  const { theme, toggleTheme } = useTheme()
  const faviconUrl = useProtectedAsset(theme === 'light' ? 'Logo-NB-Light-D.png' : 'Logo-NB-Dark-D.png')
  useDirection(i18n.language)

  useEffect(() => {
    fetch('/api/session', { credentials: 'include' }).catch(() => {})
  }, [])

  useEffect(() => {
    document.title = t('seo.title')
    const description = document.querySelector('meta[name="description"]')
    if (description) description.setAttribute('content', t('seo.description'))
  }, [i18n.language, t])

  useEffect(() => {
    if (!faviconUrl) return
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link')
    favicon.rel = 'icon'
    favicon.type = 'image/png'
    favicon.href = faviconUrl
    if (!favicon.parentNode) document.head.appendChild(favicon)
  }, [faviconUrl])

  return (
    <div className="relative overflow-x-hidden bg-white text-black transition-colors dark:bg-black dark:text-white">
      <Starfield />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_25%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.03),transparent_25%)]" />
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        language={i18n.language}
        onLanguageChange={(lang) => i18n.changeLanguage(lang)}
      />
      <main className="relative z-10">
        <Hero theme={theme} />
        <About />
        <Services />
        <Founder />
        <ComingSoon />
        <Contact />
      </main>
      <Footer theme={theme} />
      <Chatbot />
    </div>
  )
}

export default App
