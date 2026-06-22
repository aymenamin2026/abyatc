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

  // 🛠️ التخزين الموحد باستخدام المعرف الفريد ID لمنع أي تضارب في حالة الأحرف الكبيرة والصغيرة
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

  // 🛠️ تعيين القيم الافتراضية بالاعتماد على معرف الأتربيوت الفريد من الـ JSON
  useEffect(() => {
    if (attributes && attributes.length > 0) {
      const defaults: Record<string, string> = {};
      attributes.forEach((attr: any) => {
        if (attr.values && attr.values.length > 0) {
          // نستخدم الـ ID كمفتاح ثابت لا يخطئ ولا يتأثر بالحروف الكبيرة والصغيرة
          const key = String(attr.id);
          defaults[key] = attr.values[0].value?.en || attr.values[0].value;
        }
      });
      setSelectedAttributes(defaults);
    }
  }, [attributes]);

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

  // 🛠️ تحديث السعر والـ SKU بناءً على المعرفات المحددة
  let currentSku = product.sku || "1010";

  if (hasVariations && Object.keys(selectedAttributes).length > 0) {
    const variation = product.variations.find((v: any) => {
      if (v.options) {
        return Object.entries(selectedAttributes).every(([attrId, value]) => {
          // مطابقة مرنة داخل كائن الـ options الخاص بالفارييشن
          return String(v.options[attrId] || "").toLowerCase() === String(value).toLowerCase();
        });
      }
      // مطابقة احتياطية عبر الـ ID المباشر الممرر من الباك إند لارافيل
      return String(v.attribute_value_id) === String(selectedAttributes[String(v.attribute_id)]);
    });

    if (variation) {
      if (variation.price) displayPrice = parseFloat(variation.price).toFixed(2);
      if (variation.sku) currentSku = variation.sku;
    }
  }

  const handleAddToCart = async () => {
    const missingAttribute = attributes.some(attr => {
      return !selectedAttributes[String(attr.id)];
    });

    if (hasVariations && missingAttribute) {
      alert(lang === 'ar' ? 'يرجى تحديد جميع الخيارات المطلوبة للمنتج' : 'Please select all required product options');
      return;
    }

    setIsAddedToCart(true);

    const formattedOptions: Record<string, string> = {};
    attributes.forEach(attr => {
      const key = (attr.slug || attr.name?.en || "").toLowerCase();
      const selectedValueEn = selectedAttributes[String(attr.id)];
      const fullValueObj = attr.values.find((v: any) => (v.value?.en || v.value) === selectedValueEn);

      formattedOptions[key] = fullValueObj
        ? (fullValueObj.value?.[lang] || fullValueObj.value?.en || fullValueObj.value)
        : selectedValueEn || "N/A";
    });

    const baseSize = formattedOptions['size'] || "N/A";
    const extraOptions = Object.entries(formattedOptions)
      .filter(([key]) => key !== 'color' && key !== 'size')
      .map(([_, val]) => val)
      .join(' - ');

    await addToCart({
      product_id: product.id,
      name: product.name,
      image: images[0],
      color: formattedOptions['color'] || "N/A",
      size: extraOptions ? `${baseSize} (${extraOptions})` : baseSize,
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
    <div className="flex flex-col min-h-screen pt-32 pb-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-muted-foreground mb-8">
          <Link href="/" className="hover:text-foreground transition-colors">
            {lang === 'ar' ? 'الرئيسية' : 'Home'}
          </Link>
          <ChevronRight className={`w-4 h-4 mx-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <Link href="/shop" className="hover:text-foreground transition-colors">
            {t('shop', lang)}
          </Link>
          <ChevronRight className={`w-4 h-4 mx-2 ${lang === 'ar' ? 'rotate-180' : ''}`} />
          <span className="text-foreground">{catName}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {/* Image Gallery */}
          <div className="flex flex-col-reverse md:flex-row gap-3 md:gap-3 md:sticky md:top-24 h-fit">
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
                    unoptimized={true}
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
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground mb-2">{name}</h1>

            {/* SKU Section */}
            {currentSku && (
              <div className="text-sm text-muted-foreground mb-4">
                <span className="font-medium">{lang === 'ar' ? 'رمز المنتج :' : 'SKU :'}</span> <span className="font-mono">{currentSku}</span>
              </div>
            )}

            {/* Price & Rating Section */}
            <div className="flex items-center gap-4 mb-6">
              <div className="text-2xl font-semibold flex items-center">
                {shouldShowPrice ? (
                  <>
                    <span className={lang === 'ar' ? 'ml-1.5' : 'mr-1.5'}>{currencySymbol}</span>
                    <span>{displayPrice}</span>
                  </>
                ) : (
                  <div className="text-lg font-medium text-amber-600 bg-amber-50 px-4 py-2 rounded-full border border-amber-200">
                    {lang === 'ar' ? 'السعر غير معروض - راسلنا للاستفسار' : 'Price not shown - Contact us'}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <div className="flex text-amber-500">
                  {(() => {
                    const avg = reviews.length > 0 ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length : 0;
                    return [...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < Math.round(avg) ? 'fill-current' : 'text-muted-foreground opacity-30'}`} />
                    ));
                  })()}
                </div>
                <span>({reviews.length} {lang === 'ar' ? 'تقييمات' : 'Reviews'})</span>
              </div>
            </div>

            <div className={`text-muted-foreground mb-8 text-lg leading-relaxed max-w-none ${lang === 'ar' ? 'text-right' : 'text-left'}`} dangerouslySetInnerHTML={{ __html: desc }} />

            {/* 🛠️ قسم عرض الأتربيوتس الديناميكي المصلح بالكامل والمفلتر بناءً على مدخلات لوحة التحكم */}
            {attributes && attributes.length > 0 && attributes.map((attr: any) => {
              const attrName = attr.name?.[lang] || attr.name?.en || attr.name || "";
              const attrSlug = (attr.slug || "").toLowerCase();
              const attrIdKey = String(attr.id);

              // تصفية القيم لعرض القيم المحددة والنشطة فقط للمنتج الحالي
              const displayValues = attr.values.filter((val: any) => {
                if (!product.variations || product.variations.length === 0) return true;
                const valEn = String(val.value?.en || val.value || "").toUpperCase();

                return product.variations.some((v: any) => {
                  const sku = (v.sku || "").toUpperCase();
                  return (
                    v.attribute_value_id === val.id ||
                    sku.includes(`-${valEn}`) ||
                    sku.includes(`-${valEn}-`)
                  );
                });
              });

              if (displayValues.length === 0) return null;

              if (attrSlug === 'color') {
                return (
                  <div key={attr.id} className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-medium text-foreground">
                        {attrName}:
                        <span className="text-muted-foreground font-normal ml-2">
                          {displayValues.find((c: any) => (c.value?.en || c.value) === selectedAttributes[attrIdKey])?.value?.[lang] || selectedAttributes[attrIdKey]}
                        </span>
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      {displayValues.map((color: any) => {
                        const cEn = color.value?.en || color.value;
                        const cLocal = color.value?.[lang] || cEn;
                        const bgClass = colorClassMap[cEn.toLowerCase()] || "bg-gray-200 border border-gray-300";
                        const isSelected = selectedAttributes[attrIdKey] === cEn;

                        return (
                          <button
                            key={color.id}
                            onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrIdKey]: cEn }))}
                            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${bgClass} ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105' : 'hover:scale-110'}`}
                            title={cLocal}
                          >
                            {isSelected && (bgClass.includes('white') || bgClass.includes('yellow')) && <Check className="w-5 h-5 text-black" />}
                            {isSelected && !(bgClass.includes('white') || bgClass.includes('yellow')) && <Check className="w-5 h-5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div key={attr.id} className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-foreground">{attrName}</span>
                    {attrSlug === 'size' && (
                      <Link href="#" className="text-sm text-foreground hover:underline">Size Guide</Link>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {displayValues.map((val: any) => {
                      const vEn = val.value?.en || val.value;
                      const vLocal = val.value?.[lang] || vEn;
                      const isSelected = selectedAttributes[attrIdKey] === vEn;

                      return (
                        <button
                          key={val.id}
                          onClick={() => setSelectedAttributes(prev => ({ ...prev, [attrIdKey]: vEn }))}
                          className={`px-5 py-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center min-w-[70px]
                            ${isSelected
                              ? 'border-primary bg-primary text-primary-foreground shadow-sm scale-105'
                              : 'border-border bg-card hover:border-primary text-foreground hover:scale-102'
                            }`}
                        >
                          {vLocal}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {/* Actions Section */}
            <div className="flex gap-4 mb-4">
              <div className="flex items-center border border-border rounded-full px-4 h-14 bg-background">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-6 h-6 flex items-center justify-center text-xl hover:text-foreground transition-colors">-</button>
                <span className="w-10 text-center font-medium">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-6 h-6 flex items-center justify-center text-xl hover:text-foreground transition-colors">+</button>
              </div>

              <button
                onClick={handleAddToCart}
                className={`flex-1 h-14 rounded-full font-medium text-lg transition-all shadow-lg flex items-center justify-center
                  ${isAddedToCart ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-btn-bg text-btn-text hover:bg-btn-bg/90 hover:shadow-xl hover:-translate-y-0.5'}`}
                disabled={isAddedToCart || (hasVariations && attributes.some(attr => !selectedAttributes[String(attr.id)]))}
              >
                {isAddedToCart ? (
                  <span className="flex items-center gap-2"><Check className="w-5 h-5" /> {lang === 'ar' ? 'تمت الإضافة' : 'Added to Cart'}</span>
                ) : (
                  <>{t('add_to_cart', lang)}</>
                )}
              </button>

              <button className="w-14 h-14 bg-secondary flex items-center justify-center rounded-full text-foreground hover:bg-muted transition-colors border border-border">
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* WhatsApp Inquiry Button */}
            <div className="mb-8">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-14 bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-lg rounded-full shadow-lg transition-all transform hover:-translate-y-0.5 hover:shadow-xl text-center"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" clipRule="evenodd" />
                </svg>
                {lang === 'ar' ? 'طلب واستفسار عبر الواتساب' : 'Inquire via WhatsApp'}
              </a>
            </div>

          </div>
        </div>

        {/* Tabs - Details & Reviews */}
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
    </div>
  );
}