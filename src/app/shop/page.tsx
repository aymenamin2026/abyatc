import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { fetchCategories, fetchProducts, fetchSettings, fetchAttributes } from "@/lib/api";
import ShopClient from "./ShopClient";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { t } from "@/lib/translations";

export default async function Shop() {
  const categories = await fetchCategories();
  const products = await fetchProducts();
  const settings = await fetchSettings();
  const attributes = await fetchAttributes();
  
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE");
  const lang = (localeCookie?.value === "ar" ? "ar" : "en") as "en" | "ar";
  
  
  const currencySymbol = settings?.currency_symbol || "$";

  return (
    <div className="flex flex-col min-h-screen pt-4 pb-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="py-8 border-b border-border mb-8">
          <h1 className="font-serif text-4xl font-bold text-foreground mb-4">{t('shop_title', lang)}</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t('shop_subtitle', lang)}
          </p>
        </div>

        <Suspense fallback={<div className="py-20 text-center text-muted-foreground">{t('loading_products', lang)}</div>}>
          <ShopClient categories={categories} settings={settings} products={products} attributes={attributes} currencySymbol={currencySymbol} />
        </Suspense>
      </div>
    </div>
  );
}
