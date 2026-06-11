"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { t } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageContext";
import { ChevronLeft, Lock, CheckCircle2, KeyRound } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getHeaders } from "@/lib/api";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({
    code: "",
    password: "",
    password_confirmation: ""
  });
  const [siteName, setSiteName] = useState("Luluh.sa");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      router.push("/forgot-password");
    }

    async function load() {
      try {
        const { fetchSettings } = await import('@/lib/api');
        const settings = await fetchSettings();
        if (settings?.site_name) setSiteName(settings.site_name);
      } catch (e) { }
    }
    load();
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError(lang === 'ar' ? "كلمات المرور غير متطابقة" : "Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.abyatc.com/api'}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          email,
          code: formData.code,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Reset failed");

      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-primary mb-8">
        {siteName}
      </Link>

      <div className="w-full max-w-md bg-background p-8 rounded-2xl shadow-sm border border-border/50">
        <div className="mb-8">
          <Link
            href="/forgot-password"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
            {lang === 'en' ? 'Back' : 'رجوع'}
          </Link>

          <h1 className="text-2xl font-bold font-serif text-foreground mb-2">
            {lang === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة السر'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === 'en'
              ? `Enter the 6-digit code sent to ${email} and choose a new password.`
              : `أدخل الرمز المكون من 6 أرقام المرسل إلى ${email} واختر كلمة سر جديدة.`
            }
          </p>
        </div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {lang === 'en' ? 'Reset Code' : 'رمز إعادة التعيين'}
                </label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="000000"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.replace(/\D/g, '') })}
                    className={`w-full border border-border rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-transparent text-center text-xl tracking-[0.3em] font-mono ${lang === 'ar' ? 'pr-4 pl-10' : 'pl-11 pr-4'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {lang === 'en' ? 'New Password' : 'كلمة السر الجديدة'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full border border-border rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-transparent ${lang === 'ar' ? 'pr-4 pl-10 text-right' : 'pl-11 pr-4'}`}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  {lang === 'en' ? 'Confirm Password' : 'تأكيد كلمة السر'}
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={formData.password_confirmation}
                    onChange={e => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className={`w-full border border-border rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-transparent ${lang === 'ar' ? 'pr-4 pl-10 text-right' : 'pl-11 pr-4'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || formData.code.length !== 6 || formData.password.length < 8}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  lang === 'en' ? 'Reset Password' : 'إعادة تعيين كلمة السر'
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">
                {lang === 'en' ? 'Password Reset Successful' : 'تم إعادة تعيين كلمة السر'}
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                {lang === 'en'
                  ? "Your password has been changed successfully. Redirecting you to login..."
                  : "تم تغيير كلمة السر بنجاح. جاري توجيهك إلى صفحة تسجيل الدخول..."
                }
              </p>

              <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3 }}
                  className="h-full bg-primary"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
