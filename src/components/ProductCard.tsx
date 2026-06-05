"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Heart } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";
import { useRouter } from "next/navigation";
import ProductQuickView from "@/components/ProductQuickView";

interface ProductCardProps {
  product: any;
  currencySymbol: string;
  index?: number;
  settings?: any; 
}

export default function ProductCard({ product, currencySymbol, index = 0, settings }: ProductCardProps) {
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [showQuickView, setShowQuickView] = useState(false);

  const name = product.name?.[lang] || product.name?.en || product.name || "Product Name";
  const image = getImageUrl(product.images?.[0]);

  const isFav = isInWishlist(product.id);
  const isTogglingThis = isToggling === product.id;

  const getDisplayPrice = () => {
    if (product.variations && product.variations.length > 0) {
      return parseFloat(product.variations[0].price || product.base_price || "0").toFixed(2);
    }
    return parseFloat(product.base_price || "0").toFixed(2);
  };

  const price = getDisplayPrice();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    toggleWishlist(product.id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };
// --- تجهيز رابط الواتساب ---
  // نتحقق من وجود الرقم في الـ settings بكافة المسميات المحتملة
  const rawNumber = settings?.whatsapp || settings?.whatsapp_phone || settings?.whatsapp_number || settings?.phone || settings?.contact_phone || "";
  
  // تنظيف الرقم من أي رموز أو مسافات (إذا لم يجد رقم ديناميكي سيستخدم الرقم الافتراضي المكتوب بالأسفل)
  const whatsappNumber = rawNumber ? rawNumber.replace(/\D/g, '') : "966500000000"; // <-- استبدل هذا بالرقم الافتراضي الخاص بك
  
  // بناء رابط المنتج الكامل بشكل يضمن ظهور اسم النطاق (الدومين)
  const siteUrl = typeof window !== "undefined" ? window.location.origin : "https://luluh.sa";
  const productUrl = `${siteUrl}/shop/${product.slug || product.id}`;

  // تجهيز نص الرسالة المنسق
  const messageText = `مرحباً، أود الاستفسار عن منتج: ${name}\nرابط المنتج: ${productUrl}`;
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;
  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
        className="group flex flex-col"
      >
        <div className="relative aspect-[3/4] bg-secondary rounded-xl overflow-hidden mb-4 border border-border/50 transition-shadow">
          <Link href={`/shop/${product.slug}`} className="block relative w-full h-full">
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </Link>

          {/* Wishlist Heart Button - Top Right */}
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingThis}
            className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-sm ${
              isFav
                ? "bg-red-500 text-white shadow-red-200 hover:bg-red-600"
                : "bg-white/80 text-gray-500 hover:bg-white hover:text-red-500"
            } ${isTogglingThis ? "scale-90 opacity-70" : "hover:scale-110"}`}
            title={isFav ? t('remove_from_wishlist' as any, lang as any) : t('add_to_wishlist' as any, lang as any)}
          >
            <Heart className={`w-4 h-4 transition-all ${isFav ? "fill-current" : ""} ${isTogglingThis ? "animate-pulse" : ""}`} />
          </button>
          
          {/* Hover Actions */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-6 flex justify-center gap-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            {/* 1. زر السلة */}
            <button 
              onClick={() => addToCart({
                product_id: product.id,
                name: product.name || name,
                image: image,
                color: "Default",
                size: "Default",
                price: parseFloat(price),
                quantity: 1
              })}
              className="w-10 h-10 bg-white text-zinc-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg hover:scale-105 active:scale-95"
              title={t('add_to_cart' as any, lang as any)}
            >
              <ShoppingCart className="w-4 h-4" />
            </button>

            {/* 2. زر العين (العرض السريع) */}
            <button
              onClick={handleQuickView}
              className="w-10 h-10 bg-white text-zinc-900 rounded-full flex items-center justify-center hover:bg-primary hover:text-white transition-colors shadow-lg hover:scale-105 active:scale-95"
              title={t('view_details' as any, lang as any)}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* 3. زر الواتساب */}
            {/* زر الواتساب يظهر دائماً للاختبار */}
<a
  href={whatsappUrl}
  target="_blank"
  rel="noopener noreferrer"
  onClick={(e) => e.stopPropagation()} 
  className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg hover:scale-105 active:scale-95"
  title={lang === 'ar' ? 'تواصل عبر الواتساب' : 'Contact via WhatsApp'}
>
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" clipRule="evenodd" />
  </svg>
</a>
          </div>
        </div>

        <div className="flex flex-col flex-1">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
            {product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || "Category"}
          </div>
          <Link href={`/shop/${product.slug}`}>
            <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1 mb-2">
              {name}
            </h3>
          </Link>
          <div className="mt-auto font-bold text-foreground flex items-center">
            {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
              <>
                <Image src="/riyal-dark.svg" alt="SAR" width={14} height={14} className={`inline-block theme-light-only ${lang === 'ar' ? 'ml-1' : 'mr-1'}`} />
                <Image src="/riyal-light.svg" alt="SAR" width={14} height={14} className={`theme-dark-only ${lang === 'ar' ? 'ml-1' : 'mr-1'}`} />
              </>
            ) : (
              <span className={lang === 'ar' ? 'ml-1' : 'mr-1'}>{currencySymbol}</span>
            )}
            <span>{price}</span>
          </div>
        </div>
      </motion.div>

      {/* QuickView Modal */}
      <ProductQuickView
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={product}
      />
    </>
  );
}