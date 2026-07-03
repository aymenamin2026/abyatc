"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ShoppingCart, Eye, Heart } from "lucide-react";

import { getImageUrl } from "@/lib/api";
import { t } from "@/lib/translations";

import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import ProductQuickView from "@/components/ProductQuickView";

interface ProductCardProps {
  product: any;
  currencySymbol: string;
  index?: number;
  settings?: any;
}

export default function ProductCard({
  product,
  currencySymbol,
  index = 0,
  settings,
}: ProductCardProps) {
  const { lang } = useLanguage();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist, isToggling } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();

  const [showQuickView, setShowQuickView] = useState(false);
  const [productUrl, setProductUrl] = useState("");

  const name = product.name?.[lang] || product.name?.en || product.name || "Product Name";
  const image = getImageUrl(product.images?.[0]);

  const isFav = isInWishlist(product.id);
  const isTogglingThis = isToggling === product.id;

  const shouldShowPrice = product.show_price !== false && product.show_price !== 0;

  // حل مشكلة Hydration: تحديد الرابط فقط بعد تحميل المكون في المتصفح
  useEffect(() => {
    setProductUrl(`${window.location.origin}/shop/${product.slug || product.id}`);
  }, [product.slug, product.id]);

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
  const rawNumber =
    settings?.whatsapp ||
    settings?.whatsapp_phone ||
    settings?.whatsapp_number ||
    settings?.phone ||
    settings?.contact_phone ||
    "";

  const whatsappNumber = rawNumber
    ? rawNumber.replace(/\D/g, "")
    : "966500000000";

  const siteUrl =
    typeof window !== "undefined" ? window.location.origin : "https://abyatc.vercel.app";
  const productUrl = `${siteUrl}/shop/${product.slug || product.id}`;

  // تكييف نص الرسالة بناءً على ما إذا كان السعر معروضاً أو مخفياً لطلب تسعيرة
  const messageText = shouldShowPrice
    ? `مرحباً، أود الاستفسار عن منتج: ${name}\nرابط المنتج: ${productUrl}`
    : `مرحباً، أود طلب تسعيرة للمنتج: ${name}\nالسعر غير معروض بالمتجر.\nرابط المنتج: ${productUrl}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.08 }}
        className="group flex flex-col w-full h-full"
      >
        {/* IMAGE CONTAINER WITH PREMIUM GLASS EFFECT */}
        <div className="relative aspect-[3/4] bg-muted/20 rounded-[24px] sm:rounded-[28px] overflow-hidden mb-4 sm:mb-5 border border-border/40 group-hover:border-primary/30 group-hover:shadow-[0_20px_50px_rgba(var(--primary-rgb),0.08)] transition-all duration-500 z-10">
          <Link
            href={`/shop/${product.slug}`}
            className="block relative w-full h-full overflow-hidden"
          >
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              priority={index < 3}
            />
          </Link>

          {/* WISHLIST BUTTON */}
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingThis}
            className={`absolute top-3 end-3 sm:top-4 sm:end-4 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md shadow-sm ${isFav
              ? "bg-red-500/90 text-white border-red-500 hover:bg-red-600"
              : "bg-background/60 text-foreground/70 border-border/40 hover:bg-background hover:text-red-500"
              } ${isTogglingThis ? "scale-90 opacity-70 cursor-wait" : "hover:scale-110 active:scale-95"}`}
            title={isFav ? t("remove_from_wishlist", lang) : t("add_to_wishlist", lang)}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all ${isFav ? "fill-current" : ""} ${isTogglingThis ? "animate-pulse" : ""}`} />
          </button>

          {/* HOVER ACTIONS CONTAINER */}
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 bg-background/80 dark:bg-card/80 backdrop-blur-xl border border-border/40 py-2.5 px-4 sm:py-3.5 sm:px-6 rounded-xl sm:rounded-2xl flex justify-center items-center gap-3 sm:gap-4 z-20 shadow-xl transition-all duration-300 ease-out opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">
            {shouldShowPrice && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart({
                    product_id: product.id,
                    name: product.name || name,
                    image: image,
                    color: "Default",
                    size: "Default",
                    price: parseFloat(price),
                    quantity: 1,
                  });
                }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-foreground text-background rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
                title={t("add_to_cart", lang)}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={handleQuickView}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-muted text-foreground border border-border/60 rounded-full flex items-center justify-center hover:bg-background transition-all duration-300 shadow-sm hover:scale-105 active:scale-95"
              title={t("view_details", lang)}
            >
              <Eye className="w-4 h-4" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:scale-105 active:scale-95"
              title={lang === "ar" ? "تواصل عبر الواتساب" : "Contact via WhatsApp"}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* DETAILS AREA */}
        <div className="flex flex-col flex-1 px-1 sm:px-2">
          <div className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] font-medium text-muted-foreground/80 mb-1.5 sm:mb-2 line-clamp-1">
            {product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || "Category"}
          </div>

          <Link href={`/shop/${product.slug}`} className="group-hover/title:text-primary">
            <h3 className="font-light text-sm sm:text-base text-foreground group-hover:text-primary tracking-wide transition-colors line-clamp-1 mb-2">
              {name}
            </h3>
          </Link>

          <div className="mt-auto font-medium text-xs sm:text-sm text-foreground flex items-center tracking-wider">
            {shouldShowPrice ? (
              <>
                {currencySymbol === "/riyal-light.svg" || currencySymbol === "/riyal-dark.svg" ? (
                  <div className="flex items-center">
                    <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className={`inline-block dark:hidden ${lang === "ar" ? "ml-1" : "mr-1"}`} />
                    <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className={`hidden dark:inline-block ${lang === "ar" ? "ml-1" : "mr-1"}`} />
                  </div>
                ) : (
                  <span className={`font-light text-muted-foreground ${lang === "ar" ? "ml-1" : "mr-1"}`}>
                    {currencySymbol}
                  </span>
                )}
                <span className="text-sm sm:text-base font-semibold text-foreground/90">{price}</span>
              </>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all duration-300 shadow-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" />
                </svg>
                <span className="text-[11px] font-semibold">
                  {lang === "ar" ? "اطلب السعر واتساب" : "Get Price"}
                </span>
              </a>
            )}
          </div>
        </div>
      </motion.div>

      {/* QUICKVIEW MODAL */}
      <ProductQuickView
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        product={product}
      />
    </>
  );
}