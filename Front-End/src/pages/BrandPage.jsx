import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Home, ChevronLeft, Package, Crown } from 'lucide-react';
import * as api from '../services/api';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import { ProductGrid } from '../components/HighConversionGrid';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
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

const BrandPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const [brand, setBrand] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadBrandAndProducts() {
      setLoading(true);
      setError('');
      try {
        const brandData = await api.getBrandBySlug(slug);
        setBrand(brandData);
        
        // Load products for this brand
        if (brandData?.id) {
          const brandProducts = await api.getProductsByBrand(brandData.id);
          setProducts(brandProducts || []);
        }
      } catch (err) {
        setError(err.message || 'حدث خطأ أثناء تحميل بيانات العلامة التجارية');
      } finally {
        setLoading(false);
      }
    }
    
    if (slug) {
      loadBrandAndProducts();
    }
  }, [slug]);

  const mappedGridProducts = useMemo(() => {
    return products.map(p => {
      const mapped = mapToProduct(p);
      mapped.isFavorite = isFavorite(p.id);
      return mapped;
    });
  }, [products, isFavorite]);

  const handleQuickAdd = useCallback((p) => {
    const originalProduct = products.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) {
      addToCart(originalProduct, 1);
    } else {
      addToCart({
        id: p.id, title: p.title, price: p.price,
        currency: p.currency || 'USD', mainImageUrl: p.image, imageUrl: p.image
      }, 1);
    }
  }, [products, addToCart]);

  const handleFavoriteToggle = useCallback((p) => {
    const originalProduct = products.find(prod => String(prod.id) === String(p.id));
    if (originalProduct) toggleFavorite(originalProduct);
  }, [products, toggleFavorite]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center pt-20">
          <Loader2 className="w-12 h-12 text-gold-500 animate-spin mb-4" />
          <p className="text-slate-500 font-bold">جاري تحميل العلامة التجارية...</p>
        </div>
      </Layout>
    );
  }

  if (error || !brand) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="bg-red-50 border border-red-200 rounded-3xl p-10 flex flex-col items-center text-center max-w-2xl mx-auto">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">تعذر العثور على العلامة التجارية</h2>
            <p className="text-red-500 mb-8">{error}</p>
            <Link to="/" className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors">
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title={brand.name} 
        description={brand.description || `تصفح أحدث منتجات ${brand.name} في متجر قصة.`}
        image={brand.logoUrl}
      />
      
      {/* Breadcrumbs */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <Link to="/" className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              الرئيسية
            </Link>
            <ChevronLeft className="w-4 h-4" />
            <span className="text-slate-900 dark:text-white font-semibold flex items-center gap-1">
              <Crown className="w-4 h-4 text-gold-500" />
              {brand.name}
            </span>
          </nav>
        </div>
      </div>

      {/* Brand Header */}
      <div className="bg-white dark:bg-slate-900 py-12 border-b border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-100 dark:bg-gold-900/20 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gold-200 dark:bg-gold-900/10 rounded-full blur-3xl opacity-20 translate-y-1/3 -translate-x-1/3"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center gap-8 text-center md:text-right"
          >
            {/* Brand Logo */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 p-4 shrink-0 flex items-center justify-center relative group">
              <div className="absolute inset-0 bg-gold-50 dark:bg-gold-900/20 rounded-3xl transform scale-95 opacity-0 group-hover:scale-105 group-hover:opacity-100 transition-all duration-300 z-0"></div>
              {brand.logoUrl ? (
                <img src={brand.logoUrl} alt={brand.name} className="max-w-full max-h-full object-contain relative z-10" />
              ) : (
                <Crown className="w-16 h-16 text-slate-300 dark:text-slate-600 relative z-10" />
              )}
            </div>

            {/* Brand Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-4 bg-clip-text text-transparent bg-gradient-to-l from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                {brand.name}
              </h1>
              {brand.description && (
                <p className="text-slate-500 dark:text-slate-400 text-base md:text-lg max-w-2xl mx-auto md:mx-0 leading-relaxed">
                  {brand.description}
                </p>
              )}
              
              <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-50 dark:bg-gold-900/20 border border-gold-100 dark:border-gold-800/50 text-gold-700 dark:text-gold-400 rounded-xl font-bold shadow-sm">
                  <Package className="w-5 h-5" />
                  {products.length} منتجات متاحة
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Brand Products */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-3 mb-8">
          <Crown className="w-6 h-6 text-gold-500" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">أحدث منتجات {brand.name}</h2>
        </div>

        {products.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="w-full"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0 }}
            >
              <ProductGrid
                products={mappedGridProducts}
                isLoadingMore={false}
                onQuickAdd={handleQuickAdd}
                onClick={(p) => navigate(`/product/${p.slug || p.id}`)}
                onFavorite={handleFavoriteToggle}
              />
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200 dark:border-slate-800 flex flex-col items-center shadow-sm">
            <Package className="w-16 h-16 text-slate-300 dark:text-slate-700 mb-4" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد منتجات حالياً</h3>
            <p className="text-slate-500 dark:text-slate-400">سنقوم بإضافة منتجات لهذه العلامة التجارية قريباً.</p>
          </div>
        )}
      </main>
    </Layout>
  );
};

export default BrandPage;
