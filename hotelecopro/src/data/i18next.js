import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files import කරගන්න
import enTranslation from './locales/en.json';
import zhTranslation from './locales/zh.json';
import hiTranslation from './locales/hi.json';
import jaTranslation from './locales/ja.json';
import ruTranslation from './locales/ru.json';
import deTranslation from './locales/de.json';
import frTranslation from './locales/fr.json';
import siTranslation from './locales/si.json';

export const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "hi", label: "हिन्दी", flag: "🇮🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ru", label: "Русский", flag: "🇷🇺" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "si", label: "සිංහල", flag: "🇱🇰" },
];

export const T = {
  en: enTranslation,
  zh: zhTranslation,
  hi: hiTranslation,
  ja: jaTranslation,
  ru: ruTranslation,
  de: deTranslation,
  fr: frTranslation,
  si: siTranslation
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslation },
      zh: { translation: zhTranslation },
      hi: { translation: hiTranslation },
      ja: { translation: jaTranslation },
      ru: { translation: ruTranslation },
      de: { translation: deTranslation },
      fr: { translation: frTranslation },
      si: { translation: siTranslation }
    },
    fallbackLng: 'en', // මොකක් හරි අවුලක් වුනොත් default පෙන්නන භාෂාව
    interpolation: { escapeValue: false }
  });

export default i18n;