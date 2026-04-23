import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import en from './locales/en.json'
import ar from './locales/ar.json'
import ml from './locales/ml.json'
import hi from './locales/hi.json'
import ta from './locales/ta.json'
import te from './locales/te.json'

i18n.use(LanguageDetector).use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
    ml: { translation: ml },
    hi: { translation: hi },
    ta: { translation: ta },
    te: { translation: te },
  },
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  detection: {
    order: ['localStorage', 'navigator'],
    caches: ['localStorage'],
  },
})

export default i18n
