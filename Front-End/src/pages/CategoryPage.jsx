/**
 * CategoryPage — صفحة القسم
 *
 * Phase 2 update: Uses slug-based routing (/category/:slug).
 * Fetches the category by slug to get metadata (SEO title, subcategories).
 * Shows subcategory navigation when the category has children.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutGrid, Loader2, X, ArrowRight, Tag, FolderOpen
} from 'lucide-react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProductsInfinite } from '../hooks/useProducts';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

// ─── Helpers ───

function mapToProduct(p) {
  const rawImage = p.imageUrl || p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
  return {
    id: p.id,
    slug: p.slug || p.id,
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

// ─── Subcategory chip ───
const SubcategoryChip = ({ cat }) => (
  <Link
    to={`/category/${cat.slug || cat.id}`}
    className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-gold-300 dark:hover:border-gold-600 hover:shadow-md transition-all group"
  >
    {cat.iconUrl
      ? <img src={cat.iconUrl} alt={cat.name} className="w-5 h-5 object-contain rounded" />
      : <Tag className="w-4 h-4 text-gold-500 group-hover:text-gold-600" />
    }
    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
      {cat.name}
    </span>
  </Link>
);

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  // Fetch category metadata by slug (for SEO + subcategories)
  const { data: categoryData, isLoading: categoryLoading } = useSWR(
    slug ? ['categoryBySlug', slug] : null,
    () => api.getCategoryBySlug(slug)
  );

  const categoryName = categoryData?.name || slug;
  const subcategories = categoryData?.children?.filter(c => c.isActive) || [];

  // ─── SWR Data — products ───
  const {
    data: products,
    isLoading: productsLoading,
    isValidating: productsValidating,
    isLoadingMore,
    isReachingEnd,
    size,
    setSize,
    error: productsError
  } = useProductsInfinite({
    categoryName: categoryName,   // still uses name on the backend for now
    search: debouncedSearch
  });

  const activeProducts = productsError ? [] : (products || []);
  const showSkeleton = productsLoading && activeProducts.length === 0;

  // Sort promoted first
  const filteredProducts = useMemo(() => {
    const result = [...activeProducts];
    result.sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return 0;
    });
    return result;
  }, [activeProducts]);

  const mappedGridProducts = useMemo(() =>
    filteredProducts.map(p => ({ ...mapToProduct(p), isFavorite: isFavorite(p.id) })),
    [filteredProducts, isFavorite]
  );

  const handleQuickAdd = useCallback((p) => {
    const original = activeProducts.find(prod => String(prod.id) === String(p.id));
    if (original) addToCart(original, 1);
    else addToCart({ id: p.id, title: p.title, price: p.price, currency: p.currency || 'USD', mainImageUrl: p.image, imageUrl: p.image }, 1);
  }, [activeProducts, addToCart]);

  const handleFavoriteToggle = useCallback((p) => {
    const original = activeProducts.find(prod => String(prod.id) === String(p.id));
    if (original) toggleFavorite(original);
  }, [activeProducts, toggleFavorite]);

  const seoTitle = categoryData?.metaTitle || `قسم ${categoryName}`;
  const seoDescription = categoryData?.metaDescription || `تصفح أحدث وأفضل العطور والمنتجات في قسم ${categoryName} على متجر قصة — عطور أصلية ١٠٠٪ بأفضل الأسعار.`;

  return (
    <Layout>
      <SEO title={seoTitle} description={seoDescription} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12 lg:pb-16">

        {/* ── Breadcrumbs ── */}
        <Breadcrumbs items={[
          { name: 'الرئيسية', url: '/' },
          { name: 'الأقسام', url: '/products' },
          ...(categoryData?.parent ? [{ name: categoryData.parent.name, url: `/category/${categoryData.parent.slug || categoryData.parent.id}` }] : []),
          { name: categoryName },
        ]} />

        {/* ── Page Header ── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-300 dark:hover:border-gold-600 transition-all shadow-sm"
            aria-label="العودة"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/40">
              {categoryData?.iconUrl
                ? <img src={categoryData.iconUrl} alt={categoryName} className="w-6 h-6 object-contain rounded" />
                : <Tag className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              }
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {categoryLoading ? <span className="inline-block w-40 h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" /> : categoryName}
              </h1>
              {categoryData?.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-md line-clamp-1">
                  {categoryData.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Subcategory Navigation ── */}
        {subcategories.length > 0 && (
          <section className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FolderOpen className="w-4 h-4 text-gold-500" />
              <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300">الأقسام الفرعية</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {subcategories.map(sub => (
                <SubcategoryChip key={sub.id} cat={sub} />
              ))}
            </div>
          </section>
        )}

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
              placeholder={`ابحث في ${categoryName}...`}
              className="w-full pr-12 pl-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-400 shadow-sm transition-all"
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
            {searchText.trim() ? `نتائج: "${searchText.trim()}"` : `منتجات ${categoryName}`}
          </h2>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {productsValidating && !showSkeleton && <Loader2 className="w-3 h-3 animate-spin text-gold-400" />}
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
                key={slug + searchText}
              >
                <ProductGrid
                  products={mappedGridProducts}
                  isLoadingMore={isLoadingMore}
                  onQuickAdd={handleQuickAdd}
                  onClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                  onFavorite={handleFavoriteToggle}
                />

                <InfiniteScrollTrigger
                  onIntersect={() => setSize(size + 1)}
                  isLoadingMore={isLoadingMore}
                  isReachingEnd={isReachingEnd}
                />

                {isReachingEnd && activeProducts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className="flex justify-center mt-12 pb-8"
                  >
                    <p className="text-sm sm:text-base font-semibold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/50 px-6 py-2.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
                      وصلت إلى نهاية المنتجات في هذا القسم ✨
                    </p>
                  </motion.div>
                )}
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
                    : <>لا توجد منتجات في قسم <span className="font-semibold text-slate-700 dark:text-slate-300">{categoryName}</span> حالياً.</>
                  }
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="mt-5 px-5 py-2 bg-gold-600 text-white font-semibold rounded-xl hover:bg-gold-700 transition-colors text-sm"
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
