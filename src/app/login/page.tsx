"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FcGoogle } from "react-icons/fc";
import { Loader2, Mail, Lock, User, Phone, CheckCircle2 } from "lucide-react";

// Context & APIs
import { useAuth } from "@/components/AuthContext";
import { useLanguage } from "@/components/LanguageContext";
import { useCart } from "@/components/CartContext";
import { t } from "@/lib/translations";
import { authLogin, authRegister, fetchSettings, fetchCountries, verifyRegistration, resendVerificationCode } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { lang } = useLanguage();
  const { syncCart } = useCart();

  const [authMode, setAuthMode] = useState<"login" | "register" | "verify">("login");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("Lamaa Abyat");

  const [credentials, setCredentials] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: ""
  });

  const [verificationCode, setVerificationCode] = useState("");
  const [verificationEmail, setVerificationEmail] = useState("");

  // Country code state
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, settingsData] = await Promise.all([
          fetchCountries(),
          fetchSettings(),
        ]);

        const withCodes = countriesData || [];
        setCountries(withCodes);

        if (settingsData?.default_country) {
          setSelectedCountry(settingsData.default_country);
        } else if (withCodes.length > 0) {
          const ksa = withCodes.find((c: any) => c.phone_code === "+966");
          setSelectedCountry(ksa || withCodes[0]);
        }

        if (settingsData?.site_name) {
          setSiteName(settingsData.site_name);
        }
      } catch (err) {
        console.error('Error loading countries:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (user) {
      router.push("/account");
    }
  }, [user, router]);

  useEffect(() => {
    const mode = localStorage.getItem("auth_mode");
    if (mode === "verify") {
      setAuthMode("verify");
      setVerificationEmail(localStorage.getItem("pending_email") || "");
    }
    localStorage.removeItem("auth_mode");
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);
    const isLogin = authMode === "login";

    if (!isLogin && credentials.password !== credentials.password_confirmation) {
      setAuthError(t('passwords_dont_match', lang));
      setLoading(false);
      return;
    }

    try {
      const submitData = isLogin ? credentials : {
        ...credentials,
        phone: (selectedCountry?.phone_code || "+966") + credentials.phone.replace(/^0+/, '')
      };

      const data = isLogin ? await authLogin(submitData) : await authRegister(submitData);

      if (data.requires_verification) {
        const emailFromRequest = credentials.email;
        setVerificationEmail(emailFromRequest);
        localStorage.setItem("pending_email", emailFromRequest);
        setAuthMode("verify");
      } else {
        login(data.customer, data.access_token);
        await syncCart();
        router.push("/account");
      }
    } catch (err: any) {
      setAuthError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setLoading(true);

    try {
      const email = localStorage.getItem("pending_email") || verificationEmail;
      if (!email) {
        setAuthError("Email not found. Please register again.");
        return;
      }

      const data = await verifyRegistration(email, verificationCode);
      login(data.customer, data.access_token);
      await syncCart();

      localStorage.removeItem("pending_email");
      const redirect = localStorage.getItem("after_verify_redirect");
      localStorage.removeItem("after_verify_redirect");

      if (redirect === "checkout") {
        router.push("/checkout?from=auth");
      } else {
        router.push("/account");
      }
    } catch (err: any) {
      setAuthError(err.message || t("verification_failed", lang));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setAuthError("");
    try {
      await resendVerificationCode(verificationEmail);
      // يمكن استبدالها بـ Toast Message مستقبلاً
      alert(t('code_resent_success', lang));
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const filteredCountries = (countries || []).filter((c: any) => {
    return (
      (c?.name || "").toLowerCase().includes(countrySearch.toLowerCase()) ||
      (c?.phone_code || "").includes(countrySearch) ||
      (c?.iso_code_2 || "").toLowerCase().includes(countrySearch.toLowerCase())
    );
  });

  if (user) return null;

  // Animation variants
  const formVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* تأثيرات الإضاءة الخلفية */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#093f89]/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#fbc70f]/10 blur-[120px] rounded-full pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-4xl font-bold tracking-tight text-[#093f89] dark:text-white inline-block hover:scale-105 transition-transform duration-300">
            {siteName}
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            {lang === 'ar' ? 'مرحباً بك في عالم التميز' : 'Welcome to the world of excellence'}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-2xl ring-1 ring-gray-900/5 dark:ring-white/10">

          {authMode !== "verify" ? (
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl mb-8 relative">
              <button
                type="button"
                onClick={() => { setAuthMode("login"); setAuthError(""); }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 ${authMode === "login" ? "text-white" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {t('login', lang)}
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode("register"); setAuthError(""); }}
                className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 relative z-10 ${authMode === "register" ? "text-[#093f89] dark:text-gray-900" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                {t('create_account', lang)}
              </button>

              {/* Animated Tab Indicator */}
              <motion.div
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl shadow-md ${authMode === "login" ? "bg-[#093f89]" : "bg-[#fbc70f]"
                  }`}
                initial={false}
                animate={{
                  x: authMode === "login" ? (lang === 'ar' ? "0%" : "0%") : (lang === 'ar' ? "-100%" : "100%")
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              />
            </div>
          ) : (
            <div className="mb-8 text-center">
              <div className="w-16 h-16 bg-[#093f89]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-[#093f89]" />
              </div>
              <h2 className="text-2xl font-bold font-serif text-foreground mb-2">{t('verify_email', lang)}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('verification_sent_msg', lang).replace('{email}', verificationEmail)}
              </p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {authError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-sm mb-6 border border-red-200 dark:border-red-800/30 flex items-center gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-red-600 dark:bg-red-400 shrink-0" />
                {authError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            {authMode === "verify" ? (
              <motion.form
                key="verify"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleVerifySubmit}
                className="space-y-6"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('verification_code', lang)}</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="••••••"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-[#fbc70f] focus:border-[#093f89] bg-gray-50/50 dark:bg-gray-800/50 text-center text-3xl tracking-[1em] font-mono font-bold transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || verificationCode.length !== 6}
                  className="w-full bg-[#093f89] text-white py-4 rounded-xl font-bold mt-4 shadow-lg shadow-[#093f89]/20 hover:shadow-[#093f89]/40 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  {loading ? t('verifying', lang) : t('verify_code', lang)}
                </button>

                <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={handleResendCode} className="text-sm text-[#093f89] dark:text-[#fbc70f] hover:underline font-medium transition-colors">
                    {t('resend_code', lang)}
                  </button>
                  <button type="button" onClick={() => setAuthMode("register")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                    {t('change_email_back', lang)}
                  </button>
                </div>
              </motion.form>
            ) : (
              <motion.form
                key={authMode}
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onSubmit={handleAuthSubmit}
                className="space-y-5"
              >
                {authMode === "register" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('first_name', lang)}</label>
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#093f89] transition-colors" />
                        <input
                          type="text"
                          required
                          value={credentials.first_name}
                          onChange={e => setCredentials({ ...credentials, first_name: e.target.value })}
                          className="w-full border border-gray-200 dark:border-gray-800 rounded-xl pr-10 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 focus:border-[#093f89] bg-gray-50 dark:bg-gray-800/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                    <div className="relative group">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('last_name', lang)}</label>
                      <div className="relative">
                        <User className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#093f89] transition-colors" />
                        <input
                          type="text"
                          required
                          value={credentials.last_name}
                          onChange={e => setCredentials({ ...credentials, last_name: e.target.value })}
                          className="w-full border border-gray-200 dark:border-gray-800 rounded-xl pr-10 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 focus:border-[#093f89] bg-gray-50 dark:bg-gray-800/50 transition-all text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('auth_email', lang)}</label>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#093f89] transition-colors" />
                    <input
                      type="email"
                      required
                      value={credentials.email}
                      onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-800 rounded-xl pr-10 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 focus:border-[#093f89] bg-gray-50 dark:bg-gray-800/50 transition-all text-sm dir-ltr"
                    />
                  </div>
                </div>

                {authMode === "register" && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('mobile_number', lang)}</label>
                    <div className="flex gap-0 group relative">
                      {/* Country Code Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                          className="flex items-center gap-2 border border-gray-200 dark:border-gray-800 border-l-0 rounded-r-xl px-4 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors h-full focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 relative z-10"
                        >
                          <span className="text-sm font-bold text-foreground font-mono" dir="ltr">
                            {selectedCountry?.phone_code || "+966"}
                          </span>
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {showCountryDropdown && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-[calc(100%+8px)] right-0 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                            >
                              <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <input
                                  type="text"
                                  placeholder={t('search_country', lang)}
                                  value={countrySearch}
                                  onChange={e => setCountrySearch(e.target.value)}
                                  className="w-full px-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-white dark:bg-gray-900"
                                  autoFocus
                                />
                              </div>
                              <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredCountries.map((country: any) => (
                                  <button
                                    key={country.id || country.phone_code}
                                    type="button"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setCountrySearch("");
                                      setShowCountryDropdown(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${selectedCountry?.id === country.id ? 'bg-[#093f89]/5 text-[#093f89] font-bold' : 'text-foreground hover:bg-gray-50 dark:hover:bg-gray-800'
                                      }`}
                                  >
                                    <span>{country.name}</span>
                                    <span className="font-mono text-muted-foreground">{country.phone_code || "—"}</span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#093f89] transition-colors z-10" />
                        <input
                          type="tel"
                          required
                          placeholder={selectedCountry?.min_digits === selectedCountry?.max_digits ? t('enter_digits', lang).replace('{digits}', selectedCountry?.min_digits) : t('mobile_number', lang)}
                          value={credentials.phone}
                          minLength={selectedCountry?.min_digits}
                          maxLength={selectedCountry?.max_digits}
                          onChange={e => {
                            const val = e.target.value.replace(/[^0-9]/g, '');
                            if (selectedCountry?.max_digits && val.length > selectedCountry.max_digits) return;
                            setCredentials({ ...credentials, phone: val });
                          }}
                          className="w-full border border-gray-200 dark:border-gray-800 rounded-l-xl pl-10 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 focus:border-[#093f89] bg-gray-50 dark:bg-gray-800/50 transition-all text-sm font-mono"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">{t('auth_password', lang)}</label>
                    {authMode === "login" && (
                      <Link href="/forgot-password" title={t('forgot_password', lang)} className="text-[11px] text-[#093f89] dark:text-[#fbc70f] hover:underline font-bold transition-colors">
                        {t('forgot_password', lang)}
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#093f89] transition-colors" />
                    <input
                      type="password"
                      required
                      value={credentials.password}
                      onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                      className="w-full border border-gray-200 dark:border-gray-800 rounded-xl pr-10 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 focus:border-[#093f89] bg-gray-50 dark:bg-gray-800/50 transition-all text-sm dir-ltr"
                    />
                  </div>
                </div>

                {authMode === "register" && (
                  <div className="relative group">
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{t('confirm_password', lang)}</label>
                    <div className="relative">
                      <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#093f89] transition-colors" />
                      <input
                        type="password"
                        required
                        value={credentials.password_confirmation}
                        onChange={e => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                        className="w-full border border-gray-200 dark:border-gray-800 rounded-xl pr-10 pl-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#fbc70f]/50 focus:border-[#093f89] bg-gray-50 dark:bg-gray-800/50 transition-all text-sm dir-ltr"
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#093f89] text-white py-4 rounded-xl font-bold mt-2 shadow-lg shadow-[#093f89]/20 hover:shadow-[#093f89]/40 hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-2 group/btn"
                >
                  {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                  <span className="group-hover/btn:text-[#fbc70f] transition-colors duration-300">
                    {loading ? t('please_wait', lang) : (authMode === "login" ? t('login', lang) : t('create_account', lang))}
                  </span>
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                  <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    {lang === 'ar' ? 'أو' : 'OR'}
                  </span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-800"></div>
                </div>

                <a
                  href="https://api.abyatc.com/api/auth/google"
                  onClick={() => {
                    const nextUrl = new URLSearchParams(window.location.search).get('next') || window.location.pathname;
                    sessionStorage.setItem('redirect_after_login', nextUrl);
                  }}
                  className="group w-full flex items-center justify-center gap-3 border-2 border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 py-3.5 px-6 rounded-xl font-bold transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700 dir-rtl text-gray-700 dark:text-gray-200"
                >
                  <FcGoogle className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 shrink-0" />
                  <span>
                    {lang === 'ar' ? 'المتابعة باستخدام جوجل' : 'Continue with Google'}
                  </span>
                </a>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* إغلاق القائمة المنسدلة للدول عند النقر خارجها */}
      {showCountryDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }} />
      )}
    </div>
  );
}