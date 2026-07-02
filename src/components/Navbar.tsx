"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, User, LayoutDashboard, LogOut, Sun, Moon,
  ChevronDown, Search, X, Heart, Menu
} from "lucide-react";

import CartDrawer from "./CartDrawer";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";

import { getImageUrl, fetchProducts, fetchSliders } from "@/lib/api";
import { t } from "@/lib/translations";
import { useLanguage } from "./LanguageContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useWishlist } from "./WishlistContext";

export default function Navbar({ settings, transparent: initialTransparent = false }: { settings?: any, transparent?: boolean }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldBeTransparent, setShouldBeTransparent] = useState(initialTransparent);

  const headerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const pathname = usePathname();
  const { lang } = useLanguage();
  const { totalQuantity } = useCart();
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const { theme, setTheme } = useTheme();

  const isRtl = lang === 'ar';

  useEffect(() => {
    if (pathname === '/') {
      fetchSliders('home_hero').then(sliders => {
        const hasActiveHero = sliders.some((s: any) => s.is_active);
        setShouldBeTransparent(hasActiveHero ? true : false);
      });
    } else {
      setShouldBeTransparent(false);
    }
  }, [pathname]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 1. تحسين هائل للأداء: نقل تأثير الماوس ليعمل عبر CSS المتغيرات بدلاً من State لمنع الـ Re-renders
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--mouse-x', `${x}%`);
      el.style.setProperty('--mouse-y', `${y}%`);
    };

    el.addEventListener("mousemove", handleMove, { passive: true });
    return () => el.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
      if (allProducts.length === 0) {
        fetchProducts().then(setAllProducts).catch(console.error);
      }
    }
  }, [isSearchOpen, allProducts.length]);

  // 2. استخدام useMemo بدلاً من useEffect للفلترة لزيادة الكفاءة والسرعة
  const filteredSuggestions = useMemo(() => {
    if (searchQuery.trim().length < 2 || allProducts.length === 0) return [];

    const q = searchQuery.toLowerCase();
    return allProducts.filter(p => {
      const name = (p.name?.[lang] || p.name?.en || p.name || "").toLowerCase();
      const sku = (p.sku || "").toLowerCase();
      const variationSkuMatch = (p.variations || []).some((v: any) => (v.sku || "").toLowerCase().includes(q));
      return name.includes(q) || sku.includes(q) || variationSkuMatch;
    }).slice(0, 5);
  }, [searchQuery, allProducts, lang]);

  const siteName = settings?.site_name || "Luluh.sa";
  const logoUrl = settings?.logo_path ? getImageUrl(settings.logo_path) : null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: lang === 'en' ? 'Home' : 'الرئيسية' },
    { href: "/shop", label: t('shop', lang) },
    { href: "/projects", label: t('project', lang) },
    { href: "/about", label: t('about', lang) },
    { href: "/track", label: t('track_order', lang) },
    { href: "/blogs", label: lang === 'en' ? 'Blogs' : 'المدونة' },
  ];

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 z-[60] w-full transition-all duration-500 ${shouldBeTransparent && !isScrolled ? "bg-transparent" : "bg-background/80 backdrop-blur-md shadow-sm"
          }`}
      >
        {/* LIGHT FOLLOW EFFECT (CSS-Driven) */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 lg:opacity-100"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--primary-rgb),0.12), transparent 50%)`,
          }}
        />

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-50%] start-[-5%] w-[400px] h-[400px] bg-primary/10 blur-[80px] rounded-full" />
          <div className="absolute top-[-50%] end-[-5%] w-[400px] h-[400px] bg-cyan-500/20 blur-[90px] rounded-full dark:bg-cyan-500/10" />
          <div className="absolute inset-0 opacity-[0.03] bg-[url('/noise.png')]" />
        </div>

        <div className="container mx-auto px-3 sm:px-6 lg:px-12 pt-4">
          <div className={`relative w-full h-14 sm:h-16 lg:h-20 flex items-center justify-between px-4 sm:px-6 rounded-[24px] border transition-all duration-500
            ${shouldBeTransparent && !isScrolled
              ? "border-white/10 bg-white/5 backdrop-blur-2xl text-white"
              : "border-border bg-card/70 backdrop-blur-3xl text-foreground"
            }`}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 font-serif text-lg sm:text-2xl font-bold tracking-[0.15em]">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="h-14 sm:h-20 w-auto object-contain transition-all drop-shadow-lg p-1"
                  />
                ) : (
                  <span>{siteName}</span>
                )}
              </Link>
            </div>

            {/* Desktop Nav Links */}
            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-2 text-sm font-medium">
              {navLinks.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-4 py-2 rounded-xl tracking-wide transition-all duration-300
        ${active
                        ? shouldBeTransparent && !isScrolled
                          ? "bg-white/15 text-white shadow-lg"
                          : "bg-[#093f89]/10 text-[#093f89] dark:bg-[#093f89]/20 dark:text-[#fbc70f]"
                        : shouldBeTransparent && !isScrolled
                          ? "text-white/85 hover:bg-white/10 hover:text-[#fbc70f]"
                          : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10"
                      }`}
                  >
                    {link.label}

                    {/* Underline */}
                    <span
                      className={`absolute left-1/2 -bottom-1 h-[2px] bg-[#fbc70f] rounded-full transition-all duration-300
          ${active
                          ? "w-8 -translate-x-1/2 opacity-100"
                          : "w-0 -translate-x-1/2 opacity-0 group-hover:w-8"
                        }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">

              {/* Search */}
              <div className="flex items-center" ref={searchBarRef}>
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearch}
                      className="relative flex items-center min-w-[140px] sm:min-w-[260px]"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'en' ? 'Search...' : 'بحث...'}
                        className="w-full h-8 sm:h-9 ps-3 sm:ps-4 pe-8 sm:pe-10 bg-muted/40 backdrop-blur-sm border border-border rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute end-2 sm:end-3 p-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      </button>

                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {filteredSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute top-full end-0 mt-2 w-[240px] sm:w-[350px] bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden z-[70] p-2"
                          >
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold px-3 py-2 border-b border-border/50 mb-1">
                              {lang === 'en' ? 'Suggestions' : 'اقتراحات'}
                            </p>
                            <div className="space-y-1">
                              {filteredSuggestions.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/shop/${p.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors group"
                                >
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-muted flex-shrink-0 relative border border-border/30">
                                    {/* 3. استخدام next/image للصور في نتائج البحث */}
                                    <Image
                                      src={getImageUrl(p.images?.[0] || p.image_path || p.thumbnail_path || p.image) || '/no-image.jpg'}
                                      alt={p.name?.[lang] || p.name?.en || p.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 text-start">
                                    <h5 className="text-xs sm:text-sm font-medium text-foreground truncate">
                                      {p.name?.[lang] || p.name?.en || p.name}
                                    </h5>
                                    <p className="text-xs text-primary font-bold flex items-center">
                                      {p.base_price || p.price}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <button
                              onClick={handleSearch}
                              className="w-full mt-2 py-2 text-xs font-semibold text-center border-t border-border/50 hover:bg-muted transition-colors rounded-b-xl text-primary"
                            >
                              {lang === 'en' ? 'View all results' : 'عرض جميع النتائج'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.form>
                  ) : (
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className={`p-2 rounded-full border border-transparent transition-all duration-300 ${shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10 hover:border-white/10" : "text-foreground hover:bg-muted hover:border-border"
                        }`}
                      aria-label="Search"
                    >
                      <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                <LanguageToggle />
                {!user && (
                  <ThemeToggle
                    className={shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"}
                  />
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/account?tab=wishlist"
                className={`p-2 rounded-full border border-transparent transition-all duration-300 relative ${shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10 hover:border-white/10" : "text-foreground hover:bg-muted hover:border-border"
                  }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 end-0 w-3.5 h-3.5 text-[9px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2 rounded-full border border-transparent transition-all duration-300 relative ${shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10 hover:border-white/10" : "text-foreground hover:bg-muted hover:border-border"
                  }`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0 end-0 w-3.5 h-3.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all border ${shouldBeTransparent && !isScrolled ? "text-white border-white/10 bg-white/5 hover:bg-white/20" : "text-foreground border-border bg-muted/30 hover:bg-muted"
                      }`}
                  >
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center ${shouldBeTransparent && !isScrolled ? "bg-white/20 text-white" : "bg-background text-foreground shadow-sm"}`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="hidden md:block text-xs font-semibold me-1 uppercase tracking-wider">
                      {user.first_name}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={`p-2 rounded-full border border-transparent transition-all duration-300 flex items-center gap-2 ${shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"
                      }`}
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </Link>
                )}

                <AnimatePresence>
                  {accountOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute end-0 mt-3 w-56 bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-xl overflow-hidden z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <p className="text-sm font-semibold">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>

                      <div className="p-2 space-y-1">
                        <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors">
                          <LayoutDashboard className="w-4 h-4 text-muted-foreground" />
                          <span>{lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}</span>
                        </Link>
                        <Link href="/account?tab=orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors">
                          <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                          <span>{t("my_orders", lang)}</span>
                        </Link>

                        <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setAccountOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl hover:bg-muted transition-colors">
                          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                          <span>{theme === 'dark' ? (lang === 'en' ? 'Light Mode' : 'الوضع الفاتح') : (lang === 'en' ? 'Dark Mode' : 'الوضع الداكن')}</span>
                        </button>

                        <div className="border-t border-border/50 pt-1 mt-1">
                          <button onClick={() => { setAccountOpen(false); setIsLogoutModalOpen(true); }} className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-rose-500 hover:bg-rose-500/10 transition-colors">
                            <LogOut className="w-4 h-4" />
                            <span>{lang === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full border border-transparent transition-all ${shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10 hover:border-white/10" : "text-foreground hover:bg-muted hover:border-border"
                  }`}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[55] lg:hidden"
            />

            <motion.div
              initial={{ y: "-20%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "-20%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-4 inset-x-4 max-h-[85vh] md:hidden bg-card/90 backdrop-blur-3xl z-[56] flex flex-col shadow-2xl rounded-[32px] border border-border overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-border/50 bg-muted/10">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  {logoUrl ? <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" /> : <span className="font-serif text-lg font-bold">{siteName}</span>}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-muted rounded-full transition-colors border border-border/50">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-foreground">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-foreground truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-2 scrollbar-thin scrollbar-thumb-border">
                {navLinks.map((link) => {
                  const active = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-4 py-3 text-sm rounded-2xl transition-all duration-300
        ${active
                          ? "bg-[#093f89] text-white border-r-4 border-[#fbc70f] shadow-lg shadow-[#093f89]/20 font-semibold"
                          : "text-foreground/80 hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10 hover:text-[#093f89] dark:hover:text-[#fbc70f] font-medium"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-[#093f89]/10 dark:border-white/10 my-4" />

                {user ? (
                  <div className="space-y-2">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10 transition-all duration-300"
                    >
                      <LayoutDashboard className="w-4 h-4 text-muted-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors" />
                      {lang === "en" ? "Dashboard" : "لوحة التحكم"}
                    </Link>

                    <Link
                      href="/account?tab=orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10 transition-all duration-300"
                    >
                      <ShoppingBag className="w-4 h-4 text-muted-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors" />
                      {t("my_orders", lang)}
                    </Link>

                    <Link
                      href="/account?tab=wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10 transition-all duration-300"
                    >
                      <Heart className="w-4 h-4 text-muted-foreground group-hover:text-[#fbc70f] transition-colors" />

                      {lang === "en" ? "Wishlist" : "المفضلة"}

                      {wishlistCount > 0 && (
                        <span className="ms-auto text-[10px] font-bold bg-[#fbc70f] text-[#093f89] px-2 py-[2px] rounded-full shadow">
                          {wishlistCount}
                        </span>
                      )}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10 transition-all duration-300"
                  >
                    <User className="w-4 h-4 text-muted-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors" />
                    {lang === "en" ? "Login" : "تسجيل الدخول"}
                  </Link>
                )}
              </nav>

              {/* Footer Actions */}
              <div className="border-t border-border/50 p-4 bg-muted/10 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center bg-card border border-border rounded-xl px-2 h-10">
                    <LanguageToggle />
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center justify-center gap-2 h-10 text-sm rounded-xl bg-card border border-border text-foreground hover:bg-muted transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
                    <span className="text-xs font-medium">{theme === 'dark' ? (lang === 'en' ? 'Light' : 'فاتح') : (lang === 'en' ? 'Dark' : 'داكن')}</span>
                  </button>
                </div>

                {user && (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setIsLogoutModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 h-10 text-sm font-medium rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> {lang === 'en' ? 'Logout' : 'تسجيل الخروج'}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Logout Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-start"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2 font-serif">{t('confirm_logout_title', lang)}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{t('confirm_logout_desc', lang)}</p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border font-medium text-foreground hover:bg-muted transition-all"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={() => { logout(); setIsLogoutModalOpen(false); router.push("/login"); }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-all shadow-sm shadow-red-200 dark:shadow-none"
                >
                  {t('logout', lang)}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}