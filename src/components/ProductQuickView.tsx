"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Check } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "./LanguageContext";
import { t } from "@/lib/translations";
import { getImageUrl } from "@/lib/api";
import { useCart } from "./CartContext";
import { useState, useEffect, useCallback } from "react";
import { fetchSettings, fetchAttributes } from "@/lib/api";

// Fallback visual class mapping for common color names from the database
const colorClassMap: Record<string, string> = {
  "navy blue": "bg-blue-900",
  "black": "bg-black",
  "white": "bg-white border border-gray-200",
  "burgundy": "bg-rose-900",
  "charcoal": "bg-gray-700",
  "sky blue": "bg-sky-400",
  "light gray": "bg-gray-300",
  "dark gray": "bg-gray-500",
  "powder pink": "bg-pink-200",
  "pink": "bg-pink-400",
  "pistachio green": "bg-green-200",
  "classic blue": "bg-blue-600",
  "off white": "bg-stone-100 border border-gray-200",
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
    // Reset selection when product changes
    setSelectedSize(null);
    setSelectedColor(null);
    setAddedToCart(false);
  }, [product]);

  // Extract from API
  const sizeAttr = attributes?.find((a: any) => a.slug === 'size' || a.name?.en === 'Size');
  const colorAttr = attributes?.find((a: any) => a.slug === 'color' || a.name?.en === 'Color');
  
  // Filter available options based on product variations
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

  // Adjust price if a specific variation is selected
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
    
    // Show confirmation, then auto-close after delay
    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
      onClose();
    }, 1500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} z-10 p-2 bg-white/80 dark:bg-black/50 hover:bg-white dark:hover:bg-black text-foreground rounded-full backdrop-blur-md transition-colors shadow-sm`}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Gallery */}
          <div className="w-full md:w-1/2 h-64 md:h-auto relative bg-secondary">
            {product.images && product.images.length > 0 ? (
              <Image
                src={getImageUrl(product.images[0])}
                alt={productName}
                fill
                className="object-contain"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                {t('no_image', lang)}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col overflow-y-auto">
            <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">{category}</div>
            
            <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
              {productName}
            </h2>
            
            <div className="text-xl md:text-2xl font-medium text-foreground mb-6 flex items-center">
               {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                 <span className="mr-1 inline-flex items-center">
                   <Image src="/riyal-dark.svg" alt="SAR" width={18} height={18} className="inline-block theme-light-only" />
                   <Image src="/riyal-light.svg" alt="SAR" width={18} height={18} className="theme-dark-only" />
                 </span>
               ) : (
                 <span dangerouslySetInnerHTML={{ __html: currencySymbol }} className="mr-1" />
               )}
               {displayPrice.toFixed(2)}
            </div>

            {description && (
              <div 
                className="prose prose-sm dark:prose-invert text-muted-foreground mb-6 line-clamp-3"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {/* Colors */}
            {availableColors.length > 0 && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground text-sm">
                    {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}: 
                    <span className="text-muted-foreground font-normal ml-2">
                      {availableColors.find((c: any) => (c.value?.en || c.value) === selectedColor)?.value?.[lang] || selectedColor}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((color: any) => {
                    const cEn = color.value?.en || color.value;
                    const cLocal = color.value?.[lang] || cEn;
                    const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-gray-300";

                    return (
                      <button 
                        key={color.id}
                        onClick={() => setSelectedColor(cEn)}
                        className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-all ${bgClass} ${selectedColor === cEn ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'}`}
                        title={cLocal}
                      >
                        {selectedColor === cEn && (bgClass.includes('white') || bgClass.includes('yellow')) && <Check className="w-4 h-4 text-black" />}
                        {selectedColor === cEn && !(bgClass.includes('white') || bgClass.includes('yellow')) && <Check className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-foreground text-sm">{sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}</span>
                </div>
                <div className="grid grid-cols-4 lg:grid-cols-5 gap-2">
                  {availableSizes.map((size: any) => {
                    const sEn = size.value?.en || size.value;
                    const sLocal = size.value?.[lang] || sEn;

                    return (
                      <button 
                        key={size.id}
                        onClick={() => setSelectedSize(sEn)}
                        className={`py-2 px-1 rounded-lg border text-xs font-medium transition-colors flex items-center justify-center
                          ${selectedSize === sEn ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary text-foreground'}`}
                      >
                        {sLocal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-auto pt-4 flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addedToCart || (hasVariations && (!selectedSize || !selectedColor))}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-full font-medium transition-all duration-300 ${
                  addedToCart
                    ? "bg-green-500 text-white scale-[1.02] shadow-lg shadow-green-200"
                    : "bg-btn-bg text-btn-text hover:bg-btn-bg/90 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-5 h-5 animate-in zoom-in duration-300" />
                    <span>{lang === 'ar' ? 'تمت الإضافة للسلة!' : 'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    {t('add_to_cart', lang)}
                  </>
                )}
              </button>
              
              <Link
                href={`/shop/${product.slug}`}
                onClick={onClose}
                className="w-full flex items-center justify-center py-4 rounded-full font-medium border border-border text-foreground hover:bg-muted transition-colors"
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
