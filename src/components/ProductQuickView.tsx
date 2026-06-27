"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { t } from "@/lib/translations";
import { getImageUrl } from "@/lib/api";
import { useCart } from "./CartContext";
import { useState, useEffect } from "react";
import { fetchSettings, fetchAttributes } from "@/lib/api";

// Fallback visual class mapping for common color names from the database
const colorClassMap: Record<string, string> = {
  "navy blue": "bg-blue-900",
  "black": "bg-black",
  "white": "bg-white border border-border/80",
  "burgundy": "bg-rose-900",
  "charcoal": "bg-gray-700",
  "sky blue": "bg-sky-400",
  "light gray": "bg-gray-300",
  "dark gray": "bg-gray-500",
  "powder pink": "bg-pink-200",
  "pink": "bg-pink-400",
  "pistachio green": "bg-green-200",
  "classic blue": "bg-blue-600",
  "off white": "bg-stone-100 border border-border/80",
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
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [attributes, setAttributes] = useState<any[]>([]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [settingsRes, attrRes] = await Promise.all([
          fetchSettings(),
          fetchAttributes()
        ]);
        if (settingsRes?.currency_symbol) {
          setCurrencySymbol(settingsRes.currency_symbol);
        }
        if (attrRes) {
          setAttributes(attrRes);
        }
      } catch (err) { }
    }
    loadData();
  }, []);

  useEffect(() => {
    setSelectedSize(null);
    setSelectedColor(null);
    setAddedToCart(false);
  }, [product]);

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

  useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0].value?.en || availableSizes[0].value);
    }
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].value?.en || availableColors[0].value);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor]);

  if (!isOpen || !product) return null;

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
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-x-hidden overflow-y-auto">
        {/* BACKDROP OPTIMIZED */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-md z-10"
        />

        {/* MODAL CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", damping: 25, stiffness: 180 }}
          className="relative w-full max-w-4xl bg-card/90 backdrop-blur-3xl border border-border/40 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row z-20 max-h-[90vh] md:max-h-[85vh]"
        >
          {/* CLOSE BUTTON */}
          <button
            onClick={onClose}
            className={`absolute top-5 ${lang === 'ar' ? 'left-5' : 'right-5'} z-30 p-2.5 bg-background/60 hover:bg-background border border-border/40 text-foreground rounded-full backdrop-blur-md transition-all shadow-sm hover:scale-105 active:scale-95`}
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT: PREMIUM IMAGE DISPLAY */}
          <div className="w-full md:w-1/2 h-72 md:h-auto relative bg-muted/20 flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-border/30">
            {product.images && product.images.length > 0 ? (
              <div className="relative w-full h-full min-h-[240px] md:min-h-[380px]">
                <Image
                  src={getImageUrl(product.images[0])}
                  alt={productName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain p-4 transition-transform duration-500 hover:scale-102"
                  priority
                />
              </div>
            ) : (
              <div className="text-xs tracking-widest text-muted-foreground/60 font-light">
                {t('no_image', lang)}
              </div>
            )}
          </div>

          {/* RIGHT: DETAILS SCROLLABLE AREA */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col overflow-y-auto custom-scrollbar">

            {/* METADATA CATEGORY */}
            <div className="text-[10px] uppercase tracking-[0.25em] font-medium text-muted-foreground/80 mb-2.5">
              {category}
            </div>

            {/* PRODUCT TITLE */}
            <h2 className="font-light text-2xl md:text-3xl text-foreground tracking-wide leading-tight mb-4">
              {productName}
            </h2>

            {/* LIVE DYNAMIC PRICE */}
            {/* <div className="text-xl md:text-2xl font-semibold text-foreground mb-6 flex items-center tracking-wider">
              {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                <div className="flex items-center">
                  <Image src="/riyal-dark.svg" alt="SAR" width={16} height={16} className={`inline-block theme-light-only ${lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} />
                  <Image src="/riyal-light.svg" alt="SAR" width={16} height={16} className={`theme-dark-only ${lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} />
                </div>
              ) : (
                <span dangerouslySetInnerHTML={{ __html: currencySymbol }} className={`font-light text-muted-foreground ${lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} />
              )}
              <span>{displayPrice.toFixed(2)}</span>
            </div> */}

            {/* PRODUCT DESCRIPTION */}
            {description && (
              <div
                className="prose prose-sm dark:prose-invert text-muted-foreground/90 font-light leading-relaxed mb-6 line-clamp-4 border-t border-border/30 pt-4"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {/* FLEX SECTIONS FOR OPTIONS */}
            <div className="space-y-5 border-t border-border/30 pt-5 mb-8">
              {/* COLORS SELECTOR */}
              {availableColors.length > 0 && (
                <div>
                  <div className="mb-2.5">
                    <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                      {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}:
                      <span className="text-foreground font-normal normal-case tracking-normal ml-2">
                        {availableColors.find((c: any) => (c.value?.en || c.value) === selectedColor)?.value?.[lang] || selectedColor}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color: any) => {
                      const cEn = color.value?.en || color.value;
                      const cLocal = color.value?.[lang] || cEn;
                      const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-border";
                      const isSelected = selectedColor === cEn;

                      return (
                        <button
                          key={color.id}
                          onClick={() => setSelectedColor(cEn)}
                          className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${bgClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-sm' : 'hover:scale-110'}`}
                          title={cLocal}
                        >
                          {isSelected && (
                            <Check className={`w-3.5 h-3.5 ${(bgClass.includes('white') || bgClass.includes('yellow') || bgClass.includes('pink-200') || bgClass.includes('stone-100')) ? 'text-black' : 'text-white'}`} />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SIZES SELECTOR */}
              {availableSizes.length > 0 && (
                <div>
                  <div className="mb-2.5">
                    <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                      {sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {availableSizes.map((size: any) => {
                      const sEn = size.value?.en || size.value;
                      const sLocal = size.value?.[lang] || sEn;
                      const isSelected = selectedSize === sEn;

                      return (
                        <button
                          key={size.id}
                          onClick={() => setSelectedSize(sEn)}
                          className={`py-2.5 px-1 rounded-xl border text-xs tracking-wider font-light transition-all duration-300 flex items-center justify-center
                            ${isSelected
                              ? 'border-primary bg-primary/10 text-primary font-medium shadow-sm shadow-primary/5'
                              : 'border-border/60 bg-muted/5 hover:border-foreground/40 text-foreground'}`}
                        >
                          {sLocal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION FOOTER BUTTONS */}
            <div className="mt-auto space-y-3">
              {/* <button
                onClick={handleAddToCart}
                disabled={addedToCart || (hasVariations && (!selectedSize || !selectedColor))}
                className={`w-full flex items-center justify-center gap-2.5 py-4 rounded-xl font-medium text-sm tracking-wider uppercase transition-all duration-500 shadow-md ${addedToCart
                  ? "bg-green-500 text-white border-green-500 shadow-green-500/10 scale-[0.99]"
                  : "bg-foreground text-background hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-4 h-4 animate-in zoom-in duration-300" />
                    <span className="text-xs">{lang === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span className="text-xs">{t('add_to_cart', lang)}</span>
                  </>
                )}
              </button> */}

              <Link
                href={`/shop/${product.slug}`}
                onClick={onClose}
                className="w-full flex items-center justify-center py-4 rounded-xl font-medium text-xs tracking-widest uppercase border border-border bg-muted/10 text-foreground hover:bg-muted/40 transition-all duration-300 text-center"
              >
                {t('view_details', lang)}
              </Link>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}