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
        {/* الحاوية السفلية بتأثير Glassmorphism وحواف دائرية كبيرة */}
        <div className="bg-card/90 backdrop-blur-2xl border border-border shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-[28px] overflow-hidden">
          <div className="flex items-center justify-around h-16 px-1">
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
                  className="relative flex flex-col items-center justify-center gap-1 w-16 h-14 rounded-2xl transition-all duration-300 group"
                  aria-label={tab.label}
                >
                  {/* الدائرة الخلفية عند التفعيل (Hover/Active effect) */}
                  <div className={`absolute inset-0 bg-[#093f89]/10 dark:bg-[#fbc70f]/10 rounded-2xl transition-transform duration-300 scale-0 ${active ? "scale-100" : "group-hover:scale-50 opacity-0"}`} />

                  <div className="relative z-10">
                    <Icon
                      className={`w-[22px] h-[22px] transition-all duration-300 ${active
                        ? "text-[#093f89] dark:text-[#fbc70f] scale-110"
                        : "text-muted-foreground group-hover:text-foreground"
                        }`}
                      strokeWidth={active ? 2.5 : 2}
                    />

                    {tab.key === "cart" && totalQuantity > 0 && (
                      <span className="absolute -top-1.5 -end-2 w-4 h-4 text-[9px] font-bold bg-[#fbc70f] text-[#093f89] rounded-full flex items-center justify-center shadow-md ring-2 ring-card">
                        {totalQuantity}
                      </span>
                    )}
                  </div>

                  <span
                    className={`relative z-10 text-[10px] leading-tight transition-all duration-300 ${active
                      ? "font-bold text-[#093f89] dark:text-[#fbc70f]"
                      : "font-medium text-muted-foreground group-hover:text-foreground"
                      }`}
                  >
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
              className="fixed bottom-0 inset-x-0 z-[60] lg:hidden bg-card/95 backdrop-blur-3xl rounded-t-[32px] border-t border-border shadow-[0_-20px_50px_rgba(0,0,0,0.15)] h-[80vh] min-h-[400px] flex flex-col p-6 pb-24"
              role="dialog"
              aria-modal="true"
            >
              {/* شريط السحب البصري (Pull Handle) */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center mb-5 shrink-0">
                <h3 className="text-xl font-serif font-bold text-foreground">{isRtl ? "البحث " : "Search"}</h3>
                <button onClick={() => setShowSearch(false)} className="p-2 rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="relative w-full mb-6 shrink-0">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isRtl ? "ابحث عن معدة، علامة تجارية..." : "Search for a tools..."}
                  className="w-full bg-background border border-border/80 rounded-2xl h-14 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-[#093f89]/30 dark:focus:ring-[#fbc70f]/30 text-foreground shadow-inner transition-all"
                />
                <button type="submit" className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f]">
                  <Search className="w-5 h-5" />
                </button>
              </form>

              <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {suggestions.length === 0 && searchQuery.trim().length > 1 ? (
                  <div className="text-center text-sm text-muted-foreground py-16 flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 opacity-40" />
                    </div>
                    {isRtl ? "لا توجد نتائج مطابقة" : "No results found"}
                  </div>
                ) : (
                  suggestions.map((p) => (
                    <Link
                      href={`/shop/${p.slug || p.id}`}
                      key={p.id}
                      onClick={() => setShowSearch(false)}
                      className="flex items-center gap-4 p-3 hover:bg-[#093f89]/5 dark:hover:bg-[#fbc70f]/5 rounded-2xl transition-all duration-300 group"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-background shrink-0 border border-border/50 shadow-sm">
                        <Image
                          src={p.images?.[0] ? getImageUrl(p.images[0]) : '/no-image.jpg'}
                          alt={p.name?.[lang] || p.name?.en || p.name}
                          fill
                          sizes="56px"
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold line-clamp-1 text-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">
                          {p.name?.[lang] || p.name?.en || p.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium mt-0.5">
                          {p.base_price || p.price}
                        </span>
                      </div>
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
              className="fixed bottom-0 inset-x-0 z-[60] lg:hidden bg-card/95 backdrop-blur-3xl rounded-t-[32px] border-t border-border shadow-[0_-20px_50px_rgba(0,0,0,0.15)] h-[80vh] min-h-[400px] flex flex-col p-6 pb-24"
              role="dialog"
              aria-modal="true"
            >
              {/* شريط السحب البصري */}
              <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-4" />

              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-xl font-serif font-bold text-foreground">
                  {isRtl ? "تصفح الأقسام" : "Shop by Category"}
                </h3>
                <button
                  onClick={() => setShowCategories(false)}
                  className="p-2 rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                {categories.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-4">
                    <div className="w-8 h-8 border-2 border-[#093f89] border-t-transparent dark:border-[#fbc70f] dark:border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm font-medium">{isRtl ? "جاري تحميل الفئات..." : "Loading categories..."}</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 pb-4">
                    {categories.map((category) => (
                      <Link
                        href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
                        key={category.id}
                        onClick={() => setShowCategories(false)}
                        className="flex flex-col items-center p-5 bg-background/50 hover:bg-[#093f89]/5 dark:hover:bg-[#fbc70f]/10 border border-border/60 hover:border-[#093f89]/30 dark:hover:border-[#fbc70f]/30 rounded-3xl transition-all duration-300 active:scale-95 shadow-sm group"
                      >
                        <div className="relative w-20 h-20 rounded-full overflow-hidden mb-4 bg-muted border border-border/50 shadow-sm shrink-0">
                          <Image
                            src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                            alt={category.name?.[lang] || category.name?.en || category.name}
                            fill
                            sizes="80px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <span className="text-sm font-bold text-center text-foreground line-clamp-2 px-1 group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">
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