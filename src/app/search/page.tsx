import { fetchCategories, fetchProducts, fetchSettings, fetchAttributes } from "@/lib/api";
import SearchClient from "@/app/search/SearchClient";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { t } from "@/lib/translations";

export default async function SearchPage() {
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
        <Suspense fallback={<div className="py-20 text-center text-muted-foreground">{t('loading_products', lang)}</div>}>
          <SearchClient 
            categories={categories} 
            products={products} 
            attributes={attributes} 
            currencySymbol={currencySymbol} 
          />
        </Suspense>
      </div>
    </div>
  );
}
