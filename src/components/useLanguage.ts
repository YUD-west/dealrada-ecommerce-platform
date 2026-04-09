"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";
import {
  applyLanguageToDocument,
  getSavedLanguage,
  isLanguage,
  LANG_STORAGE_KEY,
  setLanguagePreference,
} from "@/lib/language";

const DEFAULT_LANG: Language = "en";

export default function useLanguage() {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof document === "undefined") return DEFAULT_LANG;
    const fromHtml = document.documentElement.lang;
    return isLanguage(fromHtml) ? fromHtml : DEFAULT_LANG;
  });

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === LANG_STORAGE_KEY && isLanguage(event.newValue)) {
        setLanguage(event.newValue);
      }
    };

    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<Language>).detail;
      if (isLanguage(detail)) {
        setLanguage(detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dealarada:lang", handleCustom);

    const saved = getSavedLanguage();
    if (saved) {
      // Align cookie/html + trigger our custom event for same-tab updates.
      setLanguagePreference(saved);
    }

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dealarada:lang", handleCustom);
    };
  }, []);

  useEffect(() => {
    applyLanguageToDocument(language);
  }, [language]);

  return language;
}
