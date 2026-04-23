import { useState } from 'react'
import { motion } from 'framer-motion'
import { LuArrowRight } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'

export default function Contact() {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: '',
  })
  const [success, setSuccess] = useState('')

  const setField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const onSubmit = (event) => {
    event.preventDefault()
    const current = JSON.parse(localStorage.getItem('ashtech_contacts') || '[]')
    current.push({ ...form, timestamp: new Date().toISOString() })
    localStorage.setItem('ashtech_contacts', JSON.stringify(current))
    setSuccess(t('contact.success'))
    setForm({ fullName: '', email: '', subject: '', message: '' })
  }

  const InputField = ({ label, type = "text", value, onChange, required }) => (
    <div className="relative w-full group">
      <input
        required={required}
        type={type}
        value={value}
        onChange={onChange}
        className="peer w-full border-b border-black/15 bg-transparent py-4 text-base text-black outline-none transition-colors duration-300 focus:border-black dark:border-white/15 dark:text-white dark:focus:border-white"
        placeholder=" "
      />
      <label className={`absolute start-0 top-1/2 -translate-y-1/2 text-sm text-black/40 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:-translate-y-full peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-black dark:text-white/40 dark:peer-focus:text-white ${value ? 'top-0 -translate-y-full text-[11px] font-bold uppercase tracking-widest text-black dark:text-white' : ''}`}>
        {label}
      </label>
    </div>
  )

  const TextAreaField = ({ label, value, onChange, required }) => (
    <div className="relative w-full group mt-4">
      <textarea
        required={required}
        value={value}
        onChange={onChange}
        rows={3}
        className="peer w-full resize-none border-b border-black/15 bg-transparent py-4 text-base text-black outline-none transition-colors duration-300 focus:border-black dark:border-white/15 dark:text-white dark:focus:border-white"
        placeholder=" "
      />
      <label className={`absolute start-0 top-6 -translate-y-1/2 text-sm text-black/40 transition-all duration-300 pointer-events-none peer-focus:top-0 peer-focus:-translate-y-full peer-focus:text-[11px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-widest peer-focus:text-black dark:text-white/40 dark:peer-focus:text-white ${value ? 'top-0 -translate-y-full text-[11px] font-bold uppercase tracking-widest text-black dark:text-white' : ''}`}>
        {label}
      </label>
    </div>
  )

  return (
    <section id="contact" className="relative border-t border-black/10 py-24 dark:border-white/10" dir={isRtl ? 'rtl' : 'ltr'}>
      <div className="section-shell">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white dark:border-white/10 dark:bg-black"
        >
          {/* Subtle background pattern */}
          <div className="panel-grid absolute inset-0 opacity-10 pointer-events-none" />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            {/* Form Side */}
            <div className="p-8 md:p-14">
              <div className="inline-flex rounded-full border border-black/15 bg-black/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.24em] text-black dark:border-white/15 dark:bg-white/5 dark:text-white">
                Contact
              </div>
              <h2 className="mt-8 text-4xl font-bold tracking-tight text-black md:text-6xl dark:text-white">
                {t('contact.title')}
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-relaxed text-black/60 dark:text-white/60">
                {t('contact.subtitle')}
              </p>

              <form onSubmit={onSubmit} className="mt-12 space-y-8">
                <div className="grid gap-8 sm:grid-cols-2">
                  <InputField label={t('contact.fullName')} value={form.fullName} onChange={(e) => setField('fullName', e.target.value)} required />
                  <InputField label={t('contact.email')} type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} required />
                </div>
                <InputField label={t('contact.subject')} value={form.subject} onChange={(e) => setField('subject', e.target.value)} required />
                <TextAreaField label={t('contact.message')} value={form.message} onChange={(e) => setField('message', e.target.value)} required />
                
                <div className="pt-8">
                  <button
                    type="submit"
                    className="group interactive flex h-14 w-full items-center justify-between rounded-full bg-black px-8 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
                  >
                    <span>{t('contact.submit')}</span>
                    <span className={`grid h-8 w-8 place-items-center rounded-full bg-white text-black transition-transform group-hover:rotate-45 dark:bg-black dark:text-white ${isRtl ? 'group-hover:-rotate-45' : ''}`}>
                      <LuArrowRight size={16} className={isRtl ? 'rotate-180' : ''} />
                    </span>
                  </button>
                  {success && (
                    <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-center text-xs font-bold text-black/50 dark:text-white/50">
                      {success}
                    </motion.p>
                  )}
                </div>
              </form>
            </div>

            {/* Info Side */}
            <div className="flex flex-col justify-between border-t border-black/10 bg-black/5 p-8 dark:border-white/10 dark:bg-white/5 md:p-14 lg:border-s lg:border-t-0">
              <div className="space-y-12">
                <motion.div initial={{ opacity: 0, x: isRtl ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Direct Line</p>
                  <a href="mailto:ashfaaqktmail@gmail.com" className="mt-3 block text-xl font-medium tracking-tight text-black transition-colors hover:text-black/60 dark:text-white dark:hover:text-white/60">
                    ashfaaqktmail@gmail.com
                  </a>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: isRtl ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} viewport={{ once: true }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Base</p>
                  <p className="mt-3 block text-xl font-medium tracking-tight text-black dark:text-white">
                    {t('contact.location')}
                  </p>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: isRtl ? -20 : 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} viewport={{ once: true }}>
                  <p className="text-xs font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Digital Space</p>
                  <a href="https://ashfaaqkt.com" target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-xl font-medium tracking-tight text-black transition-colors hover:text-black/60 dark:text-white dark:hover:text-white/60">
                    ashfaaqkt.com <LuArrowRight size={18} className={`opacity-50 ${isRtl ? 'rotate-135' : '-rotate-45'}`} />
                  </a>
                </motion.div>
              </div>

              <div className="mt-20 lg:mt-0">
                <div className="flex items-center gap-4 border-t border-black/10 pt-8 dark:border-white/10">
                  <div className="h-2.5 w-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                  <span className="text-xs font-bold uppercase tracking-widest text-black/60 dark:text-white/60">
                    Available for new projects
                  </span>
                </div>
              </div>
            </div>
          </div>
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
