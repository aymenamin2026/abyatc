"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Heart, Truck, RefreshCw, ChevronRight, Check, ShieldCheck, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getImageUrl, fetchShippingMethods, fetchReviews, checkReviewEligibility, submitReview } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import ProductCard from "@/components/ProductCard";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";

// خريطة ألوان افتراضية للمتغيرات (Colors)
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

  // تجهيز الصور
  const images = product.images && product.images.length > 0
    ? product.images.map((img: string) => getImageUrl(img))
    : ["/no-image.jpg"];

  // تجهيز رابط الواتساب الديناميكي
  const rawNumber = settings?.whatsapp || settings?.whatsapp_phone || settings?.whatsapp_number || settings?.phone || settings?.contact_phone || "";
  const whatsappNumber = rawNumber ? rawNumber.replace(/\D/g, '') : "966500000000";

  const getDynamicWhatsappUrl = () => {
    const currentUrl = typeof window !== "undefined" ? window.location.href : "";
    const productName = product.name?.[lang] || product.name?.en || product.name || "";

    const selectedOptionsText = productAttributes
      .map((attr: any) => {
        const key = (attr.slug || `attr_${attr.id}`).toLowerCase();
        const attrName = attr.name?.[lang] || attr.name?.en || attr.name;
        const selectedValueEn = selectedAttributes[key];
        const fullValueObj = attr.values.find((v: any) => (v.value?.en || v.value) === selectedValueEn);
        const value = fullValueObj ? (fullValueObj.value?.[lang] || fullValueObj.value?.en || fullValueObj.value) : selectedValueEn;
        return value ? `${attrName}: ${value}` : null;
      })
      .filter(Boolean)
      .join(" - ");

    const attributesPart = selectedOptionsText ? `\nالمواصفات المختارة: (${selectedOptionsText})` : "";
    const messageText = `مرحباً، أود الاستفسار عن: ${productName}${attributesPart}\nرابط المنتج: ${currentUrl}`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
  };

  const name = product.name?.[lang] || product.name?.en || product.name || "Product Name";
  const desc = product.description?.[lang] || product.description?.en || product.description || "No description available.";
  const catName = product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || product.categories?.[0]?.name || "Uncategorized";
  let displayPrice = parseFloat(product.base_price || "0").toFixed(2);

  const [activeImage, setActiveImage] = useState(0);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
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

  const hasVariations = product.variations && product.variations.length > 0;

  // تعيين القيم الافتراضية للسمات
  useEffect(() => {
    if (!attributes?.length || !product?.variations?.length) return;
    const usedAttributeIds = new Set<number>();
    product.variations.forEach((variation: any) => Object.keys(variation.options || {}).forEach((id) => usedAttributeIds.add(Number(id))));

    const defaults: Record<string, string> = {};
    attributes.filter((attr: any) => usedAttributeIds.has(attr.id)).forEach((attr: any) => {
      const usedValueIds = new Set<number>();
      product.variations.forEach((variation: any) => {
        const valueId = variation.options?.[String(attr.id)];
        if (valueId) usedValueIds.add(Number(valueId));
      });
      const firstValue = attr.values?.find((v: any) => usedValueIds.has(v.id));
      if (firstValue) {
        const key = attr.slug || `attr_${attr.id}`;
        defaults[key] = firstValue.value?.en || firstValue.value;
      }
    });
    setSelectedAttributes(defaults);
  }, [attributes, product]);

  // جلب معلومات الشحن والمراجعات
  useEffect(() => {
    async function fetchData() {
      const methods = await fetchShippingMethods();
      const freeMethod = methods.find((m: any) => m.conditions?.free_shipping_minimum);
      if (freeMethod) setFreeShippingThreshold(parseFloat(freeMethod.conditions.free_shipping_minimum));

      const [revs, eligibility] = await Promise.all([fetchReviews(product.id), checkReviewEligibility(product.id)]);
      setReviews(revs);
      setCanReview(eligibility.can_review);
    }
    fetchData();
  }, [product.id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newReview.comment.length < 5) return;
    setIsSubmittingReview(true);
    try {
      await submitReview({ product_id: product.id, rating: newReview.rating, comment: newReview.comment });
      const updatedRevs = await fetchReviews(product.id);
      setReviews(updatedRevs);
      setNewReview({ rating: 5, comment: "" });
      setCanReview(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // تحديث السعر حسب التغيرات
  if (hasVariations && Object.keys(selectedAttributes).length > 0) {
    const sizeSelection = selectedAttributes['size'] || selectedAttributes['Size'] || selectedAttributes[attributes.find(a => a.slug?.toLowerCase() === 'size')?.slug];
    const colorSelection = selectedAttributes['color'] || selectedAttributes['Color'] || selectedAttributes[attributes.find(a => a.slug?.toLowerCase() === 'color')?.slug];

    if (sizeSelection && colorSelection) {
      const prefix = colorSelection.substring(0, 3).toUpperCase();
      const variation = product.variations.find((v: any) =>
        (v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`)) && v.sku?.endsWith(`-${sizeSelection}`)
      );
      if (variation && variation.price) displayPrice = parseFloat(variation.price).toFixed(2);
    }
  }

  const productAttributes = attributes.filter((attr: any) =>
    product.variations?.some((variation: any) => variation.options?.[String(attr.id)])
  );

  const handleAddToCart = async () => {
    try {
      const missingAttribute = productAttributes.some(attr => !selectedAttributes[attr.slug || `attr_${attr.id}`]);
      if (hasVariations && missingAttribute) {
        alert(lang === 'ar' ? 'يرجى تحديد جميع الخيارات المطلوبة' : 'Please select all required product options');
        return;
      }
      setIsAddedToCart(true);
      const formattedOptions: Record<string, string> = {};
      productAttributes.forEach(attr => {
        const key = attr.slug || `attr_${attr.id}`;
        const selectedValueEn = selectedAttributes[key];
        const fullValueObj = attr.values.find((v: any) => (v.value?.en || v.value) === selectedValueEn);
        formattedOptions[key.toLowerCase()] = fullValueObj ? (fullValueObj.value?.[lang] || fullValueObj.value?.en || fullValueObj.value) : selectedValueEn || "N/A";
      });

      const selectedOptionsText = productAttributes.map((attr: any) => {
        const key = (attr.slug || `attr_${attr.id}`).toLowerCase();
        const attrName = attr.name?.[lang] || attr.name?.en || attr.name;
        return `${attrName}: ${formattedOptions[key] || ""}`;
      }).join(" | ");

      await addToCart({
        product_id: product.id,
        name: product.name?.[lang] || product.name?.en,
        image: images[0],
        color: "",
        size: selectedOptionsText,
        price: parseFloat(displayPrice),
        quantity: quantity
      });

      setTimeout(() => setIsAddedToCart(false), 2000);
    } catch (error) {
      console.error("ADD TO CART ERROR:", error);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col min-h-screen pt-32 pb-24 bg-background"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8 bg-secondary/20 w-fit px-4 py-2 rounded-full border border-border/50">
          <Link href="/" className="hover:text-primary transition-colors">{t('shop', lang) === 'Shop' ? 'Home' : 'الرئيسية'}</Link>
          <ChevronRight className={`w-4 h-4 mx-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <Link href="/shop" className="hover:text-primary transition-colors">{t('shop', lang)}</Link>
          <ChevronRight className={`w-4 h-4 mx-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span className="text-foreground font-medium">{catName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">

          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-4 md:sticky md:top-32 h-fit">
            {/* Thumbnails */}
            <div className={`flex ${images.length > 8 ? 'md:grid md:grid-cols-2 md:w-[104px]' : 'md:flex-col md:w-20'} gap-3 overflow-x-auto flex-shrink-0 scrollbar-hide select-none h-fit self-start pb-2 md:pb-0`}>
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative w-16 h-20 md:w-20 md:h-24 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 
                    ${activeImage === idx ? 'border-primary shadow-md scale-105' : 'border-border/50 hover:border-primary/50 opacity-70 hover:opacity-100'}`}
                >
                  <Image src={img} alt={`${name} thumbnail ${idx}`} fill className="object-cover" />
                </button>
              ))}
            </div>

            {/* Main Image */}
            <div
              className="relative flex-1 rounded-3xl overflow-hidden cursor-zoom-in group/main h-fit bg-secondary/10 border border-border/50 shadow-sm"
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeImage}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={images[activeImage]}
                    alt={name}
                    width={1000}
                    height={1250}
                    unoptimized={true}
                    className="w-full h-auto object-contain transition-transform duration-200 ease-out min-h-[400px] md:min-h-[500px]"
                    style={{
                      transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                      transform: isZoomed ? 'scale(2)' : 'scale(1)'
                    }}
                    priority
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Product Info */}
          <div className="flex flex-col pt-4">
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight"> {name}</h1>

            {/* SKU */}
            {(() => {
              let currentSku = product.sku || '';
              const sizeSelection = selectedAttributes['size'];
              const colorSelection = selectedAttributes['color'];
              if (hasVariations && sizeSelection && colorSelection) {
                const prefix = colorSelection.substring(0, 3).toUpperCase();
                const variation = product.variations.find((v: any) =>
                  (v.sku?.includes(`-${prefix}-`) || v.sku?.includes(`-${prefix}`)) && v.sku?.endsWith(`-${sizeSelection}`)
                );
                if (variation?.sku) currentSku = variation.sku;
              }
              return currentSku ? (
                <div className="text-sm text-muted-foreground mb-6 bg-secondary/30 w-fit px-3 py-1 rounded-md border border-border">
                  <span className="font-medium">{lang === 'ar' ? 'رمز المنتج' : 'SKU'}:</span> <span className="font-mono tracking-wider">{currentSku}</span>
                </div>
              ) : null;
            })()}

            <div className="flex flex-wrap items-center gap-6 mb-8 pb-8 border-b border-border">
              <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-900/50">
                <div className="flex text-amber-500">
                  {(() => {
                    const avg = reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length : 0;
                    return [...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-current' : 'text-muted-foreground opacity-30'}`} />
                    ));
                  })()}
                </div>
                <span className="text-sm font-medium text-amber-700 dark:text-amber-400">({reviews.length} {lang === 'ar' ? 'تقييمات' : 'Reviews'})</span>
              </div>
            </div>

            <div className={`text-muted-foreground mb-8 text-base md:text-lg leading-relaxed max-w-none ${lang === 'ar' ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: desc }} />

            {/* السمات الديناميكية (Attributes) */}
            {attributes && attributes.length > 0 && productAttributes.map((attr: any) => {
              const attrName = attr.name?.[lang] || attr.name?.en || attr.name || "";
              const attrSlug = attr.slug || attr.name?.en?.toLowerCase() || "";
              const displayValues = attr.values.filter((val: any) => {
                if (!product.variations || product.variations.length === 0) return true;
                return product.variations.some((variation: any) => {
                  if (!variation.options) return false;
                  return Object.entries(variation.options).some(([attributeId, valueId]) => Number(attributeId) === Number(attr.id) && Number(valueId) === Number(val.id));
                });
              });

              if (displayValues.length === 0) return null;

              if (attrSlug === 'color') {
                return (
                  <div key={attr.id} className="mb-8 bg-secondary/10 p-4 rounded-2xl border border-border/50">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-foreground text-lg">
                        {attrName}: <span className="text-primary font-bold ml-2">
                          {displayValues.find((c: any) => (c.value?.en || c.value) === selectedAttributes[attrSlug])?.value?.[lang] || selectedAttributes[attrSlug]}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {displayValues.map((color: any) => {
                        const cEn = color.value?.en || color.value;
                        const cLocal = color.value?.[lang] || cEn;
                        const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-gray-300";
                        const isSelected = selectedAttributes[attrSlug] === cEn;

                        return (
                          <button
                            key={color.id}
                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrSlug]: cEn }))}
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${bgClass} ${isSelected ? 'ring-4 ring-primary/50 ring-offset-2 ring-offset-background scale-110 shadow-lg' : 'hover:scale-110 hover:shadow-md'}`}
                            title={cLocal}
                          >
                            {isSelected && <Check className={`w-6 h-6 ${bgClass.includes('white') || bgClass.includes('yellow') ? 'text-black' : 'text-white'}`} />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={attr.id} className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium text-foreground text-lg">{attrName}</span>
                    {attrSlug === 'size' && <Link href="#" className="text-sm text-primary hover:underline">{lang === 'ar' ? 'دليل المقاسات' : 'Size Guide'}</Link>}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                    {displayValues.map((val: any) => {
                      const vEn = val.value?.en || val.value;
                      const vLocal = val.value?.[lang] || vEn;
                      const isSelected = selectedAttributes[attrSlug] === vEn;

                      return (
                        <button
                          key={val.id}
                          onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrSlug]: vEn }))}
                          className={`py-3 px-2 rounded-xl border-2 text-sm font-bold transition-all duration-200 flex items-center justify-center
                            ${isSelected ? 'border-primary bg-primary/10 text-primary shadow-sm scale-105' : 'border-border bg-card hover:border-primary/50 text-foreground hover:bg-secondary/50'}`}
                        >
                          {vLocal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 mt-4">
              <div className="flex items-center border-2 border-border rounded-2xl px-2 h-16 bg-background sm:w-1/3">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-secondary rounded-xl transition-colors">-</button>
                <span className="flex-1 text-center font-bold text-lg">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-2xl hover:bg-secondary rounded-xl transition-colors">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 h-16 rounded-2xl font-bold text-lg transition-all duration-300 shadow-lg flex items-center justify-center gap-3
                  ${isAddedToCart ? 'bg-green-500 text-white shadow-green-500/25 scale-[0.98]' : 'bg-[#fbc70f] text-primary-foreground hover:bg-primary/90 hover:shadow-primary/25 hover:-translate-y-1'}`}
                disabled={isAddedToCart || (hasVariations && productAttributes.some(attr => !selectedAttributes[attr.slug || attr.name?.en?.toLowerCase()]))}
              >
                {isAddedToCart ? (
                  <>
                    <Check className="w-6 h-6 animate-in zoom-in" />
                    {t('add_to_cart', lang) === 'Add to Quote Request' ? 'Added Successfully' : 'تمت الإضافة بنجاح'}
                  </>
                ) : (
                  <>

                    {t('add_to_cart', lang)}
                  </>
                )}
              </button>

              <button className="w-16 h-16 bg-secondary/50 flex items-center justify-center rounded-2xl text-foreground hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all border-2 border-transparent">
                <Heart className="w-6 h-6" />
              </button>
            </div>

            {/* زر الواتساب الديناميكي */}
            <div className="mb-10">
              <a
                href={getDynamicWhatsappUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 w-full h-16 bg-gradient-to-r from-emerald-400 to-emerald-600 text-white font-bold text-lg rounded-2xl shadow-lg shadow-emerald-500/25 transition-all duration-300 hover:-translate-y-1 hover:shadow-emerald-500/40"
              >
                <svg className="w-7 h-7 group-hover:animate-bounce" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" clipRule="evenodd" />
                </svg>
                {lang === 'ar' ? 'اطلب أو استفسر عبر واتساب' : 'Order or Inquire via WhatsApp'}
              </a>
            </div>

            {/* Guarantees Section (أضيف لتعزيز ثقة العميل) */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-border/60">
              {/* <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-secondary/20">
                <ShieldCheck className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">{lang === 'ar' ? 'دفع آمن 100%' : 'Secure Checkout'}</span>
              </div> */}
              <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-secondary/20">
                <Truck className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">{lang === 'ar' ? 'شحن سريع وموثوق' : 'Fast Shipping'}</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center p-3 rounded-xl bg-secondary/20 col-span-2 md:col-span-1">
                <Clock className="w-8 h-8 text-primary mb-2" />
                <span className="text-sm font-medium text-foreground">{lang === 'ar' ? 'دعم فني متواصل' : '24/7 Support'}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabs - Full Width */}
        <div className="mt-24 pt-8 border-t border-border">
          <div className="flex justify-center gap-8 md:gap-16 border-b border-border mb-12 overflow-x-auto scrollbar-hide">
            {['details', 'reviews'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 font-bold text-lg md:text-xl transition-colors relative capitalize whitespace-nowrap 
                  ${activeTab === tab ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
              >
                {t(tab as any, lang as any)}
                {activeTab === tab && (
                  <motion.div layoutId="activeTabBadge" className="absolute bottom-[-1px] left-0 right-0 h-1 bg-primary rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          <div className={`mx-auto max-w-5xl ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                {activeTab === 'details' ? (
                  <div className="prose prose-lg dark:prose-invert max-w-none bg-card p-8 rounded-3xl border border-border shadow-sm" dangerouslySetInnerHTML={{ __html: desc }} />
                ) : (
                  <div className="space-y-12">

                    {/* نموذج المراجعة (Review Form) */}
                    {canReview && (
                      <div className="bg-gradient-to-br from-secondary/50 to-background p-8 rounded-3xl border border-border shadow-sm">
                        <h4 className="font-serif text-2xl font-bold mb-6 text-foreground">
                          {lang === 'ar' ? 'أضف تقييمك وتجربتك' : 'Share your experience'}
                        </h4>
                        <form onSubmit={handleSubmitReview} className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium mb-3 text-muted-foreground">{lang === 'ar' ? 'التقييم' : 'Rating'}</label>
                            <div className="flex gap-2 bg-background w-fit p-2 rounded-full border border-border">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewReview({ ...newReview, rating: star })}
                                  className="p-1.5 transition-transform hover:scale-125 focus:outline-none"
                                >
                                  <Star className={`w-7 h-7 ${star <= newReview.rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground opacity-20'}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-3 text-muted-foreground">{lang === 'ar' ? 'تعليقك' : 'Your comment'}</label>
                            <textarea
                              value={newReview.comment}
                              onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                              className="w-full bg-background border border-border rounded-2xl p-5 min-h-[120px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-base transition-all resize-y"
                              placeholder={lang === 'ar' ? 'اكتب رأيك بصراحة هنا...' : 'Write your honest review here...'}
                              required
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={isSubmittingReview || newReview.comment.length < 5}
                            className="bg-primary text-primary-foreground px-10 py-4 rounded-full text-base font-bold hover:bg-primary/90 hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-3 w-full md:w-auto"
                          >
                            {isSubmittingReview && <RefreshCw className="w-5 h-5 animate-spin" />}
                            {lang === 'ar' ? 'إرسال التقييم' : 'Submit Review'}
                          </button>
                        </form>
                      </div>
                    )}

                    {/* قائمة المراجعات (Reviews List) - تم استكمالها */}
                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {reviews.map((review, idx) => (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: idx * 0.1 }}
                              key={review.id || idx}
                              className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-shadow"
                            >
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                    {(review.user_name || review.customer_name || 'C')[0].toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="font-bold text-foreground block">{review.user_name || review.customer_name || (lang === 'ar' ? 'عميل' : 'Customer')}</span>
                                    <div className="flex text-amber-500 mt-1">
                                      {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3.5 h-3.5 ${i < (review.rating || 5) ? 'fill-current' : 'opacity-20'}`} />
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                {review.created_at && (
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(review.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US')}
                                  </span>
                                )}
                              </div>
                              <p className="text-muted-foreground text-sm leading-relaxed">{review.comment}</p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-16 bg-secondary/20 rounded-3xl border border-border border-dashed">
                          <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                          <h5 className="text-lg font-bold text-foreground mb-2">{lang === 'ar' ? 'لا توجد تقييمات بعد' : 'No reviews yet'}</h5>
                          <p className="text-muted-foreground">{lang === 'ar' ? 'كن أول من يقيم هذا المنتج!' : 'Be the first to review this product!'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* قسم المنتجات ذات الصلة (Related Products) */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-32 pt-16 border-t border-border">
            <div className="flex items-center justify-between mb-10">
              <h3 className="font-serif text-3xl font-bold text-foreground">
                {lang === 'ar' ? 'قد يعجبك أيضاً' : 'You May Also Like'}
              </h3>
              <Link href="/shop" className="text-primary hover:underline font-medium text-sm hidden sm:block">
                {lang === 'ar' ? 'عرض الكل' : 'View All'}
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} currencySymbol={currencySymbol} />
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}