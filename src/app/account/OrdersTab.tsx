"use client";

import { useEffect, useState } from "react";
import { fetchCustomerOrders } from "@/lib/api";
import { fetchSettings } from "@/lib/api";
import Link from "next/link";
import { t } from "@/lib/translations";
import { Package, X, Eye, Truck, ExternalLink } from "lucide-react";
import Image from "next/image";
import { getImageUrl } from "@/lib/api";

export default function OrdersTab({ lang }: { lang: "en" | "ar" }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [taxRate, setTaxRate] = useState(0);
  const [pricesIncludeTax, setPricesIncludeTax] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 flex flex-col items-center justify-center">
        <div className="bg-primary/5 p-4 rounded-full mb-4">
          <Package className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-serif font-bold text-foreground mb-2">{t('no_orders', lang)}</h3>
        <p className="text-muted-foreground mb-6">{t('no_orders_desc', lang)}</p>
        <Link href="/shop" className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-all">
          {t("shop", lang)}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="font-serif text-2xl font-bold text-foreground">{t("my_orders", lang)}</h2>

      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="border-b border-border text-sm text-muted-foreground">
              <th className="pb-3 font-medium text-start">{t('order_id', lang)}</th>
              <th className="pb-3 font-medium text-start">{t('order_date', lang)}</th>
              <th className="pb-3 font-medium text-start">{t('order_status', lang)}</th>
              <th className="pb-3 font-medium text-start">{t('order_total', lang)}</th>
              <th className="pb-3 font-medium text-end">{t('order_actions', lang)}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {orders.map((order) => {
              // حساب القيمة الرقمية للإجمالي للتأكد مما إذا كان الأدمن قد وضع سعراً أم لا
              const totalAmount = parseFloat(order.total_amount || order.grand_total || '0');
              const isPriced = totalAmount > 0;

              return (
                <tr key={order.id} className="group hover:bg-muted/10 transition-colors">
                  <td className="py-4">
                    <span className="font-medium text-foreground">#{order.order_number}</span>
                  </td>
                  <td className="py-4 text-muted-foreground text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
              ${order.status === 'processing' ? 'bg-blue-100 text-blue-800' : ''}
              ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
              ${order.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              ${order.status === 'in_way' ? 'bg-indigo-100 text-indigo-800' : ''}
              ${order.status === 'awaiting_payment' ? 'bg-orange-100 text-orange-800' : ''}
            `}>
                      {t(order.status as any, lang)}
                    </span>
                  </td>
                  <td className="py-4 font-medium text-foreground">
                    {isPriced ? (
                      // إذا قام الأدمن بالتسعير، يظهر السعر والعملة بشكل طبيعي
                      <span className="flex items-center gap-1">
                        {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                          <>
                            <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
                            <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
                          </>
                        ) : (
                          <span>{currencySymbol}</span>
                        )}
                        {totalAmount.toFixed(2)}
                      </span>
                    ) : (
                      // إذا كان السعر 0 (لم يتم التسعير بعد)، تظهر هذه الرسالة
                      <span className="text-sm text-amber-500 font-normal bg-amber-500/10 px-2 py-0.5 rounded-md inline-block">
                        {t('awaiting_pricing', lang) || 'قيد المراجعة'}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground block mt-1">
                      for {order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="py-4 text-end">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1.5 text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        {t('view', lang)}
                      </button>
                      <Link
                        href={`/track?query=${order.order_number}`}
                        className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors border-s border-border ps-4"
                      >
                        <Truck className="w-4 h-4" />
                        {t('track_order', lang)}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-background rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-center justify-between bg-muted/20">
              <div>
                <h3 className="text-xl font-bold text-foreground font-serif">{t('order_details', lang)}</h3>
                <p className="text-sm text-muted-foreground">{t('order_id', lang)} #{selectedOrder.order_number}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-muted rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Order Info Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-muted/40 rounded-2xl border border-border">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('order_status', lang)}</div>
                  <div className="text-sm font-bold capitalize text-primary">{t(selectedOrder.status as any, lang)}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('order_date', lang)}</div>
                  <div className="text-sm font-bold">{new Date(selectedOrder.created_at).toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('contact_det', lang)}</div>
                  <div className="text-sm font-bold capitalize">{selectedOrder.payment_method}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">{t('order_total', lang)}</div>
                  <div className="text-sm font-bold flex items-center gap-1 text-foreground">
                    {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                      <>
                        <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
                        <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
                      </>
                    ) : (
                      <span>{currencySymbol}</span>
                    )}
                    {parseFloat(selectedOrder.total_amount || selectedOrder.grand_total).toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  {t('order_items', lang)} ({selectedOrder.items?.length || 0})
                </h4>
                <div className="space-y-4">

                  {selectedOrder.items?.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center p-3 rounded-xl border border-border hover:bg-muted/5 transition-colors">
                      <div className="w-14 h-20 rounded-lg bg-muted overflow-hidden shrink-0 border border-border">
                        <img
                          src={getImageUrl(
                            item.product?.images?.[0] ||
                            item.product?.image ||
                            item.image
                          )}
                          alt="Product"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-foreground truncate">
                          {item.product?.name ? (item.product.name[lang] || item.product.name.en || item.product.name) : (item.name || 'Product')}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {item.color} | {item.size}
                        </div>
                        <div className="text-xs font-medium text-foreground mt-1">
                          Qty: {item.quantity} × {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? 'SAR ' : currencySymbol}
                          {parseFloat(item.unit_price || item.price).toFixed(2)}
                        </div>
                      </div>
                      <div className="text-sm font-bold text-foreground whitespace-nowrap">
                        {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                          <span className="flex items-center gap-1">
                            <Image src="/riyal-dark.svg" alt="SAR" width={10} height={10} className="inline-block theme-light-only" />
                            <Image src="/riyal-light.svg" alt="SAR" width={10} height={10} className="theme-dark-only" />
                            {parseFloat(item.total || (item.price * item.quantity)).toFixed(2)}
                          </span>
                        ) : (
                          `${currencySymbol}${parseFloat(item.total || (item.price * item.quantity)).toFixed(2)}`
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping & Delivery */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                <div>
                  <h4 className="font-bold text-foreground mb-3 text-sm flex items-center gap-2">
                    <Truck className="w-4 h-4 text-primary" />
                    {t('shipping_address', lang)}
                  </h4>
                  <div className="text-xs text-muted-foreground leading-relaxed bg-muted/20 p-4 rounded-xl border border-border">
                    <div className="font-bold text-foreground mb-1">
                      {selectedOrder.shipping_address?.first_name} {selectedOrder.shipping_address?.last_name}
                    </div>
                    <div>{selectedOrder.shipping_address?.address_1}</div>
                    {selectedOrder.shipping_address?.address_2 && <div>{selectedOrder.shipping_address?.address_2}</div>}
                    <div>{selectedOrder.shipping_address?.city}, {selectedOrder.shipping_address?.postcode}</div>
                    <div>{selectedOrder.shipping_address?.country_id === '198' ? 'Saudi Arabia' : selectedOrder.shipping_address?.country_id}</div>
                    <div className="mt-2 text-primary">{selectedOrder.customer_email}</div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h4 className="font-bold text-foreground mb-3 text-sm">{t('order_summary', lang)}</h4>
                  <div className="space-y-2 text-xs bg-primary/5 p-4 rounded-xl border border-primary/10">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">{t('subtotal', lang)}</span>
                      <span className="text-foreground font-bold">
                        {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? 'SAR ' : currencySymbol}
                        {(() => {
                          const total = parseFloat(selectedOrder.total_amount || selectedOrder.grand_total);
                          const shipping = parseFloat(selectedOrder.shipping_amount || 0);
                          const pureTotal = total - shipping;
                          if (pricesIncludeTax) {
                            return (pureTotal / (1 + taxRate / 100)).toFixed(2);
                          }
                          return pureTotal.toFixed(2);
                        })()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">{t('processing_fees', lang)} ({selectedOrder.shipping_method})</span>
                      <span className="text-foreground font-bold text-green-600">
                        {selectedOrder.shipping_amount > 0 ? (
                          `${currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? 'SAR ' : currencySymbol}${parseFloat(selectedOrder.shipping_amount).toFixed(2)}`
                        ) : 'Free'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground font-medium">{t('taxes', lang)} ({taxRate}%{pricesIncludeTax ? ' Incl.' : ''})</span>
                      <span className="text-foreground font-bold">
                        {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? 'SAR ' : currencySymbol}
                        {(() => {
                          if (selectedOrder.tax_amount !== undefined && selectedOrder.tax_amount !== null) {
                            return parseFloat(selectedOrder.tax_amount).toFixed(2);
                          }
                          const total = parseFloat(selectedOrder.total_amount || selectedOrder.grand_total);
                          const shipping = parseFloat(selectedOrder.shipping_amount || 0);
                          const pureTotal = total - shipping;
                          if (pricesIncludeTax) {
                            const beforeTax = pureTotal / (1 + taxRate / 100);
                            return (pureTotal - beforeTax).toFixed(2);
                          }
                          return (pureTotal * (taxRate / 100)).toFixed(2);
                        })()}
                      </span>
                    </div>
                    <div className="h-px bg-border my-2"></div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-bold text-foreground">{t('total', lang)}</span>
                      <span className="font-bold text-primary flex items-center gap-1 text-lg">
                        {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                          <>
                            <Image src="/riyal-dark.svg" alt="SAR" width={14} height={14} className="inline-block theme-light-only" />
                            <Image src="/riyal-light.svg" alt="SAR" width={14} height={14} className="theme-dark-only" />
                          </>
                        ) : (
                          <span>{currencySymbol}</span>
                        )}
                        {parseFloat(selectedOrder.total_amount || selectedOrder.grand_total).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border bg-muted/20 flex gap-3">
              <Link
                href={`/track?query=${selectedOrder.order_number}`}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
              >
                <Truck className="w-5 h-5" />
                {t('track_order', lang)}
              </Link>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 border border-border rounded-xl font-medium hover:bg-background transition-colors"
              >
                {t('cancel', lang)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
