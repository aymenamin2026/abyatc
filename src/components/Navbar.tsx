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
      setIsScrolled(window.scrollY > 50);
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
        className={`fixed top-0 z-[60] w-full transition-all duration-500 overflow-hidden ${
          shouldBeTransparent && !isScrolled
            ? "bg-transparent border-transparent pt-4 sm:pt-6"
            : "bg-transparent pt-3"
        }`}
      >
        {/* LIGHT FOLLOW EFFECT */}
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-500 opacity-60 dark:opacity-40"
          style={{
            background: `radial-gradient(400px circle at ${pos.x}% ${pos.y}%, rgba(var(--primary-rgb),0.12), transparent 50%)`,
          }}
        />

        {/* BACKGROUND AMBIENT LAYERS */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-50%] left-[-5%] w-[400px] h-[400px] bg-primary/5 dark:bg-primary/10 blur-[80px] rounded-full" />
          <div className="absolute top-[-50%] right-[-5%] w-[400px] h-[400px] bg-cyan-500/10 dark:bg-cyan-500/15 blur-[90px] rounded-full" />
          <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] bg-[url('/noise.png')]" />
        </div>

        {/* MAIN CONTAINER */}
        <div className="container mx-auto px-3 sm:px-6 lg:px-12">
          
          {/* FLOATING HEADER CARD */}
          <div className={`
            relative w-full transition-all duration-500 z-10
            rounded-[24px] border shadow-md px-4 sm:px-6 h-14 sm:h-16 lg:h-20 flex items-center justify-between
            ${shouldBeTransparent && !isScrolled 
              ? "border-white/10 bg-white/5 backdrop-blur-2xl text-white" 
              : "border-neutral-200/80 bg-white/80 dark:border-neutral-800/80 dark:bg-neutral-900/80 backdrop-blur-3xl text-neutral-800 dark:text-neutral-100"
            }
          `}>

            {/* Logo */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href="/" className="flex items-center gap-2 font-serif text-lg sm:text-2xl font-bold tracking-[0.15em]">
                {logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={siteName} 
                    className={`h-7 sm:h-9 w-auto object-contain transition-all ${
                      shouldBeTransparent && !isScrolled ? "brightness-0 invert" : "dark:brightness-0 dark:invert"
                    }`} 
                  />
                ) : (
                  <span>{siteName}</span>
                )}
              </Link>
            </div>

            {/* Desktop Nav Links */}
            <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl tracking-wide transition-all duration-300 ${
                      active
                        ? (shouldBeTransparent && !isScrolled 
                            ? "bg-white/20 text-white shadow-sm" 
                            : "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground font-semibold")
                        : (shouldBeTransparent && !isScrolled
                            ? "text-white/80 hover:bg-white/10 hover:text-white"
                            : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-neutral-100")
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              
              {/* Search */}
              <div className="flex items-center" ref={searchBarRef}>
                <AnimatePresence>
                  {isSearchOpen ? (
                    <div className="relative">
                      <motion.form
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: typeof window !== 'undefined' && window.innerWidth < 640 ? 130 : 260, opacity: 1 }}
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
                          className="w-full h-8 sm:h-9 pl-3 sm:pl-4 pr-8 sm:pr-10 bg-neutral-100/70 dark:bg-neutral-800/70 backdrop-blur-sm border border-neutral-200 dark:border-neutral-700 rounded-full text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-neutral-900 dark:text-neutral-100"
                        />
                        <button
                          type="button"
                          onClick={() => setIsSearchOpen(false)}
                          className="absolute right-2 sm:right-3 p-1 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </motion.form>

                      <AnimatePresence>
                        {filteredSuggestions.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className={`absolute top-full ${lang === 'ar' ? 'left-0' : 'right-0'} mt-2 w-[240px] sm:w-[350px] bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 shadow-xl rounded-2xl overflow-hidden z-[70] p-2`}
                          >
                            <p className="text-[10px] uppercase tracking-wider text-neutral-400 dark:text-neutral-500 font-bold px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                              {lang === 'en' ? 'Suggestions' : 'اقتراحات'}
                            </p>
                            <div className="space-y-1">
                              {filteredSuggestions.map((p) => (
                                <Link
                                  key={p.id}
                                  href={`/shop/${p.slug}`}
                                  onClick={() => setIsSearchOpen(false)}
                                  className="flex items-center gap-3 p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 rounded-xl transition-colors group"
                                >
                                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 relative">
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
                                    <h5 className="text-xs sm:text-sm font-medium text-neutral-800 dark:text-neutral-200 truncate">
                                      {p.name?.[lang] || p.name?.en || p.name}
                                    </h5>
                                    <p className="text-xs text-primary dark:text-primary-foreground font-bold flex items-center">
                                      {p.base_price || p.price}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                            </div>
                            <button
                              onClick={handleSearch}
                              className="w-full mt-2 py-2 text-xs font-semibold text-center text-neutral-600 dark:text-neutral-400 border-t border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors rounded-b-xl"
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
                      className={`p-2 rounded-full transition-all duration-300 ${
                        shouldBeTransparent && !isScrolled 
                          ? "text-white hover:bg-white/10" 
                          : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                      }`}
                    >
                      <Search className="w-4 h-4 sm:w-5 h-5" />
                    </button>
                  )}
                </AnimatePresence>
              </div>

              {/* Language Toggle - Desktop Only */}
              <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                <LanguageToggle />
                {!user && (
                  <ThemeToggle
                    className={shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10" : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"}
                  />
                )}
              </div>

              {/* Wishlist Heart */}
              <Link
                href="/account?tab=wishlist"
                className={`p-2 rounded-full transition-all duration-300 relative ${
                  shouldBeTransparent && !isScrolled 
                    ? "text-white hover:bg-white/10" 
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <Heart className={`w-4 h-4 sm:w-5 h-5 ${wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""}`} />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 text-[9px] font-bold bg-rose-500 text-white rounded-full flex items-center justify-center shadow-sm">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2 rounded-full transition-all duration-300 relative ${
                  shouldBeTransparent && !isScrolled 
                    ? "text-white hover:bg-white/10" 
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
                }`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 h-5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-0 right-0 w-3.5 h-3.5 text-[9px] font-bold bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-sm">
                    {totalQuantity}
                  </span>
                )}
              </button>

              {/* User Account - Desktop */}
              <div className="relative hidden sm:block" ref={dropdownRef}>
                {user ? (
                  <button
                    onClick={() => setAccountOpen(!accountOpen)}
                    className={`flex items-center gap-1.5 p-1.5 rounded-full transition-all border ${
                      shouldBeTransparent && !isScrolled 
                        ? "text-white border-white/10 bg-white/5 hover:bg-white/20" 
                        : "text-neutral-800 border-neutral-200 bg-neutral-50 hover:bg-neutral-100 dark:text-neutral-200 dark:border-neutral-700 dark:bg-neutral-800/50 dark:hover:bg-neutral-800"
                    }`}
                  >
                    <div className={`w-6 h-6 sm:w-7 h-7 rounded-full flex items-center justify-center ${
                      shouldBeTransparent && !isScrolled ? "bg-white/20 text-white" : "bg-neutral-200 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-200"
                    }`}>
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="hidden md:block text-xs font-semibold mr-1 uppercase tracking-wider">
                      {user.first_name}
                    </span>
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <Link 
                    href="/login" 
                    className={`p-2 rounded-full transition-all duration-300 flex items-center gap-2 ${
                      shouldBeTransparent && !isScrolled ? "text-white hover:bg-white/10" : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"}
                  `}>
                    <User className="w-4 h-4 sm:w-5 h-5" />
                  </Link>
                )}

                {accountOpen && user && (
                  <div className={`absolute ${lang === 'ar' ? 'left-0' : 'right-0'} mt-3 w-56 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]`}>
                    <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
                      <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{user.email}</p>
                    </div>

                    <div className="p-2">
                      <Link
                        href="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-neutral-400" />
                        <span>{lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}</span>
                      </Link>

                      <button
                        onClick={() => {
                          setTheme(theme === 'dark' ? 'light' : 'dark');
                          setAccountOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
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
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors mt-1 border-t border-neutral-100 dark:border-neutral-800 pt-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{lang === 'en' ? 'Logout' : 'تسجيل الخروج'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-full transition-all ${
                  shouldBeTransparent && !isScrolled 
                    ? "text-white hover:bg-white/10" 
                    : "text-neutral-700 hover:bg-neutral-100 dark:text-neutral-200 dark:hover:bg-neutral-800"
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
            {/* Backdrop شفاف بفلتر ضبابي ناعم */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/30 dark:bg-black/60 backdrop-blur-md z-[55] lg:hidden"
            />
            
            {/* Menu Panel */}
            <motion.div
              initial={{ y: "-20%", opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: "-20%", opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="fixed top-4 inset-x-4 max-h-[85vh] md:hidden bg-white/90 dark:bg-neutral-900/90 backdrop-blur-3xl z-[56] flex flex-col shadow-2xl rounded-[32px] border border-neutral-200/60 dark:border-neutral-800/60 overflow-hidden"
            >
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/20">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="font-serif text-lg font-bold tracking-wider">
                  {logoUrl ? (
                    <img src={logoUrl} alt={siteName} className="h-7 w-auto object-contain dark:brightness-0 dark:invert" />
                  ) : (
                    <span className="text-neutral-900 dark:text-neutral-100">{siteName}</span>
                  )}
                </Link>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors border border-neutral-200 dark:border-neutral-700">
                  <X className="w-4 h-4 text-neutral-500" />
                </button>
              </div>

              {/* Mobile User Info */}
              {user && (
                <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-neutral-800/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200 truncate">{user.first_name} {user.last_name}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Mobile Nav Links */}
              <nav className="flex-1 overflow-y-auto py-4 px-4 space-y-1">
                {navLinks.map((link) => {
                  const active = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-2xl transition-all duration-300 ${
                        active
                          ? 'bg-primary text-primary-foreground shadow-md shadow-primary/10 font-semibold scale-[1.01]'
                          : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                <div className="border-t border-neutral-100 dark:border-neutral-800 my-3" />

                {/* Mobile Account Links */}
                {user ? (
                  <div className="space-y-1">
                    <Link
                      href="/account"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      {lang === 'en' ? 'Dashboard' : 'لوحة التحكم'}
                    </Link>
                    <Link
                      href="/account?tab=wishlist"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                    >
                      <Heart className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                      {lang === 'en' ? 'Wishlist' : 'المفضلة'}
                      {wishlistCount > 0 && (
                        <span className="ml-auto text-[10px] font-bold bg-rose-500 text-white px-2 py-[2px] rounded-full">{wishlistCount}</span>
                      )}
                    </Link>
                  </div>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-2xl text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 transition-colors"
                  >
                    <User className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
                    {lang === 'en' ? 'Login' : 'تسجيل الدخول'}
                  </Link>
                )}
              </nav>

              {/* Mobile Menu Footer */}
              <div className="border-t border-neutral-100 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-800/20 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center justify-center bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 rounded-xl px-2">
                    <LanguageToggle />
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                  >
                    {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                    <span className="text-xs font-medium">{theme === 'dark' ? (lang === 'en' ? 'Light' : 'فاتح') : (lang === 'en' ? 'Dark' : 'داكن')}</span>
                  </button>
                </div>

                {user && (
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsLogoutModalOpen(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl text-rose-500 border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
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

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {isLogoutModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 dark:bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[28px] shadow-2xl w-full max-w-sm overflow-hidden flex flex-col p-6 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center mb-4">
                <LogOut className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 font-serif">{t('confirm_logout_title', lang)}</h3>
              <p className="text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed text-sm">{t('confirm_logout_desc', lang)}</p>

              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => setIsLogoutModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700 font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all"
                >
                  {t('cancel', lang)}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsLogoutModalOpen(false);
                    router.push("/login");
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 text-white font-medium hover:bg-rose-700 transition-all shadow-sm shadow-rose-200 dark:shadow-none"
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