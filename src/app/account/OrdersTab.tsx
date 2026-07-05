"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X, Eye, Truck, AlertCircle } from "lucide-react";

import { fetchCustomerOrders, fetchSettings, getImageUrl } from "@/lib/api";
import { t } from "@/lib/translations";

// 1. Types Definitions
interface OrderItem {
  id: string | number;
  product?: { name?: any; images?: string[]; image?: string };
  name?: string;
  image?: string;
  unit_price?: string | number;
  price?: string | number;
  quantity: number;
  color?: string;
  size?: string;
  total?: string | number;
}

interface Order {
  id: string | number;
  order_number: string;
  created_at: string;
  status: string;
  total_amount?: string;
  grand_total?: string;
  shipping_amount?: string;
  tax_amount?: string;
  payment_method?: string;
  items: OrderItem[];
}

// 2. المحاسبة والمنطق
const calculateOrderTotals = (order: Order, taxRate: number, pricesIncludeTax: boolean) => {
  const itemsSubtotal = order.items?.reduce((sum: number, item: OrderItem) => {
    const price = parseFloat(String(item.unit_price || item.price || '0'));
    return sum + (price * (item.quantity || 1));
  }, 0) || 0;

  // إذا كان المجموع 0، فهذا يعني أن الطلب بانتظار التسعير
  const isNotPricedYet = itemsSubtotal === 0;

  if (isNotPricedYet) {
    return {
      itemsSubtotal: 0,
      isNotPricedYet: true,
      shipping: 0,
      finalTax: 0,
      finalSubtotal: 0,
      finalTotal: 0,
    };
  }

  // إذا تم التسعير، نكمل الحسابات بشكل طبيعي
  let shipping = parseFloat(String(order.shipping_amount || '0'));
  let tax = (order.tax_amount !== undefined && order.tax_amount !== null)
    ? parseFloat(String(order.tax_amount))
    : taxRate;

  let finalSubtotal = itemsSubtotal;
  let finalTax = tax;
  let finalTotal = itemsSubtotal + shipping + tax;

  if (pricesIncludeTax) {
    finalSubtotal = Math.max(0, itemsSubtotal - tax);
    finalTotal = itemsSubtotal + shipping;
  }

  return {
    itemsSubtotal,
    isNotPricedYet,
    shipping,
    finalTax,
    finalSubtotal,
    finalTotal,
  };
};

