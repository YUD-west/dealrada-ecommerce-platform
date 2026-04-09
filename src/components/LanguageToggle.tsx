"use client";

import useLanguage from "@/components/useLanguage";
import { setLanguagePreference } from "@/lib/language";

export default function LanguageToggle() {
  const language = useLanguage();

  const toggleLanguage = () => {
    const next = language === "en" ? "am" : "en";
    setLanguagePreference(next);
  };

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      className="fixed bottom-6 right-6 z-50 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-md transition hover:border-emerald-200"
      aria-label="Toggle language"
    >
      {language === "en" ? "አማርኛ" : "English"}
    </button>
  );
}
