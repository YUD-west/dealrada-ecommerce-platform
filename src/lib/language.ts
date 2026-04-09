import type { Language } from "@/lib/i18n";

export const LANG_STORAGE_KEY = "dealarada-lang";
const LANG_COOKIE_KEY = "dealarada-lang";

export function isLanguage(value: unknown): value is Language {
  return value === "en" || value === "am";
}

export function getSavedLanguage(): Language | null {
  if (typeof window === "undefined") return null;
  const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
  return isLanguage(saved) ? saved : null;
}

function setLanguageCookie(lang: Language) {
  if (typeof document === "undefined") return;
  // Keep cookie + localStorage aligned so SSR can render correct initial lang.
  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${LANG_COOKIE_KEY}=${lang}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

export function applyLanguageToDocument(lang: Language) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dataset.lang = lang;
}

export function setLanguagePreference(lang: Language) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  setLanguageCookie(lang);
  applyLanguageToDocument(lang);
  window.dispatchEvent(new CustomEvent<Language>("dealarada:lang", { detail: lang }));
}

