/**
 * ProductsPage — صفحة جميع المنتجات
 *
 * EN: Full product listing page at /products.
 *     Includes search + category filter pills + full product grid.
 *     Reuses existing HighConversionGrid components and SWR hooks.
 *
 * AR: صفحة عرض جميع المنتجات في /products.
 *     تتضمن بحث + فلاتر أقسام + شبكة منتجات كاملة.
 *     تعيد استخدام مكونات HighConversionGrid وخطافات SWR.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, Loader2, X, ArrowRight, ShoppingBag
} from 'lucide-react';
import Layout from '../components/Layout';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProducts, useCategories } from '../hooks/useProducts';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

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
    isPromoted: p.isPromoted || false,
    discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
    promotionLabel: p.promotionLabel || undefined,
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const ProductsPage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';

  const [activeCategory, setActiveCategory] = useState('الكل');
  const [searchText, setSearchText] = useState(searchFromUrl);

  // ─── SWR Data ───
  const {
    data: products,
    isLoading: productsLoading,
    isValidating: productsValidating,
    error: productsError
  } = useProducts({});

  const { data: categories } = useCategories();

  const activeProducts = productsError ? [] : (products || []);
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

    // Sort by promoted first
    result.sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return 0;
    });

    return result;
  }, [activeProducts, activeCategory, searchText]);

  const mappedGridProducts = useMemo(() => {
    return filteredProducts.map(p => {
      const mapped = mapToProduct(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [filteredProducts, isFavorite]);

  const clearAllFilters = useCallback(() => {
    setSearchText('');
    setActiveCategory('الكل');
  }, []);

  const handleQuickAdd = useCallback((p) => {
    const originalProduct = activeProducts.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) {
      addToCart(originalProduct, 1);
    } else {
      addToCart({
        id: p.id, title: p.title, price: p.price,
        currency: p.currency || 'USD', mainImageUrl: p.image
      }, 1);
    }
  }, [activeProducts, addToCart]);

  const handleFavoriteToggle = useCallback((p) => {
    const originalProduct = activeProducts.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) toggleFavorite(originalProduct);
  }, [activeProducts, toggleFavorite]);

  return (
    <Layout>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 lg:pb-16">

        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/?scrollTo=categories')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
            aria-label="العودة للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/40">
              <ShoppingBag className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              جميع المنتجات
            </h1>
          </div>
        </div>

        {/* ── Search & Filters ── */}
        <section className="mb-5">
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
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
          </div>
        </section>

        {/* ── Category Pills ── */}
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

        {/* ── Section Header + Counter ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {searchText.trim()
              ? `نتائج: "${searchText.trim()}"`
              : activeCategory === 'الكل' ? 'جميع المنتجات' : activeCategory}
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {productsValidating && !showSkeleton && (
              <Loader2 className="w-3 h-3 animate-spin text-indigo-400" />
            )}
            <LayoutGrid className="w-3.5 h-3.5" />
            {filteredProducts.length} منتج
          </div>
        </div>

        {/* ── Product Grid ── */}
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

export default ProductsPage;
