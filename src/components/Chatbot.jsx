import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LuBot, LuCornerDownLeft, LuMessageCircleMore, LuSparkles, LuX } from 'react-icons/lu'
import { useTranslation } from 'react-i18next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function Chatbot() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([{ role: 'model', text: t('chatbot.welcome') }])
  const listRef = useRef(null)

  useEffect(() => {
    setMessages([{ role: 'model', text: t('chatbot.welcome') }])
  }, [t])

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isLoading])

  const sendMessage = async (userText) => {
    if (!userText.trim()) return

    setMessages((prev) => [...prev, { role: 'user', text: userText }])
    setInput('')
    setIsLoading(true)

    try {
      const apiMessages = [...messages.slice(1), { role: 'user', text: userText }]
      const response = await fetch('/api/chat', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText, // fallback
          messages: apiMessages 
        }),
      })
      const data = await response.json()
      const reply = response.ok ? data.reply : t('chatbot.restricted')
      setMessages((prev) => [...prev, { role: 'model', text: reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'model', text: t('chatbot.restricted') }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        className="interactive fixed end-5 bottom-5 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-black/20 bg-white/85 shadow-xl backdrop-blur-xl dark:border-white/20 dark:bg-white/8 md:end-6 md:bottom-6"
        aria-label="Open chatbot"
        onClick={() => setIsOpen(true)}
      >
        <LuBot size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 18 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 p-0 md:inset-auto md:end-6 md:bottom-24 md:w-[390px]"
          >
            <div className="panel-grid flex h-full w-full flex-col border border-black/15 bg-white/95 backdrop-blur-2xl dark:border-white/15 dark:bg-black/95 md:h-[560px] md:rounded-[2rem]">
              <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-full border border-black/15 bg-white/80 dark:border-white/15 dark:bg-white/8">
                    <LuSparkles size={18} />
                  </span>
                  <div>
                    <h3 className="font-semibold">{t('chatbot.title')}</h3>
                    <p className="text-xs text-black/55 dark:text-white/55">AshTech assistant</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="interactive grid h-10 w-10 place-items-center rounded-full border border-black/15 bg-white/75 dark:border-white/15 dark:bg-white/8"
                >
                  <LuX size={16} />
                </button>
              </div>

              <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {messages.map((message, idx) => (
                  <div
                    key={`${message.role}-${idx}`}
                    className={`max-w-[88%] rounded-[1.4rem] border px-4 py-3 text-sm leading-6 overflow-hidden ${
                      message.role === 'user'
                        ? 'ms-auto border-black bg-black text-white dark:border-white dark:bg-white dark:text-black'
                        : 'border-black/12 bg-white/72 dark:border-white/12 dark:bg-white/6'
                    }`}
                    dir="auto"
                  >
                    {message.role === 'user' ? (
                      message.text
                    ) : (
                      <div className="custom-markdown overflow-x-auto">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.text}
                        </ReactMarkdown>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="inline-flex items-center gap-2 rounded-full border border-black/12 px-3 py-2 text-xs text-black/60 dark:border-white/12 dark:text-white/60">
                    <LuSparkles size={12} />
                    {t('chatbot.typing')}
                  </div>
                )}
              </div>

              <form
                className="border-t border-black/10 p-3 dark:border-white/10"
                onSubmit={(event) => {
                  event.preventDefault()
                  sendMessage(input)
                }}
              >
                <div className="flex items-center gap-2 rounded-[1.25rem] border border-black/15 bg-white/72 p-2 dark:border-white/15 dark:bg-white/6">
                  <LuMessageCircleMore size={18} className="ms-2 shrink-0 text-black/55 dark:text-white/55" />
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder={t('chatbot.placeholder')}
                    className="h-11 flex-1 bg-transparent text-sm outline-none"
                  />
                  <button
                    type="submit"
                    className="interactive grid h-11 w-11 place-items-center rounded-full border border-black bg-black text-white dark:border-white dark:bg-white dark:text-black"
                    aria-label={t('chatbot.send')}
                  >
                    <LuCornerDownLeft size={16} />
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
