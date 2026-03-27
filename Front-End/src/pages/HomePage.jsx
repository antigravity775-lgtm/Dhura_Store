import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, LayoutGrid, TrendingUp, Star, Loader2, SlidersHorizontal, MapPin, DollarSign, Package, X } from 'lucide-react';
import Layout from '../components/Layout';
import { ProductGrid, ProductBelt } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';

const cities = ['صنعاء', 'عدن', 'تعز', 'إب', 'المكلا', 'الحديدة', 'ذمار', 'حجة', 'صعدة', 'مأرب'];

const stats = [
  { label: 'إعلان نشط', value: '+12 ألف', icon: TrendingUp },
  { label: 'بائع موثوق', value: '3.5 ألف', icon: Star },
  { label: 'مدينة مغطاة', value: '22', icon: LayoutGrid },
];

// Fallback products when API is down
const fallbackProducts = [
  { id: 'fb1', title: 'انفرتر طاقة شمسية Growatt 5kW برو', price: 950000, currency: 1, condition: 1, categoryName: 'الطاقة الشمسية', mainImageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=800&q=80' },
  { id: 'fb2', title: 'ماك بوك برو M2 شاشة 14 انش', price: 1850, currency: 3, condition: 2, categoryName: 'لابتوبات', mainImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80' },
  { id: 'fb3', title: 'آيفون 15 برو ماكس 256 جيجا', price: 1100, currency: 3, condition: 1, categoryName: 'هواتف', mainImageUrl: 'https://images.unsplash.com/photo-1695048132961-0eab789a421b?w=800&q=80' },
  { id: 'fb4', title: 'بن هرازي يمني فاخر (1 كيلو)', price: 15000, currency: 1, condition: 1, categoryName: 'البن اليمني', mainImageUrl: 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800&q=80' },
  { id: 'fb5', title: 'لوح طاقة شمسية SunPower 400 واط', price: 85000, currency: 1, condition: 1, categoryName: 'الطاقة الشمسية', mainImageUrl: 'https://images.unsplash.com/photo-1521618755572-156ae0c274fe?w=800&q=80' },
  { id: 'fb6', title: 'سامسونج جالكسي S24 الترا', price: 1200, currency: 3, condition: 1, categoryName: 'هواتف', mainImageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

function formatPrice(price, currency) {
  const formatted = price >= 1000
    ? price.toLocaleString('en-US')
    : price.toString();
  const symbol = api.CurrencySymbol[currency] || 'ريال';
  return `${formatted} ${symbol}`;
}

function mapToProduct(p) {
  return {
    id: p.id,
    title: p.title,
    image: p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80',
    price: p.price,
    currency: p.currency,
    currencySymbol: api.CurrencySymbol[p.currency] || 'ريال',
    rating: p.rating ?? (3.5 + Math.abs(String(p.id).charCodeAt(0) % 15) / 10),
    reviewCount: p.reviewCount ?? Math.floor(Math.abs(String(p.id).charCodeAt(0) * 37) % 900 + 50),
    badge: p.condition === 'New' ? null : p.condition === 'Used' ? 'Sale' : 'Local',
  };
}

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('الكل');
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  // فلاتر
  const [searchText, setSearchText] = useState(searchFromUrl);
  const [filterCity, setFilterCity] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Sync search from URL
  useEffect(() => {
    setSearchText(searchFromUrl);
  }, [searchFromUrl]);

  const loadProducts = useCallback(async (city, condition, maxPrice) => {
    setLoading(true);
    try {
      const params = { pageSize: 50 };
      if (city) params.city = city;
      if (condition) params.condition = parseInt(condition);
      if (maxPrice) params.maxPriceUsd = parseFloat(maxPrice);

      const [productsData, categoriesData] = await Promise.all([
        api.getProducts(params),
        api.getCategories(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setUsingFallback(false);
    } catch {
      setProducts(fallbackProducts);
      setCategories([]);
      setUsingFallback(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts(filterCity, filterCondition, filterMaxPrice);
  }, [filterCity, filterCondition, filterMaxPrice, loadProducts]);

  const categoryNames = ['الكل', ...new Set(
    categories.length > 0
      ? categories.map(c => c.name)
      : products.map(p => p.categoryName).filter(Boolean)
  )];

  // Apply client-side filters (text search + category)
  let filteredProducts = activeCategory === 'الكل'
    ? products
    : products.filter(p => p.categoryName === activeCategory);

  if (searchText.trim()) {
    const q = searchText.trim().toLowerCase();
    filteredProducts = filteredProducts.filter(p =>
      p.title?.toLowerCase().includes(q) ||
      p.categoryName?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }

  const activeFiltersCount = [filterCity, filterCondition, filterMaxPrice].filter(Boolean).length + (searchText.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSearchText('');
    setFilterCity('');
    setFilterCondition('');
    setFilterMaxPrice('');
    setActiveCategory('الكل');
  };

  const handleQuickAdd = (p) => {
    const originalProduct = products.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) {
      addToCart(originalProduct, 1);
    } else {
      addToCart({
        id: p.id,
        title: p.title,
        price: p.price,
        currency: p.currency || 'USD', 
        mainImageUrl: p.image
      }, 1);
    }
    // optionally could alert("Added to cart!")
  };

  const handleFavoriteToggle = (p) => {
    const originalProduct = products.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) {
      toggleFavorite(originalProduct);
    }
  };

  return (
    <Layout>
      {/* ========== قسم البطل ========== */}
      <section className="relative w-full bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-indigo-950 to-slate-900"></div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-[25%] -right-[15%] w-[55%] h-[75%] rounded-full bg-indigo-500/25 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[-25%] left-[-15%] w-[55%] h-[75%] rounded-full bg-blue-600/20 blur-[130px]"
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute top-[30%] left-[20%] w-[30%] h-[40%] rounded-full bg-purple-500/15 blur-[100px]"
          />
        </div>

        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '60px 60px'
          }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 flex flex-col items-center text-center z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-200 text-sm font-semibold mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              سوق إلكتروني يمني
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.15]">
              اكتشف أفضل{' '}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-l from-blue-400 via-indigo-300 to-purple-400">
                  الصفقات
                </span>
                <motion.span
                  className="absolute -bottom-1.5 left-0 right-0 h-1 bg-gradient-to-l from-blue-400 to-indigo-400 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6, ease: "easeOut" }}
                />
              </span>
              <br className="hidden sm:block" /> في اليمن
            </h1>
            <p className="mt-6 text-base sm:text-lg md:text-xl text-indigo-100/70 font-medium leading-relaxed max-w-2xl mx-auto">
              السوق الأول لبيع وشراء الإلكترونيات ومنتجات الطاقة الشمسية والبن اليمني الفاخر — مع بائعين محليين موثوقين.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: "easeOut" }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-10"
          >
            <button
              onClick={() => document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-indigo-900 rounded-2xl font-bold text-lg hover:bg-indigo-50 hover:shadow-2xl hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              ابدأ التسوق
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-white/10 text-white rounded-2xl font-bold text-lg hover:bg-white/20 backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center transform hover:-translate-y-0.5 active:scale-[0.98]">
              أضف إعلانك
            </button>
          </motion.div>

          {/* صف الإحصائيات */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: "easeOut" }}
            className="mt-16 flex flex-wrap justify-center gap-8 sm:gap-12"
          >
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 text-white/70">
                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
                  <Icon className="w-5 h-5 text-indigo-300" />
                </div>
                <div className="text-right">
                  <div className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">{value}</div>
                  <div className="text-xs text-indigo-200/60 font-medium">{label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ========== قسم المنتجات ========== */}
      <section id="products-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">

        {/* شريط البحث والفلاتر */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* حقل البحث */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full pr-12 pl-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 shadow-sm transition-all"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* زر الفلاتر */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-bold transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              فلترة
              {activeFiltersCount > 0 && (
                <span className="min-w-[20px] h-5 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold flex items-center justify-center px-1.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* لوحة الفلترة */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* المدينة */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 inline ml-1" />
                        المدينة
                      </label>
                      <select
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">كل المدن</option>
                        {cities.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* الحالة */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <Package className="w-3.5 h-3.5 inline ml-1" />
                        الحالة
                      </label>
                      <select
                        value={filterCondition}
                        onChange={(e) => setFilterCondition(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">الكل</option>
                        <option value="1">جديد</option>
                        <option value="2">مستعمل</option>
                        <option value="3">مجدد</option>
                      </select>
                    </div>

                    {/* السعر الأقصى */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5 inline ml-1" />
                        أقصى سعر (بالدولار)
                      </label>
                      <input
                        type="number"
                        value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(e.target.value)}
                        placeholder="مثلاً 500"
                        min="0"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  {/* مسح الفلاتر */}
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{activeFiltersCount} فلتر نشط</span>
                      <button
                        onClick={clearAllFilters}
                        className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors"
                      >
                        مسح الكل
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* عنوان القسم */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {searchText.trim()
                ? `نتائج البحث: "${searchText.trim()}"`
                : activeCategory === 'الكل' ? 'المنتجات الرائجة' : activeCategory}
            </h2>
            <p className="text-slate-500 mt-1.5 text-base">اكتشف أفضل العروض بالقرب منك</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-400 bg-slate-100 px-4 py-2 rounded-xl w-fit">
            <LayoutGrid className="w-4 h-4" />
            {filteredProducts.length} منتج
          </div>
        </div>

        {/* أزرار الأقسام */}
        <div className="relative mb-10 w-full overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none md:hidden z-10"></div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categoryNames.map((name) => {
              const isActive = activeCategory === name;
              return (
                <button
                  key={name}
                  onClick={() => setActiveCategory(name)}
                  className={`relative whitespace-nowrap inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 focus:outline-none border ${
                    isActive
                      ? 'text-white bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/25'
                      : 'text-slate-600 bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700'
                  }`}
                >
                  {name}
                </button>
              );
            })}
          </div>
        </div>

        {/* حزام المنتجات المميزة (يظهر فقط في الصفحة الرئيسية بدون فلاتر) */}
        {!loading && filteredProducts.length > 0 && activeCategory === 'الكل' && !searchText.trim() && (
          <div className="mb-12 rounded-3xl overflow-hidden border border-slate-100 shadow-sm bg-white">
            <ProductBelt 
              title="⚡ صفقات مميزة لفترة محدودة" 
              products={products.slice(0, 10).map(p => {
                const mapped = mapToProduct(p);
                mapped.isFavorite = isFavorite(p.id);
                return mapped;
              })}
              onQuickAdd={handleQuickAdd}
              onClick={(p) => navigate(`/product/${p.id}`)}
              onFavorite={handleFavoriteToggle}
              speed={40}
            />
          </div>
        )}

        {/* شبكة المنتجات */}
        {loading ? (
          <ProductGrid isLoading={true} loadingCount={8} />
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredProducts.length > 0 ? (
              <motion.div
                className="w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                key={activeCategory + searchText}
              >
                <ProductGrid 
                  products={filteredProducts.map(p => {
                    const mapped = mapToProduct(p);
                    mapped.isFavorite = isFavorite(p.id);
                    return mapped;
                  })}
                  onQuickAdd={handleQuickAdd}
                  onClick={(p) => navigate(`/product/${p.id}`)}
                  onFavorite={handleFavoriteToggle}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-300"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4 text-slate-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-500 max-w-sm mx-auto">
                  {searchText.trim()
                    ? <>لم نتمكن من العثور على منتجات تطابق "<span className="font-semibold text-slate-700">{searchText.trim()}</span>".</>
                    : <>لم نتمكن من العثور على منتجات في قسم <span className="font-semibold text-slate-700">{activeCategory}</span> حالياً.</>
                  }
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-6 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  مسح الفلاتر وعرض الكل
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </section>
    </Layout>
  );
};

export default HomePage;
