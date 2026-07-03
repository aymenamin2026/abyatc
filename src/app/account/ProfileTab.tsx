"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Phone, Lock, ShieldCheck, AlertCircle, CheckCircle2, ChevronDown, Search } from "lucide-react";

import { updateCustomerProfile, requestEmailChange, verifyEmailChange, fetchCountries, fetchSettings } from "@/lib/api";
import { t } from "@/lib/translations";

// 1. تعريف الأنواع (Strict Typing)
interface CustomerData {
  id: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  customer_type: string;
  [key: string]: any;

}

interface Country {
  id: string | number;
  name: string;
  phone_code: string;
  min_digits?: number;
  max_digits?: number;
}

interface ProfileTabProps {
  lang: "en" | "ar";
  user: CustomerData; // استخدام النوع الموحد هنا
  login: (user: CustomerData, token: string) => void; // توحيد النوع هنا أيضاً
  token: string | null;
}

export default function ProfileTab({ lang, user, login, token }: ProfileTabProps) {
  const isRtl = lang === "ar";

  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    password: "",
    password_confirmation: ""
  });

  // Phone state
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+966");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Email change state
  const [currentEmail, setCurrentEmail] = useState(user?.email || "");
  const [newEmail, setNewEmail] = useState("");
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, settingsData] = await Promise.all([
          fetchCountries(),
          fetchSettings()
        ]);

        const withCodes = (countriesData || []).filter((c: Country) => c.phone_code);

        const dc = settingsData?.defaultCountry || settingsData?.default_country;
        if (dc) {
          setCountries([dc]);
          setSelectedCountry(dc);
          setSelectedCountryCode(dc.phone_code || "+966");
          if (user?.phone && user.phone.startsWith(dc.phone_code)) {
            setPhoneNumber(user.phone.slice(dc.phone_code.length));
          } else {
            setPhoneNumber(user?.phone || "");
          }
        } else {
          setCountries(withCodes);
          let matched = false;
          if (user?.phone) {
            const sortedCodes = [...withCodes].sort((a, b) => b.phone_code.length - a.phone_code.length);
            for (const c of sortedCodes) {
              if (user.phone.startsWith(c.phone_code)) {
                setSelectedCountry(c);
                setSelectedCountryCode(c.phone_code);
                setPhoneNumber(user.phone.slice(c.phone_code.length));
                matched = true;
                break;
              }
            }
          }

          if (!matched) {
            const defaultAr = withCodes.find((c: Country) => c.phone_code === "+966") || withCodes[0];
            setSelectedCountry(defaultAr);
            setSelectedCountryCode(defaultAr?.phone_code || "+966");
            setPhoneNumber(user?.phone || "");
          }
        }
      } catch (err) {
        console.error('Error loading profile data:', err);
      }
    };
    loadData();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (profile.password && profile.password !== profile.password_confirmation) {
      setError(lang === 'ar' ? "كلمات المرور غير متطابقة" : "Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const submitData = {
        ...profile,
        phone: selectedCountryCode + phoneNumber.replace(/^0+/, '')
      };
      const response = await updateCustomerProfile(submitData);
      setSuccess(response.message || "Profile updated successfully.");
      if (response.customer && token) {
        login(response.customer, token);
      }
      setProfile({ ...profile, password: "", password_confirmation: "" });

      // إخفاء رسالة النجاح بعد 5 ثوانٍ
      setTimeout(() => setSuccess(""), 5000);
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail) return;
    setEmailError("");
    setEmailSuccess("");
    setEmailLoading(true);

    try {
      const response = await requestEmailChange(newEmail);
      setEmailCodeSent(true);
      setEmailSuccess(response.message || "Verification code sent!");
    } catch (err: any) {
      setEmailError(err.message || "Failed to send verification code.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyEmailChange = async () => {
    if (!verificationCode) return;
    setEmailError("");
    setEmailSuccess("");
    setEmailLoading(true);

    try {
      const response = await verifyEmailChange(verificationCode);
      setEmailSuccess(response.message || "Email changed successfully!");
      setCurrentEmail(response.customer?.email || newEmail);

      setTimeout(() => {
        setShowEmailChange(false);
        setEmailCodeSent(false);
        setNewEmail("");
        setVerificationCode("");
        setEmailSuccess("");
      }, 2000);

      if (response.customer && token) {
        login(response.customer, token);
      }
    } catch (err: any) {
      setEmailError(err.message || "Failed to verify code.");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleCancelEmailChange = () => {
    setShowEmailChange(false);
    setEmailCodeSent(false);
    setNewEmail("");
    setVerificationCode("");
    setEmailError("");
    setEmailSuccess("");
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground">{t("account_details", lang)}</h2>
      </div>

      {/* 2. الإشعارات (Alerts) باستخدام Framer Motion */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-red-500/10 text-red-600 p-4 rounded-2xl text-sm mb-6 border border-red-500/20 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="font-medium">{error}</p>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} className="bg-green-500/10 text-green-600 p-4 rounded-2xl text-sm mb-6 border border-green-500/20 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <p className="font-medium">{success}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-8 bg-background p-6 md:p-8 rounded-3xl border border-border shadow-sm">

        {/* Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">{t('first_name', lang)}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={profile.first_name}
                onChange={e => setProfile({ ...profile, first_name: e.target.value })}
                className="w-full border border-border/60 rounded-xl py-3.5 pe-4 ps-11 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-muted/20 hover:bg-muted/40 font-medium"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-bold text-foreground">{t('last_name', lang)}</label>
            <div className="relative group">
              <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                value={profile.last_name}
                onChange={e => setProfile({ ...profile, last_name: e.target.value })}
                className="w-full border border-border/60 rounded-xl py-3.5 pe-4 ps-11 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-muted/20 hover:bg-muted/40 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Email Section */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm font-bold text-foreground">{t('auth_email', lang)}</label>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1 w-full opacity-70">
              <div className="absolute inset-y-0 start-0 ps-4 flex items-center pointer-events-none text-muted-foreground">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                disabled
                value={currentEmail}
                className="w-full border border-border/60 rounded-xl py-3.5 pe-4 ps-11 bg-muted/40 text-muted-foreground font-medium cursor-not-allowed"
              />
            </div>
            {!showEmailChange && (
              <button
                type="button"
                onClick={() => setShowEmailChange(true)}
                className="shrink-0 px-6 py-3.5 rounded-xl border border-border/80 text-sm font-bold text-foreground hover:bg-muted transition-all active:scale-95 w-full sm:w-auto"
              >
                {lang === 'ar' ? 'تغيير البريد' : 'Change Email'}
              </button>
            )}
          </div>

          {/* Email Change Flow with Framer Motion */}
          <AnimatePresence>
            {showEmailChange && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-5 sm:p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-5">
                  {emailError && (
                    <div className="bg-red-500/10 text-red-600 p-3 rounded-xl text-sm border border-red-500/20 flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" /> {emailError}
                    </div>
                  )}
                  {emailSuccess && (
                    <div className="bg-green-500/10 text-green-600 p-3 rounded-xl text-sm border border-green-500/20 flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0" /> {emailSuccess}
                    </div>
                  )}

                  {!emailCodeSent ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">
                          {lang === 'ar' ? 'البريد الإلكتروني الجديد' : 'New Email Address'}
                        </label>
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={e => setNewEmail(e.target.value)}
                          placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني الجديد' : 'Enter your new email'}
                          className="w-full border border-border/80 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-background font-medium shadow-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleRequestEmailChange}
                          disabled={emailLoading || !newEmail}
                          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
                        >
                          {emailLoading
                            ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...')
                            : (lang === 'ar' ? 'إرسال الرمز' : 'Send Code')
                          }
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEmailChange}
                          className="px-6 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-background rounded-xl transition-all"
                        >
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-primary font-medium flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        {lang === 'ar'
                          ? `تم إرسال رمز التحقق إلى ${newEmail}`
                          : `Verification code sent to ${newEmail}`
                        }
                      </p>
                      <div className="space-y-2">
                        <label className="block text-sm font-bold text-foreground">
                          {lang === 'ar' ? 'رمز التحقق (OTP)' : 'Verification Code (OTP)'}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={verificationCode}
                          onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          className="w-full border border-border/80 rounded-xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-background text-center text-3xl tracking-[0.7em] font-mono font-bold shadow-inner"
                        />
                      </div>
                      <div className="flex flex-wrap items-center gap-3 pt-2">
                        <button
                          type="button"
                          onClick={handleVerifyEmailChange}
                          disabled={emailLoading || verificationCode.length !== 6}
                          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50 active:scale-95"
                        >
                          {emailLoading
                            ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...')
                            : (lang === 'ar' ? 'تأكيد الرمز' : 'Confirm Code')
                          }
                        </button>
                        <button
                          type="button"
                          onClick={handleRequestEmailChange}
                          disabled={emailLoading}
                          className="px-4 py-3 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-all"
                        >
                          {lang === 'ar' ? 'إعادة الإرسال' : 'Resend Code'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEmailChange}
                          className="px-4 py-3 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-background rounded-xl transition-all ms-auto"
                        >
                          {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Phone Section */}
        <div className="space-y-2 pt-2">
          <label className="block text-sm font-bold text-foreground">{t('phone_number', lang)}</label>
          <div className="flex group relative">

            {/* Country Code Dropdown */}
            <button
              type="button"
              onClick={() => { if (countries.length > 1) setShowCountryDropdown(!showCountryDropdown); }}
              className={`flex items-center gap-2 border border-border/60 border-e-0 rounded-s-xl px-4 py-3.5 bg-muted/20 transition-colors z-10 ${countries.length > 1 ? 'hover:bg-muted/40 cursor-pointer' : 'cursor-default'}`}
            >
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-bold text-foreground ltr">{selectedCountryCode}</span>
              {countries.length > 1 && (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )}
            </button>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {showCountryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full start-0 mt-2 w-72 bg-card/95 backdrop-blur-3xl border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                >
                  {countries.length > 1 && (
                    <div className="p-3 border-b border-border/50 bg-muted/10">
                      <div className="relative">
                        <Search className="absolute inset-y-0 start-3 my-auto w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="Search country..."
                          value={countrySearch}
                          onChange={e => setCountrySearch(e.target.value)}
                          className="w-full py-2.5 pe-4 ps-9 text-sm font-medium border border-border/80 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 bg-background"
                          autoFocus
                        />
                      </div>
                    </div>
                  )}
                  <div className="max-h-64 overflow-y-auto custom-scrollbar">
                    {countries
                      .filter((c: Country) =>
                        c.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
                        c.phone_code.includes(countrySearch)
                      )
                      .map((country: Country) => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setSelectedCountryCode(country.phone_code);
                            setShowCountryDropdown(false);
                            setCountrySearch("");
                          }}
                          className={`w-full flex items-center justify-between px-5 py-3 text-sm transition-colors ${selectedCountryCode === country.phone_code ? 'bg-primary/10 text-primary font-bold' : 'text-foreground font-medium hover:bg-muted/50'
                            }`}
                        >
                          <span>{country.name}</span>
                          <span className="font-mono text-muted-foreground ltr">{country.phone_code}</span>
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
              placeholder={selectedCountry?.min_digits === selectedCountry?.max_digits ? `Enter ${selectedCountry?.min_digits} digits` : "Mobile Number"}
              value={phoneNumber}
              minLength={selectedCountry?.min_digits}
              maxLength={selectedCountry?.max_digits}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                if (selectedCountry?.max_digits && val.length > selectedCountry.max_digits) return;
                setPhoneNumber(val);
              }}
              className="flex-1 border border-border/60 rounded-e-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-muted/20 hover:bg-muted/40 font-medium ltr"
              dir="ltr"
            />
          </div>
          {showCountryDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }} />
          )}
        </div>

        {/* Password Section */}
        <div className="pt-8 border-t border-border mt-8 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-bold text-lg text-foreground">{t('password_change', lang)}</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">{t('new_password', lang)}</label>
              <input
                type="password"
                value={profile.password}
                placeholder="••••••••"
                onChange={e => setProfile({ ...profile, password: e.target.value })}
                className="w-full border border-border/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-muted/20 hover:bg-muted/40 font-medium tracking-widest placeholder:tracking-normal"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-foreground">{t('confirm_password', lang)}</label>
              <input
                type="password"
                value={profile.password_confirmation}
                placeholder="••••••••"
                onChange={e => setProfile({ ...profile, password_confirmation: e.target.value })}
                className="w-full border border-border/60 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all bg-muted/20 hover:bg-muted/40 font-medium tracking-widest placeholder:tracking-normal"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-primary text-primary-foreground px-10 py-4 rounded-xl font-bold text-base shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                {t('saving', lang)}
              </>
            ) : (
              t('save_changes', lang)
            )}
          </button>
        </div>
      </form>
    </div>
  );
}