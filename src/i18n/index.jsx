import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import enCore from './en.js';
import swCore from './sw.js';
import enPages from './en.pages.js';
import swPages from './sw.pages.js';
import enPanels from './en.panels.js';
import swPanels from './sw.panels.js';
import enAdmin from './en.admin.js';
import swAdmin from './sw.admin.js';
import enExtra from './en.extra.js';
import swExtra from './sw.extra.js';
import enRuntime from './en.runtime.js';
import swRuntime from './sw.runtime.js';
import enGaps from './en.gaps.js';
import swGaps from './sw.gaps.js';
import enUi from './en.ui.js';
import swUi from './sw.ui.js';

// Dictionaries are split by area (core, public pages, user area and admin) and deep-merged here.
// Each English file has a Kiswahili twin with identical keys (checked by scripts/check-i18n.mjs).
function merge(...parts) {
  const out = {};
  for (const part of parts) {
    for (const [key, value] of Object.entries(part)) {
      const isObj = value && typeof value === 'object' && !Array.isArray(value);
      out[key] = isObj && out[key] && typeof out[key] === 'object' ? merge(out[key], value) : value;
    }
  }
  return out;
}
const dictionaries = {
  en: merge(enCore, enPages, enPanels, enAdmin, enExtra, enRuntime, enGaps, enUi),
  sw: merge(swCore, swPages, swPanels, swAdmin, swExtra, swRuntime, swGaps, swUi),
};
export const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'sw', label: 'Kiswahili' },
];

const STORAGE_KEY = 'agritech.lang'; // language preference only; not sensitive

function readInitialLang() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && dictionaries[saved]) return saved;
  } catch {
    /* storage unavailable: fall back to English */
  }
  return 'en';
}

function lookup(dict, key) {
  return key.split('.').reduce((node, part) => (node == null ? undefined : node[part]), dict);
}

function interpolate(value, vars) {
  if (typeof value !== 'string' || !vars) return value;
  return value.replace(/\{(\w+)\}/g, (_, name) => (vars[name] ?? `{${name}}`));
}

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(readInitialLang);

  const setLang = useCallback((next) => {
    if (!dictionaries[next]) return;
    setLangState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(() => {
    // t('nav.home') or t('learning.duration', { n: 4 }). Falls back to English, then the key.
    const t = (key, vars) => {
      const found = lookup(dictionaries[lang], key);
      const fallback = found === undefined ? lookup(dictionaries.en, key) : found;
      if (fallback === undefined && import.meta.env?.DEV) console.warn(`[i18n] missing key: ${key}`);
      return fallback === undefined ? key : interpolate(fallback, vars);
    };
    // loc({ en: '...', sw: '...' }) for content records that carry their own translations.
    const loc = (field) => {
      if (field == null || typeof field !== 'object' || Array.isArray(field)) return field;
      return field[lang] ?? field.en ?? '';
    };
    return { lang, setLang, t, loc };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside <I18nProvider>');
  return ctx;
}
