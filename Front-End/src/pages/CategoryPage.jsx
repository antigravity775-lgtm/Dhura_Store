/**
 * CategoryPage — صفحة منتجات القسم
 *
 * EN: Compact ecommerce product listing for /category/:slug.
 *     Dense grid, filter/sort toolbar, horizontal category nav.
 *
 * AR: صفحة منتجات مدمجة لـ /category/:slug.
 *     شبكة كثيفة، شريط فلترة وترتيب، تنقل أفقي بين الأقسام.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import useSWR from 'swr';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import Breadcrumbs from '../components/Breadcrumbs';
import InfiniteScrollTrigger from '../components/InfiniteScrollTrigger';
import ProductListingToolbar from '../components/ProductListingToolbar';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProductsInfinite, useCategories } from '../hooks/useProducts';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

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

const CompactCategoryPill = ({ cat, isActive }) => (
  <Link
    to={`/category/${cat.slug || cat.id}`}
    className={`flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
      isActive
        ? 'bg-gold-600 border-gold-600 text-white shadow-sm'
        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-300 dark:hover:border-gold-600'
    }`}
  >
    {cat.iconUrl && (
      <img src={cat.iconUrl} alt="" className="w-4 h-4 object-contain rounded-full" />
    )}
    <span>{cat.name}</span>
  </Link>
);

const CategoryPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [showFilters, setShowFilters] = useState(false);
  const [offersOnly, setOffersOnly] = useState(false);
  const [condition, setCondition] = useState('');

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchText), 500);
    return () => clearTimeout(handler);
  }, [searchText]);

  const { data: categoryData, isLoading: categoryLoading } = useSWR(
    slug ? ['categoryBySlug', slug] : null,
    () => api.getCategoryBySlug(slug)
  );

  const { data: allCategories = [] } = useCategories();

  const categoryName = categoryData?.name || slug;
  const subcategories = categoryData?.children?.filter((c) => c.isActive) || [];

  const siblingCategories = useMemo(() => {
    if (!allCategories.length) return [];
    const parentId = categoryData?.parentId || categoryData?.parent?.id;
    if (parentId) {
      return allCategories.filter((c) => c.parentId === parentId || c.parent?.id === parentId);
    }
    return allCategories.filter((c) => !c.parentId && !c.parent);
  }, [allCategories, categoryData]);

  const activeFilterCount = (offersOnly ? 1 : 0) + (condition ? 1 : 0);

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
    categoryName,
    search: debouncedSearch,
    specialOffers: offersOnly,
    condition,
  });

  const activeProducts = productsError ? [] : (products || []);
  const showSkeleton = productsLoading && activeProducts.length === 0;

  const filteredProducts = useMemo(() => {
    const result = [...activeProducts];

    if (sortOrder === 'price-asc') {
      result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortOrder === 'price-desc') {
      result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortOrder === 'rating') {
      result.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    } else if (sortOrder === 'newest') {
      result.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
    } else {
      result.sort((a, b) => {
        if (a.isPromoted && !b.isPromoted) return -1;
        if (!a.isPromoted && b.isPromoted) return 1;
        return 0;
      });
    }

    return result;
  }, [activeProducts, sortOrder]);

  const mappedGridProducts = useMemo(
    () => filteredProducts.map((p) => ({ ...mapToProduct(p), isFavorite: isFavorite(p.id) })),
    [filteredProducts, isFavorite]
  );

  const handleQuickAdd = useCallback((p) => {
    const original = activeProducts.find((prod) => String(prod.id) === String(p.id));
    if (original) addToCart(original, 1);
    else addToCart({ id: p.id, title: p.title, price: p.price, currency: p.currency || 'USD', mainImageUrl: p.image, imageUrl: p.image }, 1);
  }, [activeProducts, addToCart]);

  const handleFavoriteToggle = useCallback((p) => {
    const original = activeProducts.find((prod) => String(prod.id) === String(p.id));
    if (original) toggleFavorite(original);
  }, [activeProducts, toggleFavorite]);

  const clearFilters = () => {
    setOffersOnly(false);
    setCondition('');
    setShowFilters(false);
  };

  const seoTitle = categoryData?.metaTitle || `منتجات ${categoryName}`;
  const seoDescription = categoryData?.metaDescription || `تصفح منتجات قسم ${categoryName} في متجر قصة — تسوق بسهولة وبأفضل الأسعار.`;

  return (
    <Layout>
      <SEO title={seoTitle} description={seoDescription} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-24 md:pb-10 lg:pb-12">
        <Breadcrumbs
          compact
          items={[
            { name: 'الرئيسية', url: '/' },
            { name: 'الفئات', url: '/categories' },
            ...(categoryData?.parent ? [{ name: categoryData.parent.name, url: `/category/${categoryData.parent.slug || categoryData.parent.id}` }] : []),
            { name: categoryName },
          ]}
        />

        <header className="mb-3">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            {categoryLoading ? (
              <span className="inline-block w-32 h-5 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            ) : (
              `منتجات ${categoryName}`
            )}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {filteredProducts.length} منتج
          </p>
        </header>

        {(siblingCategories.length > 1 || subcategories.length > 0) && (
          <div className="mb-3 -mx-1">
            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1 px-1">
              {siblingCategories.length > 1
                ? siblingCategories.map((cat) => (
                    <CompactCategoryPill
                      key={cat.id}
                      cat={cat}
                      isActive={cat.slug === slug || cat.name === categoryName}
                    />
                  ))
                : subcategories.map((cat) => (
                    <CompactCategoryPill key={cat.id} cat={cat} isActive={false} />
                  ))}
            </div>
          </div>
        )}

        <div className="relative mb-3">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-slate-400" />
          </div>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder={`ابحث في ${categoryName}...`}
            className="w-full pr-10 pl-9 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/40"
          />
          {searchText && (
            <button
              type="button"
              onClick={() => setSearchText('')}
              className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 hover:text-slate-600"
              aria-label="مسح البحث"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <ProductListingToolbar
          productCount={filteredProducts.length}
          isValidating={productsValidating && !showSkeleton}
          sortOrder={sortOrder}
          onSortChange={setSortOrder}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters((v) => !v)}
          activeFilterCount={activeFilterCount}
        />

        {showFilters && (
          <div className="mb-3 p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">العروض فقط</span>
              <input
                type="checkbox"
                checked={offersOnly}
                onChange={(e) => setOffersOnly(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-gold-600 focus:ring-gold-500"
              />
            </label>
            <div>
              <label htmlFor="condition-filter" className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
                الحالة
              </label>
              <select
                id="condition-filter"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gold-500/40"
              >
                <option value="">الكل</option>
                <option value="1">جديد</option>
                <option value="2">مستعمل</option>
                <option value="3">مُجدَّد</option>
              </select>
            </div>
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                مسح الفلاتر
              </button>
            )}
          </div>
        )}

        {productsError && (
          <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            تعذر تحميل المنتجات: {productsError.message || 'حدث خطأ غير متوقع'}
          </div>
        )}

        {showSkeleton ? (
          <ProductGrid isLoading loadingCount={10} variant="listing" compact />
        ) : filteredProducts.length > 0 ? (
          <>
            <ProductGrid
              products={mappedGridProducts}
              isLoadingMore={isLoadingMore}
              onQuickAdd={handleQuickAdd}
              onClick={(p) => navigate(`/product/${p.slug || p.id}`)}
              onFavorite={handleFavoriteToggle}
              variant="listing"
              compact
            />

            <InfiniteScrollTrigger
              onIntersect={() => setSize(size + 1)}
              isLoadingMore={isLoadingMore}
              isReachingEnd={isReachingEnd}
            />

            {isReachingEnd && activeProducts.length > 0 && (
              <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-6">
                وصلت إلى نهاية المنتجات في هذا القسم
              </p>
            )}
          </>
        ) : (
          <div className="text-center py-14 px-4">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
              لا توجد منتجات حالياً
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              {searchText.trim() || activeFilterCount > 0
                ? 'جرّب تعديل البحث أو الفلاتر'
                : 'جرّب تصفح قسم آخر'}
            </p>
            <Link
              to="/categories"
              className="inline-flex items-center justify-center px-4 py-2 bg-gold-600 text-white text-sm font-bold rounded-lg hover:bg-gold-500 transition-colors"
            >
              تصفح جميع الفئات
            </Link>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default CategoryPage;
