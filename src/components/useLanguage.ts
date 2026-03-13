"use client";

import { useEffect, useState } from "react";
import type { Language } from "@/lib/i18n";

const DEFAULT_LANG: Language = "en";

export default function useLanguage() {
  const [language, setLanguage] = useState<Language>(DEFAULT_LANG);

  useEffect(() => {
    const saved = window.localStorage.getItem("dealarada-lang") as Language | null;
    if (saved === "en" || saved === "am") {
      setLanguage(saved);
    }

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "dealarada-lang" && (event.newValue === "en" || event.newValue === "am")) {
        setLanguage(event.newValue);
      }
    };

    const handleCustom = (event: Event) => {
      const detail = (event as CustomEvent<Language>).detail;
      if (detail === "en" || detail === "am") {
        setLanguage(detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("dealarada:lang", handleCustom);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("dealarada:lang", handleCustom);
    };
  }, []);

  return language;
}
