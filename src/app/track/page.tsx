"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageContext';
import { getImageUrl, fetchSettings } from '@/lib/api';
import { Search, Package, CheckCircle2, Clock, Truck, ShieldAlert, XCircle } from 'lucide-react';

interface OrderTimeline {
  id: number;
  status: string;
  tracking_number: string | null;
  created_at: string;
}

interface OrderItem {
  id: number;
  product_variation_id: number;
  quantity: number;
  unit_price: number;
  total: number;
  product_size?: string;
  product_color?: string;
  product?: {
    id: number;
    name: any;
    images: string[];
  };
}

interface OrderData {
  order_number: string;
  status: string;
  subtotal?: number;
  tax_amount?: number;
  shipping_amount?: number;
  total_amount: number;
  tracking_number: string | null;
  shipping_method: string | null;
  created_at: string;
  histories: OrderTimeline[];
  items: OrderItem[];
}

export default function TrackOrderPage() {
  const { lang } = useLanguage();
  const isRtl = lang === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('id') || searchParams.get('query') || '');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState<string>('SAR');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const settingsRes = await fetchSettings();
        if (settingsRes && settingsRes.currency_symbol) {
          setCurrencySymbol(settingsRes.currency_symbol);
        }
      } catch (e) {
        console.error("Failed to load settings array");
      }
    }
    loadSettings();
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
  const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'ak_zeMJGONZsh8S7wzrGjCrKYAMHIJJB5pP';
  const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || 'sk_IAnHqVXKSo4jiZTQLgk1MdK04jsqEoYucYHA6yRBsBTcCPFV';

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`${API_URL}/track?query=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Accept': 'application/json',
          'X-API-KEY': API_KEY,
          'X-SECRET-KEY': SECRET_KEY
        }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (isRtl ? 'لم نتمكن من العثور على طلب بهذا الرقم.' : 'Order not found'));
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const urlId = searchParams.get('id');
    const urlQuery = searchParams.get('query');
    const finalQuery = urlId || urlQuery;

    if (finalQuery) {
      setQuery(finalQuery);
      performSearch(finalQuery);
    }
  }, [searchParams]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const params = new URLSearchParams(searchParams.toString());
    params.set('query', query.trim());
    params.delete('id');
    router.push(`/track?${params.toString()}`);
  };

  const getStatusVisuals = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('awaiting_payment') || s.includes('pending'))
      return {
        color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200 dark:border-amber-500/30',
        dot: 'bg-amber-500', icon: Clock
      };
    if (s.includes('processing'))
      return {
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
        dot: 'bg-blue-500', icon: Package
      };
    if (s.includes('shipped') || s.includes('in_way'))
      return {
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30',
        dot: 'bg-indigo-500', icon: Truck
      };
    if (s.includes('delivered') || s.includes('completed'))
      return {
        color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30',
        dot: 'bg-emerald-500', icon: CheckCircle2
      };
    if (s.includes('cancelled'))
      return {
        color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30',
        dot: 'bg-rose-500', icon: XCircle
      };
    return { color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30', dot: 'bg-gray-500', icon: ShieldAlert };
  };

  const getStatusText = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('awaiting_payment') || s.includes('pending')) return isRtl ? 'تم استلام الطلب' : 'Order Received';
    if (s.includes('processing')) return isRtl ? 'جاري تجهيز المعدة' : 'Preparing Equipment';
    if (s.includes('in_way')) return isRtl ? 'في الطريق إليك' : 'On The Way';
    if (s.includes('delivered') || s.includes('completed')) return isRtl ? 'مكتمل' : 'Completed';
    if (s.includes('cancelled')) return isRtl ? 'ملغي' : 'Cancelled';
    return status;
  };

  const CurrencyFormat = ({ amount, size = 14, className = "" }: { amount: number; size?: number, className?: string }) => {
    const isImage = currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg';
    return (
      <span className={`inline-flex items-center gap-1 font-bold ${className}`}>
        {isImage ? (
          <>
            <Image src="/riyal-dark.svg" alt="SAR" width={size} height={size} className="inline-block theme-light-only" />
            <Image src="/riyal-light.svg" alt="SAR" width={size} height={size} className="theme-dark-only" />
          </>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: currencySymbol }} className="text-muted-foreground/80 font-normal text-xs" />
        )}
        {Number(amount).toFixed(2)}
      </span>
    );
  };

  // ----------------------------------------------------------------------
  // منطق التسعير والضرائب الجديد بنسبة 15%
  // ----------------------------------------------------------------------
  const TAX_RATE = 0.15; // 15% الضريبة المضافة

  const calculatedSubtotal = order ? (order.subtotal ?? order.items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0)) : 0;
  const isAwaitingPricing = calculatedSubtotal === 0;

  // الحسبة النهائية
  const finalTax = order?.tax_amount ? Number(order.tax_amount) : (calculatedSubtotal * TAX_RATE);
  const finalShipping = Number(order?.shipping_amount || 0);

  // إذا كان المجموع الكلي متوفر في API نستخدمه، وإن لم يكن نجمع: (المجموع الفرعي + الضريبة + الشحن)
  const finalTotal = calculatedSubtotal + finalTax + finalShipping;
  return (
    <main className="min-h-screen pt-36 pb-24 bg-background relative overflow-hidden flex flex-col items-center">

      {/* Ambient Background Lights */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] end-[-10%] w-[500px] h-[500px] bg-[#093f89]/10 dark:bg-[#093f89]/15 blur-[140px] rounded-full animate-[pulse_8s_ease-in-out_infinite_alternate]" />
        <div className="absolute top-[40%] start-[-10%] w-[400px] h-[400px] bg-[#fbc70f]/10 dark:bg-[#fbc70f]/5 blur-[120px] rounded-full animate-[pulse_10s_ease-in-out_infinite_alternate_reverse]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.015] bg-[url('/noise.png')] mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-12 max-w-6xl relative z-10 w-full">

        {/* Header Section */}
        <div className="text-center mb-12 max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#093f89]/10 border border-[#093f89]/20 backdrop-blur-xl text-[#093f89] dark:text-[#fbc70f] text-xs font-bold tracking-widest uppercase mb-4"
          >
            <Package className="w-3.5 h-3.5" />
            {isRtl ? 'نظام التتبع الذكي' : 'Smart Tracking System'}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl font-bold text-foreground mb-4 tracking-tight drop-shadow-sm"
          >
            {isRtl ? 'تتبع طلبك' : 'Track Your Order'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground text-sm sm:text-base font-light"
          >
            {isRtl ? 'أدخل رقم الطلب أو رقم التتبع للتحقق من حالة الشحنة الخاصة بك لحظة بلحظة.' : 'Enter your order number or tracking number to check the live status of your shipment.'}
          </motion.p>
        </div>

        {/* Search Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card/60 backdrop-blur-2xl rounded-[32px] shadow-lg border border-[#093f89]/10 dark:border-border/50 p-4 sm:p-6 mb-12 max-w-3xl mx-auto"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground ${isRtl ? 'right-5' : 'left-5'}`} />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setError(''); }}
                placeholder={isRtl ? "رقم الطلب (مثال: ORD-123)..." : "Order # or Tracking #..."}
                className={`w-full bg-background/50 border-2 border-border focus:border-[#093f89] dark:focus:border-[#fbc70f] rounded-2xl ${isRtl ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 text-foreground font-medium placeholder-muted-foreground transition-colors outline-none`}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="group relative bg-[#093f89] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:shadow-[0_8px_30px_rgba(9,63,137,0.3)] dark:hover:shadow-[0_8px_30px_rgba(251,199,15,0.2)] transition-all duration-300 disabled:opacity-50 overflow-hidden flex items-center justify-center gap-2 min-w-[140px]"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              <span className="relative z-10 group-hover:text-[#fbc70f] transition-colors">
                {loading ? (isRtl ? 'جاري البحث...' : 'Searching...') : (isRtl ? 'تتبع الآن' : 'Track Now')}
              </span>
            </button>
          </form>
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="px-5 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm border border-red-200 dark:border-red-800/50 flex items-center gap-2 font-medium"
              >
                <XCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Area */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid lg:grid-cols-12 gap-8 lg:gap-10"
          >

            {/* Column 1: Order Timeline (Left on LTR, Right on RTL) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-card/40 backdrop-blur-xl rounded-[32px] shadow-sm border border-[#093f89]/10 dark:border-border/50 p-6 sm:p-8 h-full">

                {/* Header of Timeline */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-border/60">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-foreground mb-1">
                      {isRtl ? 'الطلب' : 'Order'} <span className="text-[#093f89] dark:text-[#fbc70f]">#{order.order_number}</span>
                    </h2>
                    <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                      <Clock className="w-4 h-4 opacity-70" />
                      {new Date(order.created_at).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="text-start sm:text-end">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${getStatusVisuals(order.status).color} mb-2 shadow-sm`}>
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusVisuals(order.status).dot} animate-pulse`}></span>
                      <span className="text-sm font-bold tracking-wide">{getStatusText(order.status)}</span>
                    </div>
                    {order.tracking_number && (
                      <div className="text-sm font-mono text-muted-foreground flex items-center sm:justify-end gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50 w-fit sm:ml-auto">
                        <span className="text-xs uppercase font-bold">{order.shipping_method || 'Tracking'}:</span>
                        <span className="text-foreground">{order.tracking_number}</span>
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-foreground mb-8 font-serif">{isRtl ? 'مسار الطلب' : 'Tracking Journey'}</h3>
                {/* استخدام histories هنا */}
                {(() => {
                  const displayHistories = order.histories && order.histories.length > 0
                    ? order.histories
                    : [
                      {
                        id: 9999,
                        status: order.status,
                        tracking_number: order.tracking_number,
                        created_at: order.created_at
                      }
                    ];

                  return (
                    <div className="relative pl-6 md:pl-0">
                      <div className={`absolute top-2 bottom-4 w-[2px] bg-gradient-to-b from-[#093f89] via-[#fbc70f] to-border/30 rounded-full ${isRtl ? 'right-6 md:right-[140px]' : 'left-6 md:left-[140px]'}`}></div>

                      <div className="space-y-10">
                        {displayHistories.map((history, idx) => {
                          const isLatest = idx === 0;
                          const visual = getStatusVisuals(history.status);
                          const StatusIcon = visual.icon;

                          return (
                            <motion.div
                              initial={{ opacity: 0, x: isRtl ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              key={history.id}
                              className="relative flex flex-col md:flex-row items-start md:items-center group"
                            >
                              <div className={`hidden md:block w-[120px] shrink-0 text-sm ${isLatest ? 'text-foreground font-bold' : 'text-muted-foreground'} ${isRtl ? 'text-left pl-8' : 'text-right pr-8'}`}>
                                <div>{new Date(history.created_at).toLocaleDateString()}</div>
                                <div className="text-xs opacity-70 mt-0.5">{new Date(history.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </div>

                              <div className={`absolute md:relative flex h-10 w-10 items-center justify-center bg-background rounded-full ring-4 ring-background border-2 ${isLatest ? 'border-[#093f89] dark:border-[#fbc70f] shadow-[0_0_15px_rgba(251,199,15,0.4)]' : 'border-border'} shrink-0 z-10 ${isRtl ? '-right-6 md:right-0 ml-8 md:translate-x-5' : '-left-6 md:left-0 mr-8 md:-translate-x-5'}`}>
                                <StatusIcon className={`w-4 h-4 ${isLatest ? 'text-[#093f89] dark:text-[#fbc70f]' : 'text-muted-foreground'}`} />
                              </div>

                              <div className={`bg-card border ${isLatest ? 'border-[#093f89]/30 dark:border-[#fbc70f]/30 shadow-md bg-[#093f89]/5 dark:bg-[#fbc70f]/5' : 'border-border/60 bg-muted/20'} rounded-2xl p-5 flex-1 w-full ml-6 md:ml-0 rtl:ml-0 rtl:mr-6 rtl:md:mr-0 transition-all duration-300 hover:shadow-lg`}>
                                <div className="md:hidden text-xs text-muted-foreground mb-2 flex items-center gap-1 font-medium">
                                  <Clock className="w-3.5 h-3.5" />
                                  {new Date(history.created_at).toLocaleString()}
                                </div>
                                <h4 className={`text-base font-bold mb-1 ${isLatest ? 'text-[#093f89] dark:text-[#fbc70f]' : 'text-foreground'}`}>
                                  {getStatusText(history.status)}
                                </h4>
                                {history.tracking_number && (
                                  <p className="text-sm text-muted-foreground mt-2 flex items-center gap-2">
                                    {isRtl ? 'رقم التتبع:' : 'Tracking:'}
                                    <span className="font-mono text-foreground font-bold bg-background px-2 py-1 rounded-md border border-border shadow-sm">
                                      {history.tracking_number}
                                    </span>
                                  </p>
                                )}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Column 2: Order Details & Pricing */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-card/60 backdrop-blur-2xl rounded-[32px] shadow-lg border border-[#093f89]/10 dark:border-border/50 p-6 sm:p-8 sticky top-28">
                <h3 className="text-2xl font-serif font-bold text-foreground mb-6">{isRtl ? 'تفاصيل المشتريات' : 'Order Details'}</h3>

                {/* Items List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {order.items.map(item => {
                    const productName = item.product?.name ?
                      (typeof item.product.name === 'string' ? item.product.name :
                        (item.product.name[lang] || item.product.name['en'] || 'Unknown Product'))
                      : 'Unknown Product';

                    const itemTotal = Number(item.unit_price) * item.quantity;
                    const hasVariations = item.product_size || item.product_color;

                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-2xl border border-border/50 hover:bg-secondary/60 transition-colors">
                        <div className="relative h-16 w-16 bg-card rounded-xl overflow-hidden shrink-0 border border-border shadow-sm">
                          <Image
                            src={getImageUrl(item.product?.images?.[0]) || '/no-image.jpg'}
                            alt={productName}
                            fill
                            unoptimized={true}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-foreground line-clamp-2 leading-snug">{productName}</h4>
                          <p className="text-xs text-muted-foreground mt-1.5 font-medium flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span>{isRtl ? 'الكمية:' : 'Qty:'} <span className="text-foreground">{item.quantity}</span></span>

                            {/* إظهار المقاس/المدة أو اللون إن وجد */}
                            {hasVariations && <span className="text-border mx-0.5">|</span>}
                            {item.product_size && <span>{item.product_size}</span>}
                            {item.product_color && <span className="flex items-center gap-1">{item.product_color}</span>}
                          </p>
                        </div>
                        <div className="text-sm shrink-0 text-end pl-2 rtl:pl-0 rtl:pr-2">
                          {itemTotal === 0 ? (
                            <span className="inline-flex items-center justify-center gap-1.5 text-[11px] font-bold text-[#093f89] dark:text-[#fbc70f] bg-[#093f89]/10 dark:bg-[#fbc70f]/10 px-2.5 py-1.5 rounded-lg border border-[#093f89]/20 dark:border-[#fbc70f]/20">
                              <Clock className="w-3.5 h-3.5" />
                              {isRtl ? 'قيد التسعير' : 'Awaiting Price'}
                            </span>
                          ) : (
                            <CurrencyFormat amount={itemTotal} />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Financial Calculation */}
                {isAwaitingPricing ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-8 pt-6 border-t-2 border-border/60"
                  >
                    <div className="relative overflow-hidden flex flex-col sm:flex-row items-start gap-4 bg-gradient-to-br from-[#fbc70f]/10 to-transparent border border-[#fbc70f]/30 p-5 rounded-2xl shadow-sm">
                      <div className="absolute top-0 end-0 w-32 h-32 bg-[#fbc70f]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                      <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center shrink-0 border border-[#fbc70f]/40 shadow-inner z-10">
                        <Clock className="w-6 h-6 text-[#093f89] dark:text-[#fbc70f]" />
                      </div>
                      <div className="z-10">
                        <h4 className="text-base font-bold text-foreground mb-1.5">
                          {isRtl ? 'بانتظار تسعير الإدارة' : 'Awaiting Admin Pricing'}
                        </h4>
                        <p className="text-xs sm:text-sm text-muted-foreground font-medium leading-relaxed">
                          {isRtl
                            ? 'تم استلام طلبك بنجاح وهو الآن قيد المراجعة لتحديد التسعيرة النهائية. سيتم تحديث الفاتورة هنا (بما في ذلك الضرائب والشحن) قريباً.'
                            : 'Your order has been received and is under review for final pricing. The total invoice (including VAT and shipping) will be updated here soon.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="mt-8 pt-6 border-t-2 border-border/60 space-y-4">
                    <div className="flex justify-between items-center text-muted-foreground font-medium">
                      <span>{isRtl ? 'المجموع الفرعي' : 'Subtotal'}</span>
                      <CurrencyFormat className="text-foreground" amount={calculatedSubtotal} />
                    </div>

                    {/* عرض الضريبة - محسوبة الآن 15% إذا لم تكن قادمة من الـ API */}
                    {finalTax > 0 && (
                      <div className="flex justify-between items-center text-muted-foreground font-medium">
                        <span>{isRtl ? 'الضريبة المضافة (15%)' : 'VAT (15%)'}</span>
                        <CurrencyFormat className="text-foreground" amount={finalTax} />
                      </div>
                    )}

                    {finalShipping > 0 && (
                      <div className="flex justify-between items-center text-muted-foreground font-medium">
                        <span>{isRtl ? 'الشحن' : 'Shipping'}</span>
                        <CurrencyFormat className="text-foreground" amount={finalShipping} />
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-4 mt-2 border-t border-border/60">
                      <span className="text-lg font-bold text-foreground">{isRtl ? 'المجموع الكلي' : 'Total Amount'}</span>
                      <CurrencyFormat
                        className="text-[#093f89] dark:text-[#fbc70f] text-xl"
                        amount={finalTotal}
                        size={18}
                      />
                    </div>
                  </div>
                )}

              </div>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}