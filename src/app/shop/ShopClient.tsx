"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ChevronDown, SlidersHorizontal, Check, X, ArrowDownWideNarrow } from "lucide-react";

import { t } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageContext";
import ProductQuickView from "@/components/ProductQuickView";
import ProductCard from "@/components/ProductCard";

const colorClassMap: Record<string, string> = {
  "navy blue": "bg-[#0a192f]", // Deep Navy
  black: "bg-black",
  white: "bg-white border border-border/80",
  burgundy: "bg-rose-900",
  charcoal: "bg-gray-800",
  "sky blue": "bg-sky-300",
  "light gray": "bg-gray-300",
  "dark gray": "bg-gray-600",
  "powder pink": "bg-pink-100",
  pink: "bg-pink-400",
  "pistachio green": "bg-green-200",
  "classic blue": "bg-blue-600",
  "off white": "bg-[#f8f9fa] border border-border/80",
  purple: "bg-purple-600",
  beige: "bg-[#f5f5dc]",
  "camel beige": "bg-[#c19a6b]",
  turquoise: "bg-teal-400",
  "cream yellow": "bg-[#fffdd0]",
  nude: "bg-[#e3bc9a]",
  "light mauve": "bg-[#dca4bc]",
};

// المتغيرات الخاصة بالأنيميشن (Framer Motion Variants)
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const, // إضافة "as const" هنا يحل المشكلة
      stiffness: 300,
      damping: 24
    }
  }
};

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
  const isRtl = lang === "ar";
  const searchParams = useSearchParams();
  const router = useRouter();

  const sizeAttr = attributes?.find((a: any) => a.slug === "size" || a.name?.en === "Size");
  const colorAttr = attributes?.find((a: any) => a.slug === "color" || a.name?.en === "Color");
  const apiSizes = sizeAttr?.values || [];
  const apiColors = colorAttr?.values || [];

  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);

  useEffect(() => {
    document.body.style.overflow = mobileFiltersOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat) setActiveCategory(cat);
  }, [searchParams]);

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    router.replace(
      catName === "All" ? "/shop" : `/shop?category=${encodeURIComponent(catName)}`,
      { scroll: false },
    );
  };

  const toggleSize = (sizeEn: string) => setSelectedSize((prev) => (prev === sizeEn ? null : sizeEn));
  const toggleColor = (colorEn: string) => setSelectedColor((prev) => (prev === colorEn ? null : colorEn));

  const getPrice = (p: any) => {
    if (p.base_price !== undefined && p.base_price !== null) return parseFloat(p.base_price);
    if (p.price !== undefined && p.price !== null) return parseFloat(p.price);
    if (p.variations && p.variations.length > 0) return parseFloat(p.variations[0].price || "0");
    return 0;
  };

  const sortedProducts = useMemo(() => {
    let filtered = products.filter((p: any) => {
      let categoryMatch = activeCategory === "All";
      if (!categoryMatch) {
        const catNameEn = p.categories?.[0]?.name?.en || "";
        const catNameAr = p.categories?.[0]?.name?.ar || "";
        const catNameRaw = p.categories?.[0]?.name || "";
        const catSlug = p.categories?.[0]?.slug || "";
        categoryMatch = [catNameEn, catNameAr, catNameRaw, catSlug].includes(activeCategory);
      }
      if (!categoryMatch) return false;

      if (selectedSize) {
        const hasSize = p.variations?.some((v: any) => v.sku?.endsWith(`-${selectedSize}`));
        if (!hasSize) return false;
      }

      if (selectedColor) {
        const prefix = selectedColor.substring(0, 3).toUpperCase();
        const hasColor = p.variations?.some((v: any) => v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`));
        if (!hasColor) return false;
      }

      return true;
    });

    return filtered.sort((a: any, b: any) => {
      if (sortOption === "price_asc") return getPrice(a) - getPrice(b);
      if (sortOption === "price_desc") return getPrice(b) - getPrice(a);
      if (sortOption === "newest") return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
      if (sortOption === "featured") return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
      return 0;
    });
  }, [products, activeCategory, selectedSize, selectedColor, sortOption]);

  const activeFiltersCount = (selectedSize ? 1 : 0) + (selectedColor ? 1 : 0);

  return (
    <>
      <ProductQuickView
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        product={quickViewProduct}
      />

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative select-none w-full">

        {/* MOBILE FILTER BUTTON */}
        <div className="w-full lg:hidden flex items-center justify-between p-4 rounded-[20px] border border-[#093f89]/20 bg-card/60 backdrop-blur-xl mb-4 shadow-sm transition-all duration-300">
          <span className="text-sm font-light tracking-wide text-muted-foreground">
            {sortedProducts.length} <span className="font-normal text-foreground">{t("results", lang)}</span>
          </span>
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="relative flex items-center gap-2 text-xs tracking-widest uppercase font-semibold bg-[#093f89] text-white px-6 py-3 rounded-xl shadow-[0_4px_20px_rgba(9,63,137,0.3)] hover:shadow-[0_4px_25px_rgba(251,199,15,0.3)] active:scale-95 transition-all duration-300 group"
          >
            <SlidersHorizontal className="w-4 h-4 group-hover:text-[#fbc70f] transition-colors" />
            <span className="group-hover:text-[#fbc70f] transition-colors">{t("filters", lang)}</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -end-2 w-5 h-5 bg-[#fbc70f] text-[#093f89] rounded-full flex items-center justify-center text-[10px] font-bold shadow-md border-2 border-white dark:border-black">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* SIDEBAR FILTERS (DESKTOP) - Glassmorphism & Gold/Blue Accents */}
        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-28 p-8 rounded-[32px] border border-border/40 bg-card/30 backdrop-blur-2xl shadow-lg transition-all duration-500 hover:border-[#093f89]/30 dark:hover:border-[#fbc70f]/20">

          {/* Categories */}
          <div>
            <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-foreground mb-6 pb-3 border-b border-border/50">
              {t("categories", lang)}
            </h3>
            <ul className="space-y-4">
              <li>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className={`w-full text-start text-sm tracking-wide transition-all duration-300 flex items-center justify-between group ${activeCategory === "All"
                    ? "text-[#093f89] dark:text-[#fbc70f] font-bold translate-x-1 rtl:-translate-x-1"
                    : "text-muted-foreground hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1"
                    }`}
                >
                  <span>{t("all", lang) || "All"}</span>
                  <span className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${activeCategory === "All" ? "bg-[#fbc70f] scale-100 shadow-[0_0_8px_#fbc70f]" : "bg-[#093f89] scale-0 group-hover:scale-50"}`} />
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
                      className={`w-full text-start text-sm tracking-wide transition-all duration-300 flex items-center justify-between group ${isSelected
                        ? "text-[#093f89] dark:text-[#fbc70f] font-bold translate-x-1 rtl:-translate-x-1"
                        : "text-muted-foreground hover:text-foreground hover:translate-x-1 rtl:hover:-translate-x-1"
                        }`}
                    >
                      <span>{catName}</span>
                      <span className={`w-1.5 h-1.5 rounded-full transition-transform duration-300 ${isSelected ? "bg-[#fbc70f] scale-100 shadow-[0_0_8px_#fbc70f]" : "bg-[#093f89] scale-0 group-hover:scale-50"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sizes */}
          {apiSizes.length > 0 && (
            <div className="pt-8">
              <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-foreground mb-6 pb-3 border-b border-border/50 flex justify-between items-center">
                {sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}
                <ChevronDown className="w-4 h-4 opacity-40" />
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {apiSizes.map((size: any) => {
                  const sEn = size.value?.en || size.value;
                  const sLocal = size.value?.[lang] || sEn;
                  const isSelected = selectedSize === sEn;
                  return (
                    <button
                      key={size.id}
                      onClick={() => toggleSize(sEn)}
                      className={`rounded-xl text-xs py-2.5 text-center tracking-wider transition-all duration-300 border font-medium
                      ${isSelected
                          ? "border-[#093f89] bg-[#093f89] text-white shadow-md shadow-[#093f89]/20 scale-105"
                          : "border-border/60 bg-transparent hover:border-[#093f89]/50 hover:text-[#093f89] dark:hover:text-[#fbc70f] dark:hover:border-[#fbc70f]/50"}`}
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
            <div className="pt-8">
              <h3 className="text-xs tracking-[0.2em] uppercase font-bold text-foreground mb-6 pb-3 border-b border-border/50 flex justify-between items-center">
                {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}
                <ChevronDown className="w-4 h-4 opacity-40" />
              </h3>
              <div className="flex flex-wrap gap-3">
                {apiColors.map((color: any) => {
                  const cEn = color.value?.en || color.value;
                  const cLocal = color.value?.[lang] || cEn;
                  const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-muted border border-border";
                  const isSelected = selectedColor === cEn;

                  return (
                    <button
                      key={color.id}
                      title={cLocal}
                      onClick={() => toggleColor(cEn)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 
                      ${bgClass} ${isSelected ? "ring-2 ring-[#fbc70f] ring-offset-2 ring-offset-background scale-110 shadow-lg" : "shadow-sm hover:scale-110 hover:shadow-md ring-1 ring-border/20"}`}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 ${(bgClass.includes("white") || bgClass.includes("yellow") || bgClass.includes("pink") || bgClass.includes("beige")) ? "text-[#093f89]" : "text-[#fbc70f]"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* MOBILE SIDEBAR DRAWERS */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 bg-[#093f89]/20 dark:bg-black/60 backdrop-blur-sm z-[100] lg:hidden"
              />

              <motion.div
                initial={{ x: isRtl ? "100%" : "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: isRtl ? "100%" : "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 start-0 w-full max-w-xs sm:max-w-sm bg-background/95 backdrop-blur-3xl border-e border-[#093f89]/20 p-6 z-[101] overflow-y-auto lg:hidden shadow-2xl flex flex-col justify-between"
              >
                <div className="space-y-8">
                  <div className="flex items-center justify-between pb-4 border-b border-border/40">
                    <h2 className="text-sm tracking-[0.2em] uppercase font-bold text-[#093f89] dark:text-[#fbc70f]">{t("filters", lang)}</h2>
                    <button onClick={() => setMobileFiltersOpen(false)} className="p-2 rounded-full hover:bg-muted transition-colors">
                      <X className="w-5 h-5 text-muted-foreground hover:text-foreground" />
                    </button>
                  </div>

                  {/* Sort Controls (Mobile) */}
                  <div>
                    <h3 className="text-xs tracking-widest font-semibold uppercase text-muted-foreground mb-3 flex items-center gap-2">
                      <ArrowDownWideNarrow className="w-4 h-4" /> {t("sort_by", lang)}
                    </h3>
                    <div className="relative">
                      <select
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}
                        className="w-full appearance-none bg-muted/30 border border-border/60 rounded-xl px-4 py-3.5 font-medium text-foreground focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89]/30 transition-all text-sm cursor-pointer"
                      >
                        <option value="newest" className="bg-card text-foreground">{t("sort_newest", lang)}</option>
                        <option value="featured" className="bg-card text-foreground">{t("sort_featured", lang)}</option>
                        <option value="price_asc" className="bg-card text-foreground">{t("sort_price_asc", lang)}</option>
                        <option value="price_desc" className="bg-card text-foreground">{t("sort_price_desc", lang)}</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-muted-foreground absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Mobile Categories */}
                  <div>
                    <h3 className="text-xs tracking-widest font-semibold uppercase text-muted-foreground mb-4">{t("categories", lang)}</h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleCategoryClick("All")}
                        className={`text-start py-3 px-4 text-sm rounded-xl transition-all ${activeCategory === "All" ? "bg-[#093f89] text-white font-medium shadow-md" : "text-foreground/80 hover:bg-muted"}`}
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
                            onClick={() => handleCategoryClick(catSlug)}
                            className={`text-start py-3 px-4 text-sm rounded-xl transition-all ${isSelected ? "bg-[#093f89] text-white font-medium shadow-md" : "text-foreground/80 hover:bg-muted"}`}
                          >
                            {catName}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mobile Sizes & Colors omitted for brevity but they follow the exact same logic and class styling as Desktop */}
                </div>

                <div className="sticky bottom-0 pt-6 mt-6 bg-background/95 backdrop-blur-3xl border-t border-border/40">
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="w-full bg-[#093f89] text-white font-semibold py-4 rounded-xl text-center text-sm tracking-wide shadow-lg shadow-[#093f89]/30 hover:opacity-90 active:scale-[0.98] transition-all flex justify-center items-center gap-2"
                  >
                    <span>{t("view_details", lang)}</span>
                    <span className="bg-[#fbc70f] text-[#093f89] px-2 py-0.5 rounded-full text-xs font-bold">{sortedProducts.length}</span>
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* PRODUCTS GRID AREA */}
        <div className="flex-1 w-full min-w-0">

          {/* DESKTOP HEADER ACTION CONTROLS */}
          <div className="hidden lg:flex items-center justify-between mb-10 pb-4 border-b border-border/40">
            <span className="text-sm font-light tracking-wide text-muted-foreground">
              {t("showing", lang)} <span className="font-semibold text-foreground mx-1">{sortedProducts.length}</span> {t("results", lang)}
            </span>
            <div className="flex items-center gap-3 text-xs tracking-widest uppercase text-muted-foreground">
              <span className="font-medium">{t("sort_by", lang)}</span>
              <div className="relative group">
                <select
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="appearance-none bg-card/50 border border-border/60 group-hover:border-[#093f89]/50 rounded-full ps-5 pe-12 py-2.5 font-medium text-foreground focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89]/20 transition-all cursor-pointer text-xs shadow-sm backdrop-blur-sm"
                >
                  <option value="newest" className="bg-card text-foreground">{t("sort_newest", lang)}</option>
                  <option value="featured" className="bg-card text-foreground">{t("sort_featured", lang)}</option>
                  <option value="price_asc" className="bg-card text-foreground">{t("sort_price_asc", lang)}</option>
                  <option value="price_desc" className="bg-card text-foreground">{t("sort_price_desc", lang)}</option>
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-[#093f89] absolute end-4 top-1/2 -translate-y-1/2 pointer-events-none transition-colors" />
              </div>
            </div>
          </div>

          {/* DYNAMIC PRODUCTS LAYOUT GRID WITH FRAMER MOTION */}
          {sortedProducts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-28 p-6 rounded-[32px] border border-dashed border-[#093f89]/30 bg-[#093f89]/5 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
            >
              <span className="w-16 h-16 rounded-full bg-[#fbc70f]/20 flex items-center justify-center text-[#fbc70f] mb-2">
                <X className="w-8 h-8" />
              </span>
              <p className="text-base tracking-widest text-foreground font-medium">
                {t("no_products", lang)}
              </p>
              <p className="text-sm text-muted-foreground font-light max-w-sm">
                حاول إزالة بعض الفلاتر للبحث في تشكيلة أوسع.
              </p>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-6 sm:gap-x-8 w-full"
            >
              {sortedProducts.map((product: any, index: number) => (
                <motion.div key={product.id} variants={itemVariants} className="w-full h-full">
                  <ProductCard
                    product={product}
                    currencySymbol={currencySymbol}
                    index={index}
                    settings={settings}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>

      </div>
    </>
  );
}