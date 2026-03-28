/**
 * HomePage — الصفحة الرئيسية (المُحسَّنة للتحويل العالي)
 *
 * EN: High-conversion mobile-first storefront layout.
 *     Strategy: Slim OfferBelt → Search → Categories → Products (above fold).
 *     Hero banners are replaced with immediate product visibility.
 *
 * AR: تخطيط واجهة متجر محسّن للتحويل العالي (الجوال أولاً).
 *     الاستراتيجية: حزام عروض نحيل → بحث → الأقسام → المنتجات (فوق الطي).
 *     تم استبدال اللافتات البطولية برؤية فورية للمنتجات.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, Loader2, SlidersHorizontal,
  MapPin, DollarSign, Package, X, Sparkles, Truck, ShieldCheck, BadgePercent
} from 'lucide-react';
import Layout from '../components/Layout';
import { ProductGrid, ProductBelt } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProducts, useCategories } from '../hooks/useProducts';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

// ─── Constants ───

const cities = ['صنعاء', 'عدن', 'تعز', 'إب', 'المكلا', 'الحديدة', 'ذمار', 'حجة', 'صعدة', 'مأرب'];

/**
 * EN: Offer messages that auto-scroll in the slim promotional belt.
 * AR: رسائل العروض التي تتحرك تلقائياً في حزام الترويج النحيل.
 */
const offerMessages = [
  { icon: Truck, text: 'شحن مجاني للطلبات فوق 50$', color: 'text-emerald-300' },
  { icon: BadgePercent, text: 'خصم 15% على أول طلب — كود: FIRST15', color: 'text-amber-300' },
  { icon: ShieldCheck, text: 'بائعون محليون موثوقون في 22 مدينة يمنية', color: 'text-sky-300' },
  { icon: Sparkles, text: 'ضمان جودة المنتج — استرجع أموالك بسهولة', color: 'text-purple-300' },
];

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
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

// ─── Helpers ───

function mapToProduct(p) {
  const rawImage = p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
  return {
    id: p.id,
    title: p.title,
    image: getOptimizedImageUrl(rawImage, IMAGE_WIDTHS.GRID_CARD),
    price: p.price,
    currency: p.currency,
    currencySymbol: api.CurrencySymbol[p.currency] || 'ريال',
    rating: p.rating ?? (3.5 + Math.abs(String(p.id).charCodeAt(0) % 15) / 10),
    reviewCount: p.reviewCount ?? Math.floor(Math.abs(String(p.id).charCodeAt(0) * 37) % 900 + 50),
    badge: p.condition === 'New' ? null : p.condition === 'Used' ? 'Sale' : 'Local',
  };
}

function mapToProductForBelt(p) {
  const rawImage = p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
  return {
    id: p.id,
    title: p.title,
    image: getOptimizedImageUrl(rawImage, IMAGE_WIDTHS.BELT_CARD),
    price: p.price,
    currency: p.currency,
    currencySymbol: api.CurrencySymbol[p.currency] || 'ريال',
    rating: p.rating ?? (3.5 + Math.abs(String(p.id).charCodeAt(0) % 15) / 10),
    reviewCount: p.reviewCount ?? Math.floor(Math.abs(String(p.id).charCodeAt(0) * 37) % 900 + 50),
    badge: p.condition === 'New' ? null : p.condition === 'Used' ? 'Sale' : 'Local',
  };
}

