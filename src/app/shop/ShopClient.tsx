"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence, useSpring, useMotionValue, Variants } from "framer-motion";
import { ChevronDown, SlidersHorizontal, Check, X, ArrowDownWideNarrow, ShoppingBag, Eye } from "lucide-react";

import { getImageUrl } from "@/lib/api";
import { t } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageContext";
import ProductQuickView from "@/components/ProductQuickView";
import { useCart } from "@/components/CartContext"; // تأكد من اسم الـ Context الخاص بالسلة لديك هنا

// Fallback visual class mapping
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

function useMouseTracker() {
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);
  const [isClickable, setIsClickable] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      const target = e.target as HTMLElement;
      const isHoverClickable = !!target.closest("button, a, select, input, [role='button']");
      setIsClickable(isHoverClickable);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return { mouseX, mouseY, isClickable };
}

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 40, scale: 0.96, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 70, damping: 14 }
  }
};

function PremiumProductCard({
  product,
  onQuickView,
  onAddToCart,
}: {
  product: any;
  onQuickView: (p: any) => void;
  onAddToCart: (p: any, e: React.MouseEvent) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const localX = useMotionValue(0);
  const localY = useMotionValue(0);
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    localX.set(e.clientX - rect.left);
    localY.set(e.clientY - rect.top);
  };

  const { lang } = useLanguage();
  const title = product.name?.[lang] || product.name?.en || product.name;

  // إصلاح جلب الصورة: التحقق من وجود الصورة في كائن فرعي أو مصفوفة لتفادي الـ Broken Image
  const productCoverImage = product.image || product.images?.[0] || product.thumbnail || product.cover;

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[28px] border border-border/60 bg-card/50 backdrop-blur-md p-4 shadow-md hover:shadow-2xl transition-all duration-500 h-full w-full"
    >
      <div className="absolute inset-0 z-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-[28px] p-[1px] bg-gradient-to-r from-primary via-amber-500 to-primary bg-[length:200%_auto] animate-gradient-shift" />

      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: `radial-gradient(220px circle at ${localX.get()}px ${localY.get()}px, rgba(var(--primary-rgb, 140, 100, 255), 0.08), transparent 70%)`,
        }}
      />

      <div className="relative z-10 w-full rounded-[22px] overflow-hidden bg-muted/40 aspect-square mb-5">
        <img
          src={getImageUrl(productCoverImage) || "/api/placeholder/400/400"}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none z-10" />

        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 z-20">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onQuickView(product)}
            className="w-11 h-11 rounded-full bg-white text-black shadow-lg flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
          >
            <Eye className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-between px-2">
        <div className="space-y-1">
          <h4 className="font-medium text-base tracking-tight text-foreground line-clamp-2 min-h-[3rem]">
            {title}
          </h4>
          {/* تم إزالة السعر بالكامل من هنا لبناء مظهر فخم مخصص لطلب تسعيرة مباشر */}
        </div>

        <div className="mt-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => onAddToCart(product, e)}
            className="w-full relative overflow-hidden flex items-center justify-center gap-2 px-5 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm shadow-md hover:shadow-primary/20 hover:bg-primary/90 transition-all duration-300"
          >
            <ShoppingBag className="w-4 h-4" />
            {lang === "ar" ? "إضافة إلى طلب تسعيرة" : t("add_to_cart", lang)}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}

function PremiumSkeletonGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-6 sm:gap-x-8 w-full">
      {[1, 2, 3, 4, 5].map((idx) => (
        <div key={idx} className="p-4 rounded-[28px] border border-border/40 bg-card/40 space-y-5 animate-pulse w-full">
          <div className="bg-muted rounded-[22px] aspect-square w-full" />
          <div className="space-y-3 px-2">
            <div className="h-4 bg-muted rounded-md w-3/4" />
            <div className="h-11 bg-muted rounded-xl w-full pt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

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

  // استدعاء دالة إضافة المنتجات الحقيقية من السلة لتفعيل عمل الزر فوراً
  const { addToCart, addItem } = useCart() as any;

  const { mouseX, mouseY, isClickable } = useMouseTracker();
  const smoothCursorX = useSpring(mouseX, { stiffness: 400, damping: 28 });
  const smoothCursorY = useSpring(mouseY, { stiffness: 400, damping: 28 });

  const [flyingParticles, setFlyingParticles] = useState<{ id: number; sx: number; sy: number }[]>([]);

  const sizeAttr = attributes?.find((a: any) => a.slug === "size" || a.name?.en === "Size");
  const colorAttr = attributes?.find((a: any) => a.slug === "color" || a.name?.en === "Color");
  const apiSizes = sizeAttr?.values || [];

  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState("newest");
  const [quickViewProduct, setQuickViewProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [activeCategory, selectedSize, selectedColor, sortOption]);

  const handleCategoryClick = (catName: string) => {
    setActiveCategory(catName);
    router.replace(
      catName === "All" ? "/shop" : `/shop?category=${encodeURIComponent(catName)}`,
      { scroll: false },
    );
  };

  const toggleSize = (sizeEn: string) => setSelectedSize((prev) => (prev === sizeEn ? null : sizeEn));

  const handleAddToCart = (product: any, e: React.MouseEvent) => {
    // 1. تشغيل الفخامة البصرية (تأثير الجزيئات الطائرة)
    const startX = e.clientX;
    const startY = e.clientY;
    const id = Date.now();
    setFlyingParticles((prev) => [...prev, { id, sx: startX, sy: startY }]);

    // 2. الربط الفعلي مع الـ Context ليتم حفظ المنتج بداخل السلة
    if (typeof addToCart === "function") {
      addToCart(product, 1);
    } else if (typeof addItem === "function") {
      addItem(product);
    }

    setTimeout(() => {
      setFlyingParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  const sortedProducts = useMemo(() => {
    let filtered = products.filter((p: any) => {
      let categoryMatch = activeCategory === "All";
      if (!categoryMatch) {
        const catSlug = p.categories?.[0]?.slug || "";
        categoryMatch = catSlug === activeCategory;
      }
      if (!categoryMatch) return false;

      if (selectedSize) {
        return p.variations?.some((v: any) => v.sku?.endsWith(`-${selectedSize}`));
      }
      return true;
    });

    return filtered;
  }, [products, activeCategory, selectedSize]);

  return (
    <>
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden md:block rounded-full border border-primary/40 bg-primary/5 backdrop-blur-[1px] w-6 h-6 -ml-3 -mt-3"
        style={{ x: smoothCursorX, y: smoothCursorY }}
        animate={{
          scale: isClickable ? 2.2 : 1,
          borderColor: isClickable ? "var(--primary)" : "rgba(var(--primary-rgb), 0.4)",
        }}
        transition={{ type: "tween", ease: "backOut", duration: 0.2 }}
      />

      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-20 dark:opacity-25 blur-[120px]"
        style={{
          background: `radial-gradient(circle 300px at ${mouseX.get()}px ${mouseY.get()}px, var(--primary), transparent 80%)`,
        }}
      />

      <AnimatePresence>
        {flyingParticles.map((pt) => (
          <motion.div
            key={pt.id}
            initial={{ opacity: 1, x: pt.sx, y: pt.sy, scale: 1 }}
            animate={{
              opacity: 0.3,
              x: isRtl ? 60 : window.innerWidth - 80,
              y: 40,
              scale: 0.1
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: [0.25, 1, 0.5, 1] }}
            className="fixed top-0 left-0 w-8 h-8 rounded-full bg-primary z-[9999] shadow-lg shadow-primary/50 flex items-center justify-center text-white text-[10px]"
          >
            📦
          </motion.div>
        ))}
      </AnimatePresence>

      <ProductQuickView isOpen={!!quickViewProduct} onClose={() => setQuickViewProduct(null)} product={quickViewProduct} />

      <div dir={isRtl ? "rtl" : "ltr"} className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start relative select-none w-full">

        <aside className="hidden lg:block w-72 flex-shrink-0 sticky top-28 p-8 rounded-[32px] border border-border/50 bg-card/30 backdrop-blur-2xl shadow-xl space-y-10">
          <div>
            <h3 className="text-xs tracking-[0.3em] uppercase font-semibold text-foreground mb-6 pb-2 border-b border-border/40">
              {t("categories", lang)}
            </h3>
            <ul className="space-y-3.5">
              <li>
                <button
                  onClick={() => handleCategoryClick("All")}
                  className={`w-full text-start text-sm tracking-wide transition-all duration-300 flex items-center justify-between ${activeCategory === "All" ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <span>{t("all", lang) || "All"}</span>
                  <span className={`w-1.5 h-1.5 rounded-full bg-primary transition-transform duration-300 ${activeCategory === "All" ? "scale-100" : "scale-0"}`} />
                </button>
              </li>
              {categories.map((cat) => {
                const isSelected = activeCategory === cat.slug;
                return (
                  <li key={cat.id}>
                    <button
                      onClick={() => handleCategoryClick(cat.slug)}
                      className={`w-full text-start text-sm tracking-wide transition-all duration-300 flex items-center justify-between ${isSelected ? "text-primary font-medium" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      <span>{cat.name?.[lang] || cat.name?.en}</span>
                      <span className={`w-1.5 h-1.5 rounded-full bg-primary transition-transform duration-300 ${isSelected ? "scale-100" : "scale-0"}`} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <div className="flex-1 w-full min-w-0">
          <div className="hidden lg:flex items-center justify-between mb-10 pb-4 border-b border-border/40">
            <span className="text-sm font-light tracking-wide text-muted-foreground">
              {sortedProducts.length} <span className="font-normal text-foreground">{t("results", lang)}</span>
            </span>
          </div>

          {loading ? (
            <PremiumSkeletonGrid />
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-28 p-6 rounded-[32px] border border-dashed border-border/60">
              <p className="text-sm tracking-widest text-muted-foreground font-light">{t("no_products", lang)}</p>
            </div>
          ) : (
            <motion.div
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
              className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-10 gap-x-6 sm:gap-x-8"
            >
              {sortedProducts.map((product: any, idx: number) => (
                <PremiumProductCard
                  key={product.id}
                  product={product}
                  currencySymbol={currencySymbol}
                  index={idx}
                  onQuickView={setQuickViewProduct}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
}