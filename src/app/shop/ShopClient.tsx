"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, Check, Eye, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl } from "@/lib/api";

// Fallback visual class mapping for common color names from the database
const colorClassMap: Record<string, string> = {
  "navy blue": "bg-blue-900",
  black: "bg-black",
  white: "bg-white border border-border/80",
  burgundy: "bg-rose-900",
  charcoal: "bg-gray-700",
  "sky blue": "bg-sky-400",
  "light gray": "bg-gray-300",
  "dark gray": "bg-gray-500",
  "powder pink": "bg-pink-200",
  pink: "bg-pink-400",
  "pistachio green": "bg-green-200",
  "classic blue": "bg-blue-600",
  "off white": "bg-stone-100 border border-border/80",
  purple: "bg-purple-600",
  beige: "bg-yellow-100",
  "camel beige": "bg-yellow-600",
  turquoise: "bg-teal-400",
  "cream yellow": "bg-yellow-50",
  nude: "bg-orange-100",
  "light mauve": "bg-fuchsia-200",
};

import { t } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageContext";
import { useCart } from "@/components/CartContext";
import ProductQuickView from "@/components/ProductQuickView";
import ProductCard from "@/components/ProductCard";

export default function ShopClient({
  categories = [],
  products = [],
  attributes = [],
  currencySymbol = "$",
  settings, 
}: {
  categories: any[];
  products: any[];
  attributes?: any[];
  currencySymbol?: string;
  settings?: any; 
}) {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart } = useCart();

  // Extract from API
  const sizeAttr = attributes?.find(
    (a: any) => a.slug === "size" || a.name?.en === "Size",
  );
  const colorAttr = attributes?.find(
    (a: any) => a.slug === "color" || a.name?.en === "Color",
  );
  const apiSizes = sizeAttr?.values || [];
  const apiColors = colorAttr?.values || [];

  const [activeCategory, setActiveCategory] = useState(
    searchParams.get("category") || "All",
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    router.replace(
      catName === "All"
        ? "/shop"
        : `/shop?category=${encodeURIComponent(catName)}`,
      { scroll: false },
    );
  };

  const toggleSize = (sizeEn: string) => {
    setSelectedSize((prev) => (prev === sizeEn ? null : sizeEn));
  };

  const toggleColor = (colorEn: string) => {
    setSelectedColor((prev) => (prev === colorEn ? null : colorEn));
  };

  // Filter products
  const filteredProducts = products.filter((p: any) => {
    let categoryMatch = activeCategory === "All";
    if (!categoryMatch) {
      const catNameEn = p.categories?.[0]?.name?.en || "";
      const catNameAr = p.categories?.[0]?.name?.ar || "";
      const catNameRaw = p.categories?.[0]?.name || "";
      const catSlug = p.categories?.[0]?.slug || "";
      categoryMatch = [catNameEn, catNameAr, catNameRaw, catSlug].includes(
        activeCategory,
      );
    }
    if (!categoryMatch) return false;

    if (selectedSize) {
      const hasSize = p.variations?.some((v: any) =>
        v.sku?.endsWith(`-${selectedSize}`),
      );
      if (!hasSize) return false;
    }

    if (selectedColor) {
      const prefix = selectedColor.substring(0, 3).toUpperCase();
      const hasColor = p.variations?.some(
        (v: any) =>
          v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`),
      );
      if (!hasColor) return false;
    }

    return true;
  });

  const getPrice = (p: any) => {
    if (p.base_price !== undefined && p.base_price !== null)
      return parseFloat(p.base_price);
    if (p.price !== undefined && p.price !== null) return parseFloat(p.price);
    if (p.variations && p.variations.length > 0) {
      return parseFloat(p.variations[0].price || "0");
    }
    return 0;
  };

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (sortOption === "price_asc") {
      return getPrice(a) - getPrice(b);
    } else if (sortOption === "price_desc") {
      return getPrice(b) - getPrice(a);
    } else if (sortOption === "newest") {
      return (
        new Date(b.created_at || 0).getTime() -
        new Date(a.created_at || 0).getTime()
      );
    } else if (sortOption === "featured") {
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
    return 0;
  });

  return (
    <>
      <ProductQuickView
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />

      {/* WRAPPER GRID */}
      <div className="flex flex-col lg:flex-row gap-12 items-start relative">
        
        {/* MOBILE FILTER BUTTON & CONTROLS */}
        <div className="w-full lg:hidden flex items-center justify-between p-4 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-xl mb-6 shadow-sm">
          <span className="text-sm font-light tracking-wide text-muted-foreground">
            {sortedProducts.length} <span className="font-normal text-foreground">{t("results", lang)}</span>
          </span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-2.5 text-xs tracking-widest uppercase font-medium bg-primary text-primary-foreground px-5 py-3 rounded-xl shadow-md hover:opacity-90 active:scale-95 transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" /> {t("filters", lang)}
          </button>
        </div>

        {/* SIDEBAR FILTERS (DESKTOP) */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-28 p-8 rounded-[32px] border border-border/50 bg-card/30 backdrop-blur-2xl shadow-xl space-y-10">
          
          {/* Categories */}
          <div>
            <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-foreground mb-6 pb-2 border-b border-border/40">
              {t("categories", lang)}
            </h3>
            <ul className="space-y-3.5">
              <li>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className={`w-full text-left text-sm tracking-wide transition-all duration-300 flex items-center justify-between group ${
                    activeCategory === "All" 
                      ? "text-primary font-medium translate-x-1" 
                      : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                  }`}
                >
                  <span>{t("all", lang) || "All"}</span>
                  <span className={`w-1.5 h-1.5 rounded-full bg-primary transition-transform duration-300 ${activeCategory === "All" ? "scale-100" : "scale-0 group-hover:scale-50"}`} />
                </button>
              </li>
              {categories.map((cat) => {
                const catName = cat.name?.[lang] || cat.name?.en || cat.name;
                const catSlug = cat.slug;
                const isSelected = activeCategory === catName || activeCategory === catSlug;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(catSlug)}
                      className={`w-full text-left text-sm tracking-wide transition-all duration-300 flex items-center justify-between group ${
                        isSelected 
                          ? "text-primary font-medium translate-x-1" 
                          : "text-muted-foreground hover:text-foreground hover:translate-x-1"
                      }`}
                    >
                      <span>{catName}</span>
                      <span className={`w-1.5 h-1.5 rounded-full bg-primary transition-transform duration-300 ${isSelected ? "scale-100" : "scale-0 group-hover:scale-50"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sizes */}
          {apiSizes.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-foreground mb-6 pb-2 border-b border-border/40 flex justify-between items-center">
                {sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {apiSizes.map((size: any) => {
                  const sEn = size.value?.en || size.value;
                  const sLocal = size.value?.[lang] || sEn;
                  const isSelected = selectedSize === sEn;
                  return (
                    <button
                      key={size.id}
                      onClick={() => toggleSize(sEn)}
                      className={`rounded-xl text-xs py-3 text-center tracking-wider transition-all duration-300 border font-light
                      ${isSelected 
                        ? "border-primary bg-primary/10 text-primary font-medium shadow-sm shadow-primary/10" 
                        : "border-border/60 bg-muted/10 hover:border-foreground/40 hover:text-foreground"}`}
                    >
                      {sLocal}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Colors */}
          {apiColors.length > 0 && (
            <div className="pt-2">
              <h3 className="text-xs tracking-[0.3em] uppercase font-medium text-foreground mb-6 pb-2 border-b border-border/40 flex justify-between items-center">
                {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}
                <ChevronDown className="w-3 h-3 opacity-60" />
              </h3>
              <div className="flex flex-wrap gap-3">
                {apiColors.map((color: any) => {
                  const cEn = color.value?.en || color.value;
                  const cLocal = color.value?.[lang] || cEn;
                  const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-border";
                  const isSelected = selectedColor === cEn;

                  return (
                    <button
                      key={color.id}
                      title={cLocal}
                      onClick={() => toggleColor(cEn)}
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 
                      ${bgClass} ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "hover:scale-115 hover:shadow-md"}`}
                    >
                      {isSelected && (
                        <Check className={`w-3.5 h-3.5 ${(bgClass.includes("white") || bgClass.includes("yellow") || bgClass.includes("pink-200") || bgClass.includes("green-200")) ? "text-black" : "text-white"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* MOBILE SIDEBAR DRAWERS (ANIME OVERLAY) */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              {/* Overlay Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 lg:hidden"
              />
              {/* Filter Content Body */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm bg-card/95 backdrop-blur-3xl border-l border-border/40 p-8 z-50 overflow-y-auto lg:hidden shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-4 border-b border-border/40">
                    <h2 className="text-sm tracking-[0.2em] uppercase font-medium">{t("filters", lang)}</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full hover:bg-muted/60 transition-colors">
                      <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Mobile Categories */}
                  <div>
                    <h3 className="text-xs tracking-widest font-medium uppercase text-muted-foreground mb-4">{t("categories", lang)}</h3>
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2">
                      <button
                        onClick={() => { handleCategoryClick("All"); setMobileFiltersOpen(false); }}
                        className={`text-left py-2 px-3 text-sm rounded-xl transition-all ${activeCategory === "All" ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/40"}`}
                      >
                        {t("all", lang) || "All"}
                      </button>
                      {categories.map((cat) => {
                        const catName = cat.name?.[lang] || cat.name?.en || cat.name;
                        const catSlug = cat.slug;
                        const isSelected = activeCategory === catName || activeCategory === catSlug;
                        return (
                          <button
                            key={cat.id}
                            onClick={() => { handleCategoryClick(catSlug); setMobileFiltersOpen(false); }}
                            className={`text-left py-2 px-3 text-sm rounded-xl transition-all ${isSelected ? "bg-primary/10 text-primary font-medium" : "text-foreground/80 hover:bg-muted/40"}`}
                          >
                            {catName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Sizes */}
                  {apiSizes.length > 0 && (
                    <div>
                      <h3 className="text-xs tracking-widest font-medium uppercase text-muted-foreground mb-4">{sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}</h3>
                      <div className="grid grid-cols-4 gap-2">
                        {apiSizes.map((size: any) => {
                          const sEn = size.value?.en || size.value;
                          const sLocal = size.value?.[lang] || sEn;
                          return (
                            <button
                              key={size.id}
                              onClick={() => toggleSize(sEn)}
                              className={`rounded-xl text-xs py-2.5 text-center transition-all border ${selectedSize === sEn ? "border-primary bg-primary/10 text-primary font-medium" : "border-border bg-muted/5 text-foreground"}`}
                            >
                              {sLocal}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Mobile Colors */}
                  {apiColors.length > 0 && (
                    <div>
                      <h3 className="text-xs tracking-widest font-medium uppercase text-muted-foreground mb-4">{colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}</h3>
                      <div className="flex flex-wrap gap-2.5">
                        {apiColors.map((color: any) => {
                          const cEn = color.value?.en || color.value;
                          const cLocal = color.value?.[lang] || cEn;
                          const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-border";
                          const isSelected = selectedColor === cEn;
                          return (
                            <button
                              key={color.id}
                              title={cLocal}
                              onClick={() => toggleColor(cEn)}
                              className={`relative w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all ${bgClass} ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-105" : ""}`}
                            >
                              {isSelected && <Check className={`w-3.5 h-3.5 ${(bgClass.includes("white") || bgClass.includes("yellow") || bgClass.includes("pink-200")) ? "text-black" : "text-white"}`} />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  className="w-full bg-foreground text-background font-medium py-3.5 rounded-xl mt-8 text-center text-sm tracking-wide shadow-lg active:scale-[0.98] transition-all"
                >
                  {sortedProducts.length} {t("results", lang)}
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PRODUCTS GRID AREA */}
        <div className="flex-1 w-full">
          
          {/* DESKTOP HEADER ACTION CONTROLS */}
          <div className="hidden lg:flex items-center justify-between mb-10 pb-4 border-b border-border/40">
            <span className="text-sm font-light tracking-wide text-muted-foreground">
              {sortedProducts.length} <span className="font-normal text-foreground">{t("results", lang)}</span>
            </span>
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-muted-foreground">
              <span>{t("sort_by", lang)}</span>
              <div className="relative">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-muted/20 border border-border/60 hover:border-foreground/40 rounded-xl pl-4 pr-10 py-2.5 font-medium text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all cursor-pointer text-xs"
                >
                  <option value="newest" className="bg-card text-foreground">{t("sort_newest", lang)}</option>
                  <option value="featured" className="bg-card text-foreground">{t("sort_featured", lang)}</option>
                  <option value="price_asc" className="bg-card text-foreground">{t("sort_price_asc", lang)}</option>
                  <option value="price_desc" className="bg-card text-foreground">{t("sort_price_desc", lang)}</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* DYNAMIC PRODUCTS LAYOUT GRID */}
          {sortedProducts.length === 0 ? (
            <div className="text-center py-28 p-6 rounded-[32px] border border-dashed border-border/60 bg-card/10 backdrop-blur-sm">
              <p className="text-sm tracking-widest text-muted-foreground font-light">
                {t("no_products", lang)}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-8">
              {sortedProducts.map((product: any, index: number) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  index={index}
                  settings={settings}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </>
  );
}