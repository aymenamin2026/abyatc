"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useLanguage } from '@/components/LanguageContext';
import { t } from '@/lib/translations';
import { getImageUrl, fetchSettings } from '@/lib/api';
import { Truck, Search, Package, Clock, CheckCircle2, AlertCircle } from 'lucide-react'; // أيقونات التتبع

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
    name: any;
    image: string;
  };
}

interface OrderData {
  order_number: string;
  status: string;
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

  // 1. جلب إعدادات العملة للمتجر
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

  // 2. دالة جلب البيانات والاتصال بالباك إند
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

  // 3. التتبع التلقائي الذكي بمجرد الدخول
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

  // 🎨 دالة جلب الألوان المتناسقة مع الحالات الأربع المحدثة
  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    if (s.includes('awaiting_payment') || s.includes('pending')) return 'bg-amber-500'; // الحالة 1: تم استلام الطلب (برتقالي)
    if (s.includes('processing')) return 'bg-blue-500'; // الحالة 2: تحت المعالجة (أزرق)
    if (s.includes('shipped')) return 'bg-indigo-500'; // الحالة 3: في الطريق إليك (نيلي)
    if (s.includes('delivered') || s.includes('completed')) return 'bg-emerald-500'; // الحالة 4: مكتمل (أخضر)
    if (s.includes('cancelled')) return 'bg-rose-500'; // حالة الإلغاء (أحمر)
    return 'bg-amber-500';
  };

  // 📝 دالة مساعدة لترجمة حالات الطلب بدقة بناءً على المسميات الجديدة التي طلبتها
  const getStatusText = (status: string) => {
    const s = status.toLowerCase();
    
    if (s.includes('awaiting_payment') || s.includes('pending')) {
      return lang === 'ar' ? 'تم استلام الطلب' : 'Order Received';
    }
    if (s.includes('processing')) {
      return lang === 'ar' ? 'تحت المعالجة' : 'Under Processing';
    }
    if (s.includes('in_way')) {
      return lang === 'ar' ? 'في الطريق إليك' : 'On The Way';
    }
    if (s.includes('delivered') || s.includes('completed')) {
      return lang === 'ar' ? 'مكتمل' : 'Completed';
    }
    if (s.includes('cancelled')) {
      return lang === 'ar' ? 'ملغي' : 'Cancelled';
    }
    
    return status; // إرجاع الحالة الأصلية كإجراء احتياطي
  };

  return (
    <main className="min-h-screen pt-[104px] pb-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl text-foreground mb-4">
            {lang === 'ar' ? 'تتبع طلبك' : 'Track Your Order'}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {lang === 'ar' 
              ? 'أدخل رقم الطلب أو رقم التتبع للتحقق من حالة الشحنة الخاصة بك.' 
              : 'Enter your order number or tracking number to check the live status of your shipment.'}
          </p>
        </div>

        {/* Search Box */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-background rounded-2xl shadow-sm border border-border p-6 md:p-8 mb-8"
        >
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'ar' ? "رقم الطلب أو التتبع..." : "Order # or Tracking #..."}
              className="flex-1 bg-muted border-transparent focus:border-foreground focus:ring-0 rounded-xl px-5 py-3.5 text-foreground placeholder-muted-foreground"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="bg-foreground hover:bg-foreground/80 text-background px-8 py-3.5 rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {loading ? (lang === 'ar' ? 'جاري البحث...' : 'Searching...') : (lang === 'ar' ? 'تتبع' : 'Track')}
            </button>
          </form>
          {error && (
            <div className="mt-4 p-4 bg-rose-50 text-rose-600 rounded-xl text-sm border border-rose-100">
              {error}
            </div>
          )}
        </motion.div>

        {/* Results */}
        {order && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            {/* Header Card */}
            <div className="bg-background rounded-2xl shadow-sm border border-border p-6 lg:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 pb-8 border-b border-border">
                <div>
                  <h2 className="text-xl font-medium text-foreground mb-1">
                    {lang === 'ar' ? 'الطلب' : 'Order'} #{order.order_number}
                  </h2>
                  <p className="text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-left md:text-right">
                   <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border mb-2">
                     <span className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}></span>
                     <span className="text-sm font-medium text-foreground">{getStatusText(order.status)}</span>
                   </div>
                   {order.tracking_number && (
                     <div className="text-sm font-mono text-muted-foreground">
                       <span className="text-muted-foreground/70 uppercase text-xs mr-2">{order.shipping_method}</span>
                       {order.tracking_number}
                     </div>
                   )}
                </div>
              </div>
              
              <h3 className="text-lg font-medium text-foreground mb-6">{lang === 'ar' ? 'تاريخ التحديثات' : 'Tracking Timeline'}</h3>
              
              {/* Timeline */}
              {order.histories && order.histories.length > 0 ? (
                <div className="relative pl-4 md:pl-0">
                  <div className={`absolute top-2 bottom-0 w-px bg-border ${lang === 'ar' ? 'right-4 md:right-[150px]' : 'left-4 md:left-[150px]'}`}></div>
                  
                  <div className="space-y-8">
                    {order.histories.map((history) => (
                      <div key={history.id} className="relative flex flex-col md:flex-row items-start md:items-center group">
                        <div className={`hidden md:block w-[130px] shrink-0 text-sm text-muted-foreground ${lang === 'ar' ? 'text-left pl-6' : 'text-right pr-6'}`}>
                           <div>{new Date(history.created_at).toLocaleDateString()}</div>
                           <div className="text-xs text-muted-foreground/70">{new Date(history.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </div>

                        <div className={`absolute md:relative flex h-8 w-8 items-center justify-center bg-background rounded-full ring-4 ring-background border border-border shrink-0 z-10 ${lang === 'ar' ? '-right-4 md:right-0 ml-6' : '-left-4 md:left-0 mr-6'}`}>
                          <span className={`h-2.5 w-2.5 rounded-full ${getStatusColor(history.status)}`}></span>
                        </div>

                        <div className="bg-muted border border-border rounded-xl p-4 flex-1 w-full ml-6 md:ml-0 rtl:ml-0 rtl:mr-6 rtl:md:mr-0">
                          <div className="md:hidden text-xs text-muted-foreground mb-1">
                            {new Date(history.created_at).toLocaleString()}
                          </div>
                          <h4 className="font-medium text-foreground mb-1">
                            {lang === 'ar' 
                              ? `تغيرت الحالة إلى: ${getStatusText(history.status)}` 
                              : `Status changed to: ${getStatusText(history.status)}`}
                          </h4>
                          {history.tracking_number && (
                            <p className="text-sm text-muted-foreground">
                              {lang === 'ar' ? 'رقم التتبع' : 'Tracking number'} 
                              <span className="font-mono text-foreground bg-background px-1.5 py-0.5 rounded border border-border ml-1">{history.tracking_number}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm italic">{lang === 'ar' ? 'لا يوجد تحديثات مسجلة بعد.' : 'No timeline updates recorded yet.'}</p>
              )}
            </div>
            
            {/* Products Array Summary */}
            <div className="bg-background rounded-2xl shadow-sm border border-border p-6 lg:p-8">
               <h3 className="text-lg font-medium text-foreground mb-6">{lang === 'ar' ? 'تفاصيل الطلب' : 'Order Details'}</h3>
               <div className="space-y-4">
                 {order.items.map(item => {
                   const productName = item.product?.name ? 
                     (typeof item.product.name === 'string' ? item.product.name : 
                      (item.product.name[lang] || item.product.name['en'] || 'Unknown Product')) 
                     : 'Unknown Product';
                   
                   return (
                   <div key={item.id} className="flex items-center gap-4 pb-4 border-b border-border last:border-0 last:pb-0">
                     <div className="h-16 w-16 bg-muted rounded-lg overflow-hidden shrink-0 border border-border">
                        <img src={getImageUrl(item.product?.image)} alt={productName} className="w-full h-full object-cover" />
                     </div>
                     <div className="flex-1">
                       <h4 className="text-sm font-medium text-foreground line-clamp-1">{productName}</h4>
                       <p className="text-xs text-muted-foreground">{lang === 'ar' ? 'الكمية:' : 'Qty:'} {item.quantity}</p>
                     </div>
                     <div className="text-sm font-medium text-foreground flex items-center">
                       {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                         <span className="mr-1 inline-flex items-center">
                           <Image src="/riyal-dark.svg" alt="SAR" width={12} height={12} className="inline-block theme-light-only" />
                           <Image src="/riyal-light.svg" alt="SAR" width={12} height={12} className="theme-dark-only" />
                         </span>
                       ) : (
                         <span dangerouslySetInnerHTML={{ __html: currencySymbol }} className="mr-1" />
                       )}
                       {(Number(item.unit_price) * item.quantity).toFixed(2)}
                     </div>
                   </div>
                   );
                 })}
               </div>
               
               <div className="mt-8 pt-6 border-t border-border flex justify-between items-center text-lg font-medium text-foreground">
                 <span>{lang === 'ar' ? 'المجموع الكلي' : 'Total Amount'}</span>
                 <span className="flex items-center">
                   {currencySymbol === '/riyal-light.svg' || currencySymbol === '/riyal-dark.svg' ? (
                     <span className="mr-1 inline-flex items-center">
                       <Image src="/riyal-dark.svg" alt="SAR" width={16} height={16} className="inline-block theme-light-only" />
                       <Image src="/riyal-light.svg" alt="SAR" width={16} height={16} className="theme-dark-only" />
                     </span>
                   ) : (
                     <span dangerouslySetInnerHTML={{ __html: currencySymbol }} className="mr-1" />
                   )}
                   {Number(order.total_amount).toFixed(2)}
                 </span>
               </div>
            </div>

          </motion.div>
        )}

      </div>
    </main>
  );
}