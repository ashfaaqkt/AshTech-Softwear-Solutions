import { motion } from 'framer-motion'
import { LuFingerprint, LuOrbit, LuShieldCheck } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'

export default function About() {
  const { t } = useTranslation()
  const stats = [
    { value: t('about.stats1Value'), label: t('about.stats1Label'), icon: LuFingerprint },
    { value: t('about.stats2Value'), label: t('about.stats2Label'), icon: LuOrbit },
    { value: t('about.stats3Value'), label: t('about.stats3Label'), icon: LuShieldCheck },
  ]

  return (
    <section id="about" className="border-t border-black/10 py-20 dark:border-white/10">
      <div className="section-shell">
        <div className="inline-flex rounded-full border border-black/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/65 dark:border-white/15 dark:text-white/65">
          About AshTech
        </div>
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl text-3xl font-bold md:text-5xl"
            >
              {t('about.title')}
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 }}
              className="mt-6 max-w-4xl space-y-4 text-base leading-8 text-black/78 dark:text-white/78"
            >
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <blockquote className="my-8 border-s-4 border-black/80 ps-6 py-2 text-xl font-bold tracking-tight text-black dark:border-white/80 dark:text-white">
                {t('about.p3')}
              </blockquote>
              <p>{t('about.p4')}</p>
            </motion.div>
          </div>

          <div className="grid gap-4">
            {stats.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.08 * index }}
                  className="surface interactive rounded-[1.6rem] p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <div className="text-4xl font-bold">{item.value}</div>
                      <div className="mt-2 text-sm text-black/60 dark:text-white/60">{item.label}</div>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-full border border-black/15 dark:border-white/15">
                      <Icon size={20} />
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
      {t('common.disclaimer') && (
        <p className="section-shell mt-12 text-center text-[10px] tracking-wider text-black/20 dark:text-white/20">
          {t('common.disclaimer')}
        </p>
      )}
    </section>
  )
}
