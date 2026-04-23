import { useState, useRef } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { LuBellRing, LuBriefcaseBusiness, LuChartNoAxesColumnIncreasing, LuMessageCircleHeart, LuWorkflow, LuX, LuUserCheck, LuCircleCheck, LuEye, LuCreditCard, LuCode, LuArrowRight, LuArrowDown } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'

export default function ComingSoon() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [success, setSuccess] = useState('')
  
  const containerRef = useRef(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 30, stiffness: 200 }
  const glowX = useSpring(mouseX, springConfig)
  const glowY = useSpring(mouseY, springConfig)

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  const features = [
    { key: 'item1', icon: LuBriefcaseBusiness },
    { key: 'item2', icon: LuWorkflow },
    { key: 'item3', icon: LuChartNoAxesColumnIncreasing },
    { key: 'item4', icon: LuMessageCircleHeart },
  ]

  const onSubmit = (event) => {
    event.preventDefault()
    const current = JSON.parse(localStorage.getItem('ashtech_notify_list') || '[]')
    current.push({ email, timestamp: new Date().toISOString() })
    localStorage.setItem('ashtech_notify_list', JSON.stringify(current))
    setEmail('')
    setSuccess(t('comingSoon.success'))
  }

  return (
    <section id="coming-soon" className="relative py-20" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="section-shell">
        <motion.div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="group relative overflow-hidden rounded-[2rem] border border-black/10 bg-white dark:bg-black p-8 text-black dark:text-white md:p-14"
        >
          {/* Subtle Grid Pattern Overlay */}
          <div className="panel-grid absolute inset-0 opacity-20 pointer-events-none" />
          
          {/* Subtle Cursor Glow */}
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{
              background: `radial-gradient(400px circle at ${glowX}px ${glowY}px, rgba(255,255,255,0.08), transparent 60%)`,
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 dark:border-black/20 bg-white/5 dark:bg-black/5 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-black dark:text-white">
              <span className="flex h-2 w-2 rounded-full bg-white dark:bg-black shadow-[0_0_8px_white]" />
              {t('comingSoon.status')}
            </div>
            
            <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div className="flex flex-col justify-center">
                <h2 className="text-3xl font-bold leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
                  {t('comingSoon.title')}
                </h2>
                <p className="mt-6 max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60 md:text-base">
                  {t('comingSoon.intro')}
                </p>
                <div className="mt-10 flex flex-wrap items-center gap-6">
                  <button
                    type="button"
                    className="interactive flex h-12 items-center gap-2 rounded-xl bg-black dark:bg-white px-6 text-sm font-bold uppercase tracking-tight text-white dark:text-black transition-all hover:scale-105 active:scale-95"
                    onClick={() => {
                      setOpen(true)
                      setSuccess('')
                    }}
                  >
                    <LuBellRing size={16} />
                    {t('comingSoon.cta')}
                  </button>
                  <p className="text-xs font-semibold uppercase tracking-widest text-black/30 dark:text-white/30 italic">
                    {t('comingSoon.tagline')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {features.map((feature, index) => {
                  const Icon = feature.icon
                  return (
                    <motion.div
                      key={feature.key}
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-center gap-4 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 p-4 backdrop-blur-sm transition-colors hover:border-black/20 dark:hover:border-white/20 hover:bg-black/10 dark:hover:bg-white/10"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-black/10 dark:border-white/10 bg-white/50 dark:bg-black/50">
                        <Icon size={18} />
                      </div>
                      <p className="text-xs font-medium leading-tight text-black/80 dark:text-white/80">
                        {t(`comingSoon.${feature.key}`)}
                      </p>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Process Map Section */}
        <div className="mt-16 sm:mt-24">
          <div className="mb-10 text-center">
            <h3 className="text-2xl font-bold md:text-3xl text-black dark:text-white">
              {t('comingSoon.processTitle')}
            </h3>
            <div className="mx-auto mt-4 h-1 w-12 rounded-full bg-black/10 dark:bg-white/10" />
          </div>

          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((step, idx) => {
              const icons = [LuUserCheck, LuCircleCheck, LuEye, LuCreditCard, LuCode]
              const Icon = icons[idx]
              return (
                <motion.div
                  key={`step-${step}`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 300 }}
                  style={{ zIndex: 10 - idx }}
                  className="surface relative flex flex-col items-center rounded-2xl p-6 text-center shadow-lg transition-shadow hover:shadow-2xl"
                >
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-black/10 bg-black/5 text-black dark:border-white/10 dark:bg-white/5 dark:text-white transition-transform hover:scale-110">
                    <Icon size={20} />
                  </div>
                  <h4 className="mb-3 text-sm font-bold text-black dark:text-white">
                    {t(`comingSoon.process.step${step}.title`)}
                  </h4>
                  <p className="text-xs leading-relaxed text-black/60 dark:text-white/60">
                    {t(`comingSoon.process.step${step}.desc`)}
                  </p>

                  {idx < 4 && (
                    <motion.div
                      animate={{ x: isRtl ? [-3, 3, -3] : [3, -3, 3], y: [0,0,0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                      className="absolute -bottom-7 start-1/2 z-50 -translate-x-1/2 text-black/30 dark:text-white/30 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:start-auto md:-end-6 md:translate-x-1/2 rtl:md:-translate-x-1/2 pointer-events-none"
                    >
                      <LuArrowRight className={`hidden md:block ${isRtl ? 'rotate-180' : ''}`} size={24} />
                      <LuArrowDown className="md:hidden" size={22} />
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/20 dark:bg-black/60 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.97 }}
              className="relative w-full max-w-sm rounded-3xl border border-black/10 dark:border-white/10 bg-white dark:bg-black p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-black dark:text-white">{t('comingSoon.modalTitle')}</h3>
                <button
                  type="button"
                  className="grid h-10 w-10 place-items-center rounded-full bg-black/5 dark:bg-white/5 text-black dark:text-white transition-colors hover:bg-black/10 dark:hover:bg-white/10"
                  onClick={() => setOpen(false)}
                >
                  <LuX size={16} />
                </button>
              </div>
              <form className="space-y-3" onSubmit={onSubmit}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t('comingSoon.email')}
                  className="h-12 w-full rounded-xl border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 px-4 text-sm outline-none transition-all focus:border-black/30 dark:focus:border-white/30 focus:bg-black/10 dark:focus:bg-white/10 text-black dark:text-white"
                />
                <button
                  type="submit"
                  className="h-12 w-full rounded-xl bg-black dark:bg-white text-sm font-bold uppercase tracking-widest text-white dark:text-black transition-all hover:opacity-90 active:scale-[0.98]"
                >
                  {t('comingSoon.submit')}
                </button>
                {success && (
                  <p className="mt-2 text-center text-xs font-bold text-black/50 dark:text-white/50">
                    {success}
                  </p>
                )}
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {t('common.disclaimer') && (
        <p className="section-shell mt-12 text-center text-[10px] tracking-wider text-black/20 dark:text-white/20">
          {t('common.disclaimer')}
        </p>
      )}
    </section>
  )
}


