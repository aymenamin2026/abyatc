import { Suspense } from "react";
import { cookies } from "next/headers";

import ShopClient from "./ShopClient";
import { fetchCategories, fetchProducts, fetchSettings, fetchAttributes } from "@/lib/api";
import { t } from "@/lib/translations";

export default async function Shop() {
  // 1. الجلب المتوازي للبيانات (Parallel Data Fetching): تقليل وقت تحميل الصفحة لأقصى حد
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
    <div className="relative flex flex-col min-h-screen bg-background text-foreground transition-colors duration-500 overflow-hidden">

      {/* 2. BACKGROUND LAYERS: دعم اتجاه الصفحة (RTL/LTR) والتوافق المطلق مع الوضع الداكن */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] end-[-10%] w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-primary/10 dark:bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute top-[30%] start-[-20%] w-[700px] md:w-[900px] h-[700px] md:h-[900px] bg-cyan-500/15 dark:bg-cyan-500/5 blur-[180px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.01] bg-[url('/noise.png')]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-20 md:pb-32">

        {/* PAGE HEADER */}
        <header className="relative py-12 md:py-16 border-b border-border/60 mb-10 md:mb-16">
          <div className="max-w-3xl space-y-4">
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-foreground leading-tight drop-shadow-sm">
              {t('shop_title', lang)}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl font-light leading-relaxed max-w-2xl tracking-wide opacity-90">
              {t('shop_subtitle', lang)}
            </p>
          </div>
        </header>

        {/* PRODUCTS SECTION WITH SUSPENSE */}
        <main className="w-full">
          <Suspense
            fallback={
              <div className="py-32 flex flex-col items-center justify-center space-y-4 text-muted-foreground">
                <div className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-sm md:text-base tracking-widest font-light animate-pulse">
                  {t('loading_products', lang)}
                </p>
              </div>
            }
          >
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