export default function OrdersTab({ lang }: { lang: "en" | "ar" }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [taxRate, setTaxRate] = useState(0);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    async function init() {
      try {
        const [fetchedOrders, settings] = await Promise.all([
          fetchCustomerOrders(),
          fetchSettings()
        ]);
        setOrders(fetchedOrders || []);
        if (settings?.currency_symbol) setCurrencySymbol(settings.currency_symbol);
        if (settings?.tax_rate !== undefined) setTaxRate(parseFloat(settings.tax_rate));
        if (settings?.prices_include_tax !== undefined) setPricesIncludeTax(Boolean(settings.prices_include_tax));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  const renderCurrency = () => {
    if (currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg') {
      return (
        <span className="inline-flex items-center gap-1 mx-1">
          <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
          <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
        </span>
      );
    }
    return <span className="mx-1">{currencySymbol}</span>;
  };

  const awaitingPricingText = lang === 'ar' ? 'بانتظار تسعير الإدارة' : 'Awaiting Admin Pricing';

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-[#093f89]/20 dark:border-[#fbc70f]/20 border-t-[#093f89] dark:border-t-[#fbc70f] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center bg-white dark:bg-[#121212] rounded-3xl border border-[#093f89]/10 dark:border-[#fbc70f]/20 shadow-sm">
        <div className="bg-[#093f89]/10 dark:bg-[#fbc70f]/10 p-5 rounded-full mb-5">
          <Package className="w-10 h-10 text-[#093f89] dark:text-[#fbc70f]" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-3">{t('no_orders', lang)}</h3>
        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">{t('no_orders_desc', lang)}</p>
        <Link href="/shop" className="bg-[#093f89] dark:bg-[#fbc70f] text-white dark:text-[#0a0a0a] px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-[#093f89]/20 dark:shadow-[#fbc70f]/20 hover:-translate-y-1">
          {t("shop", lang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{t("my_orders", lang)}</h2>
      </div>

      <div className="overflow-x-auto custom-scrollbar bg-card rounded-3xl border border-border shadow-sm">
        <table className="w-full text-start border-collapse min-w-[600px]">
          <thead>
            {/* 👈 تم التعديل: جعل الخلفية فاتحة تماماً في الوضع العادي، وداكنة في الوضع المظلم */}
            <tr className="border-b border-border bg-muted/50 dark:bg-[#1a1a1a]">
              {/* 👈 تم التعديل: تحويل نصوص العناوين إلى text-foreground في الوضع الفاتح لضمان ظهورها بالأسود */}
              <th className="py-5 px-6 font-semibold text-start text-foreground/80 dark:text-gray-400">{t('order_id', lang)}</th>
              <th className="py-5 px-6 font-semibold text-start text-foreground/80 dark:text-gray-400">{t('order_date', lang)}</th>
              <th className="py-5 px-6 font-semibold text-start text-foreground/80 dark:text-gray-400">{t('order_status', lang)}</th>
              <th className="py-5 px-6 font-semibold text-start text-foreground/80 dark:text-gray-400">{t('order_total', lang)}</th>
              <th className="py-5 px-6 font-semibold text-end text-foreground/80 dark:text-gray-400">{t('order_actions', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const { isNotPricedYet, finalTotal } = calculateOrderTotals(order, taxRate, pricesIncludeTax);

              return (
                <tr key={order.id} className="group hover:bg-muted/30 dark:hover:bg-white/5 transition-colors">
                  <td className="py-5 px-6">
                    <span className="font-bold text-foreground">#{order.order_number}</span>
                  </td>
                  <td className="py-5 px-6 text-muted-foreground text-sm font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize
            ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/10 dark:text-yellow-400' : ''}
            ${order.status === 'processing' ? 'bg-[#093f89]/10 text-[#093f89] dark:bg-[#093f89]/20 dark:text-blue-400' : ''}
            ${order.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400' : ''}
            ${order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400' : ''}
            ${order.status === 'in_way' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400' : ''}
            ${order.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400' : ''}
          `}>
                      {t(order.status as any, lang)}
                    </span>
                  </td>
                  <td className="py-5 px-6 font-bold text-foreground">
                    {!isNotPricedYet ? (
                      <span className="flex items-center text-lg">
                        {renderCurrency()}
                        {finalTotal.toFixed(2)}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-3 py-1.5 rounded-lg border border-[#fbc70f]/20 w-max">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {awaitingPricingText}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground block mt-1 font-medium">
                      {order.items?.length || 0} {t('order_items', lang)}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-end">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-[#093f89] dark:text-[#fbc70f] hover:bg-[#093f89]/10 dark:hover:bg-[#fbc70f]/10 rounded-xl transition-colors group/btn"
                        title={t('view', lang)}
                      >
                        <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <div className="w-px h-5 bg-border"></div>
                      <Link
                        href={`/track?query=${order.order_number}`}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-colors group/btn"
                        title={t('track_order', lang)}
                      >
                        <Truck className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 3. نافذة تفاصيل الطلب */}
      <AnimatePresence>
        {selectedOrder && (
          (() => {
            // 🔍 فحص برمي ومباشر وصارم لحالة كلاس dark لتغيير الستايل تلقائياً
            const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

            const modalBg = isDarkMode ? '#121212' : '#ffffff';
            const subBoxBg = isDarkMode ? '#0a0a0a' : '#f9fafb';
            const textColor = isDarkMode ? '#ffffff' : '#0f172a';
            const textMuted = isDarkMode ? '#a1a1aa' : '#6b7280';
            const borderColor = isDarkMode ? '#27272a' : '#f3f4f6';

            return (
              <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                  style={{ backgroundColor: modalBg, color: textColor, borderColor: borderColor }}
                  className="rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border"
                >
                  {/* Header */}
                  <div
                    style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb', borderColor: borderColor }}
                    className="p-6 border-b flex items-center justify-between"
                  >
                    <div>
                      <h3 style={{ color: textColor }} className="text-2xl font-bold font-serif">{t('order_details', lang)}</h3>
                      <p style={{ color: textMuted }} className="text-sm mt-1 font-medium">{t('order_id', lang)} #{selectedOrder.order_number}</p>
                    </div>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
                      style={{ color: textMuted }}
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  {/* Body */}
                  <div style={{ backgroundColor: modalBg }} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">

                    {/* Order Info Bar */}
                    <div
                      style={{ backgroundColor: subBoxBg, borderColor: borderColor }}
                      className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 rounded-2xl border shadow-sm"
                    >
                      <div>
                        <div style={{ color: textMuted }} className="text-[10px] uppercase tracking-wider mb-1 font-bold">{t('order_status', lang)}</div>
                        <div className="text-sm font-bold capitalize text-[#093f89] dark:text-[#fbc70f]">{t(selectedOrder.status as any, lang)}</div>
                      </div>
                      <div>
                        <div style={{ color: textMuted }} className="text-[10px] uppercase tracking-wider mb-1 font-bold">{t('order_date', lang)}</div>
                        <div style={{ color: textColor }} className="text-sm font-bold">{new Date(selectedOrder.created_at).toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div style={{ color: textMuted }} className="text-[10px] uppercase tracking-wider mb-1 font-bold">{t('contact_det', lang)}</div>
                        <div style={{ color: textColor }} className="text-sm font-bold capitalize">{selectedOrder.payment_method || '-'}</div>
                      </div>
                      <div>
                        <div style={{ color: textMuted }} className="text-[10px] uppercase tracking-wider mb-1 font-bold">{t('order_total', lang)}</div>
                        {(() => {
                          const { isNotPricedYet, finalTotal } = calculateOrderTotals(selectedOrder, taxRate, pricesIncludeTax);
                          return isNotPricedYet ? (
                            <span className="inline-block text-[11px] bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-2 py-0.5 rounded border border-[#fbc70f]/20 font-bold">
                              {awaitingPricingText}
                            </span>
                          ) : (
                            <div style={{ color: textColor }} className="text-sm font-bold flex items-center">
                              {renderCurrency()}
                              {finalTotal.toFixed(2)}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <h4 style={{ color: textColor }} className="font-bold mb-4 flex items-center gap-2 text-lg">
                        <Package className="w-5 h-5 text-[#093f89] dark:text-[#fbc70f]" />
                        {t('order_items', lang)} ({selectedOrder.items?.length || 0})
                      </h4>
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item: any) => {
                          const basePrice = parseFloat(String(item.unit_price || item.price || '0'));
                          const isItemUnpriced = basePrice === 0;

                          return (
                            <div
                              key={item.id}
                              style={{ backgroundColor: subBoxBg, borderColor: borderColor }}
                              className="flex gap-4 items-center p-4 rounded-2xl border hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors"
                            >
                              <div style={{ backgroundColor: modalBg, borderColor: borderColor }} className="w-16 h-20 rounded-xl overflow-hidden shrink-0 border">
                                <img
                                  src={getImageUrl(item.product?.images?.[0] || item.product?.image || item.image)}
                                  alt="Product"
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div style={{ color: textColor }} className="text-sm font-bold truncate">
                                  {item.product?.name ? (item.product.name[lang as keyof typeof item.product.name] || item.product.name.en || item.product.name) : (item.name || 'Product')}
                                </div>
                                {(item.color || item.size) && (
                                  <div style={{ color: textMuted }} className="text-xs mt-1 font-medium">
                                    {item.color} {item.color && item.size && '|'} {item.size}
                                  </div>
                                )}
                                <div className="text-xs font-bold text-[#093f89] dark:text-[#fbc70f] mt-2 flex items-center gap-1">
                                  Qty: {item.quantity} ×
                                  {isItemUnpriced ? (
                                    <span className="text-[10px] bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-1.5 py-0.5 rounded border border-[#fbc70f]/20">
                                      {awaitingPricingText}
                                    </span>
                                  ) : (
                                    <>
                                      {renderCurrency()}
                                      {(() => {
                                        if (pricesIncludeTax && selectedOrder.items?.length > 0) {
                                          const itemTaxShare = taxRate / selectedOrder.items.length;
                                          return Math.max(0, basePrice - (itemTaxShare / item.quantity)).toFixed(2);
                                        }
                                        return basePrice.toFixed(2);
                                      })()}
                                    </>
                                  )}
                                </div>
                              </div>
                              <div style={{ color: textColor }} className="text-base font-bold whitespace-nowrap flex items-center">
                                {isItemUnpriced ? (
                                  <span className="text-xs text-yellow-600 dark:text-[#fbc70f]">-</span>
                                ) : (
                                  <>
                                    {renderCurrency()}
                                    {(() => {
                                      const itemTotal = parseFloat(String(item.total || (basePrice * item.quantity)));
                                      if (pricesIncludeTax && selectedOrder.items?.length > 0) {
                                        const itemTaxShare = taxRate / selectedOrder.items.length;
                                        return Math.max(0, itemTotal - itemTaxShare).toFixed(2);
                                      }
                                      return itemTotal.toFixed(2);
                                    })()}
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Shipping & Delivery */}
                    <div
                      style={{ backgroundColor: subBoxBg, borderColor: borderColor }}
                      className="space-y-4 text-sm p-6 rounded-2xl border"
                    >
                      {(() => {
                        const { isNotPricedYet, shipping, finalTax, finalSubtotal, finalTotal } = calculateOrderTotals(selectedOrder, taxRate, pricesIncludeTax);

                        return (
                          <>
                            <div className="flex justify-between items-center">
                              <span style={{ color: textMuted }} className="font-medium">{t('subtotal', lang)}</span>
                              <span style={{ color: textColor }} className="font-bold flex items-center">
                                {isNotPricedYet ? (
                                  <span className="text-xs bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-2 py-1 rounded-md border border-[#fbc70f]/20">{awaitingPricingText}</span>
                                ) : (<>{renderCurrency()}{finalSubtotal.toFixed(2)}</>)}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span style={{ color: textMuted }} className="font-medium">{t('processing_fees', lang)}</span>
                              <span className="text-green-600 dark:text-green-400 font-bold flex items-center">
                                {isNotPricedYet ? (
                                  <span className="text-xs bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-2 py-1 rounded-md border border-[#fbc70f]/20">{awaitingPricingText}</span>
                                ) : shipping > 0 ? (
                                  <>{renderCurrency()}{shipping.toFixed(2)}</>
                                ) : 'Free'}
                              </span>
                            </div>

                            <div className="flex justify-between items-center">
                              <span style={{ color: textMuted }} className="font-medium">
                                {t('taxes', lang)} {pricesIncludeTax && !isNotPricedYet ? <span className="text-xs opacity-70">({t('included', lang) || 'شاملة'})</span> : ''}
                              </span>
                              <span style={{ color: textColor }} className="font-bold flex items-center">
                                {isNotPricedYet ? (
                                  <span className="text-xs bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-2 py-1 rounded-md border border-[#fbc70f]/20">{awaitingPricingText}</span>
                                ) : (<>{renderCurrency()}{finalTax.toFixed(2)}</>)}
                              </span>
                            </div>

                            <div style={{ backgroundColor: borderColor }} className="h-px my-4"></div>

                            <div className="flex justify-between items-center text-base">
                              <span style={{ color: textColor }} className="font-bold">{t('total', lang)}</span>
                              <span className="font-bold text-[#093f89] dark:text-[#fbc70f] flex items-center text-xl">
                                {isNotPricedYet ? (
                                  <span className="text-sm bg-[#fbc70f]/10 text-yellow-700 dark:text-[#fbc70f] px-3 py-1.5 rounded-lg border border-[#fbc70f]/20 flex items-center gap-1.5">
                                    <AlertCircle className="w-4 h-4" />
                                    {awaitingPricingText}
                                  </span>
                                ) : (<>{renderCurrency()}{finalTotal.toFixed(2)}</>)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Footer */}
                  <div
                    style={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#f9fafb', borderColor: borderColor }}
                    className="p-6 border-t flex gap-3"
                  >
                    <Link
                      href={`/track?query=${selectedOrder.order_number}`}
                      className="flex-1 bg-[#093f89] dark:bg-[#fbc70f] text-white dark:text-black py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:-translate-y-0.5 active:scale-95"
                    >
                      <Truck className="w-5 h-5" />
                      {t('track_order', lang)}
                    </Link>
                    <button
                      onClick={() => setSelectedOrder(null)}
                      style={{ backgroundColor: modalBg, color: textColor, borderColor: borderColor }}
                      className="px-8 py-3.5 border rounded-xl font-bold hover:bg-black/[0.03] dark:hover:bg-white/[0.03] transition-all active:scale-95"
                    >
                      {t('cancel', lang)}
                    </button>
                  </div>
                </motion.div>
              </div>
            );
          })()
        )}
      </AnimatePresence>
    </div >
  );
}