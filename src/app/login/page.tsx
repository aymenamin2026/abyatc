"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthContext";
import { authLogin, authRegister, fetchSettings, fetchCountries, verifyRegistration, resendVerificationCode } from "@/lib/api";
import { useLanguage } from "@/components/LanguageContext";
import { t } from "@/lib/translations";
import Link from "next/link";
import { useCart } from "@/components/CartContext";

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

  // Country code state
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+966");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    // Load countries and default settings
    const loadData = async () => {
      try {
        const [countriesData, settingsData] = await Promise.all([
          fetchCountries(),
          fetchSettings()
        ]);

        // Only show the default country if it exists in settings
        if (settingsData?.default_country) {
          setCountries([settingsData.default_country]);
          setSelectedCountry(settingsData.default_country);
          if (settingsData.default_country.phone_code) {
            setSelectedCountryCode(settingsData.default_country.phone_code);
          }
        }
        if (settingsData?.site_name) {
          setSiteName(settingsData.site_name);
        } else {
          const withCodes = (countriesData || []).filter((c: any) => c.phone_code);

          setCountries(withCodes);

          setSelectedCountry(
            settingsData?.default_country ||
            withCodes.find((c: any) => c.phone_code === "+966") ||
            withCodes[0]
          );
        }
      } catch (err) {
        console.error('Error loading countries:', err);
      }
    };
    loadData();
  }, []);

  // Redirect if already logged in
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
      // Prepend country code to phone for registration
      const submitData = isLogin ? credentials : {
        ...credentials,
        phone: selectedCountryCode + credentials.phone.replace(/^0+/, '')
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
      console.log("verificationEmail state:", verificationEmail);
      console.log("localStorage email:", localStorage.getItem("pending_email"));
      console.log("credentials email:", credentials.email);
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

  const filteredCountries = countries.filter((c: any) =>
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    c.phone_code.includes(countrySearch) ||
    c.iso_code_2.toLowerCase().includes(countrySearch.toLowerCase())
  );
  useEffect(() => {
    const mode = localStorage.getItem("auth_mode");

    if (mode === "verify") {
      setAuthMode("verify");
    }

    localStorage.removeItem("auth_mode");
  }, []);

  if (user) return null;

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">
      <Link href="/" className="font-serif text-3xl font-bold tracking-tight text-primary mb-8">
        {siteName}
      </Link>

      <div className="w-full max-w-md bg-background p-8 rounded-2xl shadow-sm border border-border/50">
        {authMode !== "verify" ? (
          <div className="flex bg-muted/30 border border-border rounded-xl p-1 mb-6">
            <button
              onClick={() => { setAuthMode("login"); setAuthError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${authMode === "login" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t('login', lang)}
            </button>
            <button
              onClick={() => { setAuthMode("register"); setAuthError(""); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${authMode === "register" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {t('create_account', lang)}
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold font-serif text-foreground mb-2">{t('verify_email', lang)}</h2>
            <p className="text-sm text-muted-foreground">{t('verification_sent_msg', lang).replace('{email}', verificationEmail)}</p>
          </div>
        )}

        {authError && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-200">
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
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent text-center text-2xl tracking-[0.5em] font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium mt-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? t('verifying', lang) : t('verify_code', lang)}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResendCode}
                className="text-sm text-primary hover:underline font-medium"
              >
                {t('resend_code', lang)}
              </button>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setAuthMode("register")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
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
                  <input
                    type="text"
                    required
                    value={credentials.first_name}
                    onChange={e => setCredentials({ ...credentials, first_name: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('last_name', lang)}</label>
                  <input
                    type="text"
                    required
                    value={credentials.last_name}
                    onChange={e => setCredentials({ ...credentials, last_name: e.target.value })}
                    className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('auth_email', lang)}</label>
              <input
                type="email"
                required
                value={credentials.email}
                onChange={e => setCredentials({ ...credentials, email: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
              />
            </div>
            <div className="text-xs text-red-500">
              {JSON.stringify(countries)}
            </div>
            {authMode === "register" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('mobile_number', lang)}</label>
                <div className="flex gap-0">
                  {/* Country Code Selector */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => { if (countries.length > 1) setShowCountryDropdown(!showCountryDropdown); }}
                      className={`flex items-center gap-1.5 border border-border border-r-0 rounded-l-lg px-3 py-3 bg-muted/30 transition-colors min-w-[90px] justify-center ${countries.length > 1 ? 'hover:bg-muted/50 cursor-pointer' : 'cursor-default'}`}
                    >
                      <span className="text-sm font-semibold text-foreground">{selectedCountryCode}</span>
                      {countries.length > 1 && (
                        <svg className="w-3.5 h-3.5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* Dropdown */}
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-xl shadow-xl z-50 overflow-visible">
                        {countries.length > 1 && (
                          <div className="p-2 border-b border-border">
                            <input
                              type="text"
                              placeholder={t('search_country', lang)}
                              value={countrySearch}
                              onChange={e => setCountrySearch(e.target.value)}
                              className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                              autoFocus
                            />
                          </div>
                        )}
                        <div className="max-h-48 overflow-y-auto">
                          {filteredCountries.map((country: any) => (
                            <button
                              key={country.id}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setSelectedCountryCode(country.phone_code);
                                setShowCountryDropdown(false);
                                setCountrySearch("");
                              }}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${selectedCountryCode === country.phone_code ? 'bg-primary/5 text-primary' : 'text-foreground'
                                }`}
                            >
                              <span>{country.name}</span>
                              <span className="font-mono text-muted-foreground">{country.phone_code}</span>
                            </button>
                          ))}
                          {filteredCountries.length === 0 && (
                            <div className="px-4 py-3 text-sm text-muted-foreground text-center"> {t('no_countries_found', lang)}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

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
                    className="flex-1 border border-border rounded-r-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                  />
                </div>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t('auth_password', lang)}</label>
                {authMode === "login" && (
                  <Link href="/forgot-password" title={t('forgot_password', lang)} className="text-[10px] text-primary hover:underline font-medium uppercase tracking-wider">
                    {t('forgot_password', lang)}
                  </Link>
                )}
              </div>
              <input
                type="password"
                required
                value={credentials.password}
                onChange={e => setCredentials({ ...credentials, password: e.target.value })}
                className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
              />
            </div>

            {authMode === "register" && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">{t('confirm_password', lang)}</label>
                <input
                  type="password"
                  required
                  value={credentials.password_confirmation}
                  onChange={e => setCredentials({ ...credentials, password_confirmation: e.target.value })}
                  className="w-full border border-border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-medium mt-4 shadow-sm hover:shadow-md transition-all disabled:opacity-50"
            >
              {loading ? t('please_wait', lang) : (authMode === "login" ? t('login', lang) : t('create_account', lang))}
            </button>
          </form>
        )}
      </div>

      {/* Close dropdown on outside click */}
      {showCountryDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }} />
      )}
    </div>
  );
}
