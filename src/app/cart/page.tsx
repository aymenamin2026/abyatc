"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShieldCheck, Tag, ArrowLeft, X, ShoppingBag } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useCart } from "@/components/CartContext";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";
import { fetchSettings, validateCoupon } from "@/lib/api";

export default function CartPage() {
  const { lang } = useLanguage();
  const { items, updateQuantity, removeFromCart, subtotal, totalQuantity, appliedCoupon, setAppliedCoupon } = useCart();
  const [currencySymbol, setCurrencySymbol] = useState<string>("$");
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Modal state
  const [itemToRemove, setItemToRemove] = useState<string | number | null>(null);

  useEffect(() => {
    async function loadCurrency() {
      const settings = await fetchSettings();
      if (settings?.currency_symbol) setCurrencySymbol(settings.currency_symbol);
    }
    loadCurrency();
  }, []);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode) return;

    setCouponError(null);
    setIsApplyingCoupon(true);

    try {
      const result = await validateCoupon(couponCode, subtotal);
      if (result.success) {
        setAppliedCoupon(result.coupon);
        setCouponError(null);
      } else {
        let errorMsg = t(result.message as any, lang);
        if (result.message === 'min_spend_not_reached') {
          errorMsg = errorMsg.replace('{min}', result.min_spend.toString());
        }
        setCouponError(errorMsg);
      }
    } catch (err) {
      setCouponError(t('invalid_coupon', lang));
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const calculateDiscountValue = () => {
    if (!appliedCoupon) return 0;

    let discount = 0;
    if (appliedCoupon.type === 'percent') {
      discount = subtotal * (appliedCoupon.value / 100);
      if (appliedCoupon.max_discount && discount > appliedCoupon.max_discount) {
        discount = appliedCoupon.max_discount;
      }
    } else {
      discount = appliedCoupon.value;
    }

    return Math.min(discount, subtotal);
  };

  const discountValue = calculateDiscountValue();
  const total = subtotal - discountValue;

  // 1. حالة السلة الفارغة (Empty State) - بتصميم فخم ومتحرك
  if (items.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center bg-background relative overflow-hidden"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#093f89]/5 blur-[120px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="w-32 h-32 bg-gradient-to-br from-[#093f89]/10 to-transparent dark:from-[#fbc70f]/10 rounded-full flex items-center justify-center mb-8 shadow-inner border border-[#093f89]/10 dark:border-[#fbc70f]/20 relative z-10"
        >
          <ShoppingBag className="w-14 h-14 text-[#093f89] dark:text-[#fbc70f]" strokeWidth={1.5} />
        </motion.div>

        <h1 className="font-serif text-4xl font-bold mb-4 text-foreground relative z-10">
          {t('your_cart', lang)}
        </h1>
        <p className="text-muted-foreground mb-10 max-w-sm text-lg font-light relative z-10">
          {t('empty_cart', lang)}
        </p>

        <Link
          href="/shop"
          className="group relative px-10 py-4 bg-[#093f89] text-white rounded-full font-bold text-lg overflow-hidden shadow-[0_8px_30px_rgba(9,63,137,0.3)] hover:shadow-[0_8px_40px_rgba(251,199,15,0.3)] transition-all duration-300 hover:-translate-y-1 z-10"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
          <span className="relative z-10 group-hover:text-[#fbc70f] transition-colors">{t('shop_collection', lang)}</span>
        </Link>
      </motion.div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl relative">
      {/* إضاءة خلفية خفيفة جداً تعطي عمق للصفحة */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#fbc70f]/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center gap-4 mb-10 border-b border-border/40 pb-6">
        <Link href="/shop" className="text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] transition-all p-3 rounded-full hover:bg-secondary/50 group">
          <ArrowLeft className={`w-6 h-6 transition-transform group-hover:-translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
        </Link>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground tracking-tight">{t('your_cart', lang)}</h1>
        <span className="bg-[#093f89]/10 text-[#093f89] dark:bg-[#fbc70f]/10 dark:text-[#fbc70f] px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
          {t('items_count', lang).replace('{count}', totalQuantity.toString())}
        </span>
      </div>

      <div className="grid lg:grid-cols-12 gap-10 lg:gap-14">

        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card/40 backdrop-blur-md border border-[#093f89]/10 dark:border-border/50 rounded-[32px] overflow-hidden shadow-sm">

            {/* Header row (desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-border/50 bg-secondary/30 text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <div className="col-span-8">{t('product', lang)}</div>
              {/* <div className="col-span-2 text-center">{t('price', lang)}</div> */}
              <div className="col-span-4 text-center">{t('quantity', lang)}</div>
              {/* <div className="col-span-2 text-right">{t('total', lang)}</div> */}
            </div>

            {/* Item rows with AnimatePresence for smooth removal */}
            <div className="divide-y divide-border/50">
              <AnimatePresence>
                {items.map((item) => {

                  const itemName = typeof item.name === 'object' && item.name !== null
                    ? (item.name[lang] || item.name.en || "Product Name")
                    : (item.name || "Product Name");

                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
                      transition={{ duration: 0.3 }}
                      key={item.cart_item_id}
                      className="p-5 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-6 sm:items-center group hover:bg-secondary/20 transition-colors"
                    >

                      {/* Mobile Product Header */}
                      <div className="flex justify-between sm:hidden mb-2">
                        <span className="font-bold text-lg">{itemName}</span>
                        <button onClick={() => setItemToRemove(item.cart_item_id)} className="w-8 h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Product Details (Desktop: Col 8) */}
                      <div className="sm:col-span-8 flex items-start gap-5">
                        <div className="w-24 h-32 sm:w-28 sm:h-36 bg-secondary/50 rounded-2xl overflow-hidden flex-shrink-0 relative border border-border/50 shadow-sm group-hover:shadow-md transition-shadow">
                          <Image src={item.image} alt={itemName} fill className="object-cover transition-transform duration-500 group-hover:scale-110" />
                        </div>
                        <div className="flex flex-col justify-center h-full py-2">
                          <Link href={`/shop/${item.product_id}`} className="hidden sm:block font-bold text-lg hover:text-[#093f89] dark:hover:text-[#fbc70f] transition-colors mb-2 truncate">
                            {itemName}
                          </Link>
                          <div className="inline-flex items-center px-3 py-1 rounded-md bg-secondary text-sm text-muted-foreground font-medium border border-border/50 w-fit">
                            {typeof item.size === 'object' && item.size !== null ? (item.size[lang] || item.size.en) : item.size}
                          </div>

                          {/* Desktop Delete */}
                          <button
                            onClick={() => setItemToRemove(item.cart_item_id)}
                            className="hidden sm:flex mt-4 text-xs font-semibold text-muted-foreground hover:text-red-500 items-center gap-1.5 transition-colors w-fit"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> {t('delete', lang)}
                          </button>
                        </div>
                      </div>

                      {/* Quantity (Desktop: Col 4) */}
                      <div className="sm:col-span-4 flex justify-between sm:justify-center items-center mt-2 sm:mt-0">
                        <span className="sm:hidden text-muted-foreground text-sm font-medium">{t('quantity', lang)}:</span>
                        <div className="flex items-center border-2 border-[#093f89]/10 dark:border-border/60 rounded-xl h-12 bg-background w-fit overflow-hidden shadow-sm">
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="w-10 h-full flex items-center justify-center text-xl hover:bg-[#093f89]/5 hover:text-[#093f89] dark:hover:text-[#fbc70f] transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          >-</button>
                          <span className="w-12 text-center text-base font-bold border-x-2 border-[#093f89]/10 dark:border-border/60 h-full flex items-center justify-center bg-secondary/20">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                            className="w-10 h-full flex items-center justify-center text-xl hover:bg-[#093f89]/5 hover:text-[#093f89] dark:hover:text-[#fbc70f] transition-colors"
                          >+</button>
                        </div>
                      </div>

                      {/* الأسعار مكومنتة كما أرسلتها في الكود الأصلي لتتناسب مع متطلباتك */}
                      {/* <div className="sm:col-span-2 flex justify-between sm:justify-end items-center mt-2 sm:mt-0 font-bold text-lg gap-1">...</div> */}

                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-4">
          <div className="bg-card/60 backdrop-blur-2xl border border-[#093f89]/10 dark:border-[#fbc70f]/20 rounded-[32px] p-8 shadow-xl sticky top-28">
            <h2 className="text-2xl font-bold mb-8 font-serif text-foreground">{t('order_summary', lang)}</h2>

            {/* Promo Code section */}
            <div className="mb-8 pb-8 border-b border-border/50">
              {appliedCoupon ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-4 rounded-2xl flex items-center justify-between border border-green-200 dark:border-green-800 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <Tag className="w-5 h-5" />
                    <span className="font-bold text-lg">{appliedCoupon.code}</span>
                    <span className="text-sm font-medium opacity-80">
                      ({appliedCoupon.type === 'percent' ? `${appliedCoupon.value}%` : `${appliedCoupon.value} ${currencySymbol}`} off)
                    </span>
                  </div>
                  <button onClick={removeCoupon} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-green-200 dark:hover:bg-green-800 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ) : (
                <>
                  <form onSubmit={handleApplyCoupon} className="flex flex-col gap-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('coupon_code', lang)}</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. DISCOUNT20"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          if (couponError) setCouponError(null);
                        }}
                        className="flex-1 w-full px-5 py-3.5 border-2 border-border rounded-xl bg-background text-foreground font-medium focus:outline-none focus:border-[#093f89] dark:focus:border-[#fbc70f] transition-colors uppercase placeholder:normal-case"
                      />
                      <button
                        type="submit"
                        disabled={isApplyingCoupon || !couponCode}
                        className="px-6 py-3.5 bg-[#093f89] text-white rounded-xl font-bold hover:shadow-lg hover:bg-[#093f89]/90 hover:text-[#fbc70f] transition-all disabled:opacity-50 whitespace-nowrap"
                      >
                        {isApplyingCoupon ? "..." : t('apply', lang)}
                      </button>
                    </div>
                  </form>
                  <AnimatePresence>
                    {couponError && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-red-500 text-sm font-medium mt-3 flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> {couponError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            {/* Totals table (Subtotal & Total مكومنتة كما طلبت، لكن الكوبون يظهر إذا وجد) */}
            <div className="space-y-4 mb-8">
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400 items-center font-medium bg-green-50/50 dark:bg-green-900/10 p-3 rounded-lg">
                  <span>{t('discount', lang)}</span>
                  <span className="flex items-center gap-1 font-bold">
                    - {discountValue.toFixed(2)} {currencySymbol}
                  </span>
                </div>
              )}
            </div>

            <Link
              href="/checkout"
              className="group relative w-full flex items-center justify-center gap-3 bg-[#093f89] text-white py-5 rounded-2xl font-bold text-lg hover:shadow-[0_8px_30px_rgba(9,63,137,0.3)] dark:hover:shadow-[0_8px_30px_rgba(251,199,15,0.2)] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              <span className="relative z-10 group-hover:text-[#fbc70f] transition-colors">{t('secure_checkout', lang)}</span>
              <ArrowRight className={`relative z-10 w-5 h-5 transition-all duration-300 group-hover:text-[#fbc70f] ${lang === 'ar' ? 'group-hover:-translate-x-2 rotate-180' : 'group-hover:translate-x-2'}`} />
            </Link>

            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground font-medium bg-secondary/30 py-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-green-500" />
              {t('secure_payment_info', lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal - Glassmorphism & Spring Animation */}
      <AnimatePresence>
        {itemToRemove !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#093f89]/20 dark:bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-[32px] p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              {/* شريط زخرفي علوي */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 to-rose-400" />

              <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mb-6">
                <Trash2 className="w-7 h-7" />
              </div>

              <h3 className="font-serif text-2xl font-bold mb-3 text-foreground">{t('remove_item_title', lang)}</h3>
              <p className="text-muted-foreground mb-8 text-base leading-relaxed">
                {t('remove_item_confirm', lang)}
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => setItemToRemove(null)}
                  className="flex-1 px-4 py-3.5 border-2 border-border rounded-xl font-bold hover:bg-secondary transition-colors"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={() => {
                    removeFromCart(itemToRemove!);
                    setItemToRemove(null);
                  }}
                  className="flex-1 px-4 py-3.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 transition-all"
                >
                  {t('yes_remove', lang)}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}