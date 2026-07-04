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
      <div className="px-3.5 py-2 rounded-xl bg-[#093f89]/10 animate-pulse w-[60px] h-[36px] border border-[#093f89]/5" />
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      className="group relative px-3.5 py-2 rounded-xl bg-[#093f89] text-white border border-[#fbc70f]/30 hover:border-[#fbc70f] hover:bg-[#fbc70f] hover:text-[#093f89] transition-all duration-300 flex items-center justify-center gap-2 text-xs font-bold uppercase shadow-[0_4px_12px_rgba(9,63,137,0.15)] hover:shadow-[0_0_20px_rgba(251,199,15,0.4)] active:scale-95 overflow-hidden"
      aria-label="Toggle language"
    >
      {/* تأثير إضاءة خلفي ناعم يظهر عند الحوم (Hover Ripple Effect) */}
      <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />

      {/* الأيقونة مع تأثير حركة دوران مرن عند الـ Hover */}
      <Globe className="h-4 w-4 text-[#fbc70f] group-hover:text-[#093f89] group-hover:rotate-[15deg] transition-all duration-300 ease-out" />

      {/* نص اللغة المتبادلة */}
      <span className="tracking-wider group-hover:scale-105 transition-transform duration-300">
        {lang === 'en' ? 'AR' : 'EN'}
      </span>
    </button>
  );
}