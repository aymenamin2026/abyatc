"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, SlidersHorizontal, Check, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getImageUrl } from "@/lib/api";

// Fallback visual class mapping for common color names from the database
const colorClassMap: Record<string, string> = {
  "navy blue": "bg-blue-900",
  black: "bg-black",
  white: "bg-white border border-gray-200",
  burgundy: "bg-rose-900",
  charcoal: "bg-gray-700",
  "sky blue": "bg-sky-400",
  "light gray": "bg-gray-300",
  "dark gray": "bg-gray-500",
  "powder pink": "bg-pink-200",
  pink: "bg-pink-400",
  "pistachio green": "bg-green-200",
  "classic blue": "bg-blue-600",
  "off white": "bg-stone-100 border border-gray-200",
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

  // Filter products by UI selected category, size, and color.
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
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <span className="font-medium">
            {sortedProducts.length} {t("results", lang)}
          </span>
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 text-sm font-medium border border-border px-4 py-2 rounded-md hover:bg-muted transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" /> {t("filters", lang)}
          </button>
        </div>

        {/* Sidebar / Filters */}
        <aside
          className={`w-full lg:w-64 flex-shrink-0 ${mobileFiltersOpen ? "block" : "hidden"} lg:block`}
        >
          {/* Categories */}
          <div className="mb-8">
            <h3 className="font-serif text-xl font-bold text-foreground mb-4">
              {t("categories", lang)}
            </h3>
            <ul className="space-y-3">
              <li>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className={`text-sm tracking-wide transition-colors ${activeCategory === "All" ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {t("all", lang) || "All"}
                </button>
              </li>
              {categories.map((cat) => {
                const catName = cat.name?.[lang] || cat.name?.en || cat.name;
                const catSlug = cat.slug;
                const isSelected =
                  activeCategory === catName || activeCategory === catSlug;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(catSlug)}
                      className={`text-sm tracking-wide transition-colors text-left ${isSelected ? "text-foreground font-bold" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {catName}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Sizes */}
          {apiSizes.length > 0 && (
            <div className="mb-8 border-t border-border pt-6">
              <h3 className="font-serif text-xl font-bold text-foreground mb-4 flex justify-between items-center cursor-pointer">
                {sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}{" "}
                <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {apiSizes.map((size: any) => {
                  const sEn = size.value?.en || size.value;
                  const sLocal = size.value?.[lang] || sEn;
                  return (
                    <button
                      key={size.id}
                      onClick={() => toggleSize(sEn)}
                      className={`border rounded-md text-sm py-2 px-1 text-center transition-colors 
                      ${selectedSize === sEn ? "border-foreground text-foreground bg-foreground/5 font-medium" : "border-border hover:border-foreground hover:text-foreground"}`}
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
            <div className="mb-8 border-t border-border pt-6">
              <h3 className="font-serif text-xl font-bold text-foreground mb-4 flex justify-between items-center cursor-pointer">
                {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}{" "}
                <ChevronDown className="w-4 h-4" />
              </h3>
              <div className="flex flex-wrap gap-3">
                {apiColors.map((color: any) => {
                  const cEn = color.value?.en || color.value;
                  const cLocal = color.value?.[lang] || cEn;
                  const bgClass =
                    colorClassMap[cEn.toLowerCase()] ||
                    "bg-gray-200 border border-gray-300";

                  return (
                    <button
                      key={color.id}
                      title={cLocal}
                      onClick={() => toggleColor(cEn)}
                      className={`relative w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all 
                      ${bgClass} ${selectedColor === cEn ? "ring-2 ring-primary ring-offset-2" : "hover:scale-110"}`}
                    >
                      {selectedColor === cEn &&
                        (bgClass.includes("white") ||
                          bgClass.includes("yellow")) && (
                          <Check className="w-4 h-4 text-black" />
                        )}
                      {selectedColor === cEn &&
                        !(
                          bgClass.includes("white") ||
                          bgClass.includes("yellow")
                        ) && <Check className="w-4 h-4 text-white" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          <div className="hidden lg:flex items-center justify-between mb-8">
            <span className="font-medium text-muted-foreground text-sm">
              {sortedProducts.length} {t("results", lang)}
            </span>
            <div className="flex items-center gap-2 text-sm">
              <span>{t("sort_by", lang)}</span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="bg-transparent border-b border-border pb-1 font-medium focus:outline-none focus:border-primary"
              >
                <option value="newest">{t("sort_newest", lang)}</option>
                <option value="featured">{t("sort_featured", lang)}</option>
                <option value="price_asc">{t("sort_price_asc", lang)}</option>
                <option value="price_desc">{t("sort_price_desc", lang)}</option>
              </select>
            </div>
          </div>

          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              {t("no_products", lang)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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