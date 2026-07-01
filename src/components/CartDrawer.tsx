"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ArrowRight, ShoppingBag } from "lucide-react";

import { useCart } from "./CartContext";
import { useLanguage } from "./LanguageContext";
import { t } from "@/lib/translations";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang } = useLanguage();
  const { items: cartItems, removeFromCart, updateQuantity } = useCart();

  const [itemToRemove, setItemToRemove] = useState<string | number | null>(null);
  const isRtl = lang === 'ar';

  // 1. تحسين تجربة إغلاق النافذة: دعم زر الـ Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (itemToRemove !== null) {
          setItemToRemove(null); // إغلاق نافذة التأكيد أولاً إذا كانت مفتوحة
        } else {
          onClose(); // إغلاق السلة
        }
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
      setItemToRemove(null);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, itemToRemove, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: isRtl ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 250 }}
            className={`fixed top-0 ${isRtl ? 'start-0' : 'end-0'} h-full w-full sm:w-[450px] bg-card shadow-2xl z-[101] flex flex-col border-s border-border`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/60 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary/10 text-primary rounded-full">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h2 id="cart-title" className="font-serif text-xl sm:text-2xl font-bold text-foreground">
                  {t('your_cart', lang)}
                  <span className="text-sm font-normal text-muted-foreground ms-2 block sm:inline">
                    ({cartItems.length} {cartItems.length === 1 ? (lang === 'en' ? 'item' : 'عنصر') : (lang === 'en' ? 'items' : 'عناصر')})
                  </span>
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 bg-background hover:bg-muted text-foreground border border-border/50 rounded-full transition-colors shadow-sm hover:scale-105 active:scale-95"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 custom-scrollbar">
              {cartItems.length > 0 ? (
                cartItems.map((item) => {
                  const itemName = typeof item.name === 'object' && item.name !== null
                    ? (item.name[lang] || item.name.en || "Product Name")
                    : (item.name || "Product Name");

                  return (
                    <motion.div
                      key={item.cart_item_id}
                      layout // يضيف حركة ناعمة عند الحذف أو تعديل الترتيب
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-4 p-3 rounded-2xl bg-muted/10 border border-border/40 hover:border-primary/30 transition-colors group"
                    >
                      {/* 2. تحسين أداء الصور باستخدام sizes مخصصة للسلة */}
                      <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-xl bg-background border border-border overflow-hidden flex-shrink-0">
                        <Image
                          src={item.image || '/no-image.jpg'}
                          alt={itemName}
                          fill
                          sizes="96px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>

                      <div className="flex-1 flex flex-col py-1">
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <Link href={`/shop`} onClick={onClose} className="font-medium text-sm sm:text-base text-foreground hover:text-primary transition-colors line-clamp-2">
                            {itemName}
                          </Link>
                          <button
                            onClick={() => setItemToRemove(item.cart_item_id)}
                            className="p-1.5 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0"
                            aria-label={`Remove ${itemName} from cart`}
                          >
                            <Trash2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
                          </button>
                        </div>

                        <div className="text-xs sm:text-sm text-muted-foreground mb-3 flex flex-wrap gap-2">
                          <span className="bg-background px-2 py-1 rounded-md border border-border/50 inline-block">
                            {typeof item.size === "object" ? (item.size[lang] || item.size.en) : item.size}
                          </span>
                          {item.color && item.color !== 'Default' && (
                            <span className="bg-background px-2 py-1 rounded-md border border-border/50 inline-block">
                              {typeof item.color === "object" ? (item.color[lang] || item.color.en) : item.color}
                            </span>
                          )}
                        </div>

                        <div className="mt-auto flex items-center justify-between">
                          <div className="flex items-center border border-border rounded-xl px-1 h-8 sm:h-9 bg-background shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-lg text-foreground hover:bg-muted rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                              aria-label="Decrease quantity"
                            >-</button>
                            <span className="w-8 text-center text-sm font-medium text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-lg text-foreground hover:bg-muted rounded-lg transition-colors"
                              aria-label="Increase quantity"
                            >+</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12 px-4 text-center">
                  <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6 border-8 border-background shadow-inner">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{t('empty_cart', lang)}</h3>
                  <p className="text-sm max-w-[250px] mx-auto mb-8 leading-relaxed">
                    {lang === 'en' ? "Looks like you haven't added anything to your cart yet." : "يبدو أنك لم تضف أي منتجات إلى سلتك حتى الآن."}
                  </p>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all shadow-md active:scale-95"
                  >
                    {t('shop', lang)}
                  </button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            {cartItems.length > 0 && (
              <div className="border-t border-border/60 p-5 sm:p-6 bg-muted/10 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] dark:shadow-none z-10">
                <div className="flex flex-col gap-3">
                  <Link
                    href="/cart"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-background text-foreground py-3.5 rounded-full font-medium hover:bg-muted transition-all border border-border shadow-sm active:scale-[0.98]"
                  >
                    {t('view_cart', lang)}
                  </Link>
                  <Link
                    href="/checkout"
                    onClick={onClose}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-full font-bold text-lg hover:opacity-90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl active:scale-[0.98] group"
                  >
                    {t('checkout', lang)}
                    <ArrowRight className={`w-5 h-5 transition-transform ${isRtl ? 'group-hover:-translate-x-1.5 rotate-180' : 'group-hover:translate-x-1.5'}`} />
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Remove Confirmation Modal Overlay */}
          <AnimatePresence>
            {itemToRemove !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0, y: 20 }}
                  className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative z-[106] text-center"
                >
                  <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Trash2 className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-xl font-bold mb-3 text-foreground">{t('remove_item_title', lang)}</h3>
                  <p className="text-muted-foreground mb-8 text-sm">
                    {t('remove_item_confirm', lang)}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setItemToRemove(null)}
                      className="flex-1 px-4 py-3 bg-muted text-foreground rounded-xl font-medium hover:bg-secondary transition-colors"
                    >
                      {t('cancel', lang)}
                    </button>
                    <button
                      onClick={() => {
                        removeFromCart(itemToRemove!);
                        setItemToRemove(null);
                      }}
                      className="flex-1 px-4 py-3 bg-rose-600 text-white rounded-xl font-medium hover:bg-rose-700 transition-colors shadow-md shadow-rose-600/20"
                    >
                      {t('yes_remove', lang)}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}