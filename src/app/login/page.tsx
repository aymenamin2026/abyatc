"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

  return (
    // استخدام pt-32 لإبعاد المحتوى عن النافبار بشكل قطعي
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-start pt-32 pb-12 p-4">

      <div className="w-full max-w-md bg-background rounded-2xl shadow-lg border border-border p-6 sm:p-8">

        {/* الترويسة داخل البطاقة لضمان التباين */}
        <div className="text-center mb-8">
          <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-[#093f89] dark:text-[#fbc70f]">
            {siteName}
          </Link>
          <p className="text-muted-foreground mt-2 text-sm">
            {lang === 'ar' ? 'مرحباً بك في عالم التميز' : 'Welcome to the world of excellence'}
          </p>
        </div>

        {authMode !== "verify" ? (
          <div className="flex bg-muted/50 p-1 rounded-xl mb-6 border border-border">
            <button
              type="button"
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === "login"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t('login', lang)}
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${authMode === "register"
                  ? "bg-[#093f89] text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              {t('create_account', lang)}
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-[#093f89]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#093f89]" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-1">{t('verify_email', lang)}</h2>
            <p className="text-sm text-muted-foreground">
              {t('verification_sent_msg', lang).replace('{email}', verificationEmail)}
            </p>
          </div>
        )}

        {authError && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm mb-6 border border-red-200 dark:border-red-800/30">
            {authError}
          </div>
        )}

        {authMode === "verify" ? (
          <form onSubmit={handleVerifySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('verification_code', lang)}</label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-center text-2xl tracking-[0.5em] font-mono text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-[#093f89] text-white py-3.5 rounded-lg font-medium mt-2 hover:bg-[#093f89]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('verifying', lang) : t('verify_code', lang)}
            </button>

            <div className="text-center pt-2 space-y-2">
              <button type="button" onClick={handleResendCode} className="block w-full text-sm text-[#093f89] dark:text-[#fbc70f] hover:underline font-medium">
                {t('resend_code', lang)}
              </button>
              <button type="button" onClick={() => setAuthMode("register")} className="block w-full text-xs text-muted-foreground hover:text-foreground">
                {t('change_email_back', lang)}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === "register" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('first_name', lang)}</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={credentials.first_name}
                      onChange={e => setCredentials({ ...credentials, first_name: e.target.value })}
                      className="w-full border border-border rounded-lg pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('last_name', lang)}</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={credentials.last_name}
                      onChange={e => setCredentials({ ...credentials, last_name: e.target.value })}
                      className="w-full border border-border rounded-lg pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('auth_email', lang)}</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={credentials.email}
                  onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                  className="w-full border border-border rounded-lg pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground text-sm dir-ltr"
                />
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('mobile_number', lang)}</label>
                <div className="flex">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center justify-center gap-1 border border-border border-l-0 rounded-r-lg px-3 py-2.5 bg-muted/30 hover:bg-muted/50 transition-colors h-full min-w-[80px]"
                    >
                      <span className="text-sm font-semibold text-foreground dir-ltr">
                        {selectedCountry?.phone_code || "+966"}
                      </span>
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-border rounded-lg shadow-xl z-50">
                        <div className="p-2 border-b border-border">
                          <input
                            type="text"
                            placeholder={t('search_country', lang)}
                            value={countrySearch}
                            onChange={e => setCountrySearch(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground"
                            autoFocus
                          />
                        </div>
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.map((country: any) => (
                            <button
                              key={country.id || country.phone_code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setCountrySearch("");
                                setShowCountryDropdown(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 ${selectedCountry?.id === country.id ? 'bg-[#093f89]/5 text-[#093f89]' : 'text-foreground'
                                }`}
                            >
                              <span>{country.name}</span>
                              <span className="font-mono text-muted-foreground">{country.phone_code || "—"}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative flex-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
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
                      className="w-full border border-border rounded-l-lg pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground text-sm dir-ltr"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('auth_password', lang)}</label>
                {authMode === "login" && (
                  <Link href="/forgot-password" title={t('forgot_password', lang)} className="text-xs text-[#093f89] dark:text-[#fbc70f] hover:underline font-medium">
                    {t('forgot_password', lang)}
                  </Link>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full border border-border rounded-lg pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground text-sm dir-ltr"
                />
              </div>
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('confirm_password', lang)}</label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    required
                    value={credentials.password_confirmation}
                    onChange={e => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                    className="w-full border border-border rounded-lg pr-9 pl-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#093f89] bg-transparent text-foreground text-sm dir-ltr"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#093f89] text-white py-3.5 rounded-lg font-medium mt-4 hover:bg-[#093f89]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? t('please_wait', lang) : (authMode === "login" ? t('login', lang) : t('create_account', lang))}
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-border"></div>
              <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase">
                {lang === 'ar' ? 'أو' : 'OR'}
              </span>
              <div className="flex-grow border-t border-border"></div>
            </div>

            <a
              href="https://api.abyatc.com/api/auth/google"
              onClick={() => {
                const nextUrl = new URLSearchParams(window.location.search).get('next') || window.location.pathname;
                sessionStorage.setItem('redirect_after_login', nextUrl);
              }}
              className="w-full flex items-center justify-center gap-2 border border-border bg-background hover:bg-muted/50 py-3 rounded-lg font-medium transition-colors text-foreground text-sm dir-rtl"
            >
              <FcGoogle className="w-5 h-5 shrink-0" />
              <span>
                {lang === 'ar' ? 'المتابعة باستخدام جوجل' : 'Continue with Google'}
              </span>
            </a>
          </form>
        )}
      </div>

      {showCountryDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }} />
      )}
    </div>
  );
}