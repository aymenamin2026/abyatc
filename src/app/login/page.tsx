"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { authLogin, authRegister, fetchSettings, fetchCountries, verifyRegistration, resendVerificationCode } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";
import Link from "next/link";
import { useCart } from "@/components/CartContext";
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, Lock, User, Phone, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { user, login } = useAuth();
  const { lang } = useLanguage();
  const { syncCart } = useCart();

  const [authMode, setAuthMode] = useState<"login" | "register" | "verify">("login");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteName, setSiteName] = useState("abyatc.vercel.app");
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
        localStorage.setItem("auth_mode", "verify");
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
      const email = localStorage.getItem("pending_email");
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

  useEffect(() => {
    const mode = localStorage.getItem("auth_mode");
    if (mode === "verify") {
      setAuthMode("verify");
    }
    localStorage.removeItem("auth_mode");
  }, []);

  if (user) return null;

  // Variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut", staggerChildren: 0.1 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1120] flex flex-col items-center justify-center p-4 relative overflow-hidden">

      {/* Background Ambient Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#093f89]/20 dark:bg-[#093f89]/30 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#fbc70f]/10 dark:bg-[#fbc70f]/15 blur-[100px] rounded-full pointer-events-none z-0" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative z-10 mb-8 text-center"
      >
        <Link href="/" className="font-serif text-4xl sm:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#093f89] to-[#07326d] dark:from-white dark:to-slate-300">
          {siteName}
        </Link>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">{t('welcome_back', lang) || "أهلاً بك مجدداً في عالم الفخامة"}</p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[28rem] relative z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-white/40 dark:border-slate-800"
      >
        {authMode !== "verify" ? (
          <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full mb-8 relative">
            <button
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 z-10 ${authMode === "login" ? "text-white dark:text-slate-900 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}
            >
              {t('login', lang)}
            </button>
            <button
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all duration-300 z-10 ${authMode === "register" ? "text-white dark:text-slate-900 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"}`}
            >
              {t('create_account', lang)}
            </button>
            {/* Animated Active Background */}
            <motion.div
              layoutId="activeTab"
              className="absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-gradient-to-r from-[#093f89] to-[#07326d] dark:from-[#fbc70f] dark:to-[#e5b50d] rounded-xl z-0"
              initial={false}
              animate={{
                left: authMode === "login" ? (lang === 'ar' ? "auto" : "6px") : (lang === 'ar' ? "6px" : "auto"),
                right: authMode === "login" ? (lang === 'ar' ? "6px" : "auto") : (lang === 'ar' ? "auto" : "6px"),
              }}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          </div>
        ) : (
          <motion.div variants={itemVariants} className="mb-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-[#093f89]/10 dark:bg-[#fbc70f]/10 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="w-8 h-8 text-[#093f89] dark:text-[#fbc70f]" />
            </div>
            <h2 className="text-2xl font-bold font-serif text-slate-900 dark:text-white mb-2">{t('verify_email', lang)}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{t('verification_sent_msg', lang).replace('{email}', verificationEmail)}</p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {authError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl text-sm mb-6 border border-red-200 dark:border-red-800/50 flex items-center gap-3 font-medium"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-pulse"></span>
              {authError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {authMode === "verify" ? (
            <motion.form key="verify-form" variants={containerVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleVerifySubmit} className="space-y-5">
              <motion.div variants={itemVariants}>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">{t('verification_code', lang)}</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89] dark:focus:border-[#fbc70f] dark:focus:ring-[#fbc70f] transition-all text-center text-3xl tracking-[0.5em] font-mono text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600"
                  dir="ltr"
                />
              </motion.div>

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="w-full bg-gradient-to-r from-[#093f89] to-[#07326d] dark:from-[#fbc70f] dark:to-[#e5b50d] text-white dark:text-slate-900 py-4 rounded-2xl font-bold mt-2 shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <span className="animate-pulse">{t('verifying', lang)}</span> : t('verify_code', lang)}
              </motion.button>

              <motion.div variants={itemVariants} className="flex flex-col items-center gap-3 pt-4">
                <button type="button" onClick={handleResendCode} className="text-sm text-[#093f89] dark:text-[#fbc70f] hover:underline font-bold transition-all">
                  {t('resend_code', lang)}
                </button>
                <button type="button" onClick={() => setAuthMode("register")} className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors font-medium">
                  {t('change_email_back', lang)}
                </button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.form key={authMode} variants={containerVariants} initial="hidden" animate="visible" exit="exit" onSubmit={handleAuthSubmit} className="space-y-5">

              {authMode === "register" && (
                <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <User className="absolute top-4 left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder={t('first_name', lang)}
                      value={credentials.first_name}
                      onChange={e => setCredentials({ ...credentials, first_name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-4 focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89] dark:focus:border-[#fbc70f] dark:focus:ring-[#fbc70f] transition-all text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder={t('last_name', lang)}
                      value={credentials.last_name}
                      onChange={e => setCredentials({ ...credentials, last_name: e.target.value })}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-4 focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89] dark:focus:border-[#fbc70f] dark:focus:ring-[#fbc70f] transition-all text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="relative">
                <Mail className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="email"
                  required
                  placeholder={t('auth_email', lang)}
                  value={credentials.email}
                  onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89] dark:focus:border-[#fbc70f] dark:focus:ring-[#fbc70f] transition-all text-sm text-slate-900 dark:text-white ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                />
              </motion.div>

              {authMode === "register" && (
                <motion.div variants={itemVariants}>
                  <div className="flex bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus-within:border-[#093f89] focus-within:ring-1 focus-within:ring-[#093f89] dark:focus-within:border-[#fbc70f] dark:focus-within:ring-[#fbc70f] transition-all relative">

                    {/* Country Selector */}
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-2 px-4 py-4 border-l rtl:border-r rtl:border-l-0 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors rounded-l-2xl rtl:rounded-r-2xl rtl:rounded-l-none"
                    >
                      <span className="text-sm font-bold text-slate-900 dark:text-white" dir="ltr">
                        {selectedCountry?.phone_code || "+966"}
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    </button>

                    {/* Dropdown Menu */}
                    <AnimatePresence>
                      {showCountryDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                          className="absolute top-[110%] left-0 w-72 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
                            <input
                              type="text"
                              placeholder={t('search_country', lang)}
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              className="w-full px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-[#093f89] dark:focus:border-[#fbc70f] text-slate-900 dark:text-white transition-all"
                              autoFocus
                            />
                          </div>
                          <div className="max-h-56 overflow-y-auto custom-scrollbar">
                            {filteredCountries.map((country: any) => (
                              <button
                                key={country.id || country.phone_code}
                                type="button"
                                onClick={() => {
                                  setSelectedCountry(country);
                                  setCountrySearch("");
                                  setShowCountryDropdown(false);
                                }}
                                className={`w-full flex items-center justify-between px-5 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors ${selectedCountry?.id === country.id ? 'bg-[#093f89]/5 text-[#093f89] dark:bg-[#fbc70f]/10 dark:text-[#fbc70f] font-bold' : 'text-slate-700 dark:text-slate-300'}`}
                              >
                                <span>{country.name}</span>
                                <span className="font-mono text-slate-400" dir="ltr">{country.phone_code || "—"}</span>
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Phone Input */}
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
                      className="flex-1 bg-transparent px-4 py-4 focus:outline-none text-sm text-slate-900 dark:text-white w-full min-w-0"
                      dir="ltr"
                    />
                  </div>
                </motion.div>
              )}

              <motion.div variants={itemVariants} className="relative">
                <Lock className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} w-5 h-5 text-slate-400 pointer-events-none`} />
                <input
                  type="password"
                  required
                  placeholder={t('auth_password', lang)}
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89] dark:focus:border-[#fbc70f] dark:focus:ring-[#fbc70f] transition-all text-sm text-slate-900 dark:text-white ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                />
                {authMode === "login" && (
                  <Link href="/forgot-password" title={t('forgot_password', lang)} className={`absolute top-4 ${lang === 'ar' ? 'left-4' : 'right-4'} text-xs text-[#093f89] dark:text-[#fbc70f] hover:underline font-bold transition-all z-10`}>
                    {t('forgot_password', lang)}
                  </Link>
                )}
              </motion.div>

              {authMode === "register" && (
                <motion.div variants={itemVariants} className="relative">
                  <Lock className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} w-5 h-5 text-slate-400 pointer-events-none`} />
                  <input
                    type="password"
                    required
                    placeholder={t('confirm_password', lang)}
                    value={credentials.password_confirmation}
                    onChange={e => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                    className={`w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 focus:outline-none focus:border-[#093f89] focus:ring-1 focus:ring-[#093f89] dark:focus:border-[#fbc70f] dark:focus:ring-[#fbc70f] transition-all text-sm text-slate-900 dark:text-white ${lang === 'ar' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                  />
                </motion.div>
              )}

              <motion.button
                variants={itemVariants}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#093f89] to-[#07326d] dark:from-[#fbc70f] dark:to-[#e5b50d] text-white dark:text-slate-900 py-4 rounded-2xl font-bold mt-2 shadow-lg shadow-[#093f89]/20 dark:shadow-[#fbc70f]/10 hover:shadow-xl transition-all transform active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {loading && <span className="w-5 h-5 border-2 border-white/30 dark:border-slate-900/30 border-t-white dark:border-t-slate-900 rounded-full animate-spin"></span>}
                {loading ? t('please_wait', lang) : (authMode === "login" ? t('login', lang) : t('create_account', lang))}
              </motion.button>

            </motion.form>
          )}
        </AnimatePresence>

        {/* Google Authentication - Styled Elegantly */}
        {authMode !== "verify" && (
          <motion.div variants={itemVariants} initial="hidden" animate="visible" className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <a
              href="https://api.abyatc.com/api/auth/google"
              onClick={() => {
                const nextUrl = new URLSearchParams(window.location.search).get('next') || window.location.pathname;
                sessionStorage.setItem('redirect_after_login', nextUrl);
              }}
              className="group w-full flex items-center justify-center gap-3 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 py-4 px-6 rounded-2xl font-bold transition-all duration-300 active:scale-[0.98] shadow-sm hover:shadow-md text-sm text-slate-700 dark:text-slate-200"
            >
              <FcGoogle className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 shrink-0" />
              <span>
                {lang === 'ar' ? 'المتابعة باستخدام جوجل' : 'Continue with Google'}
              </span>
            </a>
          </motion.div>
        )}
      </motion.div>

      {showCountryDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }} />
      )}
    </div>
  );
}