// ────────────────────────────────────────────────────────────────────
// OfferBelt — حزام العروض الترويجية
// EN: Slim auto-scrolling promotional bar. Uses pure CSS marquee
//     animation — no JS intervals, no re-renders, GPU-accelerated.
//     Takes ≤12% of mobile viewport height (~48px).
// AR: شريط ترويجي نحيل يتحرك تلقائياً. يستخدم رسوم CSS فقط —
//     بدون فترات JS، بدون إعادة عرض، مُسرّع بـ GPU.
//     يأخذ ≤12% من ارتفاع شاشة الجوال (~48 بكسل).
// ────────────────────────────────────────────────────────────────────
const OfferBelt = React.memo(() => {
  // Double the messages for seamless infinite scroll
  const doubledMessages = [...offerMessages, ...offerMessages];

  return (
    <div className="relative w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 overflow-hidden select-none">
      {/* Subtle animated glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 animate-pulse" />

      <div className="offer-belt-track flex items-center gap-12 py-2.5 sm:py-3 whitespace-nowrap">
        {doubledMessages.map((msg, i) => {
          const Icon = msg.icon;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 flex-shrink-0"
            >
              <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${msg.color} flex-shrink-0`} />
              <span>{msg.text}</span>
              <span className="text-white/20 mx-4">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
});
OfferBelt.displayName = 'OfferBelt';

// ────────────────────────────────────────────────────────────────────
// HomePage
// ────────────────────────────────────────────────────────────────────
const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchText, setSearchText] = useState(searchFromUrl);
  const [filterCity, setFilterCity] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { setSearchText(searchFromUrl); }, [searchFromUrl]);

  // ─── SWR Data ───
  const {
    data: products,
    isLoading: productsLoading,
    isValidating: productsValidating,
    error: productsError
  } = useProducts({
    city: filterCity,
    condition: filterCondition,
    maxPriceUsd: filterMaxPrice
  });

  const { data: categories } = useCategories();

  const activeProducts = productsError ? fallbackProducts : products;
  const showSkeleton = productsLoading && activeProducts.length === 0;

  // ─── Memoized Values ───
  const categoryNames = useMemo(() => {
    return ['الكل', ...new Set(
      categories.length > 0
        ? categories.map(c => c.name)
        : activeProducts.map(p => p.categoryName).filter(Boolean)
    )];
  }, [categories, activeProducts]);

  const filteredProducts = useMemo(() => {
    let result = activeCategory === 'الكل'
      ? activeProducts
      : activeProducts.filter(p => p.categoryName === activeCategory);

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeProducts, activeCategory, searchText]);

  const mappedGridProducts = useMemo(() => {
    return filteredProducts.map(p => {
      const mapped = mapToProduct(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [filteredProducts, isFavorite]);

  const mappedBeltProducts = useMemo(() => {
    return activeProducts.slice(0, 10).map(p => {
      const mapped = mapToProductForBelt(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [activeProducts, isFavorite]);

  const activeFiltersCount = [filterCity, filterCondition, filterMaxPrice].filter(Boolean).length + (searchText.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSearchText('');
    setFilterCity('');
    setFilterCondition('');
    setFilterMaxPrice('');
    setActiveCategory('الكل');
  };

  const handleQuickAdd = (p) => {
    const originalProduct = activeProducts.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) {
      addToCart(originalProduct, 1);
    } else {
      addToCart({
        id: p.id, title: p.title, price: p.price,
        currency: p.currency || 'USD', mainImageUrl: p.image
      }, 1);
    }
  };

  const handleFavoriteToggle = (p) => {
    const originalProduct = activeProducts.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) toggleFavorite(originalProduct);
  };

  // ─── Render ───
  return (
    <Layout>
      {/* ═══════ حزام العروض / Offer Belt ═══════ */}
      <OfferBelt />

      {/* ═══════ المحتوى الرئيسي / Main Content ═══════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 lg:pb-16">

        {/* ── البحث والفلاتر / Search & Filters ── */}
        <section className="mb-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            {/* Search */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                placeholder="ابحث عن منتج..."
                className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 shadow-sm transition-all"
              />
              {searchText && (
                <button
                  onClick={() => setSearchText('')}
                  className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl border text-sm font-bold transition-all ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30'
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

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-5 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                        <MapPin className="w-3.5 h-3.5 inline ml-1" /> المدينة
                      </label>
                      <select
                        value={filterCity}
                        onChange={(e) => setFilterCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">كل المدن</option>
                        {cities.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    {/* Condition */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                        <Package className="w-3.5 h-3.5 inline ml-1" /> الحالة
                      </label>
                      <select
                        value={filterCondition}
                        onChange={(e) => setFilterCondition(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all appearance-none cursor-pointer"
                      >
                        <option value="">الكل</option>
                        <option value="1">جديد</option>
                        <option value="2">مستعمل</option>
                        <option value="3">مجدد</option>
                      </select>
                    </div>
                    {/* Max Price */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                        <DollarSign className="w-3.5 h-3.5 inline ml-1" /> أقصى سعر (بالدولار)
                      </label>
                      <input
                        type="number"
                        value={filterMaxPrice}
                        onChange={(e) => setFilterMaxPrice(e.target.value)}
                        placeholder="مثلاً 500"
                        min="0"
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all"
                        dir="ltr"
                      />
                    </div>
                  </div>
                  {activeFiltersCount > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-xs text-slate-500 font-medium">{activeFiltersCount} فلتر نشط</span>
                      <button onClick={clearAllFilters} className="text-xs text-red-500 hover:text-red-600 font-bold transition-colors">
                        مسح الكل
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* ── الأقسام / Category Pills ── */}
        <section className="mb-6">
          <div className="relative w-full overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-50 dark:from-slate-950 to-transparent pointer-events-none md:hidden z-10" />
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {categoryNames.map((name) => {
                const isActive = activeCategory === name;
                return (
                  <button
                    key={name}
                    onClick={() => setActiveCategory(name)}
                    className={`relative whitespace-nowrap inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none border ${
                      isActive
                        ? 'text-white bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-500/25'
                        : 'text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/30'
                    }`}
                  >
                    {name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── العنوان + العداد / Section Header ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {searchText.trim()
              ? `نتائج: "${searchText.trim()}"`
              : activeCategory === 'الكل' ? 'المنتجات الرائجة' : activeCategory}
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {productsValidating && !showSkeleton && (
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            )}
            <LayoutGrid className="w-3.5 h-3.5" />
            {filteredProducts.length} منتج
          </div>
        </div>

        {/* ── حزام المنتجات المميزة / Featured Products Belt ── */}
        {!showSkeleton && filteredProducts.length > 0 && activeCategory === 'الكل' && !searchText.trim() && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
            <ProductBelt
              title="⚡ صفقات مميزة لفترة محدودة"
              products={mappedBeltProducts}
              onQuickAdd={handleQuickAdd}
              onClick={(p) => navigate(`/product/${p.id}`)}
              onFavorite={handleFavoriteToggle}
              speed={40}
            />
          </div>
        )}

        {/* ── شبكة المنتجات / Product Grid ── */}
        {showSkeleton ? (
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
                  products={mappedGridProducts}
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
                className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700"
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 mb-4 text-slate-400">
                  <Search className="w-7 h-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto text-sm">
                  {searchText.trim()
                    ? <>لم نتمكن من العثور على منتجات تطابق "<span className="font-semibold text-slate-700 dark:text-slate-300">{searchText.trim()}</span>".</>
                    : <>لم نتمكن من العثور على منتجات في قسم <span className="font-semibold text-slate-700 dark:text-slate-300">{activeCategory}</span> حالياً.</>
                  }
                </p>
                <button
                  onClick={clearAllFilters}
                  className="mt-5 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                >
                  مسح الفلاتر وعرض الكل
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </Layout>
  );
};

export default HomePage;
