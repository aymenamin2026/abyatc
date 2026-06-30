"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, ShoppingBag, ArrowRight, Package, Calendar, Mail } from "lucide-react";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";
import { useEffect, useState } from "react";
import { fetchSettings } from "@/lib/api";

export default function ThankYouPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order_number");
  const { lang } = useLanguage();
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [supportEmail, setSupportEmail] = useState("support@abyatc.com");

  // حالة جديدة لحفظ ميعاد التوصيل المتوقع القادم من السيرفر
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>("");

  useEffect(() => {
    async function loadOrderAndSettings() {
      try {
        // 1. جلب إعدادات الموقع الافتراضية
        const settings = await fetchSettings();
        if (settings?.currency_symbol) setCurrencySymbol(settings.currency_symbol);
        if (settings?.support_email) setSupportEmail(settings.support_email);

        // 2. جلب تفاصيل الطلب أوتوماتيكياً عبر الـ API بناءً على رقم الطلب
        if (orderNumber) {
          // استبدل هذا الرابط بمسار الـ API الفعلي لديك لجلب طلب معين
          const response = await fetch(`https://api.abyatc.com/api/orders/${orderNumber}`);
          if (response.ok) {
            const orderData = await response.json();

            // قراءة حقل التوصيل المتوقع من علاقة طريقة الشحن المتواجدة بالطلب
            const delivery = orderData?.shipping_method?.estimated_days;
            if (delivery) {
              if (typeof delivery === 'object') {
                setEstimatedDelivery(delivery[lang] || delivery.ar || delivery.en);
              } else {
                setEstimatedDelivery(delivery);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error loading thank you page data:", error);
      }
    }
    loadOrderAndSettings();
  }, [orderNumber, lang]);

  return (
    <main className="min-h-screen pt-[104px] pb-24 bg-background overflow-hidden relative">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 max-w-3xl">
        <div className={`flex flex-col items-center text-center ${lang === 'ar' ? 'rtl' : 'ltr'}`} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
          {/* Success Icon */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="mb-8 relative"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 relative z-10">
              <CheckCircle2 className="w-12 h-12 text-white" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-green-500 rounded-full blur-xl"
            />
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              {lang === 'ar' ? 'شكراً لطلبك!' : 'Thank You!'}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {lang === 'ar' ? 'لقد تم تأكيد طلبك بنجاح.' : 'Your order has been confirmed and is being processed.'}
            </p>
          </motion.div>

          {/* Order Snapshot Card */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full bg-background border border-border rounded-3xl p-8 shadow-sm mb-12 relative overflow-hidden"
          >
            <div className={`absolute top-0 opacity-5 ${lang === 'ar' ? 'left-0 p-4' : 'right-0 p-4'}`}>
              <Package className="w-32 h-32" />
            </div>

            <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${lang === 'ar' ? 'text-right' : 'text-left'}`}>
              <div className="space-y-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {lang === 'ar' ? 'رقم الطلب' : 'Order Number'}
                  </div>
                  <div className="text-2xl font-mono font-bold text-primary">#{orderNumber || (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...')}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {lang === 'ar' ? 'بريد التأكيد' : 'Confirmation Email'}
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    {lang === 'ar' ? 'تم الإرسال إلى بريدك المسجل' : 'Sent to your registered email'}
                  </div>
                </div>
              </div>

              <div className={`space-y-6 ${lang === 'ar' ? 'md:border-r md:border-border md:pr-8' : 'md:border-l md:border-border md:pl-8'}`}>
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                    {lang === 'ar' ? 'التوصيل المتوقع' : 'Estimated Delivery'}
                  </div>
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    {/* طباعة القيمة القادمة من السيرفر أوتوماتيكياً أو وضع قيمة افتراضية احتياطية */}
                    <span>
                      {estimatedDelivery || (lang === 'ar' ? '3 - 5 أيام عمل' : '3 - 5 Business Days')}
                    </span>
                  </div>
                </div>
                <div>
                  <Link
                    href={`/track?query=${orderNumber}`}
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold group transition-all"
                  >
                    {lang === 'ar' ? 'تتبع حالة الطلب' : 'Track Status'}
                    <ArrowRight className={`w-4 h-4 group-hover:translate-x-1 transition-transform ${lang === 'ar' ? 'rotate-180' : ''}`} />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center"
          >
            <Link
              href="/shop"
              className="flex-1 max-w-[240px] bg-primary text-primary-foreground px-8 py-4 rounded-full font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-5 h-5" />
              {lang === 'ar' ? 'مواصلة التسوق' : 'Continue Shopping'}
            </Link>

            <Link
              href="/account"
              className="flex-1 max-w-[240px] bg-secondary text-secondary-foreground px-8 py-4 rounded-full font-bold hover:bg-secondary/80 transition-all border border-border flex items-center justify-center gap-2"
            >
              {lang === 'ar' ? 'حسابي / طلباتي' : 'My Account / Orders'}
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-12 text-sm text-muted-foreground max-w-md mx-auto"
          >
            {lang === 'ar' ? 'تحتاج مساعدة؟ تواصل مع الدعم عبر' : 'Need help? Contact our support at'} <span className="text-primary font-medium">{supportEmail}</span>
          </motion.p>
        </div>
      </div>
    </main>
  );
}