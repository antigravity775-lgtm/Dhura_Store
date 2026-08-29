import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Coffee,
  Heart,
  LogIn,
  LogOut,
  User,
  Package,
  Store,
  Crown,
  Home,
  BadgePercent,
  Sparkles,
  Info,
  Phone,
  MapPin,
  Settings,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { useTheme } from "../context/ThemeContext";
import * as api from "../services/api";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import BannerRenderer from "./BannerRenderer";
import { useLocation } from "react-router-dom";

const logo = "/Logo_192.png";

const desktopNavLinks = [
  { to: "/", label: "الرئيسية" },
  { to: "/products", label: "المنتجات" },
  { to: "/categories", label: "الفئات" },
  { to: "/products?promoted=true", label: "العروض" },
];
const Layout = React.memo(({ children }) => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const desktopSearchInputRef = useRef(null);
  const [storeInfo, setStoreInfo] = useState(() => {
    try {
      const cached = localStorage.getItem('teeb_store_info');
      if (cached) return JSON.parse(cached);
    } catch { return null; }
    return null;
  });

  // Teeb Logo Intro Animation State
  // "center" -> "moving" -> "done"
  const [introStage, setIntroStage] = useState(() => {
    return sessionStorage.getItem("teeb_intro_seen") ? "done" : "center";
  });

  useEffect(() => {
    if (introStage === "center") {
      const t = setTimeout(() => {
        setIntroStage("moving");
        window.dispatchEvent(new Event("teebLogoMoving"));
      }, 800);
      return () => clearTimeout(t);
    }
    if (introStage === "moving") {
      const t = setTimeout(() => {
        setIntroStage("done");
        sessionStorage.setItem("teeb_intro_seen", "true");
      }, 550); // 800ms + 550ms = 1350ms
      return () => clearTimeout(t);
    }
  }, [introStage]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Fetch dynamic store info for footer
    api
      .getStoreInfo()
      .then((data) => {
        try { localStorage.setItem('teeb_store_info', JSON.stringify(data)); } catch { }
        setStoreInfo(data);
      })
      .catch((err) => console.error("Failed to load store info:", err));

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setDesktopSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (desktopSearchOpen) {
      desktopSearchInputRef.current?.focus();
    }
  }, [desktopSearchOpen]);

  const handleLogout = useCallback(() => {
    logout();
    navigate("/");
    setIsMobileMenuOpen(false);
  }, [logout, navigate]);

  const handleSearch = useCallback(
    (e) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      } else {
        navigate("/products");
      }
      setIsMobileMenuOpen(false);
      setDesktopSearchOpen(false);
    },
    [searchQuery, navigate],
  );

  const searchInputClass =
    "block w-full pr-11 pl-4 py-2.5 border border-gray-200 dark:border-gold-800 rounded-full bg-gray-50/80 dark:bg-gold-950/60 text-slate-900 dark:text-gold-50 placeholder-gray-400 dark:placeholder-gold-600 focus:outline-none focus:bg-white dark:focus:bg-gold-950/80 focus:ring-2 focus:ring-gold-500/40 focus:border-gold-400 transition-all shadow-sm text-sm text-right";

  const isHomePage = pathname === '/';
  const headerOverHero = isHomePage && !scrolled && introStage === 'done';
  const isIntroActive = introStage !== "done";

  return (
    <div
      className="min-h-screen bg-bone dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300"
      dir="rtl"
    >
      {/* Intro Overlay Background */}
      <AnimatePresence>
        {introStage === "center" && (
          <motion.div
            key="intro-overlay"
            className="fixed inset-0 z-[9998] bg-[#F5F2EC] dark:bg-[#111111] pointer-events-none"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeInOut" }}
          />
        )}
      </AnimatePresence>

      {/* Centered Logo for Intro */}
      {/* Centered Logo for Intro */}
      <AnimatePresence>
        {introStage === "center" && (
          <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-none">
            <div className="flex flex-row items-center gap-4 md:gap-6 mt-[-10vh]" dir="ltr">

              {/* English Text (Left) */}
              <motion.div
                layoutId="teeb-brand-text-en"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <span className="whitespace-nowrap font-serif leading-none text-2xl sm:text-3xl md:text-5xl tracking-widest text-slate-900 dark:text-white drop-shadow-sm font-medium">
                  TEEB
                </span>
              </motion.div>

              {/* Icon (Center) */}
              <motion.div
                layoutId="teeb-brand-icon"
                initial={{ opacity: 0, scale: 0.78 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                  opacity: { duration: 0.15, delay: 0.1 },
                  scale: { type: "spring", damping: 14, stiffness: 110, delay: 0.15 }
                }}
                className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-36 md:h-36 rounded-[0.8rem] md:rounded-2xl bg-white flex items-center justify-center p-0 overflow-hidden shadow-2xl ring-2 ring-gold-400/50"
              >
                <img
                  src={logo}
                  alt="شعار TEEB"
                  className="w-full h-full object-cover object-center scale-[1.16]"
                />
              </motion.div>

              {/* Arabic Text (Right) */}
              <motion.div
                layoutId="teeb-brand-text-ar"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <span className="whitespace-nowrap font-serif leading-none text-[2rem] sm:text-[2.75rem] md:text-[4.5rem] text-slate-900 dark:text-white drop-shadow-sm font-bold relative -top-0.5 md:-top-2">
                  طــيـــــب
                </span>
              </motion.div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* شريط التنقل / Navigation Bar */}
      <header
        className={`sticky top-0 transition-all duration-300 ${isIntroActive ? "z-[10000]" : "z-50"
          } ${isIntroActive && introStage === "center"
            ? "bg-transparent border-transparent shadow-none"
            : scrolled
              ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-md border-b border-gray-100 dark:border-slate-800"
              : "bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 shadow-sm"
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-x-2 sm:gap-x-3 h-14 sm:h-16 ${introStage === "center" ? "invisible" : ""}`}>

            {/* 1. START / RIGHT SIDE (Search + Mobile Menu) */}
            <div className="flex items-center gap-2 min-w-0">
              <button
                className="md:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-800 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="فتح القائمة"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {/* Full search bar — xl+ */}
              <div className="hidden xl:block w-full max-w-sm min-w-0">
                <form onSubmit={handleSearch} className="relative w-full group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-gold-500 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={searchInputClass}
                    placeholder="ابحث عن المنتجات..."
                  />
                </form>
              </div>

              {/* Search icon — md to xl */}
              <button
                type="button"
                onClick={() => setDesktopSearchOpen((open) => !open)}
                aria-label="بحث عن المنتجات"
                aria-expanded={desktopSearchOpen}
                className={`hidden md:flex xl:hidden p-2.5 rounded-xl border transition-all ${
                  desktopSearchOpen
                    ? "border-gold-400 bg-gold-50 dark:bg-gold-900/30 text-gold-600 dark:text-gold-300"
                    : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-gold-300 hover:text-gold-600 dark:hover:text-gold-300 hover:bg-gold-50/60 dark:hover:bg-gold-900/20"
                }`}
              >
                <Search className="h-5 w-5" />
              </button>
            </div>

            {/* 2. CENTER / LOGO */}
            <Link
              to="/"
              className="flex-shrink-0 flex items-center gap-3 cursor-pointer group select-none px-1"
            >
              {introStage !== "center" && (
                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 lg:gap-4" dir="ltr">
                  <motion.div
                    layoutId="teeb-brand-text-en"
                    transition={{ type: "spring", damping: 24, stiffness: 140 }}
                  >
                    <span className="whitespace-nowrap font-serif leading-none text-xs sm:text-sm md:text-lg lg:text-2xl tracking-wider lg:tracking-widest text-slate-900 dark:text-white font-medium drop-shadow-sm">
                      TEEB
                    </span>
                  </motion.div>

                  <motion.div
                    layoutId="teeb-brand-icon"
                    transition={{ type: "spring", damping: 24, stiffness: 140 }}
                    className="relative w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-14 lg:h-14 rounded-md lg:rounded-xl bg-white flex items-center justify-center p-0 overflow-hidden shadow-md ring-1 ring-gold-400/50"
                  >
                    <img
                      src={logo}
                      alt="شعار TEEB"
                      width="56"
                      height="56"
                      fetchpriority="high"
                      className="w-full h-full object-cover object-center scale-[1.16] transition-transform group-hover:scale-[1.22] duration-300"
                    />
                    <div className="absolute top-0 right-0 w-2 h-2 bg-gold-400 rounded-full border border-white animate-pulse hidden lg:block" />
                  </motion.div>

                  <motion.div
                    layoutId="teeb-brand-text-ar"
                    transition={{ type: "spring", damping: 24, stiffness: 140 }}
                  >
                    <span className="whitespace-nowrap font-serif leading-none text-base sm:text-lg md:text-xl lg:text-[2.25rem] text-slate-900 dark:text-white font-bold drop-shadow-sm relative -top-px lg:-top-1">
                      طــيـــــب
                    </span>
                  </motion.div>
                </div>
              )}
            </Link>

            {/* 3. END / LEFT SIDE (Actions) */}
            <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0">
              {/* EN: Dark Mode Toggle Button — accessible in both desktop and mobile
                  AR: زر تبديل الوضع الداكن — متاح في سطح المكتب والجوال */}
              <button
                onClick={toggleTheme}
                className="hidden p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-gold-500 dark:hover:text-gold-400 hover:bg-gold-50 dark:hover:bg-gold-500/10 transition-all duration-200 focus:outline-none"
                aria-label={
                  isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
                }
                title={isDark ? "الوضع الفاتح" : "الوضع الداكن"}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 transition-transform hover:rotate-45 duration-300" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform hover:-rotate-12 duration-300" />
                )}
              </button>

              {/* لوحة المسؤول / Admin Panel */}
              {isAdmin && (
                <>
                  <Link
                    to="/admin"
                    className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 border border-purple-200 dark:border-purple-700 rounded-xl text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm transition-all"
                  >
                    <Crown className="w-4 h-4" />
                    لوحة المسؤول
                  </Link>
                  <Link
                    to="/admin"
                    title="لوحة المسؤول"
                    className="hidden sm:flex xl:hidden p-2 border border-purple-200 dark:border-purple-700 rounded-xl text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                  >
                    <Crown className="w-4 h-4" />
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    to="/my-orders"
                    className="hidden xl:flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:border-gold-300 dark:hover:border-gold-700 hover:text-gold-700 dark:hover:text-gold-300 hover:shadow-sm transition-all"
                  >
                    <Package className="w-4 h-4" />
                    طلباتي
                  </Link>
                  <Link
                    to="/my-orders"
                    title="طلباتي"
                    className="hidden sm:flex xl:hidden p-2 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-gold-50 dark:hover:bg-gold-900/30 hover:border-gold-300 dark:hover:border-gold-700 transition-all"
                  >
                    <Package className="w-4 h-4" />
                  </Link>
                </>
              )}

              {/* المفضلة / Favorites */}
              <Link
                to="/favorites"
                className="flex p-1.5 sm:p-2 text-gray-400 dark:text-gold-700 hover:text-rose-500 dark:hover:text-rose-400 transition-colors focus:outline-none rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 relative"
                title="المفضلة"
              >
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 -left-1 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-[1.5px] border-white dark:border-gold-950 px-1">
                    {favoritesCount > 99 ? "99+" : favoritesCount}
                  </span>
                )}
              </Link>

              {/* سلة التسوق / Cart */}
              <Link
                to="/cart"
                className="p-2 text-gray-500 dark:text-gold-600 hover:text-gold-600 dark:hover:text-gold-400 transition-colors relative group focus:outline-none rounded-xl hover:bg-gold-50 dark:hover:bg-gold-500/10"
              >
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-1 min-w-[18px] h-[18px] bg-gold-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-[1.5px] border-white dark:border-gold-950 px-1">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Link>

              {/* تسجيل الدخول / الملف الشخصي */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-1.5 xl:gap-2">
                  <Link
                    to="/profile"
                    title={user?.fullName || "الملف الشخصي"}
                    className="flex items-center gap-2 px-2 xl:px-3 py-2 bg-gold-50 dark:bg-gold-900/40 rounded-xl border border-gold-100 dark:border-gold-800 hover:bg-gold-100 dark:hover:bg-gold-900/60 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-full bg-gold-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {user?.fullName?.charAt(0) || (
                        <User className="w-4 h-4" />
                      )}
                    </div>
                    <span className="hidden xl:inline text-sm font-semibold text-gold-900 dark:text-gold-200 max-w-[100px] truncate">
                      {user?.fullName || "المستخدم"}
                    </span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 dark:text-gold-700 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  title="تسجيل الدخول"
                  className="hidden sm:flex items-center gap-1.5 px-3 lg:px-4 py-2.5 bg-gold-500 text-white rounded-xl text-sm font-bold hover:bg-gold-400 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">تسجيل الدخول</span>
                </Link>
              )}

              {/* Mobile Menu Button is now on the START side (Right) */}
            </div>
          </div>

          {/* Collapsible search drawer — md to xl */}
          <AnimatePresence>
            {desktopSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="hidden md:block xl:hidden overflow-hidden border-t border-slate-100/80 dark:border-slate-800/80"
              >
                <form onSubmit={handleSearch} className="relative py-2.5 group">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-gold-500 transition-colors" />
                  </div>
                  <input
                    ref={desktopSearchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={searchInputClass}
                    placeholder="ابحث عن المنتجات..."
                  />
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* قائمة الجوال / Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 dark:border-slate-800 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto pb-24">

              <div className="flex flex-col gap-1 px-2 pb-4">
                
                {/* 1. الرئيسية */}
                <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Home className="w-5 h-5 text-gold-500" /> الرئيسية
                </Link>

                <Link to="/categories" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <LayoutGrid className="w-5 h-5 text-gold-500" /> الفئات
                </Link>
                
                {/* 2. جميع المنتجات */}
                <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <ShoppingBag className="w-5 h-5 text-gold-500" /> جميع المنتجات
                </Link>
                
                {/* 3. العروض والخصومات */}
                <Link to="/products?promoted=true" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <BadgePercent className="w-5 h-5 text-rose-500" /> العروض والخصومات
                </Link>
                
                {/* 4. المنتجات الجديدة */}
                <Link to="/products?sort=newest" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Sparkles className="w-5 h-5 text-amber-500" /> المنتجات الجديدة
                </Link>
                
                <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>

                {/* 5. طلباتي */}
                <Link to={isAuthenticated ? "/my-orders" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Package className="w-5 h-5 text-slate-400" /> طلباتي
                </Link>
                
                {/* 6. المفضلة */}
                <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Heart className="w-5 h-5 text-slate-400" /> المفضلة
                  {favoritesCount > 0 && (
                    <span className="mr-auto text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
                      {favoritesCount}
                    </span>
                  )}
                </Link>

                <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>

                {/* 7. من نحن */}
                <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Info className="w-5 h-5 text-slate-400" /> من نحن
                </Link>
                
                {/* 8. تواصل معنا */}
                <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Phone className="w-5 h-5 text-slate-400" /> تواصل معنا
                </Link>
                
                {/* 9. فروعنا / موقعنا */}
                <Link to="/branches" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <MapPin className="w-5 h-5 text-slate-400" /> فروعنا / موقعنا
                </Link>
                
                <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>

                {/* 10. الإعدادات */}
                <Link to={isAuthenticated ? "/profile" : "/auth"} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Settings className="w-5 h-5 text-slate-400" /> الإعدادات
                </Link>

                {/* Admin Dashboard */}
                {isAdmin && (
                  <>
                    <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-2"></div>
                    <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors">
                      <Crown className="w-5 h-5" /> لوحة المسؤول
                    </Link>
                  </>
                )}

                {/* Auth actions */}
                <div className="mt-2">
                  {isAuthenticated ? (
                    <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-full text-right">
                      <LogOut className="w-5 h-5" /> تسجيل الخروج
                    </button>
                  ) : (
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 bg-gold-500 text-white font-bold rounded-xl text-sm hover:bg-gold-400 transition-all mx-2">
                      <LogIn className="w-4 h-4" /> تسجيل الدخول
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Desktop main navigation */}
          <nav className="hidden md:flex items-center justify-center gap-1 pb-2.5 border-t border-slate-100/80 dark:border-slate-800/80 pt-2" aria-label="التنقل الرئيسي">
            {desktopNavLinks.map(({ to, label }) => {
              const isActive = to === '/'
                ? pathname === '/'
                : to.includes('?')
                  ? pathname === to.split('?')[0]
                  : pathname.startsWith(to);

              return (
                <Link
                  key={to}
                  to={to}
                  className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'text-gold-700 dark:text-gold-400 bg-gold-50 dark:bg-gold-900/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* شريط البحث الجوال الثابت / Mobile Persistent Search Bar */}
      <div className="md:hidden sticky top-14 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 py-2">
        <form onSubmit={handleSearch} className="relative w-full">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </div>
          <input
            type="text"
            inputMode="search"
            enterKeyHint="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pr-10 pl-4 py-2 border border-gray-200 dark:border-slate-700 rounded-full bg-gray-50/80 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-400 transition-all shadow-sm text-base text-right"
            placeholder="ابحث عن المنتجات..."
          />
        </form>
      </div>

      {/* المحتوى الرئيسي / Main Content */}
      <main className="flex-grow w-full pb-20 md:pb-0">{children}</main>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <BannerRenderer placement="footer" />
      </div>

      {/* الفوتر / Footer */}
      <Footer storeInfo={storeInfo} />

      {/* شريط التنقل السفلي للجوال / Mobile Bottom Nav */}
      <MobileBottomNav />

      {/* نافذة منبثقة / Popup Banner */}
      <BannerRenderer placement="popup" />
    </div>
  );
});
Layout.displayName = "Layout";

export default Layout;
