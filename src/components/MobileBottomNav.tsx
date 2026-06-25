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
import Image from "next/image";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { lang } = useLanguage();
  const { totalQuantity } = useCart();
  const { user } = useAuth();
  const { theme } = useTheme();

  const isRtl = lang === "ar";
  const [showSearch, setShowSearch] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
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
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-2xl transition-all duration-300 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"
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
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[58] lg:hidden"
            />

            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-background bg-opacity-95 backdrop-blur-xl rounded-t-[32px] border-t border-border/60 shadow-2xl h-[70vh] min-h-[400px] flex flex-col p-6 pb-24"
            >
              <div className="flex justify-between items-center mb-4 shrink-0">
                <h3 className="text-lg font-bold">{isRtl ? "البحث في المتجر" : "Search Store"}</h3>
                <button onClick={() => setShowSearch(false)} className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground">
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
                  className="w-full bg-secondary border border-border/80 rounded-2xl h-12 px-4 text-sm focus:outline-none focus:border-primary text-foreground"
                />
              </form>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1 native-scrollbar">
                {suggestions.length === 0 && searchQuery.trim().length > 1 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    {isRtl ? "لا توجد نتائج مطابقة" : "No results found"}
                  </div>
                ) : (
                  suggestions.map((p) => (
                    <Link href={`/shop/${p.slug || p.id}`} key={p.id} className="flex items-center gap-3 p-2 hover:bg-secondary rounded-xl transition-colors">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary shrink-0 border border-border/40">
                        <Image src={p.images?.[0] ? getImageUrl(p.images[0]) : '/no-image.jpg'} alt="" fill className="object-cover" />
                      </div>
                      <span className="text-sm font-medium line-clamp-1 text-foreground">{p.name?.[lang] || p.name?.en || p.name}</span>
                    </Link>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}

        {/* 2. Categories Panel (نافذة عرض الفئات بتصميم متناسق) */}
        {showCategories && (
          <>
            {/* الخلفية المعتمة والمموهة للموقع عند فتح الفئات */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategories(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[58] lg:hidden"
            />

            {/* نافذة الفئات الصاعدة من الأسفل */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[60] lg:hidden bg-background bg-opacity-95 backdrop-blur-xl rounded-t-[32px] border-t border-border/60 shadow-2xl h-[70vh] min-h-[400px] flex flex-col p-6 pb-24"
            >
              {/* الهيدر: العنوان وزر الإغلاق */}
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h3 className="text-lg font-bold text-foreground">
                  {isRtl ? "تصفح حسب الفئات" : "Shop by Category"}
                </h3>
                <button
                  onClick={() => setShowCategories(false)}
                  className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* جسد النافذة: شبكة عرض الفئات القابلة للتمرير */}
              <div className="flex-1 overflow-y-auto pr-1 native-scrollbar">
                {categories.length === 0 ? (
                  /* حالة الانتظار وجلب البيانات من الباك إند */
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">{isRtl ? "جاري تحميل الفئات..." : "Loading categories..."}</span>
                  </div>
                ) : (
                  /* شبكة الفئات - عنصرين في كل صف على الموبايل */
                  <div className="grid grid-cols-2 gap-4 pb-4">
                    {categories.map((category) => (
                      <Link
                        href={`/shop?category=${encodeURIComponent(category.name?.[lang] || category.name?.en || category.name)}`}
                        key={category.id}
                        onClick={() => setShowCategories(false)}
                        className="flex flex-col items-center p-4 bg-secondary/40 hover:bg-secondary/80 border border-border/40 rounded-2xl transition-all duration-200 active:scale-95 group"
                      >
                        {/* صورة الفئة الدائرية المحمية */}
                        <div className="relative w-16 h-16 rounded-full overflow-hidden mb-3 bg-background border border-border/60 shadow-sm shrink-0">
                          <Image
                            src={category.image ? getImageUrl(category.image) : '/no-image.jpg'}
                            alt={category.name?.[lang] || category.name?.en || category.name}
                            fill
                            sizes="64px"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>

                        {/* اسم الفئة */}
                        <span className="text-xs font-bold text-center text-foreground line-clamp-2 px-1">
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

      <div className="h-20 lg:hidden" />
    </>
  );
}