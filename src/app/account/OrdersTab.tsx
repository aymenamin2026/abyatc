"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Package, X, Eye, Truck } from "lucide-react";

import { fetchCustomerOrders, fetchSettings, getImageUrl } from "@/lib/api";
import { t } from "@/lib/translations";

// 1. تعريف الأنواع (Strict Typing)
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

// 2. فصل المنطق المحاسبي خارج الـ Component لتحسين الأداء وسهولة القراءة
const calculateOrderTotals = (order: Order, taxRate: number, pricesIncludeTax: boolean) => {
  const itemsSubtotal = order.items?.reduce((sum: number, item: OrderItem) => {
    const price = parseFloat(String(item.unit_price || item.price || '0'));
    return sum + (price * (item.quantity || 1));
  }, 0) || 0;

  const isNotPricedYet = itemsSubtotal === 0;
  const shipping = parseFloat(String(order.shipping_amount || '0'));
  const tax = (order.tax_amount !== undefined && order.tax_amount !== null)
    ? parseFloat(String(order.tax_amount))
    : taxRate;

  let finalSubtotal = itemsSubtotal;
  let finalTax = tax;
  let finalTotal = itemsSubtotal + shipping + tax;

  if (pricesIncludeTax && !isNotPricedYet) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 flex flex-col items-center justify-center bg-card/30 rounded-3xl border border-border/50 backdrop-blur-sm">
        <div className="bg-primary/10 p-5 rounded-full mb-5">
          <Package className="w-10 h-10 text-primary" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-foreground mb-3">{t('no_orders', lang)}</h3>
        <p className="text-muted-foreground mb-8 max-w-md">{t('no_orders_desc', lang)}</p>
        <Link href="/shop" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-1">
          {t("shop", lang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{t("my_orders", lang)}</h2>
      </div>

      <div className="overflow-x-auto custom-scrollbar bg-background rounded-3xl border border-border shadow-sm">
        <table className="w-full text-start border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border bg-muted/20">
              <th className="py-5 px-6 font-semibold text-start text-muted-foreground">{t('order_id', lang)}</th>
              <th className="py-5 px-6 font-semibold text-start text-muted-foreground">{t('order_date', lang)}</th>
              <th className="py-5 px-6 font-semibold text-start text-muted-foreground">{t('order_status', lang)}</th>
              <th className="py-5 px-6 font-semibold text-start text-muted-foreground">{t('order_total', lang)}</th>
              <th className="py-5 px-6 font-semibold text-end text-muted-foreground">{t('order_actions', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              const { isNotPricedYet, finalTotal } = calculateOrderTotals(order, taxRate, pricesIncludeTax);

              return (
                <tr key={order.id} className="group hover:bg-muted/10 transition-colors">
                  <td className="py-5 px-6">
                    <span className="font-bold text-foreground">#{order.order_number}</span>
                  </td>
                  <td className="py-5 px-6 text-muted-foreground text-sm font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold capitalize shadow-sm
                      ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20' : ''}
                      ${order.status === 'processing' ? 'bg-blue-500/10 text-blue-600 border border-blue-500/20' : ''}
                      ${order.status === 'completed' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : ''}
                      ${order.status === 'cancelled' ? 'bg-red-500/10 text-red-600 border border-red-500/20' : ''}
                      ${order.status === 'in_way' ? 'bg-indigo-500/10 text-indigo-600 border border-indigo-500/20' : ''}
                      ${order.status === 'awaiting_payment' ? 'bg-orange-500/10 text-orange-600 border border-orange-500/20' : ''}
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
                      <span className="text-sm text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 inline-block">
                        {t('awaiting_pricing', lang) || 'قيد المراجعة'}
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
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors group/btn"
                        title={t('view', lang)}
                      >
                        <Eye className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                      </button>
                      <div className="w-px h-5 bg-border"></div>
                      <Link
                        href={`/track?query=${order.order_number}`}
                        className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors group/btn"
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

      {/* 3. نافذة تفاصيل الطلب مع Framer Motion */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-card/95 backdrop-blur-3xl rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border/60"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/10">
                <div>
                  <h3 className="text-2xl font-bold text-foreground font-serif">{t('order_details', lang)}</h3>
                  <p className="text-sm text-muted-foreground mt-1 font-medium">{t('order_id', lang)} #{selectedOrder.order_number}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-rose-500/10 hover:text-rose-500 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Order Info Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-background rounded-2xl border border-border shadow-sm">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">{t('order_status', lang)}</div>
                    <div className="text-sm font-bold capitalize text-primary">{t(selectedOrder.status as any, lang)}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">{t('order_date', lang)}</div>
                    <div className="text-sm font-bold">{new Date(selectedOrder.created_at).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">{t('contact_det', lang)}</div>
                    <div className="text-sm font-bold capitalize">{selectedOrder.payment_method || '-'}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 font-bold">{t('order_total', lang)}</div>
                    <div className="text-sm font-bold flex items-center text-foreground">
                      {renderCurrency()}
                      {parseFloat(selectedOrder.total_amount || selectedOrder.grand_total || '0').toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h4 className="font-bold text-foreground mb-4 flex items-center gap-2 text-lg">
                    <Package className="w-5 h-5 text-primary" />
                    {t('order_items', lang)} ({selectedOrder.items?.length || 0})
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item: OrderItem) => (
                      <div key={item.id} className="flex gap-4 items-center p-4 rounded-2xl border border-border/60 hover:bg-muted/30 transition-colors bg-background">
                        <div className="w-16 h-20 rounded-xl bg-muted/50 overflow-hidden shrink-0 border border-border/50">
                          <img
                            src={getImageUrl(item.product?.images?.[0] || item.product?.image || item.image)}
                            alt="Product"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-foreground truncate">
                            {item.product?.name ? (item.product.name[lang as keyof typeof item.product.name] || item.product.name.en || item.product.name) : (item.name || 'Product')}
                          </div>
                          {(item.color || item.size) && (
                            <div className="text-xs text-muted-foreground mt-1 font-medium">
                              {item.color} {item.color && item.size && '|'} {item.size}
                            </div>
                          )}
                          <div className="text-xs font-bold text-primary mt-2">
                            Qty: {item.quantity} × {renderCurrency()}
                            {(() => {
                              const basePrice = parseFloat(String(item.unit_price || item.price || '0'));
                              if (basePrice === 0) return '0.00';
                              if (pricesIncludeTax && selectedOrder.items?.length > 0) {
                                const itemTaxShare = taxRate / selectedOrder.items.length;
                                return Math.max(0, basePrice - (itemTaxShare / item.quantity)).toFixed(2);
                              }
                              return basePrice.toFixed(2);
                            })()}
                          </div>
                        </div>
                        <div className="text-base font-bold text-foreground whitespace-nowrap flex items-center">
                          {renderCurrency()}
                          {(() => {
                            const basePrice = parseFloat(String(item.unit_price || item.price || '0'));
                            if (basePrice === 0) return '0.00';
                            const itemTotal = parseFloat(String(item.total || (basePrice * item.quantity)));
                            if (pricesIncludeTax && selectedOrder.items?.length > 0) {
                              const itemTaxShare = taxRate / selectedOrder.items.length;
                              return Math.max(0, itemTotal - itemTaxShare).toFixed(2);
                            }
                            return itemTotal.toFixed(2);
                          })()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping & Delivery */}
                <div className="space-y-3 text-sm bg-primary/5 p-6 rounded-2xl border border-primary/10">
                  {(() => {
                    const { isNotPricedYet, shipping, finalTax, finalSubtotal, finalTotal } = calculateOrderTotals(selectedOrder, taxRate, pricesIncludeTax);

                    return (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">{t('subtotal', lang)}</span>
                          <span className="text-foreground font-bold flex items-center">
                            {isNotPricedYet ? (
                              <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">{t('awaiting_pricing', lang) || 'قيد المراجعة'}</span>
                            ) : (<>{renderCurrency()}{finalSubtotal.toFixed(2)}</>)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">{t('processing_fees', lang)}</span>
                          <span className="text-green-600 font-bold flex items-center">
                            {isNotPricedYet ? (
                              <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">{t('awaiting_pricing', lang) || 'قيد المراجعة'}</span>
                            ) : shipping > 0 ? (
                              <>{renderCurrency()}{shipping.toFixed(2)}</>
                            ) : 'Free'}
                          </span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground font-medium">
                            {t('taxes', lang)} {pricesIncludeTax && !isNotPricedYet ? <span className="text-xs opacity-70">({t('included', lang) || 'شاملة'})</span> : ''}
                          </span>
                          <span className="text-foreground font-bold flex items-center">
                            {isNotPricedYet ? (
                              <span className="text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded text-[11px]">{t('awaiting_pricing', lang) || 'قيد المراجعة'}</span>
                            ) : (<>{renderCurrency()}{finalTax.toFixed(2)}</>)}
                          </span>
                        </div>

                        <div className="h-px bg-primary/10 my-3"></div>

                        <div className="flex justify-between items-center text-base">
                          <span className="font-bold text-foreground">{t('total', lang)}</span>
                          <span className="font-bold text-primary flex items-center text-xl">
                            {isNotPricedYet ? (
                              <span className="text-sm text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20">{t('awaiting_pricing', lang) || 'قيد المراجعة'}</span>
                            ) : (<>{renderCurrency()}{finalTotal.toFixed(2)}</>)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-border/50 bg-muted/10 flex gap-3">
                <Link
                  href={`/track?query=${selectedOrder.order_number}`}
                  className="flex-1 bg-primary text-primary-foreground py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 active:scale-95"
                >
                  <Truck className="w-5 h-5" />
                  {t('track_order', lang)}
                </Link>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-8 py-3.5 border border-border/80 rounded-xl font-bold hover:bg-muted transition-all active:scale-95"
                >
                  {t('cancel', lang)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}