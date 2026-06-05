"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Clock, ShoppingBag, ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/LanguageContext";
import { Suspense } from "react";

function CheckoutResultContent() {
  const searchParams = useSearchParams();
  const { lang } = useLanguage();

  const status = searchParams.get("status") || "failed";
  const orderNumber = searchParams.get("order_number");
  const error = searchParams.get("error");

  const isSuccess = status === "success";
  const isPending = status === "pending";

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-background rounded-3xl shadow-xl border border-border p-8 sm:p-12 max-w-lg w-full text-center"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          className="mx-auto mb-6"
        >
          {isSuccess ? (
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          ) : isPending ? (
            <div className="w-20 h-20 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center mx-auto">
              <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
            </div>
          ) : (
            <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
            </div>
          )}
        </motion.div>

        {/* Title */}
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {isSuccess
            ? lang === "ar" ? "تم الدفع بنجاح!" : "Payment Successful!"
            : isPending
            ? lang === "ar" ? "الدفع قيد المعالجة" : "Payment Pending"
            : lang === "ar" ? "فشل الدفع" : "Payment Failed"
          }
        </h1>

        {/* Description */}
        <p className="text-muted-foreground mb-6 leading-relaxed">
          {isSuccess
            ? lang === "ar"
              ? "تم تأكيد طلبك وسيتم معالجته قريباً. شكراً لتسوقك معنا!"
              : "Your order has been confirmed and will be processed shortly. Thank you for shopping with us!"
            : isPending
            ? lang === "ar"
              ? "دفعتك قيد المعالجة. سيتم تحديث حالة الطلب تلقائياً."
              : "Your payment is being processed. The order status will be updated automatically."
            : lang === "ar"
            ? "لم يتم إكمال الدفع. يمكنك المحاولة مرة أخرى أو اختيار طريقة دفع مختلفة."
            : "The payment could not be completed. You can try again or choose a different payment method."
          }
        </p>

        {/* Order Number */}
        {orderNumber && (
          <div className="bg-muted/50 rounded-xl p-4 mb-6 border border-border/50">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              {lang === "ar" ? "رقم الطلب" : "Order Number"}
            </p>
            <p className="text-lg font-bold font-mono text-foreground">{orderNumber}</p>
          </div>
        )}

        {/* Error Message */}
        {error && !isSuccess && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-red-700 dark:text-red-300">{decodeURIComponent(error)}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mt-8">
          {isSuccess ? (
            <>
              <Link
                href="/account?tab=orders"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                {lang === "ar" ? "طلباتي" : "My Orders"}
              </Link>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium transition-all hover:bg-muted active:scale-95"
              >
                <Home className="w-4 h-4" />
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/checkout"
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium transition-all hover:shadow-lg active:scale-95"
              >
                <ArrowLeft className="w-4 h-4" />
                {lang === "ar" ? "المحاولة مرة أخرى" : "Try Again"}
              </Link>
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 border border-border text-foreground px-6 py-3 rounded-xl font-medium transition-all hover:bg-muted active:scale-95"
              >
                <Home className="w-4 h-4" />
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function CheckoutResult() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-muted/20 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    }>
      <CheckoutResultContent />
    </Suspense>
  );
}
