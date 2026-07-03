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

  const isRtl = lang === "ar";
  const name = product.name?.[lang] || product.name?.en || product.name || "Product Name";
  const image = getImageUrl(product.images?.[0]);

  const isFav = isInWishlist(product.id);
  const isTogglingThis = isToggling === product.id;

  const shouldShowPrice = product.show_price !== false && product.show_price !== 0;

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

  const rawNumber =
    settings?.whatsapp ||
    settings?.whatsapp_phone ||
    settings?.whatsapp_number ||
    settings?.phone ||
    settings?.contact_phone ||
    settings?.data?.whatsapp ||
    settings?.settings?.whatsapp ||
    "";

  const whatsappNumber = rawNumber ? String(rawNumber).replace(/\D/g, "") : "966500000000";

  const messageText = shouldShowPrice
    ? `مرحباً، أود الاستفسار عن منتج: ${name}\nرابط المنتج: ${productUrl}`
    : `مرحباً، أود طلب تسعيرة للمنتج: ${name}\nالسعر غير معروض بالمتجر.\nرابط المنتج: ${productUrl}`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(messageText)}`;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
        className="group flex flex-col w-full h-full"
      >
        {/* IMAGE CONTAINER WITH LUXURY GLASS EFFECT */}
        <div className="relative aspect-[4/5] bg-card rounded-[2rem] overflow-hidden mb-5 border border-border/60 shadow-sm group-hover:shadow-[0_20px_40px_rgba(9,63,137,0.12)] dark:group-hover:shadow-[0_20px_40px_rgba(251,199,15,0.05)] transition-all duration-500 ease-in-out z-10">
          <Link
            href={`/shop/${product.slug}`}
            className="block relative w-full h-full overflow-hidden"
          >
            {/* Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#093f89]/5 to-transparent dark:from-[#fbc70f]/5 pointer-events-none z-0" />

            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 z-10 mix-blend-multiply dark:mix-blend-normal"
              priority={index < 4}
            />

            {/* Gradient Overlay for bottom actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
          </Link>

          {/* WISHLIST BUTTON - Floating at top */}
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingThis}
            className={`absolute top-4 end-4 z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border backdrop-blur-md shadow-sm ${isFav
                ? "bg-red-500/90 text-white border-red-500 hover:bg-red-600"
                : "bg-white/70 dark:bg-gray-900/70 text-muted-foreground border-white/40 dark:border-white/10 hover:bg-white dark:hover:bg-gray-800 hover:text-red-500 hover:border-red-200"
              } ${isTogglingThis ? "scale-90 opacity-70 cursor-wait" : "hover:scale-110 active:scale-95"}`}
            title={isFav ? t("remove_from_wishlist", lang) : t("add_to_wishlist", lang)}
            aria-label="Toggle Wishlist"
          >
            <Heart className={`w-4 h-4 transition-all ${isFav ? "fill-current" : ""} ${isTogglingThis ? "animate-pulse" : ""}`} />
          </button>

          {/* LUXURY HOVER ACTIONS CONTAINER */}
          <div className="absolute inset-x-4 bottom-4 bg-white/20 dark:bg-black/40 backdrop-blur-xl border border-white/30 dark:border-white/10 py-3 px-5 rounded-2xl flex justify-center items-center gap-4 z-20 shadow-xl transition-all duration-500 ease-out opacity-0 translate-y-6 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto">

            {/* 1. ADD TO CART */}
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
                className="w-10 h-10 bg-[#093f89] text-white dark:bg-[#fbc70f] dark:text-[#093f89] rounded-full flex items-center justify-center hover:bg-[#072a5e] dark:hover:bg-[#e5b300] transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
                title={t("add_to_cart", lang)}
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            )}

            {/* 2. QUICK VIEW */}
            <button
              onClick={handleQuickView}
              className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 text-[#093f89] dark:text-[#fbc70f] border border-transparent hover:border-[#093f89]/30 dark:hover:border-[#fbc70f]/30 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
              title={t("view_details", lang)}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* 3. WHATSAPP */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center hover:bg-emerald-600 transition-all duration-300 shadow-md hover:shadow-lg hover:scale-110 active:scale-95"
              title={lang === "ar" ? "تواصل عبر الواتساب" : "Contact via WhatsApp"}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>

        {/* PRODUCT DETAILS AREA */}
        <div className="flex flex-col flex-1 px-2">
          {/* CATEGORY METADATA */}
          <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70 mb-2 line-clamp-1">
            {product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || "Category"}
          </div>

          {/* PRODUCT NAME TITLE */}
          <Link href={`/shop/${product.slug}`} className="group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors duration-300">
            <h3 className="font-serif text-base sm:text-lg text-foreground font-semibold tracking-wide line-clamp-1 mb-3">
              {name}
            </h3>
          </Link>

          {/* DYNAMIC PRICE DETAILS */}
          <div className="mt-auto flex items-center">
            {shouldShowPrice ? (
              <div className="flex items-center text-[#093f89] dark:text-[#fbc70f]">
                {currencySymbol === "/riyal-light.svg" || currencySymbol === "/riyal-dark.svg" ? (
                  <div className="flex items-center">
                    <Image src="/riyal-dark.svg" alt="SAR" width={14} height={14} className={`inline-block dark:hidden ${isRtl ? "ml-1.5" : "mr-1.5"}`} />
                    <Image src="/riyal-light.svg" alt="SAR" width={14} height={14} className={`hidden dark:inline-block ${isRtl ? "ml-1.5" : "mr-1.5"}`} />
                  </div>
                ) : (
                  <span className={`text-sm font-medium opacity-80 ${isRtl ? "ml-1.5" : "mr-1.5"}`}>
                    {currencySymbol}
                  </span>
                )}
                <span className="text-lg font-bold tracking-wider">{price}</span>
              </div>
            ) : (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all duration-300 shadow-sm"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" />
                </svg>
                <span className="text-xs font-bold tracking-wide">
                  {lang === "ar" ? "السعر عبر واتساب" : "Get Price"}
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