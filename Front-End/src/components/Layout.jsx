import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Sun, Zap, Coffee, Heart, LogIn, LogOut, User, Package, Store, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const Layout = ({ children }) => {
  const { user, isAuthenticated, isSeller, isAdmin, logout } = useAuth();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans" dir="rtl">
      {/* شريط التنقل */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-gray-100' : 'bg-white/70 backdrop-blur-lg border-b border-gray-200 shadow-sm'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* الشعار */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2 cursor-pointer group select-none">
              <div className="relative">
                <ShoppingBag className="h-8 w-8 text-indigo-600 transition-transform group-hover:scale-110 duration-300" />
                <div className="absolute -top-0.5 -left-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-l from-indigo-700 to-slate-800 bg-clip-text text-transparent">
                Al-gaadi store
              </span>
            </Link>

            {/* شريط البحث - سطح المكتب */}
            <div className="hidden md:flex flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="relative w-full group">
                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pr-11 pl-4 py-2.5 border border-gray-200 rounded-full bg-gray-50/80 text-slate-900 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all shadow-sm text-sm text-right"
                  placeholder="ابحث عن منتجات، فئات، بائعين..."
                />
              </form>
            </div>

            {/* أزرار الجانب الأيسر */}
            <div className="flex items-center gap-2 sm:gap-3">

              {/* لوحة المسؤول */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-purple-200 rounded-xl text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 hover:shadow-sm transition-all"
                >
                  <Crown className="w-4 h-4" />
                  لوحة المسؤول
                </Link>
              )}

              {/* لوحة البائع */}
              {isSeller && !isAdmin && (
                <Link
                  to="/seller"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-sm transition-all"
                >
                  <Store className="w-4 h-4" />
                  لوحة البائع
                </Link>
              )}

              {/* طلباتي */}
              {isAuthenticated && (!isSeller || isAdmin) && (
                <Link
                  to="/my-orders"
                  className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-700 hover:shadow-sm transition-all"
                >
                  <Package className="w-4 h-4" />
                  طلباتي
                </Link>
              )}

              {/* المفضلة */}
              <Link to="/favorites" className="hidden sm:flex p-2 text-gray-400 hover:text-rose-500 transition-colors focus:outline-none rounded-xl hover:bg-rose-50 relative" title="المفضلة">
                <Heart className="h-5 w-5" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-0.5 -left-1 min-w-[18px] h-[18px] bg-rose-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-[1.5px] border-white px-1">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </Link>

              {/* سلة التسوق */}
              <Link to="/cart" className="p-2 text-gray-500 hover:text-indigo-600 transition-colors relative group focus:outline-none rounded-xl hover:bg-indigo-50">
                <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -left-1 min-w-[18px] h-[18px] bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-[1.5px] border-white px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* تسجيل الدخول / الملف الشخصي */}
              {isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-xl border border-indigo-100 hover:bg-indigo-100 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                      {user?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-semibold text-indigo-800 max-w-[100px] truncate">{user?.fullName || 'المستخدم'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
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

              {/* زر القائمة - الجوال */}
              <button
                className="md:hidden p-2 text-gray-500 hover:text-slate-900 focus:outline-none focus:bg-gray-100 rounded-xl transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="فتح القائمة"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* قائمة الجوال */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
              <form onSubmit={handleSearch} className="relative w-full">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl bg-gray-50 text-slate-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm transition-shadow text-right"
                  placeholder="ابحث عن منتجات..."
                  autoFocus
                />
              </form>

              <div className="flex flex-col gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2.5 bg-indigo-50 rounded-xl">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold">
                        {user?.fullName?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user?.fullName}</div>
                        <div className="text-xs text-slate-500">{user?.role === 'Admin' ? 'مسؤول' : user?.role === 'Seller' ? 'بائع' : 'مشتري'}</div>
                      </div>
                    </Link>

                    {isAdmin && (
                      <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors">
                        <Crown className="w-4 h-4" /> لوحة المسؤول
                      </Link>
                    )}
                    {isSeller && !isAdmin && (
                      <Link to="/seller" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <Store className="w-4 h-4" /> لوحة البائع
                      </Link>
                    )}
                    {(!isSeller || isAdmin) && (
                      <Link to="/my-orders" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                        <Package className="w-4 h-4" /> طلباتي
                      </Link>
                    )}

                    <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors">
                      <Heart className="w-4 h-4" /> المفضلة
                      {favoritesCount > 0 && (
                        <span className="mr-auto text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">{favoritesCount}</span>
                      )}
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors w-full text-right"
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

      {/* المحتوى الرئيسي */}
      <main className="flex-grow w-full">
        {children}
      </main>

      {/* الفوتر */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-16">
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
                <li><a href="#" className="hover:text-white transition-colors">من نحن</a></li>
                <li><a href="#" className="hover:text-white transition-colors">كيف يعمل</a></li>
                <li><a href="#" className="hover:text-white transition-colors">تواصل معنا</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold text-sm uppercase tracking-wider mb-4">الدعم</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">مركز المساعدة</a></li>
                <li><a href="#" className="hover:text-white transition-colors">نصائح الأمان</a></li>
                <li><a href="#" className="hover:text-white transition-colors">الإبلاغ عن مشكلة</a></li>
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
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-slate-300">Al-gaadi store</span>
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
