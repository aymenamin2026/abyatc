"use client";

import { useEffect, useState } from "react";
import { Heart, Trash2, ShoppingCart, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { fetchWishlist, getImageUrl, removeFromWishlist } from "@/lib/api";
import { useCart } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { t } from "@/lib/translations";

interface WishlistTabProps {
  lang: "en" | "ar";
  currencySymbol?: string;
}

export default function WishlistTab({ lang, currencySymbol = "SAR" }: WishlistTabProps) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const { addToCart } = useCart();
  const { refreshWishlist } = useWishlist();

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const data = await fetchWishlist();
      setItems(data.items || []);
    } catch (e) {
      console.error("Error loading wishlist:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId: number) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((item) => item.product_id !== productId));
      refreshWishlist();
    } catch (e) {
      console.error("Error removing from wishlist:", e);
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product: any) => {
    const image = getImageUrl(product.images?.[0]);
    const price = product.variations?.[0]?.price || product.base_price || "0";

    addToCart({
      product_id: product.id,
      name: product.name || "Product",
      image,
      color: "Default",
      size: "Default",
      price: parseFloat(price),
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm">{lang === "en" ? "Loading wishlist..." : "جاري تحميل المفضلة..."}</p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-500/10 text-red-400 flex items-center justify-center mb-6">
          <Heart className="w-10 h-10" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2 font-serif">
          {t("wishlist_empty" as any, lang)}
        </h3>
        <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
          {t("wishlist_empty_desc" as any, lang)}
        </p>
        <Link
          href="/shop"
          // 👈 تم استبدال bg-primary و text-primary-foreground بالألوان المباشرة مع الحفاظ على تأثير الـ hover الناعم
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#fbc70f] text-black font-semibold rounded-xl hover:brightness-95 transition-all shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          {t("browse_products" as any, lang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl font-bold text-foreground">
          {t("my_wishlist" as any, lang)}
        </h2>
        <span className="text-sm text-muted-foreground">
          {items.length} {lang === "en" ? "items" : "منتجات"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const name = product.name?.[lang] || product.name?.en || product.name || "Product";
            const image = getImageUrl(product.images?.[0]);
            const price = product.variations?.[0]?.price || product.base_price || "0";
            const categoryName = product.categories?.[0]?.name?.[lang] || product.categories?.[0]?.name?.en || "";

            return (
              <motion.div
                key={item.product_id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="group bg-secondary/30 rounded-2xl border border-border/50 overflow-hidden hover:shadow-lg transition-all duration-300"
              >
                {/* Product Image */}
                <Link href={`/shop/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden">
                  <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Remove button overlay */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(item.product_id);
                    }}
                    disabled={removingId === item.product_id}
                    className="absolute top-3 right-3 w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-all shadow-md opacity-0 group-hover:opacity-100 disabled:opacity-50"
                    title={t("remove_from_wishlist" as any, lang)}
                  >
                    {removingId === item.product_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </Link>

                {/* Product Info */}
                <div className="p-4 space-y-2">
                  {categoryName && (
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {categoryName}
                    </span>
                  )}
                  <Link href={`/shop/${product.slug}`}>
                    <h4 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-1">
                      {name}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-between pt-1">
                    {/* <span className="font-bold text-foreground">
                      {currencySymbol} {parseFloat(price).toFixed(2)}
                    </span> */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground text-xs font-semibold rounded-xl hover:opacity-90 transition-all"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {t("add_to_cart" as any, lang)}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
