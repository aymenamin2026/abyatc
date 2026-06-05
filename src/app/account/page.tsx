"use client";

import { useLanguage } from "@/components/LanguageContext";
import { useAuth } from "@/components/AuthContext";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { t } from "@/lib/translations";
import { LayoutDashboard, ShoppingBag, MapPin, UserSquare2, Heart, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Sub-components
import OrdersTab from "./OrdersTab";
import AddressesTab from "./AddressesTab";
import ProfileTab from "./ProfileTab";
import WishlistTab from "./WishlistTab";

export default function AccountPage() {
  const { lang } = useLanguage();
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
    <div className="flex flex-col min-h-screen bg-muted/20 pb-24">
      {/* Header Banner */}
      <section className="bg-primary/5 py-12 px-4 sm:px-6 border-b border-border text-center">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-foreground">
          {t("dashboard", lang)}
        </h1>
      </section>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar Navigation */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="flex flex-col gap-2 bg-background p-4 rounded-2xl shadow-sm border border-border h-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive 
                        ? "bg-primary text-primary-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
              
              <div className="my-2 border-t border-border"></div>
              
              <button
                onClick={() => setShowLogoutModal(true)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 transition-all"
              >
                <LogOut className="w-5 h-5" />
                {t("logout", lang)}
              </button>
            </nav>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 bg-background rounded-2xl shadow-sm border border-border p-6 sm:p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <h2 className="font-serif text-2xl font-bold text-foreground">
                    {t('dashboard_welcome', lang)}, <span className="text-primary">{user.first_name}</span>!
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {t('dashboard_intro', lang)}
                  </p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                    <button onClick={() => onTabChange("orders")} className="p-6 border border-border hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-foreground">{t("my_orders", lang)}</span>
                    </button>
                    <button onClick={() => onTabChange("addresses")} className="p-6 border border-border hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <MapPin className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-foreground">{t("my_addresses", lang)}</span>
                    </button>
                    <button onClick={() => onTabChange("profile")} className="p-6 border border-border hover:border-primary/50 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UserSquare2 className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-foreground">{t("account_details", lang)}</span>
                    </button>
                    <button onClick={() => onTabChange("wishlist")} className="p-6 border border-border hover:border-red-300 rounded-2xl flex flex-col items-center justify-center gap-3 transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-500/10 text-red-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Heart className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-foreground">{t("my_wishlist" as any, lang)}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === "orders" && (
                <motion.div key="orders" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <OrdersTab lang={lang} />
                </motion.div>
              )}

              {activeTab === "addresses" && (
                <motion.div key="addresses" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <AddressesTab lang={lang} user={user} />
                </motion.div>
              )}

              {activeTab === "profile" && (
                <motion.div key="profile" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <ProfileTab lang={lang} user={user} login={login} token={token} />
                </motion.div>
              )}

              {activeTab === "wishlist" && (
                <motion.div key="wishlist" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                  <WishlistTab lang={lang} />
                </motion.div>
              )}
            </AnimatePresence>
          </main>
          
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-background rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col p-6 border border-border"
            >
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-serif">{t('confirm_logout_title', lang)}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">{t('confirm_logout_desc', lang)}</p>
              
              <div className="flex gap-3 mt-auto">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium text-foreground hover:bg-secondary transition-all"
                >
                  {t('cancel', lang)}
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all shadow-sm shadow-red-200"
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
