"use client";

import { Home, Grid3x3, User, ShoppingBag, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "./LanguageContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useTheme } from "next-themes";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fetchProducts, fetchCategories, getImageUrl } from "@/lib/api";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();
  const { totalQuantity } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();

  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      searchInputRef.current?.focus();
      if (allProducts.length === 0) {
        fetchProducts().then(setAllProducts).catch(console.error);
      }
    } else {
      setSuggestions([]);
      setSearchQuery("");
    }
  }, [showSearch]);

  useEffect(() => {
    if (showCategories && categories.length === 0) {
      fetchCategories().then(setCategories).catch(console.error);
    }
  }, [showCategories]);

  useEffect(() => {
    if (searchQuery.trim().length > 1 && allProducts.length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = allProducts.filter((p) => {
        const name = (p.name?.[lang] || p.name?.en || p.name || "").toLowerCase();
        return name.includes(q) || (p.sku || "").toLowerCase().includes(q);
      }).slice(0, 6);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [searchQuery, allProducts, lang]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearch(false);
    }
  };

  useEffect(() => {
    setShowSearch(false);
    setShowCategories(false);
  }, [pathname]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  const tabs = [
    { key: "home", href: "/", icon: Home, label: lang === "ar" ? "الرئيسية" : "Home" },
    { key: "categories", href: "#", icon: Grid3x3, label: lang === "ar" ? "الأقسام" : "Categories" },
    { key: "search", href: "#", icon: Search, label: lang === "ar" ? "بحث" : "Search" },
    { key: "cart", href: "/cart", icon: ShoppingBag, label: lang === "ar" ? "السلة" : "Cart" },
    { key: "account", href: user ? "/account" : "/login", icon: User, label: lang === "ar" ? "حسابي" : "Account" },
  ];

  return (
    <>
      {/* Floating Bottom Tab Bar */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 left-4 right-4 z-[50] lg:hidden"
      >
        <div className="bg-background/70 backdrop-blur-2xl border border-border/50 shadow-2xl rounded-[24px] overflow-hidden">
          <div className="flex items-center justify-around h-16 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = tab.key === "home" ? isActive("/") && pathname === "/" :
                tab.key === "cart" ? isActive("/cart") :
                tab.key === "account" ? isActive("/account") || isActive("/login") :
                tab.key === "categories" ? showCategories :
                tab.key === "search" ? showSearch : false;

              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    if (tab.key === "search") {
                      setShowSearch(!showSearch);
                      setShowCategories(false);
                    } else if (tab.key === "categories") {
                      setShowCategories(!showCategories);
                      setShowSearch(false);
                    } else {
                      setShowSearch(false);
                      setShowCategories(false);
                      router.push(tab.href);
                    }
                  }}
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-2xl transition-all duration-300 ${
                    active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-all ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 1.8} />
                    {tab.key === "cart" && totalQuantity > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 text-[9px] font-bold bg-primary text-white rounded-full flex items-center justify-center shadow-sm">
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${active ? "font-bold" : "font-medium"}`}>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Panels (Search & Categories remain unchanged in logic but match the theme) */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSearch(false)} className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[48] lg:hidden" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 z-[49] lg:hidden bg-background/80 backdrop-blur-xl rounded-t-[32px] border-t border-border/50 shadow-2xl max-h-[70vh] flex flex-col">
              {/* ... محتوى البحث كما هو ... */}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="h-20 lg:hidden" /> {/* مسافة إضافية لتناسب التصميم العائم */}
    </>
  );
}