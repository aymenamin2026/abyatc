"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { lang } = useLanguage();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === "en" ? "ar" : "en";
    
    // Set cookie that the server will read on next request
    document.cookie = `NEXT_LOCALE=${newLang}; path=/; max-age=31536000`;
    
    // Force a hard refresh to re-evaluate server components and layout injection
    router.refresh();
  };

  if (!mounted) {
    return (
      <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse w-[54px] h-[30px]" />
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5 text-xs font-bold uppercase shadow-sm active:scale-95"
      aria-label="Toggle language"
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{lang === 'en' ? 'AR' : 'EN'}</span>
    </button>
  );
}
