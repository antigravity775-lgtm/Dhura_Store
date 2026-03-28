import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Sun, Moon, Zap, Coffee, Heart, LogIn, LogOut, User, Package, Store, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useTheme } from '../context/ThemeContext';
import * as api from '../services/api';

const Layout = ({ children }) => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [storeInfo, setStoreInfo] = useState(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Fetch dynamic store info for footer
    api.getStoreInfo()
      .then(data => setStoreInfo(data))
      .catch(err => console.error('Failed to load store info:', err));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col font-sans transition-colors duration-300" dir="rtl">
      {/* شريط التنقل / Navigation Bar */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-md border-b border-gray-100 dark:border-slate-800' 
          : 'bg-white/70 dark:bg-slate-900/70 backdrop-blur-lg border-b border-gray-200 dark:border-slate-800 shadow-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* الشعار / Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-3 cursor-pointer group select-none">
              <div className="relative w-10 h-10 md:w-11 md:h-11 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-md">
                <img src="/Logo.png" alt="شعار متجر الجعدي" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
                <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white animate-pulse hidden md:block"></div>
              </div>
              <span className="font-extrabold text-xl md:text-2xl tracking-tight text-slate-900 dark:text-white dark:drop-shadow-sm">
                متجر الجعدي
              </span>
            </Link>

            {/* شريط البحث - سطح المكتب / Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pr-11 pl-4 py-2.5 border border-gray-200 dark:border-slate-700 rounded-full bg-gray-50/80 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all shadow-sm text-sm text-right"
                  placeholder="ابحث عن منتجات، فئات، بائعين..."
                />
              </form>
            </div>

            {/* أزرار الجانب الأيسر / Left-side Actions */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* EN: Dark Mode Toggle Button — accessible in both desktop and mobile
                  AR: زر تبديل الوضع الداكن — متاح في سطح المكتب والجوال */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-all duration-200 focus:outline-none"
                aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
                title={isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}
              >
                {isDark ? (
                  <Sun className="w-5 h-5 transition-transform hover:rotate-45 duration-300" />
                ) : (
                  <Moon className="w-5 h-5 transition-transform hover:-rotate-12 duration-300" />
                )}
              </button>

              {/* لوحة المسؤول / Admin Panel */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-purple-200 dark:border-purple-700 rounded-xl text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-sm transition-all"
                >
                  <Crown className="w-4 h-4" />
                  لوحة المسؤول
                </Link>
              )}

              {/* لوحة البائع / Seller Panel */}
              {isSeller && !isAdmin && (
                <Link
                  to="/seller"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-sm transition-all"
                >
                  <Store className="w-4 h-4" />
                  لوحة البائع
                </Link>
              )}

              {/* طلباتي / My Orders */}
              {isAuthenticated && (!isSeller || isAdmin) && (
                <Link
                  to="/my-orders"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-700 dark:hover:text-indigo-300 hover:shadow-sm transition-all"
                >
                  <Package className="w-4 h-4" />
                  طلباتي
                </Link>
              )}

              {/* المفضلة / Favorites */}
              <Link to="/favorites" className="hidden sm:flex p-2 text-gray-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors focus:outline-none rounded-xl hover:bg-rose-50 dark:hover:bg-rose-500/10 relative" title="المفضلة">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 -left-1 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-[1.5px] border-white dark:border-slate-900 px-1">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>

              {/* سلة التسوق / Cart */}
              <Link to="/cart" className="p-2 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors relative group focus:outline-none rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-[1.5px] border-white dark:border-slate-900 px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* تسجيل الدخول / الملف الشخصي */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl border border-indigo-100 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-semibold text-indigo-800 dark:text-indigo-200 max-w-[100px] truncate">{user?.fullName || 'المستخدم'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-xl hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="تسجيل الخروج"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-500 transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  <LogIn className="w-4 h-4" />
                  تسجيل الدخول
                </Link>
              )}

              {/* زر القائمة - الجوال / Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-gray-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white focus:outline-none focus:bg-gray-100 dark:focus:bg-slate-800 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="فتح القائمة"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* قائمة الجوال / Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 dark:border-slate-800 space-y-3">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 dark:text-slate-500" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow text-right"
                  placeholder="ابحث عن منتجات..."
                  autoFocus
                />
              </form>

              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {user?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{user?.fullName}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user?.role === 'Admin' ? 'مسؤول' : user?.role === 'Seller' ? 'بائع' : 'مشتري'}</div>
                      </div>
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-xl transition-colors">
                        <Crown className="w-4 h-4" /> لوحة المسؤول
                      </Link>
                    )}
                    {isSeller && !isAdmin && (
                      <Link to="/seller" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <Store className="w-4 h-4" /> لوحة البائع
                      </Link>
                    )}
                    {(!isSeller || isAdmin) && (
                      <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <Package className="w-4 h-4" /> طلباتي
                      </Link>
                    )}

                    <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <Heart className="w-4 h-4" /> المفضلة
                      {favoritesCount > 0 && (
                        <span className="mr-auto text-xs font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">{favoritesCount}</span>
                      )}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors w-full text-right"
                    >
                      <LogOut className="w-4 h-4" /> تسجيل الخروج
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl text-sm"
                  >
                    <LogIn className="w-4 h-4" /> تسجيل الدخول
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* المحتوى الرئيسي / Main Content */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* الفوتر / Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-slate-300 border-t border-slate-800 dark:border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-12 grid grid-cols-2 sm:grid-cols-4 gap-8">
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">الأقسام</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Sun className="w-4 h-4 text-yellow-400" /> الطاقة الشمسية</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Zap className="w-4 h-4 text-blue-400" /> الإلكترونيات</a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2"><Coffee className="w-4 h-4 text-amber-400" /> البن اليمني</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">الشركة</h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (storeInfo?.aboutUsText) alert('من نحن:\n\n' + storeInfo.aboutUsText);
                    }}
                    className="hover:text-white transition-colors"
                  >
                    من نحن
                  </a>
                </li>
                {storeInfo?.contactEmail && (
                  <li><a href={`mailto:${storeInfo.contactEmail}`} className="hover:text-white transition-colors">راسلنا (إيميل)</a></li>
                )}
                {storeInfo?.contactPhone && (
                  <li><a href={`tel:${storeInfo.contactPhone.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">اتصل بنا</a></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">الدعم</h4>
              <ul className="space-y-2.5 text-sm">
                {storeInfo?.whatsappUrl ? (
                  <li><a href={storeInfo.whatsappUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-2">دعم واتساب</a></li>
                ) : (
                  <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                )}
                {storeInfo?.facebookUrl && (
                  <li><a href={storeInfo.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">فيسبوك</a></li>
                )}
                {storeInfo?.twitterUrl && (
                  <li><a href={storeInfo.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">إكس (تويتر)</a></li>
                )}
                {storeInfo?.instagramUrl && (
                  <li><a href={storeInfo.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">إنستغرام</a></li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">قانوني</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">شروط الخدمة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الخصوصية</a></li>
                <li><a href="#" className="hover:text-white transition-colors">سياسة الكوكيز</a></li>
              </ul>
            </div>
          </div>

          <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <img src="/Logo.png" alt="شعار المتجر" className="w-6 h-6 rounded-full bg-white object-cover shadow-sm" />
              <span className="font-bold text-slate-300">متجر الجعدي</span>
              <span>&copy; {new Date().getFullYear()} جميع الحقوق محفوظة.</span>
            </div>
            <span className="text-xs">صُنع بـ ❤️ في اليمن</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
