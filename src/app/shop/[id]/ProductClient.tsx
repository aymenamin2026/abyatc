"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Truck, RefreshCw, ChevronRight, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, fetchShippingMethods, fetchReviews, checkReviewEligibility, submitReview } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import ProductCard from "@/components/ProductCard";

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

import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";

export default function ProductClient({
  product,
  attributes = [],
  currencySymbol = "$",
  relatedProducts = [],
  settings
}: {
  product: any,
  attributes?: any[],
  currencySymbol?: string,
  relatedProducts?: any[],
  settings?: any;
}) {
  const { lang } = useLanguage();
  const shouldShowPrice = product.show_price !== false && product.show_price !== 0;
  // Process images
  const images = product.images && product.images.length > 0
    ? product.images.map((img: string) => getImageUrl(img))
    : ["/no-image.jpg"];

  // --- تجهيز رابط الواتساب الديناميكي لصفحة التفاصيل ---
  const rawNumber = settings?.whatsapp || settings?.whatsapp_phone || settings?.whatsapp_number || settings?.phone || settings?.contact_phone || "";
  const whatsappNumber = rawNumber ? rawNumber.replace(/\D/g, '') : "966500000000";

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const productName = product.name?.[lang] || product.name?.en || product.name || "";
  const messageText = `مرحباً، أود الاستفسار عن منتج: ${productName}\nرابط المنتج: ${currentUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  const name = product.name?.[lang] || product.name?.en || product.name || "Product Name";
  const desc = product.description?.[lang] || product.description?.en || product.description || "No description available.";
  const catName = product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || product.categories?.[0]?.name || "Uncategorized";
  let displayPrice = parseFloat(product.base_price || "0").toFixed(2);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("details");
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZoomed, setIsZoomed] = useState(false);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const { addToCart } = useCart();

  // Extract from API
  const sizeAttr = attributes?.find((a: any) => a.slug === 'size' || a.name?.en === 'Size');
  const colorAttr = attributes?.find((a: any) => a.slug === 'color' || a.name?.en === 'Color');

  // Filter available options based on product variations
  const hasVariations = product.variations && product.variations.length > 0;

  const availableSizes = hasVariations && sizeAttr ? sizeAttr.values.filter((size: any) => {
    const sEn = size.value?.en || size.value;
    return product.variations.some((v: any) => v.sku?.endsWith(`-${sEn}`));
  }) : [];

  const availableColors = hasVariations && colorAttr ? colorAttr.values.filter((color: any) => {
    const cEn = color.value?.en || color.value;
    const prefix = cEn.substring(0, 3).toUpperCase();
    return product.variations.some((v: any) => v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`));
  }) : []; useEffect(() => {
    if (availableSizes.length > 0 && !selectedSize) {
      setSelectedSize(availableSizes[0].value?.en || availableSizes[0].value);
    }
    if (availableColors.length > 0 && !selectedColor) {
      setSelectedColor(availableColors[0].value?.en || availableColors[0].value);
    }
  }, [availableSizes, availableColors, selectedSize, selectedColor]);

  useEffect(() => {
    async function getShipping() {
      const methods = await fetchShippingMethods();
      const freeMethod = methods.find((m: any) => m.conditions?.free_shipping_minimum);
      if (freeMethod) {
        setFreeShippingThreshold(parseFloat(freeMethod.conditions.free_shipping_minimum));
      }
    }
    getShipping();
  }, []);

  useEffect(() => {
    async function loadReviews() {
      const [revs, eligibility] = await Promise.all([
        fetchReviews(product.id),
        checkReviewEligibility(product.id)
      ]);
      setReviews(revs);
      setCanReview(eligibility.can_review);
    }
    loadReviews();
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.comment.length < 5) return;

    setIsSubmittingReview(true);
    try {
      await submitReview({
        product_id: product.id,
        rating: newReview.rating,
        comment: newReview.comment
      });
      // Refresh reviews
      const updatedRevs = await fetchReviews(product.id);
      setReviews(updatedRevs);
      setNewReview({ rating: 5, comment: "" });
      setCanReview(false); // Can only review once or wait for moderation if that's the logic
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Adjust price if a specific variation is selected
  if (hasVariations && selectedSize && selectedColor) {
    const prefix = selectedColor.substring(0, 3).toUpperCase();
    const variation = product.variations.find((v: any) =>
      (v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`)) && v.sku?.endsWith(`-${selectedSize}`)
    );
    if (variation && variation.price) {
      displayPrice = parseFloat(variation.price).toFixed(2);
    }
  }

  const handleAddToCart = async () => {
    if (hasVariations && (!selectedSize || !selectedColor)) {
      alert(lang === 'ar' ? 'يرجى اختيار اللون والمقاس' : 'Please select color and size');
      return;
    }

    setIsAddedToCart(true);
    const colorValueObj = availableColors.find((c: any) => (c.value?.en || c.value) === selectedColor)?.value;
    const sizeValueObj = availableSizes.find((s: any) => (s.value?.en || s.value) === selectedSize)?.value;

    await addToCart({
      product_id: product.id,
      name: product.name,
      image: images[0],
      color: colorValueObj || selectedColor,
      size: sizeValueObj || selectedSize,
      price: parseFloat(displayPrice),
      quantity: quantity
    });

    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <div className="flex flex-col min-h-screen pt-4 pb-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">{t('shop', lang) === 'Shop' ? 'Home' : 'الرئيسية'}</Link>
          <ChevronRight className={`w-4 h-4 mx-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <Link href="/shop" className="hover:text-foreground transition-colors">{t('shop', lang)}</Link>
          <ChevronRight className={`w-4 h-4 mx-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span className="text-foreground">{catName}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">

          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-3 md:sticky md:top-24 h-fit">
            {/* Thumbnails */}
            <div className={`flex ${images.length > 8 ? 'md:grid md:grid-cols-2 md:w-[104px]' : 'md:flex-col md:w-12'} gap-2 overflow-x-auto flex-shrink-0 scrollbar-hide select-none h-fit self-start`}>
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-10 h-14 md:w-12 md:h-16 rounded-lg overflow-hidden border transition-all flex-shrink-0 ${activeImage === idx ? 'border-primary ring-1 ring-primary/20' : 'border-border/50 hover:border-primary/50'}`}
                >
                  <Image src={img} alt={`${name} thumbnail ${idx}`} fill className="object-contain" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className="relative flex-1 rounded-2xl overflow-hidden cursor-zoom-in group/main h-fit"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >

                  <Image
                    src={images[activeImage]}
                    alt={name}
                    width={1000}
                    height={1250}
                    unoptimized={true} // <--- أضف هذا السطر هنا
                    className="w-full h-auto object-contain transition-transform duration-200 ease-out"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZoomed ? 'scale(2.5)' : 'scale(1)'
                    }}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2"> {name}</h1>

            {/* SKU */}
            {(() => {
              let currentSku = product.sku || '';
              if (hasVariations && selectedSize && selectedColor) {
                const prefix = selectedColor.substring(0, 3).toUpperCase();
                const variation = product.variations.find((v: any) =>
                  (v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`)) && v.sku?.endsWith(`-${selectedSize}`)
                );
                if (variation?.sku) currentSku = variation.sku;
              }
              return currentSku ? (
                <div className="text-sm text-muted-foreground mb-4">
                  <span className="font-medium">{lang === 'ar' ? 'رمز المنتج' : 'SKU'}:</span> <span className="font-mono">{currentSku}</span>
                </div>
              ) : null;
            })()}

            <div className="flex items-center gap-4 mb-6">
              {/* <div className="text-2xl font-semibold flex items-center">
                {shouldShowPrice ? (
                  <>
                    {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                      <>
                        <Image src="/riyal-dark.svg" alt="SAR" width={20} height={20} className={`inline-block theme-light-only ${lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} />
                        <Image src="/riyal-light.svg" alt="SAR" width={20} height={20} className={`theme-dark-only ${lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}`} />
                      </>
                    ) : (
                      <span className={lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}>{currencySymbol}</span>
                    )}
                    <span>{displayPrice}</span>
                  </>
                ) : (
                  <div className="text-lg font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                    {lang === 'ar' ? 'السعر غير معروض - راسلنا للاستفسار' : 'Price not shown - Contact us'}
                  </div>
                )}
              </div> */}
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="flex text-amber-500">
                  {(() => {
                    const avg = reviews.length > 0
                      ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
                      : 0;
                    return [...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-current' : 'text-muted-foreground opacity-30'}`}
                      />
                    ));
                  })()}
                </div>
                <span>({reviews.length} {lang === 'ar' ? 'تقييمات' : 'Reviews'})</span>
              </div>
            </div>

            <div className={`text-muted-foreground mb-8 text-lg leading-relaxed max-w-none ${lang === 'ar' ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: desc }} />

            {/* Colors */}
            {availableColors.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-foreground">
                    {colorAttr?.name?.[lang] || colorAttr?.name?.en || "Color"}:
                    <span className="text-muted-foreground font-normal ml-2">
                      {availableColors.find((c: any) => (c.value?.en || c.value) === selectedColor)?.value?.[lang] || selectedColor}
                    </span>
                  </span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {availableColors.map((color: any) => {
                    const cEn = color.value?.en || color.value;
                    const cLocal = color.value?.[lang] || cEn;
                    const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-gray-300";

                    return (
                      <button
                        key={color.id}
                        onClick={() => setSelectedColor(cEn)}
                        className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${bgClass} ${selectedColor === cEn ? 'ring-2 ring-primary ring-offset-2' : 'hover:scale-110'}`}
                        title={cLocal}
                      >
                        {selectedColor === cEn && (bgClass.includes('white') || bgClass.includes('yellow')) && <Check className="w-5 h-5 text-black" />}
                        {selectedColor === cEn && !(bgClass.includes('white') || bgClass.includes('yellow')) && <Check className="w-5 h-5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-medium text-foreground">{sizeAttr?.name?.[lang] || sizeAttr?.name?.en || "Size"}</span>
                  <Link href="#" className="text-sm text-foreground hover:underline">Size Guide</Link>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                  {availableSizes.map((size: any) => {
                    const sEn = size.value?.en || size.value;
                    const sLocal = size.value?.[lang] || sEn;

                    return (
                      <button
                        key={size.id}
                        onClick={() => setSelectedSize(sEn)}
                        className={`py-3 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center
                          ${selectedSize === sEn ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:border-primary text-foreground'}`}
                      >
                        {sLocal}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4 mb-4">
              {/* إظهار اختيار الكمية فقط إذا كان السعر متاحاً */}

              <div className="flex items-center border border-border rounded-full px-4 h-14 bg-background">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 flex items-center justify-center text-xl hover:text-foreground transition-colors">-</button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 flex items-center justify-center text-xl hover:text-foreground transition-colors">+</button>
              </div>


              {/* زر إضافة للسلة يظهر فقط إذا كان السعر متاحاً */}
              <button
                onClick={handleAddToCart}
                className={`flex-1 h-14 rounded-full font-medium text-lg transition-all shadow-lg flex items-center justify-center
                  ${isAddedToCart
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-btn-bg text-btn-text hover:bg-btn-bg/90 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                disabled={(hasVariations && (!selectedColor || !selectedSize)) || isAddedToCart}
              >
                {isAddedToCart ? (
                  <span className="flex items-center gap-2"><Check className="w-5 h-5" /> {t('add_to_cart', lang) === 'Add to Cart' ? 'Added to Cart' : 'تمت الإضافة'}</span>
                ) : (
                  <>
                    {t('add_to_cart', lang)}
                  </>
                )}
              </button>

              <button className="w-14 h-14 bg-secondary flex items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors border border-border">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* زر الواتساب الديناميكي المنسق لصفحة التفاصيل */}
            <div className="mb-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-lg rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 text-center"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" clipRule="evenodd" />
                </svg>
                {lang === 'ar' ? 'طلب واستفسار عبر الواتساب' : 'Inquire via WhatsApp'}
              </a>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-4 py-6 border-y border-border mb-8">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Truck className="w-5 h-5 text-foreground" />
                <span className="flex items-center gap-1 flex-wrap">
                  {lang === 'ar' ? 'شحن مجاني للطلبات فوق' : 'Free shipping over'}
                  <span className="font-semibold flex items-center gap-1">
                    {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                      <>
                        <Image src="/riyal-dark.svg" alt="SAR" width={14} height={14} className={`inline-block theme-light-only ${lang === 'ar' ? 'ml-1' : 'mr-1'}`} />
                        <Image src="/riyal-light.svg" alt="SAR" width={14} height={14} className={`theme-dark-only ${lang === 'ar' ? 'ml-1' : 'mr-1'}`} />
                        <span>{lang === 'ar' ? 'ر.س' : 'SAR'}</span>
                      </>
                    ) : (
                      <span>{currencySymbol}</span>
                    )}
                    <span>{freeShippingThreshold || 100}</span>
                  </span>
                </span>
              </div>
              {/* <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <RefreshCw className="w-5 h-5 text-foreground" />
                <span>{t('free_returns', lang)}</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Tabs - Full Width */}
        <div className="mt-16 pt-8 border-t border-border">
          <div className="flex gap-8 border-b border-border mb-8 overflow-x-auto scrollbar-hide">
            {['details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 font-medium text-base transition-colors relative capitalize whitespace-nowrap ${activeTab === tab ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t(tab as any, lang as any)}
                {activeTab === tab && (
                  <motion.div layoutId="activeTabBadge" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            ))}
          </div>
          <div className={`text-muted-foreground text-base leading-relaxed max-w-4xl ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'details' ? (
                  <div dangerouslySetInnerHTML={{ __html: desc }} />
                ) : (
                  <div className="space-y-12">
                    {/* Review Form (Only for eligible customers) */}
                    {canReview && (
                      <div className="bg-secondary/30 p-8 rounded-2xl border border-border">
                        <h4 className="font-serif text-xl font-bold mb-4">
                          {lang === 'ar' ? 'أضف تقييمك' : 'Add your review'}
                        </h4>
                        <form onSubmit={handleSubmitReview} className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'التقييم' : 'Rating'}</label>
                            <div className="flex gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className={`p-1 transition-transform hover:scale-110`}
                                >
                                  <Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground opacity-30'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">{lang === 'ar' ? 'تعليقك' : 'Your comment'}</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full bg-background border border-border rounded-xl p-4 min-h-[100px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm leading-relaxed"
                              placeholder={lang === 'ar' ? 'اكتب رأيك هنا...' : 'Write your review here...'}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingReview || newReview.comment.length < 5}
                            className="bg-primary text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                          >
                            {isSubmittingReview ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : null}
                            {lang === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-8">
                      {reviews && reviews.length > 0 ? (
                        reviews.map((review: any, idx: number) => (
                          <div key={idx} className="border-b border-border pb-8 last:border-0">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-foreground font-bold text-sm">
                                  {review.customer_name?.charAt(0) || 'C'}
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground text-sm">{review.customer_name || 'Customer'}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                                  </div>
                                </div>
                              </div>
                              <div className="flex text-amber-500">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-current' : 'opacity-20'}`} />
                                ))}
                              </div>
                            </div>
                            <p className="text-sm italic leading-relaxed text-muted-foreground pl-13">
                              "{review.comment}"
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="py-16 text-center border border-dashed border-border rounded-2xl bg-secondary/10">
                          <p className="text-muted-foreground">
                            {lang === 'ar' ? 'لا توجد تقييمات بعد. كن أول من يقيم هذا المنتج!' : 'No reviews yet. Be the first to review this product!'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Related Products - Full Width Section Matching Home Featured */}
      {relatedProducts.length > 0 && (
        <section className="py-24 bg-background border-t border-border/50 mt-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className={`font-serif text-3xl md:text-4xl font-bold text-foreground mb-3 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {t('related_products' as any, lang as any)}
                </h2>
                <p className={`text-muted-foreground ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
                  {lang === 'ar' ? 'اكتشف المزيد من هذه الفئة' : 'Explore more from this category'}
                </p>
              </div>
              <Link href="/shop" className="hidden md:flex items-center gap-1 text-foreground font-medium hover:text-foreground/80 transition-colors">
                {t('view_all_products' as any, lang as any)}
                <ChevronRight className={`w-4 h-4 ${lang === 'ar' ? 'rotate-180' : ''}`} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProducts.map((p: any, i: number) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  currencySymbol={currencySymbol}
                  index={i}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
