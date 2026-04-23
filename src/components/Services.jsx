import { motion } from 'framer-motion'
import { LuArrowUpRight } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import { services } from '../data/services'

export default function Services() {
  const { t } = useTranslation()

  return (
    <section id="services" className="border-t border-black/10 py-20 dark:border-white/10">
      <div className="section-shell">
        <div className="inline-flex rounded-full border border-black/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/65 dark:border-white/15 dark:text-white/65">
          Capabilities
        </div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-6 text-3xl font-bold md:text-5xl"
        >
          {t('services.title')}
        </motion.h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {services.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.article
                key={item.key}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="surface interactive rounded-[1.8rem] p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full border border-black/15 dark:border-white/15">
                    <Icon size={20} />
                  </span>
                  <LuArrowUpRight size={18} className="text-black/40 dark:text-white/40" />
                </div>
                <h3 className="mt-8 text-xl font-semibold">{t(`services.${item.key}.title`)}</h3>
                <p className="mt-3 text-sm leading-7 text-black/72 dark:text-white/72">{t(item.descriptionKey)}</p>
              </motion.article>
            )
          })}
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
