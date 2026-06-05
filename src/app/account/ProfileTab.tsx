"use client";

import { useState } from "react";
import { updateCustomerProfile, requestEmailChange, verifyEmailChange, fetchCountries, fetchSettings } from "@/lib/api";
import { t } from "@/lib/translations";
import { useEffect } from "react";

export default function ProfileTab({ lang, user, login, token }: { lang: "en" | "ar", user: any, login: any, token: string | null }) {
  const [profile, setProfile] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone: user?.phone || "",
    password: "",
    password_confirmation: ""
  });

  // Phone state
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+966");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [countriesData, settingsData] = await Promise.all([
          fetchCountries(),
          fetchSettings()
        ]);

        const withCodes = (countriesData || []).filter((c: any) => c.phone_code);
        
        // If there's a default country, we ONLY show that one
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
          // Try to match current phone with a country code
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
            const defaultAr = withCodes.find((c: any) => c.phone_code === "+966") || withCodes[0];
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
      setShowEmailChange(false);
      setEmailCodeSent(false);
      setNewEmail("");
      setVerificationCode("");
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
    <div className="max-w-xl">
      <h2 className="font-serif text-2xl font-bold text-foreground mb-6">{t("account_details", lang)}</h2>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm mb-6 border border-red-200">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl text-sm mb-6 border border-green-200">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('first_name', lang)}</label>
            <input 
              type="text" 
              required
              value={profile.first_name}
              onChange={e => setProfile({...profile, first_name: e.target.value})}
              className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-secondary/20" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">{t('last_name', lang)}</label>
            <input 
              type="text" 
              required
              value={profile.last_name}
              onChange={e => setProfile({...profile, last_name: e.target.value})}
              className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-secondary/20" 
            />
          </div>
        </div>

        {/* Email Section */}
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">{t('auth_email', lang)}</label>
          <div className="flex items-center gap-3">
            <input 
              type="email" 
              disabled
              value={currentEmail}
              className="w-full border border-border rounded-xl px-4 py-3 bg-secondary/30 text-muted-foreground cursor-not-allowed" 
            />
            {!showEmailChange && (
              <button 
                type="button"
                onClick={() => setShowEmailChange(true)}
                className="shrink-0 text-sm text-primary hover:text-primary/80 font-medium transition-colors whitespace-nowrap"
              >
                {lang === 'ar' ? 'تغيير' : 'Change'}
              </button>
            )}
          </div>

          {/* Email Change Flow */}
          {showEmailChange && (
            <div className="mt-4 p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-4">
              {emailError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                  {emailError}
                </div>
              )}
              {emailSuccess && (
                <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm border border-green-200">
                  {emailSuccess}
                </div>
              )}

              {!emailCodeSent ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {lang === 'ar' ? 'البريد الإلكتروني الجديد' : 'New Email Address'}
                    </label>
                    <input 
                      type="email"
                      required
                      value={newEmail}
                      onChange={e => setNewEmail(e.target.value)}
                      placeholder={lang === 'ar' ? 'أدخل بريدك الإلكتروني الجديد' : 'Enter your new email'}
                      className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white" 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleRequestEmailChange}
                      disabled={emailLoading || !newEmail}
                      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {emailLoading 
                        ? (lang === 'ar' ? 'جاري الإرسال...' : 'Sending...') 
                        : (lang === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code')
                      }
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEmailChange}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">
                    {lang === 'ar' 
                      ? `تم إرسال رمز التحقق إلى ${newEmail}. أدخل الرمز أدناه:` 
                      : `A verification code has been sent to ${newEmail}. Enter it below:`
                    }
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-2">
                      {lang === 'ar' ? 'رمز التحقق' : 'Verification Code'}
                    </label>
                    <input 
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={e => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white text-center text-2xl tracking-[0.5em] font-mono" 
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleVerifyEmailChange}
                      disabled={emailLoading || verificationCode.length !== 6}
                      className="bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {emailLoading 
                        ? (lang === 'ar' ? 'جاري التحقق...' : 'Verifying...') 
                        : (lang === 'ar' ? 'تأكيد التغيير' : 'Confirm Change')
                      }
                    </button>
                    <button
                      type="button"
                      onClick={handleRequestEmailChange}
                      disabled={emailLoading}
                      className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                    >
                      {lang === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEmailChange}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-muted-foreground mb-2">{t('phone_number', lang)}</label>
          <div className="flex gap-0">
            {/* Country Code Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => { if (countries.length > 1) setShowCountryDropdown(!showCountryDropdown); }}
                className={`flex items-center gap-1.5 border border-border border-r-0 rounded-l-xl px-3 py-3 bg-secondary/30 transition-colors min-w-[95px] justify-center ${countries.length > 1 ? 'hover:bg-secondary/40 cursor-pointer' : 'cursor-default'}`}
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
                <div className="absolute top-full left-0 mt-1 w-72 bg-background border border-border rounded-xl shadow-xl z-50 overflow-hidden">
                  {countries.length > 1 && (
                    <div className="p-2 border-b border-border">
                      <input
                        type="text"
                        placeholder="Search country..."
                        value={countrySearch}
                        onChange={e => setCountrySearch(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-transparent"
                        autoFocus
                      />
                    </div>
                  )}
                  <div className="max-h-48 overflow-y-auto">
                    {countries
                      .filter((c: any) => 
                        c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
                        c.phone_code.includes(countrySearch)
                      )
                      .map((country: any) => (
                        <button
                          key={country.id}
                          type="button"
                          onClick={() => {
                            setSelectedCountry(country);
                            setSelectedCountryCode(country.phone_code);
                            setShowCountryDropdown(false);
                            setCountrySearch("");
                          }}
                          className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors ${
                            selectedCountryCode === country.phone_code ? 'bg-primary/5 text-primary' : 'text-foreground'
                          }`}
                        >
                          <span>{country.name}</span>
                          <span className="font-mono text-muted-foreground">{country.phone_code}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

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
              className="flex-1 border border-border rounded-r-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-secondary/20" 
            />
          </div>
          {/* Close dropdown on outside click */}
          {showCountryDropdown && (
            <div className="fixed inset-0 z-40" onClick={() => { setShowCountryDropdown(false); setCountrySearch(""); }} />
          )}
        </div>

        <div className="pt-6 border-t border-border mt-8">
          <h3 className="font-medium text-foreground mb-4">{t('password_change', lang)}</h3>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">{t('new_password', lang)}</label>
              <input 
                type="password" 
                value={profile.password}
                onChange={e => setProfile({...profile, password: e.target.value})}
                className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-secondary/20" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">{t('confirm_password', lang)}</label>
              <input 
                type="password" 
                value={profile.password_confirmation}
                onChange={e => setProfile({...profile, password_confirmation: e.target.value})}
                className="w-full border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-secondary/20" 
              />
            </div>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-medium mt-6 shadow-sm hover:bg-primary/90 transition-all disabled:opacity-50"
        >
          {loading ? t('saving', lang) : t('save_changes', lang)}
        </button>
      </form>
    </div>
  );
}
