"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { t } from "@/lib/translations";
import { useLanguage } from "@/components/LanguageContext";
import { ChevronLeft, Mail, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getHeaders } from "@/lib/api";

export default function ForgotPasswordPage() {
  const { lang } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("Luluh.sa");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { fetchSettings } = await import('@/lib/api');
        const settings = await fetchSettings();
        if (settings?.site_name) setSiteName(settings.site_name);
      } catch (e) { }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // API call would go here
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.abyatc.com/api'}/auth/forgot-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to send reset link");

      setSuccess(true);
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
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
          >
            <ChevronLeft className={`w-4 h-4 transition-transform group-hover:-translate-x-1 ${lang === 'ar' ? 'rotate-180 group-hover:translate-x-1' : ''}`} />
            {lang === 'en' ? 'Back to Login' : 'العودة لتسجيل الدخول'}
          </Link>

          <h1 className="text-2xl font-bold font-serif text-foreground mb-2">
            {lang === 'en' ? 'Forgot Password?' : 'نسيت كلمة السر؟'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {lang === 'en'
              ? "No worries! Enter your email address and we'll send you a 6-digit code to reset your password."
              : "لا تقلق! أدخل بريدك الإلكتروني وسنرسل لك رمزاً مكوناً من 6 أرقام لإعادة تعيين كلمة السر."
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
                  {t('auth_email', lang)}
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full border border-border rounded-xl py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-transparent ${lang === 'ar' ? 'pr-4 pl-10 text-right' : 'pl-11 pr-4'}`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  lang === 'en' ? 'Send Reset Code' : 'إرسال رمز إعادة التعيين'
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
                {lang === 'en' ? 'Check your email' : 'تحقق من بريدك الإلكتروني'}
              </h3>
              <p className="text-sm text-muted-foreground mb-8">
                {lang === 'en'
                  ? `We've sent a 6-digit verification code to ${email}. Please enter it to continue.`
                  : `لقد أرسلنا رمز تحقق مكون من 6 أرقام إلى ${email}. يرجى إدخاله للمتابعة.`
                }
              </p>

              <Link
                href={`/reset-password?email=${encodeURIComponent(email)}`}
                className="block w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium shadow-sm hover:shadow-md transition-all text-center"
              >
                {lang === 'en' ? 'Enter Reset Code' : 'أدخل رمز إعادة التعيين'}
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
