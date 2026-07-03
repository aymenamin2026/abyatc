import { Suspense } from "react";
import { cookies } from "next/headers";

import ShopClient from "./ShopClient";
import { fetchCategories, fetchProducts, fetchSettings, fetchAttributes } from "@/lib/api";
import { t } from "@/lib/translations";

// مكون الهيكل العظمي الفاخر لاستخدامه كـ Fallback أثناء التحميل
function SkeletonGridFallback() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-6 sm:gap-x-8 w-full">
      {[1, 2, 3, 4, 5, 6].map((idx) => (
        <div key={idx} className="p-4 rounded-[28px] border border-border/40 bg-card/40 space-y-5 w-full relative overflow-hidden shadow-sm">
          {/* تأثير اللمعان المتحرك */}
          <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 dark:via-white/5 to-transparent skew-x-12 z-10"></div>

          <div className="bg-muted/50 rounded-[22px] aspect-[4/5] w-full animate-pulse" />
          <div className="space-y-4 px-2">
            <div className="h-4 bg-muted/50 rounded-md w-3/4 animate-pulse" />
            <div className="h-5 bg-muted/50 rounded-md w-1/3 animate-pulse" />
            <div className="h-12 bg-muted/50 rounded-xl w-full animate-pulse mt-4" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default async function Shop() {
  // الجلب المتوازي للبيانات لتحسين وقت الاستجابة
  const [categories, products, settings, attributes, cookieStore] = await Promise.all([
    fetchCategories(),
    fetchProducts(),
    fetchSettings(),
    fetchAttributes(),
    cookies()
  ]);

  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const lang = (localeCookie?.value === "en" ? "en" : "ar") as "en" | "ar";
  const currencySymbol = settings?.currency_symbol || "$";

  return (
    <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden md:cursor-default">

      {/* BACKGROUND LAYERS: دمج ألوان العلامة التجارية الفخمة */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {/* إضاءة زرقاء ملكية علوية */}
        <div className="absolute top-[-10%] end-[-10%] w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-[#093f89]/10 dark:bg-[#093f89]/15 blur-[140px] rounded-full animate-[pulse_8s_ease-in-out_infinite_alternate]" />
        {/* إضاءة ذهبية سفلية */}
        <div className="absolute top-[40%] start-[-20%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[#fbc70f]/10 dark:bg-[#fbc70f]/5 blur-[160px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate_reverse]" />
        {/* طبقة Noise للمسة سينمائية */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] bg-[url('/noise.png')] mix-blend-overlay" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-20 md:pb-32">

        {/* PAGE HEADER */}
        <header className="relative py-12 md:py-16 border-b border-border/40 mb-10 md:mb-16">
          <div className="max-w-3xl space-y-5">
            <span className="text-[#fbc70f] font-bold tracking-[0.2em] uppercase text-xs sm:text-sm drop-shadow-sm">
              {lang === 'ar' ? 'اكتشف مجموعتنا' : 'Discover Our Collection'}
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-tight">
              {t('shop_title', lang)}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl tracking-wide">
              {t('shop_subtitle', lang)}
            </p>
          </div>
        </header>

        {/* PRODUCTS SECTION WITH PREMIUM SUSPENSE */}
        <main className="w-full">
          <Suspense fallback={<SkeletonGridFallback />}>
            <ShopClient
              categories={categories}
              settings={settings}
              products={products}
              attributes={attributes}
              currencySymbol={currencySymbol}
            />
          </Suspense>
        </main>

      </div>
    </div>
  );
}