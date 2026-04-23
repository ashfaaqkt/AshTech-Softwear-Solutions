import { LuGithub, LuHouse, LuInstagram, LuLinkedin, LuSparkles, LuLayers3, LuArrowUpRight } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import { useProtectedAsset } from '../hooks/useProtectedAsset'

const navItems = [
  { key: 'home', id: 'home', icon: LuHouse },
  { key: 'about', id: 'about', icon: LuSparkles },
  { key: 'services', id: 'services', icon: LuLayers3 },
  { key: 'contact', id: 'contact', icon: LuArrowUpRight },
]

export default function Footer({ theme }) {
  const { t } = useTranslation()
  const footerImage = useProtectedAsset(theme === 'dark' ? 'Title-Footer-Dark.png' : 'Title-Footer-Light.png')
  const signImage = useProtectedAsset('sign.jpg')

  return (
    <footer className="border-t border-black/10 py-6 dark:border-white/10">
      <div className="section-shell">
        <div className="surface overflow-hidden rounded-3xl">
          <div className="grid gap-0 lg:grid-cols-[1fr_0.5fr]">
            {/* Left Brand Area */}
            <div className="p-6">
              <div className="inline-flex rounded-full border border-black/15 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-black/60 dark:border-white/15 dark:text-white/60">
                AshTech
              </div>

              <div className="mt-4 flex flex-col md:flex-row md:items-end gap-6">
                {footerImage ? (
                  <img src={footerImage} alt="AshTech footer" className="w-full max-w-[280px]" />
                ) : (
                  <div className="h-20 w-48 rounded-xl border border-black/10 dark:border-white/10" />
                )}
                
                <p className="max-w-md text-xs leading-relaxed text-black/68 dark:text-white/68 pb-1">
                  {t('footer.desc')}
                </p>
              </div>
            </div>

            {/* Right Navigation Area */}
            <div className="border-t border-black/10 p-6 lg:border-s lg:border-t-0 dark:border-white/10">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">Navigate</h3>
                  <nav className="flex flex-col gap-3">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      return (
                        <button
                          key={item.key}
                          type="button"
                          className="interactive inline-flex items-center gap-2 text-sm font-semibold text-black/75 transition-colors hover:text-black dark:text-white/75 dark:hover:text-white text-left"
                          onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                        >
                          <Icon size={14} className="opacity-70" />
                          <span>{t(`nav.${item.key}`)}</span>
                        </button>
                      )
                    })}
                  </nav>
                </div>
                
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40 mb-4">Socials</h3>
                  <div className="flex gap-2">
                    <a href="#" aria-label="GitHub" className="interactive grid h-9 w-9 place-items-center rounded-full border border-black/15 transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">
                      <LuGithub size={16} />
                    </a>
                    <a href="#" aria-label="LinkedIn" className="interactive grid h-9 w-9 place-items-center rounded-full border border-black/15 transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">
                      <LuLinkedin size={16} />
                    </a>
                    <a href="#" aria-label="Instagram" className="interactive grid h-9 w-9 place-items-center rounded-full border border-black/15 transition-colors hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5">
                      <LuInstagram size={16} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Signature Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-black/10 px-6 py-4 text-xs font-medium text-black/60 dark:border-white/10 dark:text-white/60">
            <div className="flex items-center gap-4">
              {signImage ? (
                <img
                  src={signImage}
                  alt="Signature"
                  className="h-6 w-auto opacity-80"
                  style={{ filter: theme === 'dark' ? 'brightness(0) invert(1)' : 'none' }}
                />
              ) : null}
            </div>
            
            <div className="text-center sm:text-right">
              © 2026 {t('footer.brand')}. {t('footer.rights')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
