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
import { t } from "@/lib/translations";

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

  // Load products when search opens
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

  // Load categories when categories panel opens
  useEffect(() => {
    if (showCategories && categories.length === 0) {
      fetchCategories().then(setCategories).catch(console.error);
    }
  }, [showCategories]);

  // Filter suggestions
  useEffect(() => {
    if (searchQuery.trim().length > 1 && allProducts.length > 0) {
      const q = searchQuery.toLowerCase();
      const filtered = allProducts.filter((p) => {
        const name = (p.name?.[lang] || p.name?.en || p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        return name.includes(q) || sku.includes(q);
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

  // Close panels on route change
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
      {/* Bottom Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-[50] lg:hidden">
        <div className="bg-background/95 backdrop-blur-lg border-t border-border/60 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-around h-16 px-2 pb-safe">
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
                  className={`flex flex-col items-center justify-center gap-0.5 w-16 py-1 rounded-xl transition-all ${active
                      ? (theme === 'dark' ? "text-white" : "text-primary")
                      : "text-muted-foreground"
                    }`}
                >
                  <div className="relative">
                    <Icon className={`w-5 h-5 transition-all ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.5 : 1.8} />
                    {tab.key === "cart" && totalQuantity > 0 && (
                      <span className="absolute -top-1.5 -right-2 w-4 h-4 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
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
      </div>

      {/* Search Panel */}
      <AnimatePresence>
        {showSearch && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSearch(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[48] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed bottom-16 left-0 right-0 z-[49] lg:hidden bg-background rounded-t-3xl border-t border-border shadow-2xl max-h-[70vh] flex flex-col"
            >
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-serif text-lg font-bold">{lang === "ar" ? "بحث" : "Search"}</h3>
                  <button onClick={() => setShowSearch(false)} className="p-1.5 hover:bg-muted rounded-full">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <form onSubmit={handleSearch} className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={lang === "ar" ? "ابحث عن المنتجات..." : "Search products..."}
                    className="w-full h-11 px-4 bg-muted/60 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto px-4 py-3">
                {suggestions.length > 0 ? (
                  <div className="space-y-2">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        href={`/shop/${p.slug}`}
                        onClick={() => setShowSearch(false)}
                        className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors"
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                          <img
                            src={getImageUrl(p.images?.[0])}
                            alt={p.name?.[lang] || p.name?.en}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.jpg"; }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{p.name?.[lang] || p.name?.en || p.name}</p>
                          <p className="text-xs text-primary font-bold">{p.base_price || p.price}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.length > 1 ? (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {lang === "ar" ? "لم يتم العثور على نتائج" : "No results found"}
                  </p>
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    {lang === "ar" ? "ابدأ الكتابة للبحث..." : "Start typing to search..."}
                  </p>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Categories Panel */}
      <AnimatePresence>
        {showCategories && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategories(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[48] lg:hidden"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="fixed bottom-16 left-0 right-0 z-[49] lg:hidden bg-background rounded-t-3xl border-t border-border shadow-2xl max-h-[60vh] flex flex-col"
            >
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-serif text-lg font-bold">{lang === "ar" ? "الأقسام" : "Categories"}</h3>
                <button onClick={() => setShowCategories(false)} className="p-1.5 hover:bg-muted rounded-full">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-3 gap-3">
                  {/* All Products */}
                  <Link
                    href="/shop"
                    onClick={() => setShowCategories(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-primary/5 border border-primary/20 hover:bg-primary/10 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Grid3x3 className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">
                      {lang === "ar" ? "الكل" : "All"}
                    </span>
                  </Link>

                  {categories.map((cat) => {
                    const catName = cat.name?.[lang] || cat.name?.en || cat.name;
                    return (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${encodeURIComponent(cat.slug || catName)}`}
                        onClick={() => setShowCategories(false)}
                        className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                      >
                        {cat.image ? (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                            <img
                              src={getImageUrl(cat.image)}
                              alt={catName}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).src = "/no-image.jpg"; }}
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            <Grid3x3 className="w-5 h-5" />
                          </div>
                        )}
                        <span className="text-xs font-medium text-center leading-tight line-clamp-2">
                          {catName}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer to prevent content from being hidden behind bottom nav */}
      <div className="h-16 lg:hidden" />
    </>
  );
}
