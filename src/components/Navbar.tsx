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
        className={`fixed top-0 z-[60] w-full transition-all duration-700 ease-in-out ${shouldBeTransparent && !isScrolled ? "bg-transparent" : "bg-background/70 backdrop-blur-2xl shadow-[0_4px_30px_rgba(0,0,0,0.03)] border-b border-border/40"
          }`}
      >
        {/* LIGHT FOLLOW EFFECT */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-0 lg:opacity-100"
          style={{
            background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(9, 63, 137, 0.08), transparent 50%)`,
          }}
        />

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-50%] start-[-5%] w-[400px] h-[400px] bg-[#093f89]/5 blur-[80px] rounded-full" />
          <div className="absolute top-[-50%] end-[-5%] w-[400px] h-[400px] bg-[#fbc70f]/5 blur-[90px] rounded-full dark:bg-[#fbc70f]/5" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <div className={`relative w-full h-16 lg:h-20 flex items-center justify-between px-5 sm:px-8 rounded-full border transition-all duration-500
            ${shouldBeTransparent && !isScrolled
              ? "border-white/15 bg-white/5 backdrop-blur-3xl text-white"
              : "border-border/50 bg-card/60 backdrop-blur-3xl text-foreground shadow-sm hover:shadow-md"
            }`}
          >
            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 font-serif text-lg sm:text-2xl font-bold tracking-[0.15em] group">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={siteName}
                    className="h-12 sm:h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105 p-1"
                  />
                ) : (
                  <span className="group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">{siteName}</span>
                )}
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-2 text-sm font-medium">
              {navLinks.map((link) => {
                const active = pathname === link.href;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-5 py-2.5 rounded-full tracking-wide transition-all duration-300 group
                      ${active
                        ? shouldBeTransparent && !isScrolled
                          ? "bg-white/20 text-white shadow-lg"
                          : "bg-[#093f89] text-white dark:bg-[#fbc70f] dark:text-[#093f89] shadow-md shadow-[#093f89]/20 dark:shadow-[#fbc70f]/20"
                        : shouldBeTransparent && !isScrolled
                          ? "text-white/85 hover:bg-white/15 hover:text-[#fbc70f]"
                          : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-[#093f89]/5 dark:hover:bg-[#fbc70f]/10"
                      }`}
                  >
                    {link.label}

                    {/* Hover Underline Accent */}
                    <span
                      className={`absolute left-1/2 -bottom-0 h-[3px] bg-[#fbc70f] dark:bg-[#093f89] rounded-t-full transition-all duration-300
                        ${active
                          ? "w-6 -translate-x-1/2 opacity-100"
                          : "w-0 -translate-x-1/2 opacity-0 group-hover:w-6"
                        }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">

              {/* Search */}
              <div className="flex items-center" ref={searchBarRef}>
                <AnimatePresence mode="wait">
                  {isSearchOpen ? (
                    <motion.form
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: "auto", opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      onSubmit={handleSearch}
                      className="relative flex items-center min-w-[160px] sm:min-w-[280px]"
                    >
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder={lang === 'en' ? 'Search...' : 'بحث...'}
                        className="w-full h-10 ps-5 pe-10 bg-muted/50 backdrop-blur-md border border-border/80 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#093f89]/30 dark:focus:ring-[#fbc70f]/30 text-foreground transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setIsSearchOpen(false)}
                        className="absolute end-3 p-1.5 text-muted-foreground hover:text-rose-500 transition-colors rounded-full hover:bg-rose-500/10"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {filteredSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 15, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full end-0 mt-4 w-[260px] sm:w-[380px] bg-card/90 backdrop-blur-2xl border border-border/60 shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-[2rem] overflow-hidden z-[70] p-3"
                          >
                            <p className="text-[10px] uppercase tracking-[0.2em] text-[#093f89] dark:text-[#fbc70f] font-bold px-4 py-2 border-b border-border/50 mb-2">
                              {lang === 'en' ? 'Suggestions' : 'اقتراحات'}
                            </p>
                            <div className="space-y-1">
                              {filteredSuggestions.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/shop/${p.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center gap-4 p-2.5 hover:bg-muted/60 rounded-2xl transition-all duration-300 group"
                                >
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-background flex-shrink-0 relative border border-border/40 shadow-sm">
                                    <Image
                                      src={getImageUrl(p.images?.[0] || p.image_path || p.thumbnail_path || p.image) || '/no-image.jpg'}
                                      alt={p.name?.[lang] || p.name?.en || p.name}
                                      fill
                                      sizes="48px"
                                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 text-start">
                                    <h5 className="text-sm font-semibold text-foreground truncate group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors">
                                      {p.name?.[lang] || p.name?.en || p.name}
                                    </h5>
                                    <p className="text-xs text-muted-foreground font-medium mt-0.5">
                                      {p.base_price || p.price} {settings?.currency_symbol || '$'}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <button
                              onClick={handleSearch}
                              className="w-full mt-3 py-3 text-xs font-bold text-center border-t border-border/50 bg-[#093f89]/5 dark:bg-[#fbc70f]/5 hover:bg-[#093f89]/10 dark:hover:bg-[#fbc70f]/10 text-[#093f89] dark:text-[#fbc70f] transition-colors rounded-xl"
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
                      className={`p-2.5 rounded-full transition-all duration-300 ${shouldBeTransparent && !isScrolled
                        ? "text-white hover:bg-white/20"
                        : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-muted"
                        }`}
                      aria-label="Search"
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle */}
              <div className="hidden sm:flex items-center gap-2 mx-1">
                <LanguageToggle />
                {!user && (
                  <ThemeToggle
                    className={shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/20" : "text-muted-foreground hover:bg-muted"}
                  />
                )}
              </div>

              {/* Wishlist */}
              <Link
                href="/account?tab=wishlist"
                className={`p-2.5 rounded-full transition-all duration-300 relative ${shouldBeTransparent && !isScrolled
                  ? "text-white hover:bg-white/20"
                  : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-muted"
                  }`}
              >
                <Heart className={`w-5 h-5 ${wishlistCount > 0 ? "fill-red-500 text-red-500" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute top-1 end-1 w-4 h-4 text-[10px] font-bold bg-[#fbc70f] text-[#093f89] rounded-full flex items-center justify-center shadow-md ring-2 ring-background">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2.5 rounded-full transition-all duration-300 relative ${shouldBeTransparent && !isScrolled
                  ? "text-white hover:bg-white/20"
                  : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-muted"
                  }`}
              >
                <ShoppingBag className="w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-1 end-1 w-4 h-4 text-[10px] font-bold bg-[#093f89] text-white dark:bg-[#fbc70f] dark:text-[#093f89] rounded-full flex items-center justify-center shadow-md ring-2 ring-background">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className={`flex items-center gap-2 p-1.5 pe-3 rounded-full transition-all border ${shouldBeTransparent && !isScrolled
                      ? "text-white border-white/20 bg-white/10 hover:bg-white/25"
                      : "text-foreground border-border/60 bg-muted/40 hover:bg-muted shadow-sm hover:shadow-md"
                      }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${shouldBeTransparent && !isScrolled ? "bg-white/20 text-white" : "bg-[#093f89] text-white dark:bg-[#fbc70f] dark:text-[#093f89]"}`}>
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden md:block text-xs font-bold uppercase tracking-wider">
                      {user.first_name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className={`p-2.5 rounded-full transition-all duration-300 flex items-center gap-2 ${shouldBeTransparent && !isScrolled
                      ? "text-white hover:bg-white/20"
                      : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-muted"
                      }`}
                  >
                    <User className="w-5 h-5" />
                  </Link>
                )}

                <AnimatePresence>
                  {accountOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 15, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute end-0 mt-4 w-64 bg-card/90 backdrop-blur-2xl border border-border/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden z-[60] py-2"
                    >
                      <div className="px-5 py-4 border-b border-border/40 bg-muted/20">
                        <p className="text-sm font-bold text-foreground">{user.first_name} {user.last_name}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">{user.email}</p>
                      </div>

                      <div className="p-3 space-y-1.5">
                        <Link href="/account" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl font-medium text-muted-foreground hover:text-[#093f89] hover:bg-[#093f89]/5 dark:hover:text-[#fbc70f] dark:hover:bg-[#fbc70f]/10 transition-colors">
                          <LayoutDashboard className="w-4 h-4" />
                          <span>{lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}</span>
                        </Link>
                        <Link href="/account?tab=orders" onClick={() => setAccountOpen(false)} className="flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl font-medium text-muted-foreground hover:text-[#093f89] hover:bg-[#093f89]/5 dark:hover:text-[#fbc70f] dark:hover:bg-[#fbc70f]/10 transition-colors">
                          <ShoppingBag className="w-4 h-4" />
                          <span>{t("my_orders", lang)}</span>
                        </Link>

                        <button onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); setAccountOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                          {theme === 'dark' ? <Sun className="w-4 h-4 text-[#fbc70f]" /> : <Moon className="w-4 h-4 text-[#093f89]" />}
                          <span>{theme === 'dark' ? (lang === 'en' ? 'Light Mode' : 'الوضع الفاتح') : (lang === 'en' ? 'Dark Mode' : 'الوضع الداكن')}</span>
                        </button>

                        <div className="border-t border-border/40 pt-1.5 mt-1.5">
                          <button onClick={() => { setAccountOpen(false); setIsLogoutModalOpen(true); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm rounded-2xl font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
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
                className={`lg:hidden p-2.5 rounded-full border border-transparent transition-all ${shouldBeTransparent && !isScrolled
                  ? "text-white hover:bg-white/20"
                  : "text-muted-foreground hover:text-[#093f89] dark:hover:text-[#fbc70f] hover:bg-muted"
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
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[55] lg:hidden"
            />

            <motion.div
              initial={{ y: "-20%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "-20%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-4 inset-x-4 max-h-[85vh] md:hidden bg-card/90 backdrop-blur-3xl z-[56] flex flex-col shadow-2xl rounded-[32px] border border-border/50 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/40 bg-muted/10">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                  {logoUrl ? <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain dark:brightness-0 dark:invert" /> : <span className="font-serif text-xl font-bold">{siteName}</span>}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 hover:bg-muted rounded-full transition-colors border border-border/40 text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              {user && (
                <div className="px-6 py-5 border-b border-border/40 bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#093f89] text-white dark:bg-[#fbc70f] dark:text-[#093f89] flex items-center justify-center font-bold shadow-md">
                      {user.first_name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-base text-foreground truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate font-medium mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <nav className="flex-1 overflow-y-auto py-5 px-5 space-y-2 scrollbar-thin scrollbar-thumb-border">
                {navLinks.map((link) => {
                  const active = pathname === link.href;

                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center px-5 py-3.5 text-sm rounded-2xl transition-all duration-300
                        ${active
                          ? "bg-[#093f89] text-white border-s-4 border-[#fbc70f] shadow-lg shadow-[#093f89]/20 font-bold"
                          : "text-foreground/80 hover:bg-[#093f89]/5 dark:hover:bg-[#093f89]/10 hover:text-[#093f89] dark:hover:text-[#fbc70f] font-semibold"
                        }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-border/50 my-5 mx-2" />

                {user ? (
                  <div className="space-y-2">
                    <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center gap-4 px-5 py-3.5 text-sm font-semibold rounded-2xl hover:bg-muted transition-all">
                      <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors" />
                      {lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                    </Link>
                    <Link href="/account?tab=orders" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center gap-4 px-5 py-3.5 text-sm font-semibold rounded-2xl hover:bg-muted transition-all">
                      <ShoppingBag className="w-5 h-5 text-muted-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors" />
                      {t("my_orders", lang)}
                    </Link>
                    <Link href="/account?tab=wishlist" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center gap-4 px-5 py-3.5 text-sm font-semibold rounded-2xl hover:bg-muted transition-all">
                      <Heart className="w-5 h-5 text-muted-foreground group-hover:text-[#fbc70f] transition-colors" />
                      {lang === 'en' ? 'Wishlist' : 'المفضلة'}
                      {wishlistCount > 0 && <span className="ms-auto text-[10px] font-bold bg-[#fbc70f] text-[#093f89] px-2.5 py-0.5 rounded-full shadow-sm">{wishlistCount}</span>}
                    </Link>
                  </div>
                ) : (
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center gap-4 px-5 py-3.5 text-sm font-semibold rounded-2xl hover:bg-muted transition-all">
                    <User className="w-5 h-5 text-muted-foreground group-hover:text-[#093f89] dark:group-hover:text-[#fbc70f] transition-colors" />
                    {lang === 'en' ? 'Login' : 'تسجيل الدخول'}
                  </Link>
                )}
              </nav>

              {/* Footer Actions */}
              <div className="border-t border-border/50 p-5 bg-muted/10 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-center bg-card border border-border/60 rounded-xl px-2 h-12 shadow-sm">
                    <LanguageToggle />
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center justify-center gap-2 h-12 text-sm rounded-xl bg-card border border-border/60 text-foreground hover:bg-muted transition-colors shadow-sm font-semibold"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-[#fbc70f]" /> : <Moon className="w-4 h-4 text-[#093f89]" />}
                    <span>{theme === 'dark' ? (lang === 'en' ? 'Light' : 'فاتح') : (lang === 'en' ? 'Dark' : 'داكن')}</span>
                  </button>
                </div>

                {user && (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setIsLogoutModalOpen(true); }}
                    className="w-full flex items-center justify-center gap-2 h-12 text-sm font-bold rounded-xl text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 transition-colors"
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
              className="bg-card border border-border/60 rounded-[32px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-8 text-start"
            >
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-5 shadow-inner">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold text-foreground mb-3 font-serif">{t('confirm_logout_title', lang)}</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed text-sm font-medium">{t('confirm_logout_desc', lang)}</p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-3.5 rounded-xl border border-border/80 font-bold text-foreground hover:bg-muted transition-all"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={() => { logout(); setIsLogoutModalOpen(false); router.push("/login"); }}
                  className="flex-1 px-4 py-3.5 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-600/20"
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