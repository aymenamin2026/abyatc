"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight, ShieldCheck, Tag, ArrowLeft, X } from "lucide-react";
import { useState, useEffect } from "react";
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

    return Math.min(discount, subtotal); // Cannot discount more than subtotal
  };

  const discountValue = calculateDiscountValue();
  const total = subtotal - discountValue;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        </div>
        <h1 className="font-serif text-3xl font-bold mb-4">{t('your_cart', lang)}</h1>
        <p className="text-muted-foreground mb-8 max-w-sm">
          {t('empty_cart', lang)}
        </p>
        <Link
          href="/shop"
          className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors"
        >
          {t('shop_collection', lang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary">
          <ArrowLeft className={`w-5 h-5 ${lang === 'ar' ? 'rotate-180' : ''}`} />
        </Link>
        <h1 className="font-serif text-4xl font-bold">{t('your_cart', lang)}</h1>
        <span className="text-muted-foreground bg-secondary px-3 py-1 rounded-full text-sm font-medium">
          {t('items_count', lang).replace('{count}', totalQuantity.toString())}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
            {/* Header row (desktop) */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-border bg-secondary/30 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <div className="col-span-6">{t('product', lang)}</div>
              <div className="col-span-2 text-center">{t('price', lang)}</div>
              <div className="col-span-2 text-center">{t('quantity', lang)}</div>
              <div className="col-span-2 text-right">{t('total', lang)}</div>
            </div>

            {/* Item rows */}
            <div className="divide-y divide-border">
              {items.map((item) => {
                const itemName = typeof item.name === 'object' && item.name !== null
                  ? (item.name[lang] || item.name.en || "Product Name")
                  : (item.name || "Product Name");

                return (
                  <div key={item.cart_item_id} className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:items-center">

                    {/* Mobile Product Header */}
                    <div className="flex justify-between sm:hidden mb-2">
                      <span className="font-medium">{itemName}</span>
                      <button onClick={() => setItemToRemove(item.cart_item_id)} className="text-muted-foreground hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Product Details (Desktop: Col 6) */}
                    <div className="sm:col-span-6 flex items-start gap-4">
                      <div className="w-20 h-28 sm:w-24 sm:h-32 bg-secondary rounded-lg overflow-hidden flex-shrink-0 relative">
                        <Image src={item.image} alt={itemName} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/shop/${item.product_id}`} className="hidden sm:block font-medium hover:text-primary transition-colors mb-1 truncate">
                          {itemName}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          {typeof item.color === 'object' && item.color !== null ? (item.color[lang] || item.color.en) : item.color} | {t('size', lang)} {typeof item.size === 'object' && item.size !== null ? (item.size[lang] || item.size.en) : item.size}
                        </div>
                        {/* Mobile Delete */}
                        <button
                          onClick={() => setItemToRemove(item.cart_item_id)}
                          className="hidden sm:flex mt-4 text-xs text-muted-foreground hover:text-red-500 items-center gap-1 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> {t('delete', lang)}
                        </button>
                      </div>
                    </div>

                    {/* Price (Desktop: Col 2) */}
                    <div className="hidden sm:flex sm:col-span-2 justify-center items-center gap-1 font-medium">
                      {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                        <>
                          <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
                          <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
                        </>
                      ) : (
                        <span>{currencySymbol}</span>
                      )}
                      {item.price.toFixed(2)}
                    </div>

                    {/* Quantity (Desktop: Col 2) */}
                    <div className="sm:col-span-2 flex justify-between sm:justify-center items-center mt-2 sm:mt-0">
                      <span className="sm:hidden text-muted-foreground text-sm">{t('quantity', lang)}:</span>
                      <div className="flex items-center border border-border rounded-full h-9 bg-background w-fit">
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-full flex items-center justify-center text-lg hover:text-primary transition-colors disabled:opacity-30"
                        >-</button>
                        <span className="w-8 text-center text-sm font-medium border-x border-border h-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          className="w-8 h-full flex items-center justify-center text-lg hover:text-primary transition-colors"
                        >+</button>
                      </div>
                    </div>

                    {/* Total (Desktop: Col 2) */}
                    <div className="sm:col-span-2 flex justify-between sm:justify-end items-center mt-2 sm:mt-0 font-semibold text-lg sm:text-base gap-1">
                      <span className="sm:hidden text-muted-foreground text-sm font-normal">{t('total', lang)}:</span>
                      {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                        <>
                          <Image src="/riyal-dark.svg" alt="SAR" width={14} height={14} className="inline-block theme-light-only" />
                          <Image src="/riyal-light.svg" alt="SAR" width={14} height={14} className="theme-dark-only" />
                        </>
                      ) : (
                        <span>{currencySymbol}</span>
                      )}
                      {(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Order Summary & Checkout */}
        <div className="lg:col-span-1">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold mb-6 font-serif">{t('order_summary', lang)}</h2>

            {/* Promo Code section */}
            <div className="mb-6 pb-6 border-b border-border">
              {appliedCoupon ? (
                <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 p-3 rounded-lg flex items-center justify-between border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span className="font-semibold">{appliedCoupon.code}</span>
                    <span className="text-sm">({appliedCoupon.type === 'percent' ? `${appliedCoupon.value}%` : `${appliedCoupon.value} ${currencySymbol}`} off)</span>
                  </div>
                  <button onClick={removeCoupon} className="hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <input
                      type="text"
                      placeholder={t('coupon_code', lang)}
                      value={couponCode}
                      onChange={(e) => {
                        setCouponCode(e.target.value);
                        if (couponError) setCouponError(null);
                      }}
                      className="flex-1 w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                      type="submit"
                      disabled={isApplyingCoupon || !couponCode}
                      className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg font-medium hover:bg-secondary/80 transition-colors disabled:opacity-50 whitespace-nowrap"
                    >
                      {isApplyingCoupon ? "..." : t('apply', lang)}
                    </button>
                  </form>
                  {couponError && (
                    <p className="text-red-500 text-xs mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                      {couponError}
                    </p>
                  )}
                </>
              )}
            </div>

            {/* Totals table */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-muted-foreground items-center">
                <span>{t('subtotal', lang)}</span>
                <span className="font-medium text-foreground flex items-center gap-1">
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

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 dark:text-green-400 items-center">
                  <span>{t('discount', lang)} ({appliedCoupon.code})</span>
                  <span className="flex items-center gap-1">-
                    {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                      <>
                        <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
                        <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
                      </>
                    ) : (
                      <span>{currencySymbol}</span>
                    )}
                    {discountValue.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-muted-foreground">
                <span>{t('shipping', lang)}</span>
                <span>{t('calculated_at_checkout', lang)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>{t('taxes', lang)}</span>
                <span>{t('calculated_at_checkout', lang)}</span>
              </div>

              <div className="pt-4 mt-4 border-t border-border flex justify-between items-center text-xl font-bold">
                <span>{t('total', lang)}</span>
                <span className="flex items-center gap-1">
                  {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                    <>
                      <Image src="/riyal-dark.svg" alt="SAR" width={16} height={16} className="inline-block theme-light-only" />
                      <Image src="/riyal-light.svg" alt="SAR" width={16} height={16} className="theme-dark-only" />
                    </>
                  ) : (
                    <span>{currencySymbol}</span>
                  )}
                  {total.toFixed(2)}
                </span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-bold text-lg hover:bg-primary/90 transition-all shadow-md hover:shadow-lg group"
            >
              {t('secure_checkout', lang)} <ArrowRight className={`w-5 h-5 transition-transform ${lang === 'ar' ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
            </Link>

            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-600" />
              {t('secure_payment_info', lang)}
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {itemToRemove !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-in fade-in zoom-in duration-200">
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
          </div>
        </div>
      )}
    </div>
  );
}