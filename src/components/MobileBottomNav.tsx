"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Grid3x3, User, ShoppingBag, Search, X } from "lucide-react";

import { useLanguage } from "./LanguageContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { fetchProducts, fetchCategories, getImageUrl } from "@/lib/api";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  const { lang } = useLanguage();
  const { totalQuantity } = useCart();
  const { user } = useAuth();

  const isRtl = lang === "ar";

  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // التحكم في السكرول عند فتح النوافذ المنبثقة
  useEffect(() => {
    if (showSearch || showCategories) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [showSearch, showCategories]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      if (allProducts.length === 0) {
        fetchProducts().then(setAllProducts).catch(console.error);
      }
    } else {
      setSearchQuery("");
    }
  }, [showSearch, allProducts.length]);

  useEffect(() => {
    if (showCategories && categories.length === 0) {
      fetchCategories().then(setCategories).catch(console.error);
    }
  }, [showCategories, categories.length]);

  // تحسين الأداء (Performance): استخدام useMemo للفلترة بدلاً من useState متكرر
  const suggestions = useMemo(() => {
    if (searchQuery.trim().length < 2 || allProducts.length === 0) return [];

    const q = searchQuery.toLowerCase();
    return allProducts.filter((p) => {
      const name = (p.name?.[lang] || p.name?.en || p.name || "").toLowerCase();
      return name.includes(q) || (p.sku || "").toLowerCase().includes(q);
    }).slice(0, 6);
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
    { key: "home", href: "/", icon: Home, label: isRtl ? "الرئيسية" : "Home" },
    { key: "categories", href: "#", icon: Grid3x3, label: isRtl ? "الأقسام" : "Categories" },
    { key: "search", href: "#", icon: Search, label: isRtl ? "بحث" : "Search" },
    { key: "cart", href: "/cart", icon: ShoppingBag, label: isRtl ? "السلة" : "Cart" },
    { key: "account", href: user ? "/account" : "/login", icon: User, label: isRtl ? "حسابي" : "Account" },
  ];

  return (
    <>
      {/* Floating Bottom Tab Bar */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-4 inset-x-4 z-[50] lg:hidden"
      >
        <div className="bg-background/80 backdrop-blur-2xl border border-border shadow-2xl rounded-[24px] overflow-hidden">
          <div className="flex items-center justify-around h-16 px-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active =
                tab.key === "home" ? isActive("/") && pathname === "/" :
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
                  className={`flex flex-col items-center justify-center gap-1 w-16 py-1 rounded-2xl transition-all duration-300 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    }`}
                  aria-label={tab.label}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 2} />
                    {tab.key === "cart" && totalQuantity > 0 && (
                      <span className="absolute -top-1.5 -end-2 w-4 h-4 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                        {totalQuantity}
                      </span>
                    )}
                  </div>
                  <span className={`text-[10px] leading-tight ${active ? "font-bold" : "font-medium"}`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      {/* Panels (Search & Categories) */}
      <AnimatePresence>
        {/* 1. Search Panel */}
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[58] lg:hidden"
              aria-hidden="true"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 z-[60] lg:hidden bg-card/95 backdrop-blur-xl rounded-t-[32px] border-t border-border shadow-2xl h-[75vh] min-h-[400px] flex flex-col p-6 pb-24"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex justify-between items-center mb-5 shrink-0">
                <h3 className="text-lg font-bold text-foreground">{isRtl ? "البحث في المتجر" : "Search Store"}</h3>
                <button onClick={() => setShowSearch(false)} className="p-2 rounded-full bg-muted text-foreground hover:bg-secondary transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative w-full mb-4 shrink-0">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? "ابحث عن منتج، علامة تجارية..." : "Search for a product..."}
                  className="w-full bg-background border border-border rounded-2xl h-12 px-4 text-sm focus:outline-none focus:border-primary text-foreground shadow-sm transition-colors"
                />
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {suggestions.length === 0 && searchQuery.trim().length > 1 ? (
                  <div className="text-center text-sm text-muted-foreground py-12 flex flex-col items-center">
                    <Search className="w-8 h-8 mb-3 opacity-20" />
                    {isRtl ? "لا توجد نتائج مطابقة" : "No results found"}
                  </div>
                ) : (
                  suggestions.map((p) => (
                    <Link
                      href={`/shop/${p.slug || p.id}`} // تم إصلاح المسار ليكون /shop/ بدلاً من /product/
                      key={p.id}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors group"
                    >
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-background shrink-0 border border-border/50">
                        <Image
                          src={p.images?.[0] ? getImageUrl(p.images[0]) : '/no-image.jpg'}
                          alt={p.name?.[lang] || p.name?.en || p.name}
                          fill
                          sizes="48px"
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                      <span className="text-sm font-medium line-clamp-1 text-foreground group-hover:text-primary transition-colors">
                        {p.name?.[lang] || p.name?.en || p.name}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* 2. Categories Panel */}
        {showCategories && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategories(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[58] lg:hidden"
              aria-hidden="true"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 inset-x-0 z-[60] lg:hidden bg-card/95 backdrop-blur-xl rounded-t-[32px] border-t border-border shadow-2xl h-[75vh] min-h-[400px] flex flex-col p-6 pb-24"
              role="dialog"
              aria-modal="true"
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-foreground">
                  {isRtl ? "تصفح حسب الفئات" : "Shop by Category"}
                </h3>
                <button
                  onClick={() => setShowCategories(false)}
                  className="p-2 rounded-full bg-muted text-foreground hover:bg-secondary transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-3">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">{isRtl ? "جاري تحميل الفئات..." : "Loading categories..."}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pb-4">
                    {categories.map((category) => (
                      <Link
                        href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
                        key={category.id}
                        onClick={() => setShowCategories(false)}
                        className="flex flex-col items-center p-4 bg-background hover:bg-muted border border-border rounded-2xl transition-all duration-200 active:scale-95 shadow-sm group"
                      >
                        <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 bg-muted border border-border/60 shadow-sm shrink-0">
                          <Image
                            src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                            alt={category.name?.[lang] || category.name?.en || category.name}
                            fill
                            sizes="64px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <span className="text-xs font-bold text-center text-foreground line-clamp-2 px-1 group-hover:text-primary transition-colors">
                          {category.name?.[lang] || category.name?.en || category.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}