/**
 * CategoryPage — صفحة القسم
 *
 * EN: Displays products filtered by category name.
 *     Reads categoryName from URL params (/category/:categoryName).
 *     Uses SWR hooks for efficient data fetching.
 *     Reuses existing HighConversionGrid components.
 *
 * AR: تعرض المنتجات المفلترة حسب اسم القسم.
 *     تقرأ categoryName من معاملات الرابط (/category/:categoryName).
 *     تستخدم خطافات SWR لجلب البيانات بكفاءة.
 *     تعيد استخدام مكونات HighConversionGrid الموجودة.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, Loader2, X, ArrowRight, Tag
} from 'lucide-react';
import Layout from '../components/Layout';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProducts } from '../hooks/useProducts';
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

const CategoryPage = () => {
  const { categoryName } = useParams();
  const decodedCategoryName = decodeURIComponent(categoryName);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchText, setSearchText] = useState('');

  // ─── SWR Data ───
  const {
    data: products,
    isLoading: productsLoading,
    isValidating: productsValidating,
    error: productsError
  } = useProducts({});

  const activeProducts = productsError ? [] : (products || []);
  const showSkeleton = productsLoading && activeProducts.length === 0;

  // ─── Filter by category ───
  const filteredProducts = useMemo(() => {
    let result = activeProducts.filter(p => p.categoryName === decodedCategoryName);

    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      result = result.filter(p =>
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    // Sort promoted first
    result.sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return 0;
    });

    return result;
  }, [activeProducts, decodedCategoryName, searchText]);

  const mappedGridProducts = useMemo(() => {
    return filteredProducts.map(p => {
      const mapped = mapToProduct(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [filteredProducts, isFavorite]);

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
            onClick={() => navigate('/')}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all shadow-sm"
            aria-label="العودة للرئيسية"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40">
              <Tag className="w-4.5 h-4.5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {decodedCategoryName}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                منتجات القسم
              </p>
            </div>
          </div>
        </div>

        {/* ── Search ── */}
        <section className="mb-5">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder={`ابحث في ${decodedCategoryName}...`}
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
        </section>

        {/* ── Counter ── */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {searchText.trim()
              ? `نتائج: "${searchText.trim()}"`
              : `منتجات ${decodedCategoryName}`}
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
                key={decodedCategoryName + searchText}
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
                    ? <>لم نتمكن من العثور على منتجات تطابق "<span className="font-semibold text-slate-700 dark:text-slate-300">{searchText.trim()}</span>" في هذا القسم.</>
                    : <>لا توجد منتجات في قسم <span className="font-semibold text-slate-700 dark:text-slate-300">{decodedCategoryName}</span> حالياً.</>
                  }
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-5 px-5 py-2 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors text-sm"
                >
                  العودة للصفحة الرئيسية
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </Layout>
  );
};

export default CategoryPage;
