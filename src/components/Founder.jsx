import { motion } from 'framer-motion'
import { LuArrowUpRight, LuCodeXml, LuScanFace } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import { useProtectedAsset } from '../hooks/useProtectedAsset'

export default function Founder() {
  const { t } = useTranslation()
  const founderImage = useProtectedAsset('Founder-Pic.png')

  return (
    <section id="founder" className="border-t border-black/10 py-20 dark:border-white/10">
      <div className="section-shell grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="group panel-grid surface relative flex aspect-[0.95] items-stretch justify-center overflow-hidden rounded-[2rem] p-0 text-center"
        >
          {founderImage ? (
            <img
              src={founderImage}
              alt="Ashfaaq KT"
              className="h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="h-full w-full" />
          )}
          <div className="absolute bottom-5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-2 rounded-full border border-black/15 bg-white/75 px-4 py-2 text-sm text-black/75 backdrop-blur dark:border-white/15 dark:bg-black/55 dark:text-white/80">
            <LuCodeXml size={16} />
            Ashfaaq KT
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
        >
          <div className="inline-flex rounded-full border border-black/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-black/65 dark:border-white/15 dark:text-white/65">
            Founder
          </div>
          <h2 className="mt-6 text-3xl font-bold md:text-5xl lg:text-6xl">{t('founder.title')}</h2>
          <p className="mt-8 text-lg leading-relaxed text-black/70 dark:text-white/70">
            {t('founder.p1')}
          </p>
          
          <div className="mt-10 border-s-2 border-black/20 ps-6 py-1 dark:border-white/20">
            <p className="text-xl italic font-medium leading-relaxed text-black dark:text-white">
              "{t('founder.quote')}"
            </p>
            <p className="mt-4 text-xs font-black tracking-[0.2em] uppercase text-black/40 dark:text-white/40">
              — {t('founder.quoteAuthor')}
            </p>
          </div>

          <a
            href="https://ashfaaqkt.com"
            target="_blank"
            rel="noreferrer"
            className="interactive mt-10 inline-flex items-center gap-3 rounded-full bg-black px-7 py-4 text-sm font-bold text-white shadow-xl dark:bg-white dark:text-black"
          >
            {t('founder.link')}
            <LuArrowUpRight size={18} />
          </a>
        </motion.div>
      </div>
      {t('common.disclaimer') && (
        <p className="section-shell mt-12 text-center text-[10px] tracking-wider text-black/20 dark:text-white/20">
          {t('common.disclaimer')}
        </p>
      )}
    </section>
  )
}
