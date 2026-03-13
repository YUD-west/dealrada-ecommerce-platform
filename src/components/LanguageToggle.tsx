"use client";

import { useEffect, useState } from "react";

type Language = "en" | "am";

export default function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    const saved = window.localStorage.getItem("dealarada-lang") as Language | null;
    if (saved === "en" || saved === "am") {
      setLanguage(saved);
      document.documentElement.lang = saved;
      document.documentElement.dataset.lang = saved;
    }
  }, []);

  const toggleLanguage = () => {
    const next = language === "en" ? "am" : "en";
    setLanguage(next);
    window.localStorage.setItem("dealarada-lang", next);
    document.documentElement.lang = next;
    document.documentElement.dataset.lang = next;
    window.dispatchEvent(new CustomEvent("dealarada:lang", { detail: next }));
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
