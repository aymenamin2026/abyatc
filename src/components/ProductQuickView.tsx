"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ArrowRight } from "lucide-react";

import { useLanguage } from "./LanguageContext";
import { useCart } from "./CartContext";
import { t } from "@/lib/translations";
import { getImageUrl, fetchSettings, fetchAttributes } from "@/lib/api";

// Fallback visual class mapping - extracted outside to prevent re-creation
const COLOR_CLASS_MAP: Record<string, string> = {
  "navy blue": "bg-blue-900",
  "black": "bg-black",
  "white": "bg-white border border-border",
  "burgundy": "bg-rose-900",
  "charcoal": "bg-gray-700",
  "sky blue": "bg-sky-400",
  "light gray": "bg-gray-300",
  "dark gray": "bg-gray-500",
  "powder pink": "bg-pink-200",
  "pink": "bg-pink-400",
  "pistachio green": "bg-green-200",
  "classic blue": "bg-blue-600",
  "off white": "bg-stone-100 border border-border",
  "purple": "bg-purple-600",
  "beige": "bg-yellow-100",
  "camel beige": "bg-yellow-600",
  "turquoise": "bg-teal-400",
  "cream yellow": "bg-yellow-50",
  "nude": "bg-orange-100",
  "light mauve": "bg-fuchsia-200"
};

type ProductQuickViewProps = {
  isOpen: boolean;
  onClose: () => void;
  product: any | null;
};

