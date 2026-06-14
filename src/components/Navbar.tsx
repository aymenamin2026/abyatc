"use client";

import Link from "next/link";
import { ShoppingBag, User, LayoutDashboard, LogOut, Sun, Moon, ChevronDown, Search, X, Heart, Menu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import CartDrawer from "./CartDrawer";
import { getImageUrl, fetchProducts, fetchSliders } from "@/lib/api";
import { LanguageToggle } from "./LanguageToggle";
import { ThemeToggle } from "./ThemeToggle";
import { useLanguage } from "./LanguageContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useWishlist } from "./WishlistContext";
import { t } from "@/lib/translations";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar({ settings, transparent: initialTransparent = false }: { settings?: any, transparent?: boolean }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<any[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [shouldBeTransparent, setShouldBeTransparent] = useState(initialTransparent);
  
  const headerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 50, y: 50 });

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
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      if (!headerRef.current) return;
      const rect = headerRef.current.getBoundingClientRect();
      setPos({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      });
    };

    const el = headerRef.current;
    el?.addEventListener("mousemove", handleMove);
    return () => el?.removeEventListener("mousemove", handleMove);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
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
      if (searchInputRef.current) searchInputRef.current.focus();
      fetchProducts().then(setAllProducts).catch(console.error);
    } else {
      setFilteredSuggestions([]);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length > 1 && allProducts.length > 0) {
      const filtered = allProducts.filter(p => {
        const q = searchQuery.toLowerCase();
        const name = (p.name?.[lang] || p.name?.en || p.name || "").toLowerCase();
        const sku = (p.sku || "").toLowerCase();
        const variationSkuMatch = (p.variations || []).some((v: any) => (v.sku || "").toLowerCase().includes(q));
        return name.includes(q) || sku.includes(q) || variationSkuMatch;
      }).slice(0, 5);
      setFilteredSuggestions(filtered);
    } else {
      setFilteredSuggestions([]);
    }
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
    { href: "/track", label: t('track_order', lang) },
    { href: "/about", label: t('about', lang) },
    { href: "/blogs", label: lang === 'en' ? 'Blogs' : 'المدونة' },
  ];

  return (
    <>
      <header 
        ref={headerRef}
        className={`fixed top-0 left-0 right-0 z-[60] p-4 sm:p-6 transition-all duration-500 overflow-hidden ${
          shouldBeTransparent && !isScrolled ? "bg-transparent pt-5" : "bg-transparent pt-4"
        }`}
      >
        {/* LIGHT FOLLOW EFFECT MAPPED SPLENDIDLY */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(450px circle at ${pos.x}% ${pos.y}%, rgba(var(--primary-rgb),0.12), transparent 50%)`,
          }}
        />

        {/* BACKGROUND AMBIENT LAYERS (توهج سماوي وبنفسجي بارز وفاخر خلف الهيدر) */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-30%] left-[-5%] w-[450px] h-[350px] bg-primary/10 blur-[100px] rounded-full" />
          <div className="absolute top-[-30%] right-[-5%] w-[450px] h-[350px] bg-cyan-500/30 blur-[110px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.02] bg-[url('/noise.png')]" />
        </div>

        {/* MAIN CONTAINER */}
        <div className="max-w-7xl mx-auto">
          
          {/* FLOATING HEADER CARD DESIGN */}
          <div className={`
            relative w-full transition-all duration-500 z-10
            rounded-[24px] border px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between
            ${shouldBeTransparent && !isScrolled 
              ? "border-white/10 bg-white/5 backdrop-blur-2xl text-white shadow-lg" 
              : "border-border/60 bg-card/60 backdrop-blur-3xl text-foreground shadow-2xl shadow-cyan-500/[0.02]"
            }
          `}>

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0 relative z-10">
              <Link href="/" className="flex items-center gap-2 font-serif text-xl sm:text-2xl font-extrabold tracking-[0.12em] group transition-all">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={siteName} 
                    className={`h-8 sm:h-10 w-auto object-contain transition-all duration-300 ${
                      shouldBeTransparent && !isScrolled ? "brightness-0 invert" : ""
                    }`} 
                  />
                ) : (
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-primary">
                    {siteName}
                  </span>
                )}
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity blur-[0.5px]" />
              </Link>
            </div>

            {/* Desktop Nav Links (صندوق زجاجي مبهر متناسق في الوسط) */}
            <nav className="hidden lg:flex items-center gap-1 bg-muted/10 border border-border/30 rounded-full p-1.5 backdrop-blur-md">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-5 py-2 text-xs sm:text-sm font-bold rounded-full tracking-wide transition-all duration-300 relative group overflow-hidden ${
                      active
                        ? (shouldBeTransparent && !isScrolled 
                          ? "bg-white text-black shadow-md" 
                          : "bg-primary text-primary-foreground shadow-md shadow-primary/15")
                        : (shouldBeTransparent && !isScrolled
                          ? "text-white/80 hover:bg-white/10 hover:text-white"
                          : "text-muted-foreground hover:text-foreground")
                    }`}
                  >
                    <span className="relative z-10">{link.label}</span>
                    
                    {/* تأثير النيون الزجاجي الخفيف الممتص للألوان الخلفية عند الـ Hover */}
                    {!active && (
                      <div className="absolute inset-0 bg-cyan-500/0 group-hover:bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition-all duration-300 blur-sm rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 flex-shrink-0">
              
              {/* Search Control */}
              <div className="flex items-center" ref={searchBarRef}>
                <AnimatePresence>
                  {isSearchOpen ? (
                    <div className="relative">
                      <motion.form
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? 140 : 280, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        onSubmit={handleSearch}
                        className="relative flex items-center"
                      >
                        <input
                          ref={searchInputRef}
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder={lang === 'en' ? 'Search...' : 'بحث...'}
                          className="w-full h-9 pl-4 pr-10 bg-muted/50 backdrop-blur-md border border-border/80 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/30 text-foreground"
                        />
                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(false)}
                          className="absolute right-3 p-1 text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </motion.form>

                      {/* Suggestions Dropdown */}
                      <AnimatePresence>
                        {filteredSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            className={`absolute top-full ${lang === 'ar' ? 'left-0' : 'right-0'} mt-3 w-[260px] sm:w-[360px] bg-background/95 backdrop-blur-2xl border border-border/80 shadow-2xl rounded-2xl overflow-hidden z-[70] p-2`}
                          >
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-extrabold px-3 py-2 border-b border-border/40 mb-1">
                              {lang === 'en' ? 'Suggestions' : 'اقتراحات الأناقة'}
                            </p>
                            <div className="space-y-1">
                              {filteredSuggestions.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/shop/${p.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl transition-colors group"
                                >
                                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative border border-border/40">
                                    <img
                                      src={getImageUrl(p.images?.[0] || p.image_path || p.thumbnail_path || p.image)}
                                      alt={p.name?.[lang] || p.name?.en || p.name}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/no-image.jpg';
                                      }}
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <h5 className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                      {p.name?.[lang] || p.name?.en || p.name}
                                    </h5>
                                    <p className="text-xs text-cyan-500 font-extrabold mt-0.5">
                                      {p.base_price || p.price}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <button
                              onClick={handleSearch}
                              className="w-full mt-2 py-2.5 text-xs font-bold text-center border-t border-border/40 hover:bg-muted text-primary transition-colors rounded-b-xl"
                            >
                              {lang === 'en' ? 'View all results' : 'عرض جميع النتائج'}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <button
                      onClick={() => setIsSearchOpen(true)}
                      className={`p-2.5 rounded-full border border-transparent transition-all duration-300 hover:scale-105 ${
                        shouldBeTransparent && !isScrolled 
                          ? "text-white hover:bg-white/10 hover:border-white/10" 
                          : "text-foreground hover:bg-muted hover:border-border/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                      }`}
                    >
                      <Search className="w-4 h-4 sm:w-5 h-5" />
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Language & Preferences Toggles (صقل أزرار اللغات والثيم) */}
              <div className="hidden sm:flex items-center gap-1.5">
                <div className={`rounded-full p-0.5 border transition-all ${shouldBeTransparent && !isScrolled ? "border-white/10 bg-white/5" : "border-border bg-muted/20"}`}>
                  <LanguageToggle />
                </div>
                {!user && (
                  <ThemeToggle
                    className={`rounded-full p-2.5 hover:scale-105 transition-transform ${shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted"}`}
                  />
                )}
              </div>

              {/* Wishlist Icon */}
              <Link
                href="/account?tab=wishlist"
                className={`p-2.5 rounded-full border border-transparent transition-all duration-300 relative hover:scale-105 ${
                  shouldBeTransparent && !isScrolled 
                    ? "text-white hover:bg-white/10 hover:border-white/10" 
                    : "text-foreground hover:bg-muted hover:border-border/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 h-5 transition-transform ${wishlistCount > 0 ? "fill-red-500 text-red-500 scale-110" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 text-[9px] font-extrabold bg-red-500 text-white rounded-full flex items-center justify-center shadow-sm animate-pulse">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart Container Trigger */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2.5 rounded-full border border-transparent transition-all duration-300 relative hover:scale-105 ${
                  shouldBeTransparent && !isScrolled 
                    ? "text-white hover:bg-white/10 hover:border-white/10" 
                    : "text-foreground hover:bg-muted hover:border-border/60 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                }`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0.5 right-0.5 w-4 h-4 text-[9px] font-extrabold bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-md shadow-primary/20">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* User Account / Profile Dropdown Card */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all duration-300 border hover:scale-[1.02] ${
                      shouldBeTransparent && !isScrolled 
                        ? "text-white border-white/10 bg-white/5 hover:bg-white/20" 
                        : "text-foreground border-border/80 bg-muted/40 hover:bg-muted hover:border-cyan-500/30"
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border font-bold ${
                      shouldBeTransparent && !isScrolled ? "bg-white/20 text-white border-white/20" : "bg-primary/10 text-primary border-primary/20"
                    }`}>
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden md:block text-xs font-bold mr-1 uppercase tracking-wider max-w-[70px] truncate">
                      {user.first_name}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    className={`p-2.5 rounded-full border border-transparent transition-all duration-300 hover:scale-105 flex items-center gap-2 ${
                      shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10" : "text-foreground hover:bg-muted hover:border-border/60"
                    }`}
                  >
                    <User className="w-4 h-4 sm:w-5 h-5" />
                  </Link>
                )}

                {/* Account Dashboard Floater Menu */}
                {accountOpen && user && (
                  <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-4 w-60 bg-background/95 backdrop-blur-2xl border border-border/80 rounded-[22px] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300 z-[60] p-2`}>
                    <div className="px-4 py-3 border-b border-border/40 bg-muted/30 rounded-t-xl mb-1">
                      <p className="text-sm font-bold text-foreground truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="space-y-0.5">
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted text-foreground/90 hover:text-foreground transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-primary" />
                        <span>{lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}</span>
                      </Link>

                      <button
                        onClick={() => {
                          setTheme(theme === 'dark' ? 'light' : 'dark');
                          setAccountOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-xl hover:bg-muted text-foreground/90 hover:text-foreground transition-colors"
                      >
                        {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                        <span>{theme === 'dark'
                          ? (lang === 'en' ? 'Light Mode' : 'الوضع الفاتح')
                          : (lang === 'en' ? 'Dark Mode' : 'الوضع الداكن')}</span>
                      </button>

                      <button
                        onClick={() => {
                          setAccountOpen(false);
                          setIsLogoutModalOpen(true);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold rounded-xl text-rose-500 hover:bg-rose-500/5 transition-colors border-t border-border/40 mt-1 pt-2.5"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger Trigger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2.5 rounded-full border border-transparent transition-all ${
                  shouldBeTransparent && !isScrolled 
                    ? "text-white hover:bg-white/10 hover:border-white/10" 
                    : "text-foreground hover:bg-muted hover:border-border/60"
                }`}
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay Floating Glass Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-md z-[55] lg:hidden"
            />
            
            <motion.div
              initial={{ y: "-25%", opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "-25%", opacity: 0, scale: 0.96 }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed top-4 inset-x-4 max-h-[88vh] md:hidden bg-card/90 backdrop-blur-3xl z-[56] flex flex-col shadow-2xl rounded-[32px] border border-border/80 overflow-hidden"
            >
              {/* Mobile Header Box */}
              <div className="flex items-center justify-between p-5 border-b border-border/40 bg-muted/20">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-xl font-extrabold tracking-wider">
                  {logoUrl ? (
                    <img src={logoUrl} alt={siteName} className="h-8 w-auto object-contain" />
                  ) : (
                    <span className="text-foreground">{siteName}</span>
                  )}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2.5 hover:bg-muted rounded-full transition-colors border border-border/50">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* User Bio inside Drawer */}
              {user && (
                <div className="px-5 py-4 border-b border-border/40 bg-muted/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 font-bold">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Dynamic Elements */}
              <nav className="flex-1 overflow-y-auto py-5 px-4 space-y-1.5">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/15 scale-[1.01]'
                          : 'text-foreground/80 hover:bg-muted/60 hover:text-foreground'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-border/40 my-3" />

                {user ? (
                  <div className="space-y-1">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl text-foreground/80 hover:bg-muted/60 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-primary" />
                      {lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                    </Link>
                    <Link
                      href="/account?tab=wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl text-foreground/80 hover:bg-muted/60 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-red-500 fill-red-500/10" />
                      {lang === 'en' ? 'Wishlist' : 'المفضلة'}
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-[10px] font-extrabold bg-red-500 text-white px-2.5 py-0.5 rounded-full">{wishlistCount}</span>
                      )}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl text-foreground/80 hover:bg-muted/60 transition-colors"
                  >
                    <User className="w-4 h-4 text-cyan-500" />
                    {lang === 'en' ? 'Login' : 'تسجيل الدخول'}
                  </Link>
                )}
              </nav>

              {/* Footer configuration indicators inside mobile drawer */}
              <div className="border-t border-border/40 p-4 bg-muted/30 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center bg-background border border-border/60 rounded-xl px-2 h-11">
                    <LanguageToggle />
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-xl bg-background border border-border/60 text-foreground hover:bg-muted transition-colors h-11"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span className="text-xs font-bold">{theme === 'dark' ? (lang === 'en' ? 'Light' : 'فاتح') : (lang === 'en' ? 'Dark' : 'داكن')}</span>
                  </button>
                </div>

                {user && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold rounded-xl text-rose-500 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {lang === 'en' ? 'Logout' : 'تسجيل الخروج'}
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

      {/* Logout Confirmation Dialog Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-background border border-border/80 rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-left"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4 border border-rose-500/20">
                <LogOut className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-1.5 font-serif">{t('confirm_logout_title', lang)}</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed text-sm">{t('confirm_logout_desc', lang)}</p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 h-11 rounded-xl border border-border font-bold text-sm text-foreground hover:bg-secondary transition-all"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsLogoutModalOpen(false);
                    router.push("/login");
                  }}
                  className="flex-1 h-11 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 transition-all shadow-md shadow-rose-600/15"
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