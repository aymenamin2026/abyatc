"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/lib/translations';
import { getImageUrl, fetchSettings } from '@/lib/api';
import { Truck, Search, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// المعرفات اللونية الرسمية للهوية
const COLOR_PRIMARY = "#093f89"; // الأزرق الكحلي
const COLOR_ACCENT = "#fbc70f";  // الأصفر الذهبي

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
        throw new Error(data.message || (lang === 'ar' ? 'لم نتمكن من العثور على طلب بهذا الرقم.' : 'Order not found'));
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

  // تعديل ذكي ومحسّن لحالات الطلب لتبدو متجانسة هندسياً مع هويتك الفاخرة
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('awaiting_payment') || s.includes('pending')) return 'bg-[#fbc70f]'; // الأصفر الذهبي للانتظار والتنبيه
    if (s.includes('processing') || s.includes('shipped') || s.includes('in_way') || s.includes('delivered') || s.includes('completed')) {
      return 'bg-[#093f89]'; // الأزرق الكحلي للحالات الجارية والمكتملة بنجاح تعزيزاً للعلامة
    }
    if (s.includes('cancelled')) return 'bg-rose-500';
    return 'bg-slate-400';
  };

  const getStatusText = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('awaiting_payment') || s.includes('pending')) return lang === 'ar' ? 'تم استلام الطلب وبانتظار الدفع' : 'Order Received & Awaiting Payment';
    if (s.includes('processing')) return lang === 'ar' ? 'تم اعتماد الطلب وجاري تجهيز العدة' : 'Approved & Preparing equipment';
    if (s.includes('in_way')) return lang === 'ar' ? 'في الطريق إليك' : 'On The Way';
    if (s.includes('delivered') || s.includes('completed')) return lang === 'ar' ? 'مكتمل ومسلم' : 'Completed';
    if (s.includes('cancelled')) return lang === 'ar' ? 'ملغي' : 'Cancelled';
    return status;
  };

  const CurrencyFormat = ({ amount, size = 14 }: { amount: number; size?: number }) => {
    const isImage = currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg';
    return (
      <span className="inline-flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
        {isImage ? (
          <>
            <Image src="/riyal-dark.svg" alt="SAR" width={size} height={size} className="inline-block theme-light-only" />
            <Image src="/riyal-light.svg" alt="SAR" width={size} height={size} className="theme-dark-only" />
          </>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: currencySymbol }} className="text-slate-500 dark:text-zinc-400 font-normal text-xs" />
        )}
        {Number(amount).toFixed(2)}
      </span>
    );
  };

  return (
    <main className="min-h-screen pt-[104px] pb-24 bg-slate-50/50 dark:bg-zinc-950 transition-colors duration-300">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          {/* عنوان الصفحة الرئيسي مدعوم بلون كحلي فخم */}
          <h1 className="font-serif text-3xl md:text-5xl font-bold text-slate-950 dark:text-white mb-4">
            {lang === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
          </h1>
          <div className="w-12 h-1 mx-auto rounded-full mb-4" style={{ backgroundColor: COLOR_ACCENT }} />
          <p className="text-slate-600 dark:text-zinc-400 max-w-xl mx-auto text-sm md:text-base">
            {lang === 'ar' ? 'أدخل رقم الطلب أو رقم التتبع للتحقق من حالة الشحنة الخاصة بك.' : 'Enter your order number or tracking number to check the live status of your shipment.'}
          </p>
        </div>

        {/* صندوق البحث الاحترافي - بيئة خلفية بيضاء صافية ومريحة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-slate-100 dark:border-zinc-800 p-6 md:p-8 mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            {/* حقل الإدخال: يضيء بـ الكحلي عند الفوكس */}
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ar' ? "رقم الطلب أو التتبع..." : "Order # or Tracking #..."}
              className="flex-1 bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 focus:border-[#093f89] dark:focus:border-[#fbc70f] focus:ring-0 rounded-xl px-5 py-3.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all duration-200 outline-none"
            />
            {/* زر التتبع: يأخذ اللون الكحلي بالكامل ويتحول بمرونة */}
            <button
              type="submit"
              disabled={loading || !query.trim()}
              style={{ backgroundColor: COLOR_PRIMARY }}
              className="hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-medium transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (lang === 'ar' ? 'جاري البحث...' : 'Searching...') : (lang === 'ar' ? 'تتبع الآن' : 'Track Now')}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-xl text-sm border border-rose-100 dark:border-rose-900/30 font-medium">
              {error}
            </div>
          )}
        </motion.div>

        {/* عرض تفاصيل النتائج المسترجعة */}
        {order && (
          <motion.div initial={{ opacity: 0, scale: 0.99 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">

            {/* بطاقة الرأس والتايم لاين للمراحل */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-slate-100 dark:border-zinc-800 p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-slate-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-1">
                    {lang === 'ar' ? 'تفاصيل الطلب' : 'Order'} #{order.order_number}
                  </h2>
                  <p className="text-xs md:text-sm text-slate-500 dark:text-zinc-400">
                    {new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="text-start md:text-left rtl:md:text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 mb-2">
                    <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></span>
                    <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">{getStatusText(order.status)}</span>
                  </div>
                  {order.tracking_number && (
                    <div className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                      <span className="text-slate-400 uppercase text-[10px] mr-2 font-bold">{order.shipping_method}</span>
                      {order.tracking_number}
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-6">{lang === 'ar' ? 'حالة خط السير والوقت' : 'Tracking Timeline'}</h3>

              {order.histories && order.histories.length > 0 ? (
                <div className="relative pl-4 md:pl-0">
                  <div className={`absolute top-2 bottom-0 w-px bg-slate-100 dark:bg-zinc-800 ${lang === 'ar' ? 'right-4 md:right-[150px]' : 'left-4 md:left-[150px]'}`}></div>
                  <div className="space-y-8">
                    {order.histories.map((history) => (
                      <div key={history.id} className="relative flex flex-col md:flex-row items-start md:items-center group">
                        <div className={`hidden md:block w-[130px] shrink-0 text-xs text-slate-500 dark:text-zinc-400 ${lang === 'ar' ? 'text-left pl-6' : 'text-right pr-6'}`}>
                          <div className="font-semibold">{new Date(history.created_at).toLocaleDateString()}</div>
                          <div className="text-[11px] text-slate-400">{new Date(history.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                        <div className={`absolute md:relative flex h-8 w-8 items-center justify-center bg-white dark:bg-zinc-900 rounded-full ring-4 ring-white dark:ring-zinc-900 border border-slate-200 dark:border-zinc-700 shrink-0 z-10 ${lang === 'ar' ? '-right-4 md:right-0 ml-6' : '-left-4 md:left-0 mr-6'}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(history.status)}`}></span>
                        </div>
                        <div className="bg-slate-50/70 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 rounded-xl p-4 flex-1 w-full ml-6 md:ml-0 rtl:ml-0 rtl:mr-6 rtl:md:mr-0">
                          <div className="md:hidden text-[11px] text-slate-400 mb-1">{new Date(history.created_at).toLocaleString()}</div>
                          <h4 className="font-bold text-sm text-slate-900 dark:text-zinc-100">
                            {lang === 'ar' ? `${getStatusText(history.status)}` : `${getStatusText(history.status)}`}
                          </h4>
                          {history.tracking_number && (
                            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                              {lang === 'ar' ? 'رقم التتبع المرفق:' : 'Associated tracking number:'}
                              <span className="font-mono text-slate-900 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 ml-1 font-bold">{history.tracking_number}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-slate-400 dark:text-zinc-500 text-sm italic">{lang === 'ar' ? 'لا يوجد تحديثات مسجلة بعد.' : 'No timeline updates recorded yet.'}</p>
              )}
            </div>

            {/* الفاتورة وتفاصيل المنتجات المالية المتناسقة */}
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-md border border-slate-100 dark:border-zinc-800 p-6 lg:p-8">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-6">{lang === 'ar' ? 'العناصر المشتراة' : 'Order Details'}</h3>

              <div className="space-y-4">
                {order.items.map(item => {
                  const productName = item.product?.name ?
                    (typeof item.product.name === 'string' ? item.product.name :
                      (item.product.name[lang] || item.product.name['en'] || 'Unknown Product'))
                    : 'Unknown Product';

                  return (
                    <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-zinc-800 last:border-0 last:pb-0">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-zinc-950 rounded-lg overflow-hidden shrink-0 border border-slate-100 dark:border-zinc-800">
                        <img src={getImageUrl(item.product?.images?.[0])} alt={productName} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{productName}</h4>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">{lang === 'ar' ? 'الكمية:' : 'Qty:'} <span className="font-bold">{item.quantity}</span></p>
                      </div>
                      <div className="text-sm">
                        <CurrencyFormat amount={Number(item.unit_price) * item.quantity} />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* الملخص الحسابي النظيف والمنظم هندسياً */}
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-zinc-800 space-y-3 text-sm">

                <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                  <span>{lang === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <CurrencyFormat amount={order.subtotal ?? order.items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0)} />
                </div>

                {order.tax_amount !== undefined && Number(order.tax_amount) > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                    <span>{lang === 'ar' ? 'الضريبة المضافة' : 'VAT'}</span>
                    <CurrencyFormat amount={order.tax_amount} />
                  </div>
                )}

                {order.shipping_amount !== undefined && Number(order.shipping_amount) > 0 && (
                  <div className="flex justify-between items-center text-slate-600 dark:text-zinc-400">
                    <span>{lang === 'ar' ? 'تكاليف الشحن والتوصيل' : 'Shipping'}</span>
                    <CurrencyFormat amount={order.shipping_amount} />
                  </div>
                )}

                {/* خط المجموع النهائي البارز بالخط العريض */}
                <div className="flex justify-between items-center text-lg font-bold text-slate-950 dark:text-white pt-3 border-t border-slate-100 dark:border-zinc-800">
                  <span>{lang === 'ar' ? 'المجموع الإجمالي الكلي' : 'Total Amount'}</span>
                  <CurrencyFormat
                    amount={
                      (order.subtotal ?? order.items.reduce((acc, item) => acc + (Number(item.unit_price) * item.quantity), 0)) +
                      Number(order.tax_amount ?? 0) +
                      Number(order.shipping_amount ?? 0)
                    }
                    size={16}
                  />
                </div>

              </div>
            </div>

          </motion.div>
        )}
      </div>
    </main>
  );
}