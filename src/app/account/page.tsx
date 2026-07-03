"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, ShoppingBag, MapPin, UserSquare2, Heart, LogOut, ChevronRight } from "lucide-react";

import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { t } from "@/lib/translations";

// Sub-components
import OrdersTab from "./OrdersTab";
import AddressesTab from "./AddressesTab";
import ProfileTab from "./ProfileTab";
import WishlistTab from "./WishlistTab";

export default function AccountPage() {
  const { lang } = useLanguage();
  const isRtl = lang === "ar";
  const { user, token, logout, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"dashboard" | "orders" | "addresses" | "profile" | "wishlist">("dashboard");
  const [isMounted, setIsMounted] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const tabParam = searchParams.get("tab");
    if (tabParam && ["dashboard", "orders", "addresses", "profile", "wishlist"].includes(tabParam)) {
      setActiveTab(tabParam as any);
    }
  }, [searchParams]);

  const onTabChange = (tabId: string) => {
    setActiveTab(tabId as any);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tabId);
    router.push(`/account?${params.toString()}`, { scroll: false });
  };

  // Require Auth
  useEffect(() => {
    if (isMounted && !user) {
      router.push("/login");
    }
  }, [user, isMounted, router]);

  if (!isMounted || !user) return null;

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const tabs = [
    { id: "dashboard", label: t("dashboard", lang), icon: LayoutDashboard },
    { id: "orders", label: t("my_orders", lang), icon: ShoppingBag },
    { id: "wishlist", label: t("my_wishlist" as any, lang), icon: Heart },
    { id: "addresses", label: t("my_addresses", lang), icon: MapPin },
    { id: "profile", label: t("account_details", lang), icon: UserSquare2 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background relative overflow-hidden pb-24">

      {/* 1. BACKGROUND AMBIENT LAYERS (الفخامة البصرية) */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] start-[-10%] w-[500px] md:w-[700px] h-[500px] md:h-[700px] bg-[#093f89]/5 blur-[120px] rounded-full dark:bg-[#093f89]/10" />
        <div className="absolute top-[20%] end-[-10%] w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-[#fbc70f]/5 blur-[150px] rounded-full dark:bg-[#fbc70f]/5" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.01] bg-[url('/noise.png')]" />
      </div>

      {/* 2. HEADER BANNER */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 text-center z-10 border-b border-border/40 bg-card/30 backdrop-blur-md">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-sm mb-4">
          {t("dashboard", lang)}
        </h1>
        <p className="text-muted-foreground font-medium tracking-wide">
          {lang === 'ar' ? 'مرحباً بك في بوابتك الشخصية' : 'Welcome to your personal portal'}
        </p>
      </section>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">

          {/* 3. SIDEBAR NAVIGATION */}
          <aside className="w-full lg:w-80 flex-shrink-0 lg:sticky lg:top-32">
            <nav className="flex lg:flex-col gap-2 bg-card/60 backdrop-blur-2xl p-4 lg:p-6 rounded-[2rem] shadow-lg border border-border/60 overflow-x-auto lg:overflow-visible custom-scrollbar">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 group flex-shrink-0 lg:flex-shrink whitespace-nowrap ${isActive
                        ? "bg-[#093f89] text-white dark:bg-[#fbc70f] dark:text-[#093f89] shadow-md shadow-[#093f89]/20 dark:shadow-[#fbc70f]/20"
                        : "text-muted-foreground hover:bg-[#093f89]/5 dark:hover:bg-[#fbc70f]/10 hover:text-[#093f89] dark:hover:text-[#fbc70f]"
                      }`}
                  >
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive ? "" : "group-hover:scale-110"}`} strokeWidth={isActive ? 2.5 : 2} />
                    {tab.label}

                    {/* مؤشر تفاعلي للسهم يظهر فقط في الشاشات الكبيرة */}
                    {isActive && (
                      <ChevronRight className={`hidden lg:block w-4 h-4 ms-auto opacity-70 ${isRtl ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                );
              })}

              <div className="hidden lg:block my-4 border-t border-border/50"></div>

              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold text-rose-500 hover:bg-rose-500/10 transition-all duration-300 flex-shrink-0 lg:flex-shrink group"
              >
                <LogOut className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" strokeWidth={2} />
                {t("logout", lang)}
              </button>
            </nav>
          </aside>

          {/* 4. MAIN CONTENT AREA */}
          <main className="flex-1 w-full bg-card/60 backdrop-blur-2xl rounded-[2.5rem] shadow-xl border border-border/60 p-6 sm:p-10 lg:p-12 min-h-[600px]">
            <AnimatePresence mode="wait">

              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="space-y-10"
                >
                  <div className="space-y-3">
                    <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
                      {t('dashboard_welcome', lang)}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#093f89] to-[#093f89]/70 dark:from-[#fbc70f] dark:to-[#fbc70f]/70">{user.first_name}</span>!
                    </h2>
                    <p className="text-muted-foreground text-lg leading-relaxed font-light">
                      {t('dashboard_intro', lang)}
                    </p>
                  </div>

                  {/* أزرار الإجراءات السريعة (Quick Action Cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 pt-4">

                    <button onClick={() => onTabChange("orders")} className="p-8 bg-background border border-border/60 hover:border-[#093f89]/30 dark:hover:border-[#fbc70f]/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500 ease-in-out hover:shadow-2xl hover:shadow-[#093f89]/10 dark:hover:shadow-[#fbc70f]/5 hover:-translate-y-2 group">
                      <div className="w-16 h-16 rounded-2xl bg-[#093f89]/5 dark:bg-[#fbc70f]/10 text-[#093f89] dark:text-[#fbc70f] flex items-center justify-center group-hover:bg-[#093f89] group-hover:text-[#fbc70f] dark:group-hover:bg-[#fbc70f] dark:group-hover:text-[#093f89] transition-colors duration-500 shadow-sm">
                        <ShoppingBag className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">{t("my_orders", lang)}</span>
                    </button>

                    <button onClick={() => onTabChange("addresses")} className="p-8 bg-background border border-border/60 hover:border-[#093f89]/30 dark:hover:border-[#fbc70f]/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500 ease-in-out hover:shadow-2xl hover:shadow-[#093f89]/10 dark:hover:shadow-[#fbc70f]/5 hover:-translate-y-2 group">
                      <div className="w-16 h-16 rounded-2xl bg-[#093f89]/5 dark:bg-[#fbc70f]/10 text-[#093f89] dark:text-[#fbc70f] flex items-center justify-center group-hover:bg-[#093f89] group-hover:text-[#fbc70f] dark:group-hover:bg-[#fbc70f] dark:group-hover:text-[#093f89] transition-colors duration-500 shadow-sm">
                        <MapPin className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">{t("my_addresses", lang)}</span>
                    </button>

                    <button onClick={() => onTabChange("profile")} className="p-8 bg-background border border-border/60 hover:border-[#093f89]/30 dark:hover:border-[#fbc70f]/30 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500 ease-in-out hover:shadow-2xl hover:shadow-[#093f89]/10 dark:hover:shadow-[#fbc70f]/5 hover:-translate-y-2 group">
                      <div className="w-16 h-16 rounded-2xl bg-[#093f89]/5 dark:bg-[#fbc70f]/10 text-[#093f89] dark:text-[#fbc70f] flex items-center justify-center group-hover:bg-[#093f89] group-hover:text-[#fbc70f] dark:group-hover:bg-[#fbc70f] dark:group-hover:text-[#093f89] transition-colors duration-500 shadow-sm">
                        <UserSquare2 className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">{t("account_details", lang)}</span>
                    </button>

                    <button onClick={() => onTabChange("wishlist")} className="p-8 bg-background border border-border/60 hover:border-red-300 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all duration-500 ease-in-out hover:shadow-2xl hover:shadow-red-500/10 hover:-translate-y-2 group">
                      <div className="w-16 h-16 rounded-2xl bg-red-500/5 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors duration-500 shadow-sm">
                        <Heart className="w-7 h-7 transition-transform duration-500 group-hover:scale-110" strokeWidth={1.5} />
                      </div>
                      <span className="font-bold text-foreground group-hover:text-red-500 transition-colors">{t("my_wishlist" as any, lang)}</span>
                    </button>

                  </div>
                </motion.div>
              )}

              {/* تمرير المكونات الفرعية كما هي، سيتم تأطيرها داخل الواجهة الفخمة التي بنيناها */}
              {activeTab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <OrdersTab lang={lang} />
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div key="addresses" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <AddressesTab lang={lang} user={user} />
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <ProfileTab lang={lang} user={user} login={login} token={token} />
                </motion.div>
              )}

              {activeTab === "wishlist" && (
                <motion.div key="wishlist" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3, ease: "easeOut" }}>
                  <WishlistTab lang={lang} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

        </div>
      </div>

      {/* 5. LOGOUT CONFIRMATION MODAL - Luxury Redesign */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="bg-card/95 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full max-w-sm overflow-hidden flex flex-col p-8 sm:p-10 border border-border/60 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-6 mx-auto shadow-inner">
                <LogOut className="w-8 h-8" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">{t('confirm_logout_title', lang)}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed font-medium">{t('confirm_logout_desc', lang)}</p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-border/80 font-bold text-foreground hover:bg-muted transition-all active:scale-95"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20 active:scale-95"
                >
                  {t('logout', lang)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}