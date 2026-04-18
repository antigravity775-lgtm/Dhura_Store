/**
 * HomePage — الصفحة الرئيسية (المُعاد تصميمها)
 *
 * EN: Redesigned high-conversion homepage with two clear navigation paths:
 *     1. Browse by Categories — visual category cards grid
 *     2. Explore Products — "Start Shopping" CTA buttons
 *     Plus a featured product preview grid (8 items).
 *
 *     Layout: OfferBelt → Categories → Start Shopping CTAs → Product Preview
 *
 * AR: الصفحة الرئيسية المُعاد تصميمها مع مسارين واضحين للتنقل:
 *     1. التصفح حسب الأقسام — شبكة بطاقات أقسام مرئية
 *     2. استكشاف المنتجات — أزرار "ابدأ التسوق"
 *     بالإضافة إلى شبكة معاينة المنتجات المميزة (8 عناصر).
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Truck, BadgePercent, ShieldCheck, Sparkles, Eye
} from 'lucide-react';
import Layout from '../components/Layout';
import CategoryGrid from '../components/CategoryGrid';
import HomepageSections from '../components/HomepageSections';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { useProducts, useCategories } from '../hooks/useProducts';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

// ─── Constants ───

const PREVIEW_COUNT = 8;

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
    isPromoted: p.isPromoted || false,
    discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
    promotionLabel: p.promotionLabel || undefined,
  };
}

/**
 * EN: Fisher-Yates shuffle — creates a shuffled copy of the array.
 * AR: خوارزمية فيشر-ييتس — ينشئ نسخة مُعاد ترتيبها من المصفوفة.
 */
function shuffleArray(arr) {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ────────────────────────────────────────────────────────────────────
// OfferBelt — حزام العروض الترويجية
// ────────────────────────────────────────────────────────────────────
const OfferBelt = React.memo(({ shippingOfferText }) => {
  const dynamicMessages = useMemo(() => {
    const next = [...offerMessages];
    next[0] = { ...next[0], text: shippingOfferText || next[0].text };
    return next;
  }, [shippingOfferText]);
  const doubledMessages = [...dynamicMessages, ...dynamicMessages];

  return (
    <div className="relative w-full bg-gradient-to-r from-[#120F09] via-[#2A1F0A] to-[#120F09] overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-r from-dhura-500/10 via-dhura-400/8 to-dhura-500/10 animate-pulse" />
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

  const [shuffleSeed, setShuffleSeed] = useState(0);
  const [shippingOfferText, setShippingOfferText] = useState('');

  // ─── Auto-scroll handling ───
  useEffect(() => {
    if (window.location.search.includes('scrollTo=categories')) {
      // Small timeout to ensure DOM is ready and layout is stable
      setTimeout(() => {
        const el = document.getElementById('categories-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          // Clean up URL so it doesn't auto-scroll again on refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }, 100);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo()
      .then((info) => {
        if (mounted) setShippingOfferText(info?.shippingOfferText || '');
      })
      .catch(() => {
        if (mounted) setShippingOfferText('');
      });
    return () => {
      mounted = false;
    };
  }, []);

  // ─── SWR Data ───
  const {
    data: products,
    isLoading: productsLoading,
    error: productsError
  } = useProducts({});

  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const activeProducts = productsError ? [] : (products || []);
  const showSkeleton = productsLoading && activeProducts.length === 0;

  // ─── Preview Products (8 items, mix of promoted + random) ───
  const previewProducts = useMemo(() => {
    if (activeProducts.length === 0) return [];

    // Promoted products first
    const promoted = activeProducts.filter(p => p.isPromoted);
    const nonPromoted = activeProducts.filter(p => !p.isPromoted);

    // Shuffle the non-promoted (shuffleSeed forces re-shuffle when Discover Random is clicked)
    const shuffledNonPromoted = shuffleArray(nonPromoted);

    // Combine: promoted first, then shuffled
    const combined = [...promoted, ...shuffledNonPromoted];
    return combined.slice(0, PREVIEW_COUNT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeProducts, shuffleSeed]);

  const mappedPreviewProducts = useMemo(() => {
    return previewProducts.map(p => {
      const mapped = mapToProduct(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [previewProducts, isFavorite]);

  // ─── Handlers ───

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
      {/* ═══════ حزام العروض / Offer Belt ═══════ */}
      <OfferBelt shippingOfferText={shippingOfferText} />

      {/* ═══════ المحتوى الرئيسي / Main Content ═══════ */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12 lg:pb-16">

        {/* ═══════ 1. الأقسام / Category Grid ═══════ */}
        <CategoryGrid
          categories={categories}
          isLoading={categoriesLoading}
        />

        {/* ═══════ 2. ابدأ التسوق / Start Shopping CTAs ═══════ */}
        <HomepageSections />

        {/* ═══════ 3. معاينة المنتجات / Product Preview ═══════ */}
        <section>
          {/* Section Header */}
          <div className="flex items-center justify-between mb-5 sm:mb-6">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <Eye className="w-4.5 h-4.5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  العروض الحصرية
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  أقوى الخصومات والأسعار المميزة
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/products')}
              className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-amber-50 dark:hover:bg-dhura-900/30"
            >
              عرض الكل ←
            </button>
          </div>

          {/* Product Grid */}
          {showSkeleton ? (
            <ProductGrid isLoading={true} loadingCount={PREVIEW_COUNT} />
          ) : (
            <AnimatePresence mode="popLayout">
              <motion.div
                className="w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                key={`preview-${shuffleSeed}`}
              >
                {mappedPreviewProducts.length > 0 ? (
                  <ProductGrid
                    products={mappedPreviewProducts}
                    onQuickAdd={handleQuickAdd}
                    onClick={(p) => navigate(`/product/${p.id}`)}
                    onFavorite={handleFavoriteToggle}
                  />
                ) : (
                  <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                    <p className="text-sm">لا توجد منتجات متاحة حالياً</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </section>
      </main>
    </Layout>
  );
};

export default HomePage;
