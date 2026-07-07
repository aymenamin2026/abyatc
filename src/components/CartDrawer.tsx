"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ArrowRight, ShieldCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "./CartContext";

import { t } from "@/lib/translations";
import { useLanguage } from "./LanguageContext";
import { fetchSettings } from "@/lib/api";

export default function CartDrawer({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { lang } = useLanguage();
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [pricesIncludeTax, setPricesIncludeTax] = useState<boolean>(true);

  useEffect(() => {
    async function loadSettings() {
      const settings = await fetchSettings();
      if (settings?.currency_symbol) setCurrencySymbol(settings.currency_symbol);
      if (settings?.prices_include_tax !== undefined) setPricesIncludeTax(Boolean(settings.prices_include_tax));
    }
    loadSettings();
  }, []);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      setItemToRemove(null); // Reset modal on close
    }
    return () => { document.body.style.overflow = "unset" };
  }, [isOpen]);

  const { items: cartItems, subtotal, removeFromCart, updateQuantity } = useCart();
  const [itemToRemove, setItemToRemove] = useState<string | number | null>(null);

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
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: lang === 'ar' ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: lang === 'ar' ? "-100%" : "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed top-0 ${lang === 'ar' ? 'left-0' : 'right-0'} h-full w-full sm:w-[500px] bg-background shadow-2xl z-[101] flex flex-col`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b border-border`}>
              <h2 className="font-serif text-2xl font-bold">{t('your_cart', lang)}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-full transition-colors"
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cartItems.map((item) => {
                const itemName = typeof item.name === 'object' && item.name !== null
                  ? (item.name[lang] || item.name.en || "Product Name")
                  : (item.name || "Product Name");

                return (
                  <div key={item.cart_item_id} className="flex gap-4">
                    <div className="relative w-24 h-32 rounded-md bg-secondary overflow-hidden flex-shrink-0">
                      <Image src={item.image} alt={itemName} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-medium text-foreground">{itemName}</h3>
                        <button
                          onClick={() => setItemToRemove(item.cart_item_id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {typeof item.color === 'object' && item.color !== null ? (item.color[lang] || item.color.en) : item.color} | {typeof item.size === 'object' && item.size !== null ? (item.size[lang] || item.size.en) : item.size}
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <div className="flex items-center border border-border rounded-full px-2 h-9 bg-background">
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-6 h-6 flex items-center justify-center text-lg hover:text-primary transition-colors disabled:opacity-30"
                          >-</button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-lg hover:text-primary transition-colors"
                          >+</button>
                        </div>
                        {/* <div className="font-semibold flex items-center gap-1">
                          {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                            <>
                              <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
                              <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
                            </>
                          ) : (
                            <span>{currencySymbol}</span>
                          )}
                          {(item.price * item.quantity).toFixed(2)}
                        </div> */}
                      </div>
                    </div>
                  </div>
                );
              })}
              {cartItems.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-12">
                  <p>{t('empty_cart', lang)}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-border p-6 bg-muted/30">
              {/* <div className="flex justify-between mb-2">
                <span className="text-muted-foreground">{t('subtotal', lang)}</span>
                <span className="font-semibold flex items-center gap-1">
                  {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                    <>
                      <Image src="/riyal-dark.svg" alt="SAR" width={14} height={14} className="inline-block theme-light-only" />
                      <Image src="/riyal-light.svg" alt="SAR" width={14} height={14} className="theme-dark-only" />
                    </>
                  ) : (
                    <span>{currencySymbol}</span>
                  )}
                  {subtotal.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                {pricesIncludeTax ? t('shipping_calculated_checkout', lang) || "Shipping calculated at checkout. Taxes are included." : t('shipping_taxes_calculated', lang) || "Shipping & taxes calculated at checkout."}
              </p> */}

              <div className="flex flex-col gap-3">
                <Link
                  href="/cart"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-[#fbc70f] text-[#093f89] py-3 rounded-full font-semibold text-lg hover:bg-[#e2b30d] transition-all border border-[#fbc70f] dark:bg-[#fbc70f] dark:text-[#093f89] dark:hover:bg-[#e2b30d] shadow-sm"
                >
                  {t('view_cart', lang)}
                </Link>
                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-full font-medium text-lg hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl group"
                >
                  {t('checkout', lang)} <ArrowRight className={`w-5 h-5 transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                </Link>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="w-4 h-4 text-green-600" /> {t('secure_checkout', lang)}
              </div>
            </div>
          </motion.div>

          {/* Remove Confirmation Modal Overlay */}
          <AnimatePresence>
            {itemToRemove !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[105] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-background border border-border rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative z-[106]"
                >
                  <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">{t('remove_item_title', lang)}</h3>
                  <p className="text-muted-foreground mb-8 text-sm">
                    {t('remove_item_confirm', lang)}
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setItemToRemove(null)}
                      className="flex-1 px-4 py-3 border border-border rounded-xl font-medium hover:bg-secondary transition-colors"
                    >
                      {t('cancel', lang)}
                    </button>
                    <button
                      onClick={() => {
                        removeFromCart(itemToRemove!);
                        setItemToRemove(null);
                      }}
                      className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors shadow-sm"
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
