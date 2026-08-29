/**
 * HomePage — الصفحة الرئيسية (تصميم كثافة عالية)
 *
 * EN: Dense, high-conversion homepage with compact category belt,
 *     horizontal product carousels, and smaller product cards.
 *
 * AR: صفحة رئيسية كثيفة مع حزام فئات مدمج،
 *     شرائط منتجات أفقية، وبطاقات منتجات أصغر.
 */

import React, { useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import CategoryBelt from '../components/CategoryBelt';
import HeroSection from '../components/HeroSection';
import BannerRenderer from '../components/BannerRenderer';
import ProductCarousel from '../components/ProductCarousel';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProducts, useCategories } from '../hooks/useProducts';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

const SECTION_COUNT = 8;
const CATEGORY_CAROUSEL_COUNT = 10;

function partitionHomeProducts(products, sectionCount = SECTION_COUNT) {
  const usedIds = new Set();

  const takeUnique = (candidates, count) => {
    const result = [];
    for (const p of candidates) {
      const id = String(p.id);
      if (usedIds.has(id)) continue;
      result.push(p);
      usedIds.add(id);
      if (result.length >= count) break;
    }
    return result;
  };

  const onOffer = products.filter((p) => p.isPromoted || p.discountPrice);
  const bestSellers = takeUnique(
    onOffer.length > 0 ? onOffer : products,
    sectionCount
  );

  const newest = [...products].sort(
    (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
  );
  const newArrivals = takeUnique(newest, sectionCount);

  const remaining = products.filter((p) => !usedIds.has(String(p.id)));
  const pools = new Map();

  for (const p of remaining) {
    const cat = p.categoryName || String(p.categoryId || 'other');
    if (!pools.has(cat)) pools.set(cat, []);
    pools.get(cat).push(p);
  }

  const diverseCandidates = [];
  const categoryKeys = [...pools.keys()];
  let hasMore = true;

  while (diverseCandidates.length < sectionCount && hasMore) {
    hasMore = false;
    for (const cat of categoryKeys) {
      const pool = pools.get(cat);
      if (pool?.length) {
        diverseCandidates.push(pool.shift());
        hasMore = true;
        if (diverseCandidates.length >= sectionCount) break;
      }
    }
  }

  const featuredProducts = takeUnique([...diverseCandidates, ...remaining], sectionCount);

  return { bestSellers, newArrivals, featuredProducts };
}

function pickCategoryProducts(pool, usedIds, limit = CATEGORY_CAROUSEL_COUNT) {
  const unused = pool.filter((p) => !usedIds.has(String(p.id)));
  const used = pool.filter((p) => usedIds.has(String(p.id)));
  return [...unused, ...used].slice(0, limit);
}

function buildCategorySections(products, categories, featuredIds) {
  const usedIds = new Set(featuredIds.map((id) => String(id)));
  const byCategory = new Map();

  for (const p of products) {
    const catName = p.categoryName;
    if (!catName) continue;
    if (!byCategory.has(catName)) byCategory.set(catName, []);
    byCategory.get(catName).push(p);
  }

  const orderedNames = categories.length > 0
    ? categories.map((c) => c.name).filter((name) => byCategory.has(name))
    : [...byCategory.keys()].sort((a, b) => a.localeCompare(b, 'ar'));

  return orderedNames
    .map((name) => {
      const meta = categories.find((c) => c.name === name);
      const pool = byCategory.get(name) || [];
      const sectionProducts = pickCategoryProducts(pool, usedIds, CATEGORY_CAROUSEL_COUNT);
      if (sectionProducts.length === 0) return null;

      return {
        id: meta?.id || name,
        name,
        slug: meta?.slug,
        products: sectionProducts,
      };
    })
    .filter(Boolean);
}

function mapToProduct(p) {
  const rawImage = p.imageUrl || p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
  return {
    id: p.id,
    slug: p.slug || p.id,
    title: p.title,
    description: p.description || null,
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

const OfferBelt = React.memo(({ shippingOfferText }) => {
  if (!shippingOfferText || !shippingOfferText.trim()) return null;

  const messages = Array(8).fill({
    icon: Sparkles,
    text: shippingOfferText,
    color: 'text-gold-300'
  });

  return (
    <div className="relative z-0 shrink-0 w-full bg-gradient-to-r from-[#120F09] via-[#2A1F0A] to-[#120F09] overflow-hidden select-none border-b border-gold-500/10">
      <div className="absolute inset-0 bg-gradient-to-r from-gold-500/10 via-gold-400/8 to-gold-500/10 animate-pulse" />
      <div className="offer-belt-track flex items-center gap-12 py-2 whitespace-nowrap">
        {messages.map((msg, i) => {
          const Icon = msg.icon;
          return (
            <span
              key={i}
              className="inline-flex items-center gap-2 text-xs font-semibold text-white/90 flex-shrink-0"
            >
              <Icon className={`w-3.5 h-3.5 ${msg.color} flex-shrink-0`} />
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

const HomePage = () => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const [shippingOfferText, setShippingOfferText] = React.useState(() => {
    try {
      const cached = localStorage.getItem('teeb_store_info');
      if (cached) return JSON.parse(cached).shippingOfferText || '';
    } catch { return ''; }
    return '';
  });

  useEffect(() => {
    if (window.location.search.includes('scrollTo=categories')) {
      setTimeout(() => {
        const el = document.getElementById('categories-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo()
      .then((info) => {
        try { localStorage.setItem('teeb_store_info', JSON.stringify(info)); } catch {}
        if (mounted) setShippingOfferText(info?.shippingOfferText || '');
      })
      .catch(() => {
        if (mounted) setShippingOfferText('');
      });
    return () => { mounted = false; };
  }, []);

  const { data: products, isLoading: productsLoading, error: productsError } = useProducts({});
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const activeProducts = productsError ? [] : (products || []);
  const showSkeleton = productsLoading && activeProducts.length === 0;

  const { bestSellers, newArrivals, featuredProducts } = useMemo(
    () => partitionHomeProducts(activeProducts, SECTION_COUNT),
    [activeProducts]
  );

  const categorySections = useMemo(() => {
    const featuredIds = [
      ...bestSellers,
      ...newArrivals,
      ...featuredProducts,
    ].map((p) => p.id);

    return buildCategorySections(activeProducts, categories, featuredIds);
  }, [activeProducts, categories, bestSellers, newArrivals, featuredProducts]);

  const mapWithFavorites = useCallback((list) => {
    return list.map((p) => {
      const mapped = mapToProduct(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [isFavorite]);

  const handleQuickAdd = useCallback((p) => {
    const originalProduct = activeProducts.find((prod) => String(prod.id) === String(p.id));
    if (originalProduct) {
      addToCart(originalProduct, 1);
    } else {
      addToCart({
        id: p.id, title: p.title, description: p.description || null, price: p.price,
        currency: p.currency || 'USD', mainImageUrl: p.image, imageUrl: p.image
      }, 1);
    }
  }, [activeProducts, addToCart]);

  const handleFavoriteToggle = useCallback((p) => {
    const originalProduct = activeProducts.find((prod) => String(prod.id) === String(p.id));
    if (originalProduct) toggleFavorite(originalProduct);
  }, [activeProducts, toggleFavorite]);

  const handleProductClick = useCallback((p) => {
    navigate(`/product/${p.slug || p.id}`);
  }, [navigate]);

  return (
    <Layout>
      <SEO title="الصفحة الرئيسية" />

      <OfferBelt shippingOfferText={shippingOfferText} />
      <BannerRenderer placement="announcement" />

      <HeroSection />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-10 lg:pb-12">
        <CategoryBelt categories={categories} isLoading={categoriesLoading} />

        {productsError && (
          <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
            تعذر تحميل المنتجات حالياً: {productsError.message || 'حدث خطأ غير متوقع'}
          </div>
        )}

        {bestSellers.length > 0 && (
        <ProductCarousel
          title="الأكثر مبيعاً"
          subtitle="المنتجات الأكثر طلباً"
          viewAllHref="/products?promoted=true"
          products={mapWithFavorites(bestSellers)}
          isLoading={showSkeleton}
          onQuickAdd={handleQuickAdd}
          onClick={handleProductClick}
          onFavorite={handleFavoriteToggle}
        />
        )}

        <BannerRenderer placement="promo_home" />

        {newArrivals.length > 0 && (
          <ProductCarousel
            title="وصل حديثاً"
            subtitle="أحدث المنتجات في المتجر"
            viewAllHref="/products?sort=newest"
            products={mapWithFavorites(newArrivals)}
            isLoading={showSkeleton}
            onQuickAdd={handleQuickAdd}
            onClick={handleProductClick}
            onFavorite={handleFavoriteToggle}
          />
        )}

        {featuredProducts.length > 0 && (
        <section className="mb-5 sm:mb-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                منتجات مميزة
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                مختارات من أفضل المنتجات
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/products')}
              className="text-xs sm:text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
            >
              عرض الكل ←
            </button>
          </div>

          {showSkeleton ? (
            <ProductGrid isLoading loadingCount={SECTION_COUNT} className="!px-0 !py-0" />
          ) : (
            <ProductGrid
              products={mapWithFavorites(featuredProducts)}
              onQuickAdd={handleQuickAdd}
              onClick={handleProductClick}
              onFavorite={handleFavoriteToggle}
              className="!px-0 !py-0"
            />
          )}
        </section>
        )}

        {categorySections.length > 0 && (
          <section className="mt-2" aria-label="منتجات حسب الفئة">
            {categorySections.map((section) => (
              <ProductCarousel
                key={section.id}
                title={section.name}
                subtitle={`${section.products.length} منتج`}
                viewAllHref={
                  section.slug
                    ? `/category/${encodeURIComponent(section.slug || section.name)}`
                    : `/category/${encodeURIComponent(section.name)}`
                }
                products={mapWithFavorites(section.products)}
                isLoading={showSkeleton}
                loadingCount={6}
                onQuickAdd={handleQuickAdd}
                onClick={handleProductClick}
                onFavorite={handleFavoriteToggle}
              />
            ))}
          </section>
        )}

        {showSkeleton && categories.length > 0 && categorySections.length === 0 && (
          categories.slice(0, 4).map((cat) => (
            <ProductCarousel
              key={`cat-skel-${cat.id}`}
              title={cat.name}
              products={[]}
              isLoading
              loadingCount={6}
            />
          ))
        )}
      </main>
    </Layout>
  );
};

export default HomePage;