export default function ProductQuickView({ isOpen, onClose, product }: ProductQuickViewProps) {
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const isRtl = lang === "ar";

  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  // إغلاق النافذة عند ضغط زر Escape (لتحسين إمكانية الوصول)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [settingsRes, attrRes] = await Promise.all([
          fetchSettings(),
          fetchAttributes()
        ]);
        if (!isMounted) return;

        if (settingsRes?.currency_symbol) setCurrencySymbol(settingsRes.currency_symbol);
        if (attrRes) setAttributes(attrRes);
      } catch (err) {
        console.error("Failed to fetch settings for QuickView:", err);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedSize(null);
      setSelectedColor(null);
      setAddedToCart(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const sizeAttr = attributes?.find((a: any) => a.slug === 'size' || a.name?.en === 'Size');
  const colorAttr = attributes?.find((a: any) => a.slug === 'color' || a.name?.en === 'Color');

  const hasVariations = product?.variations && product.variations.length > 0;

  const availableSizes = hasVariations && sizeAttr ? sizeAttr.values.filter((size: any) => {
    const sEn = size.value?.en || size.value;
    return product.variations.some((v: any) => v.sku?.endsWith(`-${sEn}`));
  }) : [];

  const availableColors = hasVariations && colorAttr ? colorAttr.values.filter((color: any) => {
    const cEn = color.value?.en || color.value;
    const prefix = cEn.substring(0, 3).toUpperCase();
    return product.variations.some((v: any) => v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`));
  }) : [];

  if (availableSizes.length > 0 && !selectedSize) {
    setSelectedSize(availableSizes[0].value?.en || availableSizes[0].value);
  }
  if (availableColors.length > 0 && !selectedColor) {
    setSelectedColor(availableColors[0].value?.en || availableColors[0].value);
  }

  const productName = product.name?.[lang] || product.name?.en || product.name;
  const description = product.description?.[lang] || product.description?.en || product.description;
  const category = product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || t('apparel', lang);

  let displayPrice = product.base_price !== undefined ? parseFloat(product.base_price)
    : (product.variations?.[0]?.price ? parseFloat(product.variations[0].price) : 0);

  if (hasVariations && selectedSize && selectedColor) {
    const prefix = selectedColor.substring(0, 3).toUpperCase();
    const variation = product.variations.find((v: any) =>
      (v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`)) && v.sku?.endsWith(`-${selectedSize}`)
    );
    if (variation && variation.price) {
      displayPrice = parseFloat(variation.price);
    }
  }

  const handleAddToCart = () => {
    if (hasVariations && (!selectedSize || !selectedColor)) return;
    addToCart({
      product_id: product.id,
      name: product.name || productName,
      image: getImageUrl(product.images?.[0]),
      color: selectedColor || "Default",
      size: selectedSize || "Default",
      price: displayPrice,
      quantity: 1
    });

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quickview-title"
      >
        {/* LUXURY BACKDROP */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-10"
        />

        {/* MODAL CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="
relative
w-full
max-w-4xl
bg-card/95
backdrop-blur-3xl
border
border-[#093f89]/10
dark:border-[#fbc70f]/20
rounded-[2rem]
sm:rounded-[3rem]
shadow-[0_30px_90px_rgba(0,0,0,.35)]
overflow-hidden
flex
flex-col
md:flex-row
z-20
max-h-[90vh]
md:max-h-[85vh]
"
        >
          {/* CLOSE BUTTON */}
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className="
    absolute
    top-4
    end-4
    sm:top-6
    sm:end-6
    z-30
    flex
    items-center
    justify-center
    w-11
    h-11
    rounded-full
    border
    border-border/40
    bg-white/90
    dark:bg-slate-900/90
    text-slate-700
    dark:text-white
    backdrop-blur-xl
    shadow-lg
    transition-all
    duration-300
    hover:bg-[#093f89]
    hover:text-white
    hover:rotate-90
    hover:scale-110
    active:scale-95
  "
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT: IMAGE DISPLAY WITH BRAND GRADIENT */}
          {/* LEFT: IMAGE DISPLAY WITH BRAND GRADIENT */}
          <div className="w-full md:w-1/2 h-64 sm:h-72 md:h-auto relative bg-background flex items-center justify-center p-6 border-b md:border-b-0 md:border-e border-border/30 overflow-hidden">

            {/* Luxury Background */}
            <div className="absolute inset-0 pointer-events-none z-0">

              <div className="absolute inset-0 bg-gradient-to-br from-[#093f89]/10 via-transparent to-[#fbc70f]/10" />

              <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#093f89]/10 blur-3xl" />

              <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#fbc70f]/10 blur-3xl" />

            </div>

            {product.images && product.images.length > 0 ? (
              <div className="relative w-full h-full min-h-[220px] md:min-h-[400px] z-10">
                <Image
                  src={getImageUrl(product.images[0])}
                  alt={productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 drop-shadow-xl transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
            ) : (
              <div className="text-xs tracking-widest text-muted-foreground/60 font-light z-10">
                {t('no_image', lang)}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS AREA */}
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar bg-card">

            <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-[#093f89] dark:text-[#fbc70f] mb-3 inline-block bg-[#093f89]/5 dark:bg-[#fbc70f]/10 px-3 py-1 rounded-full w-fit">
              {category}
            </div>

            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-[#fbc70f] to-[#093f89] mb-5" />

            <h2
              id="quickview-title"
              className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground font-bold tracking-tight leading-tight mb-5"
            >
              {productName}
            </h2>

            {/* PRODUCT DESCRIPTION */}
            {description && (
              <div
                className="prose prose-sm dark:prose-invert text-slate-600 dark:text-slate-300 leading-8 text-[15px] font-light leading-relaxed mb-6 line-clamp-4"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {/* OPTIONS SECTION */}
            <div className="space-y-6 border-t border-border/40 pt-6 mb-8 mt-auto">

              {/* COLORS */}
              {availableColors.length > 0 && (
                <div>
                  <div className="mb-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-foreground">
                      {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}:
                      <span className="text-muted-foreground font-medium normal-case tracking-normal mx-2">
                        {availableColors.find((c: any) => (c.value?.en || c.value) === selectedColor)?.value?.[lang] || selectedColor}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color: any) => {
                      const cEn = color.value?.en || color.value;
                      const cLocal = color.value?.[lang] || cEn;
                      const bgClass = COLOR_CLASS_MAP[cEn.toLowerCase()] || "bg-muted border border-border";
                      const isSelected = selectedColor === cEn;

                      return (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(cEn)}
                          className={`
relative
w-10
h-10
rounded-full
flex
items-center
justify-center
transition-all
duration-300
shadow-md
${bgClass}
${isSelected
                              ?
                              'ring-4 ring-[#fbc70f] dark:ring-[#093f89] ring-offset-2 ring-offset-card scale-110'
                              :
                              'hover:scale-125 hover:rotate-6 hover:shadow-xl'
                            }
`}
                          title={cLocal}
                          aria-label={`Select color ${cLocal}`}
                        >
                          {isSelected && (
                            <Check className={`w-4 h-4 ${(bgClass.includes('white') || bgClass.includes('yellow') || bgClass.includes('stone-100') || bgClass.includes('pink-200')) ? 'text-black' : 'text-white'}`} strokeWidth={3} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SIZES */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="mb-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-foreground">
                      {sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {availableSizes.map((size: any) => {
                      const sEn = size.value?.en || size.value;
                      const sLocal = size.value?.[lang] || sEn;
                      const isSelected = selectedSize === sEn;

                      return (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(sEn)}
                          className={`
    py-2.5
    px-2
    rounded-xl
    text-xs
    font-bold
    tracking-wider
    flex
    items-center
    justify-center
    border
    transition-all
    duration-300
    hover:shadow-[0_0_25px_rgba(9,63,137,.35)]
    hover:-translate-y-0.5
    ${isSelected
                              ? "border-[#093f89] bg-gradient-to-r from-[#093f89] to-[#0d5dbf] text-white dark:border-[#fbc70f] dark:bg-[#fbc70f] dark:text-[#093f89] shadow-md shadow-[#093f89]/20 dark:shadow-[#fbc70f]/20"
                              : "border-border/60 bg-muted/20 hover:border-[#093f89]/40 dark:hover:border-[#fbc70f]/40 hover:bg-muted text-foreground"
                            }
  `}
                        >
                          {sLocal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER */}
            <div className="pt-2">
              <Link
                href={`/shop/${product.slug}`}
                onClick={onClose}
                className="
group
relative
overflow-hidden
flex
items-center
justify-center
gap-2
w-full
py-4
rounded-2xl
font-bold
uppercase
tracking-widest
bg-gradient-to-r
from-[#093f89]
to-[#0c58b9]
text-white
transition-all
duration-500
hover:scale-[1.02]
hover:shadow-[0_20px_40px_rgba(9,63,137,.35)]
active:scale-95
"
              >

                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                <span className="relative z-10">
                  {t('view_details', lang)}
                </span>

                <ArrowRight
                  className={`relative z-10 w-4 h-4 transition-transform duration-300 ${isRtl
                    ? 'rotate-180 group-hover:-translate-x-1'
                    : 'group-hover:translate-x-1'
                    }`}
                />

              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}