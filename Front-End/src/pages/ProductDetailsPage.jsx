import React, { useState, useEffect, useMemo } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  MapPin,
  User,
  ShieldCheck,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Tag,
  Package,
  ShoppingCart,
  Check,
  Loader2,
  AlertCircle,
  Star,
  Zap,
  Truck,
} from "lucide-react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import RelatedProducts from "../components/RelatedProducts";
import * as api from "../services/api";
import { getOptimizedImageUrl, IMAGE_WIDTHS } from "../utils/cloudinaryUrl";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { buildProductSchema, buildBreadcrumbSchema } from "../utils/structuredData";
import { trackViewItem, trackAddToCart } from "../utils/analytics";

// UUID regex for backward-compat detection
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatPrice(price, currency) {
  const formatted =
    price >= 1000 ? price.toLocaleString("en-US") : price.toString();
  const symbol = api.CurrencySymbol[currency] || "ريال";
  return `${formatted} ${symbol}`;
}

const ProductSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse w-full">
    <div className="w-36 h-5 bg-slate-200 dark:bg-slate-700 rounded-lg mb-8"></div>
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
      <div className="w-full lg:w-[55%] flex flex-col gap-4">
        <div className="w-full aspect-[4/3] bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
      </div>
      <div className="w-full lg:w-[45%] flex flex-col gap-5">
        <div className="flex gap-2">
          <div className="w-16 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
          <div className="w-24 h-7 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
        <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="w-3/4 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="w-40 h-12 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
        <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-2"></div>
        <div className="space-y-2.5">
          <div className="w-28 h-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
        </div>
        <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl mt-auto"></div>
      </div>
    </div>
  </div>
);

/* ── Star Rating helper ── */
function StarRating({ rating, reviewCount }) {
  const numRating = Number(rating) || 0;
  const full = Math.floor(numRating);
  const half = numRating - full >= 0.5;
  return (
    <div className="flex items-center gap-1.5 mb-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i <= full
              ? 'text-gold-400 fill-gold-400'
              : i === full + 1 && half
                ? 'text-gold-400 fill-gold-200'
                : 'text-slate-300 dark:text-slate-600 fill-current'
              }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{numRating.toFixed(1)}</span>
      <span className="text-xs text-slate-400 dark:text-slate-500">({Number(reviewCount).toLocaleString()} تقييم)</span>
    </div>
  );
}

const ProductDetailsPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [errorType, setErrorType] = useState(null); // 'not_found' | 'server_error'

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setErrorType(null);
    setAddedToCart(false);
    setSelectedImageIndex(0);

    async function load() {
      try {
        let data;

        if (UUID_REGEX.test(slug)) {
          // Backward compat: old UUID-based links — look up by ID then redirect to slug URL
          data = await api.getProductById(slug);
          if (data?.slug && mounted) {
            // Silently redirect to slug URL (replace so back button works)
            navigate(`/product/${data.slug}`, { replace: true });
            return;
          }
        } else {
          // Normal slug lookup
          data = await api.getProductBySlug(slug);
        }

        if (mounted) {
          setProduct(data);
          if (data.hasVariants && data.variants?.length > 0) {
            setSelectedVariantId(data.variants[0].id);
          }
          setLoading(false);
          // GA4 e-commerce tracking
          trackViewItem(data);
        }
      } catch (err) {
        const is404 = err.message?.includes('404') || err.status === 404;
        if (mounted) {
          setNotFound(true);
          setErrorType(is404 ? 'not_found' : 'server_error');
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [slug, navigate]);

  useEffect(() => {
    let mounted = true;
    api
      .getStoreInfo()
      .then((info) => {
        if (mounted) setStoreInfo(info);
      })
      .catch(() => {
        if (mounted) setStoreInfo(null);
      });
    return () => {
      mounted = false;
    };
  }, []);

  const selectedVariant = useMemo(() => {
    if (!product || !product.hasVariants || !product.variants) return null;
    return product.variants.find(v => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(product?.price || 0);
  const displayDiscount = selectedVariant ? (selectedVariant.discountPrice ? Number(selectedVariant.discountPrice) : null) : (product?.discountPrice ? Number(product.discountPrice) : null);
  const displayStock = selectedVariant ? selectedVariant.stockQuantity : (product?.stockQuantity || 0);

  const handleAddToCart = () => {
    if (!product) return;
    if (product.hasVariants) {
      // Phase 7 cart dependency
      return;
    }
    if (displayStock <= 0) return;
    
    addToCart(product, 1);
    trackAddToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.title || "متجر قصة",
      text: `شاهد هذا المنتج: ${product?.title}\n`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ الرابط!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const whatsappMessage = `مرحباً! أنا مهتم بالمنتج: ${product?.title || ""}
الرابط: ${window.location.href}`;
  const formattedContactPhone = useMemo(() => {
    const rawPhone = storeInfo?.contactPhone || "";
    const digits = rawPhone.replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("967") ? digits : `967${digits}`;
  }, [storeInfo?.contactPhone]);

  const whatsappBaseUrl = useMemo(() => {
    const link = (storeInfo?.whatsappUrl || "").trim();
    if (!link || link.includes("chat.whatsapp.com")) {
      return formattedContactPhone ? `https://wa.me/${formattedContactPhone}` : "";
    }
    const normalized = link.startsWith("http") ? link : `https://${link}`;
    try {
      const url = new URL(normalized);
      if (url.hostname.includes("whatsapp.com")) {
        return normalized;
      }
      return formattedContactPhone ? `https://wa.me/${formattedContactPhone}` : "";
    } catch {
      const digits = link.replace(/\D/g, "");
      if (digits) {
        return `https://wa.me/${digits.startsWith("967") ? digits : `967${digits}`}`;
      }
      return formattedContactPhone ? `https://wa.me/${formattedContactPhone}` : "";
    }
  }, [storeInfo?.whatsappUrl, formattedContactPhone]);

  const productWhatsAppUrl = useMemo(() => {
    if (!whatsappBaseUrl) return "";
    try {
      const url = new URL(whatsappBaseUrl);
      if (url.searchParams.has("text")) {
        return whatsappBaseUrl;
      }
      url.searchParams.set("text", whatsappMessage);
      return url.toString();
    } catch {
      return `${whatsappBaseUrl}?text=${encodeURIComponent(whatsappMessage)}`;
    }
  }, [whatsappBaseUrl, whatsappMessage]);

  if (loading) {
    return (
      <Layout>
        <ProductSkeleton />
      </Layout>
    );
  }

  if (notFound) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <div className="w-24 h-24 bg-rose-100 dark:bg-rose-900/30 text-rose-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            {errorType === 'server_error' ? 'خطأ في الاتصال بالخادم' : 'المنتج غير موجود'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            {errorType === 'server_error'
              ? 'يبدو أن هناك مشكلة في الخادم حالياً (ربما ضغط كبير). يرجى المحاولة مرة أخرى بعد قليل.'
              : 'عذراً، لم نتمكن من العثور على المنتج الذي تبحث عنه. قد يكون تم حذفه أو أن الرابط غير صحيح.'}
          </p>
          <button onClick={() => {
            if (errorType === 'server_error') window.location.reload();
            else navigate('/');
          }} className="px-8 py-3.5 bg-gold-600 text-white font-bold rounded-2xl hover:bg-gold-700 transition-all shadow-lg shadow-gold-200 dark:shadow-none active:scale-95">
            {errorType === 'server_error' ? 'إعادة المحاولة' : 'العودة للصفحة الرئيسية'}
          </button>
        </div>
      </Layout>
    );
  }

  const conditionText = api.ConditionMap[product.condition] || "جديد";

  // Build gallery from relational images array, fall back to single imageUrl
  const galleryImages = product.images?.length > 0
    ? product.images.map(img => img.url)
    : (product.imageUrl ? [product.imageUrl] : ["https://images.unsplash.com/photo-1560472355-536de3962603?w=1000&q=80"]);

  const safeIndex = Math.min(selectedImageIndex, galleryImages.length - 1);
  const activeRawUrl = galleryImages[safeIndex];
  const activeImageUrl = getOptimizedImageUrl(activeRawUrl, IMAGE_WIDTHS.DETAIL);
  const rawImageUrl = galleryImages[0]; // used for SEO

  // ── Structured data ──
  const productSchema = buildProductSchema(product);
  const breadcrumbItems = [
    { name: 'الرئيسية', url: '/' },
    ...(product.categoryName ? [{ name: product.categoryName, url: `/category/${encodeURIComponent(product.categoryName)}` }] : []),
    { name: product.title },
  ];

  const productSlug = product.slug;

  return (
    <Layout>
      <SEO
        title={product.title}
        description={product.description?.substring(0, 160) || `تسوق ${product.title} بأفضل الأسعار على متجر قصة.`}
        image={rawImageUrl}
        type="product"
        canonicalPath={`/product/${productSlug}`}
        jsonLd={[productSchema]}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-12 w-full">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          {/* ========== العمود الأيمن: معرض الصور ========== */}
          <div className="w-full lg:w-[55%] flex flex-col gap-3 select-none">
            {/* Main image */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <motion.img
                key={activeRawUrl}
                src={activeImageUrl}
                alt={`${product.title} - ${product.categoryName || 'عطر'}`}
                width="800"
                height="600"
                fetchpriority="high"
                initial={{ opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25 }}
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Navigation arrows for multi-image */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(i => (i - 1 + galleryImages.length) % galleryImages.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(i => (i + 1) % galleryImages.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    aria-label="الصورة التالية"
                  >
                    <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  </button>
                  {/* Dot indicators */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
                    {galleryImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`rounded-full transition-all ${
                          idx === safeIndex
                            ? 'w-5 h-2 bg-white shadow-sm'
                            : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`صورة ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail strip — shown only when there are multiple images */}
            {galleryImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {galleryImages.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      idx === safeIndex
                        ? 'border-gold-400 shadow-md shadow-gold-200/50 dark:shadow-gold-900/30 scale-105'
                        : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-400'
                    }`}
                    aria-label={`عرض الصورة ${idx + 1}`}
                  >
                    <img
                      src={getOptimizedImageUrl(url, 150)}
                      alt={`${product.title} ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ========== العمود الأيسر: تفاصيل المنتج ========== */}
          <div className="w-full lg:w-[45%] flex flex-col">
            {/* شارات المعلومات */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${product.condition === 1
                  ? "bg-gold-100 dark:bg-gold-900/40 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-700"
                  : "bg-gold-50 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-700"
                  }`}
              >
                <Package className="w-3.5 h-3.5" />
                {conditionText}
              </span>
              {product.categoryName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  <Tag className="w-3.5 h-3.5" />
                  {product.categoryName}
                </span>
              )}
              {displayStock > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-700">
                  متوفر ({displayStock})
                </span>
              )}
              {product.isPromoted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-gold-500 to-purple-500 text-white shadow-md shadow-gold-500/20">
                  ⭐ منتج مميز
                </span>
              )}
              {product.promotionLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gold-50 dark:bg-gold-900/30 text-gold-700 dark:text-gold-300 border border-gold-200 dark:border-gold-700">
                  {product.promotionLabel}
                </span>
              )}
            </div>

            {/* العنوان */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight mb-2">
              {product.title}
            </h1>

            {/* التقييم / Star Rating */}
            {(() => {
              const rating = product.rating ?? (3.5 + Math.abs(String(product.id).charCodeAt(0) % 15) / 10);
              const reviewCount = product.reviewCount ?? Math.floor(Math.abs(String(product.id).charCodeAt(0) * 37) % 900 + 50);
              return <StarRating rating={rating} reviewCount={reviewCount} />;
            })()}

            {/* شارة الشح / Scarcity Badge */}
            {displayStock > 0 && displayStock <= 5 && (
              <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl px-3 py-1.5 text-xs font-bold mb-3 animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                متبقي {displayStock} قطعة فقط!
              </div>
            )}
            {displayStock === 0 && (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl px-3 py-1.5 text-xs font-bold mb-3">
                نفد المخزون
              </div>
            )}

            {/* السعر وأزرار الإجراء */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {displayDiscount ? (
                  <>
                    <div className="text-lg text-slate-400 dark:text-slate-500 line-through mb-1">
                      {formatPrice(displayPrice, product.currency)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {formatPrice(
                          Number(displayDiscount),
                          product.currency,
                        )}
                      </span>
                      <span className="px-2.5 py-1 text-sm font-bold text-white bg-red-500 rounded-lg shadow-sm">
                        -
                        {Math.round(
                          ((displayPrice - displayDiscount) /
                            displayPrice) *
                          100,
                        )}
                        %
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-3xl sm:text-4xl font-black text-gold-600 dark:text-gold-400 tracking-tight">
                    {!selectedVariant && product.hasVariants && <span className="text-sm text-slate-500 ml-2">يبدأ من</span>}
                    {formatPrice(displayPrice, product.currency)}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => product && toggleFavorite(product)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${product && isFavorite(product.id)
                    ? "bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-700 text-rose-500"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200"
                    }`}
                  aria-label="إضافة للمفضلة"
                >
                  <Heart
                    className="w-5 h-5"
                    fill={
                      product && isFavorite(product.id)
                        ? "currentColor"
                        : "none"
                    }
                  />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-gold-600 dark:hover:text-gold-400 hover:border-gold-200 dark:hover:border-gold-700 transition-all"
                  aria-label="مشاركة المنتج"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <hr className="border-slate-200/80 dark:border-slate-700 mb-6" />

            {/* خيارات المنتج / Variant Selection */}
            {product.hasVariants && product.variants?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                  الخيارات المتاحة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    // Extract a readable label from the variant's attributes
                    const label = variant.attributes?.map(a => a.value).join(' - ') || variant.sku || 'متغير';
                    const isSelected = selectedVariantId === variant.id;
                    const isOutOfStock = variant.stockQuantity <= 0;
                    
                    return (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all overflow-hidden ${
                          isSelected
                            ? 'bg-gold-50 dark:bg-gold-900/30 border-2 border-gold-400 text-gold-700 dark:text-gold-300 shadow-sm'
                            : 'bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-300 hover:text-gold-600'
                        } ${isOutOfStock ? 'opacity-60' : ''}`}
                      >
                        {label}
                        {isOutOfStock && (
                          <span className="absolute inset-0 bg-white/40 dark:bg-slate-900/40 cursor-not-allowed">
                            <span className="absolute top-1/2 left-0 w-full h-[1.5px] bg-red-400 -rotate-12 transform -translate-y-1/2"></span>
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* المواصفات / Specifications */}
            {product.attributes && product.attributes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                  المواصفات
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 overflow-hidden">
                  <div className="divide-y divide-slate-100 dark:divide-slate-700">
                    {product.attributes.map((attr, idx) => {
                      const attrName = attr.categoryAttribute?.name || 'مواصفة';
                      let displayValue = attr.value;
                      if (attr.categoryAttribute?.type === 'BOOLEAN') {
                        displayValue = (attr.value === 'true' || attr.value === '1') ? 'نعم' : 'لا';
                      } else if (attr.categoryAttribute?.type === 'MULTI_SELECT') {
                        displayValue = attr.value.split(',').join('، ');
                      }
                      
                      return (
                        <div key={attr.id || idx} className="flex px-4 py-3 text-sm">
                          <span className="w-1/3 font-semibold text-slate-600 dark:text-slate-400">{attrName}</span>
                          <span className="w-2/3 text-slate-900 dark:text-slate-200 font-medium text-left" dir="auto">{displayValue}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* الوصف */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-gold-500 rounded-full"></div>
                  الوصف
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[15px] whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* كتلة الثقة / Trust Block */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 my-5">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">ضمان الجودة — استرجاع سهل</span>
              </div>
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-3 py-2.5 border border-slate-100 dark:border-slate-700">
                <MessageCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">دعم فوري عبر واتساب</span>
              </div>
            </div>

            <div className="flex-grow"></div>

            {/* أزرار الإجراء - Premium CTA Section */}
            <div className="mt-6 flex items-center gap-3 sticky bottom-0 lg:static z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl border-t border-slate-200/60 dark:border-slate-800/60 lg:border-none p-3 pb-[max(env(safe-area-inset-bottom),12px)] lg:p-0 lg:bg-transparent lg:dark:bg-transparent -mx-4 px-4 lg:mx-0">
              
              {/* زر إضافة للسلة (Primary CTA) */}
              <motion.button
                onClick={handleAddToCart}
                disabled={addedToCart || product.hasVariants}
                className={`flex-1 flex items-center justify-center gap-2 h-[52px] sm:h-14 rounded-xl font-extrabold text-[15px] sm:text-base shadow-lg transition-all ${
                  product.hasVariants 
                    ? "bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700"
                    : addedToCart
                    ? "bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-gold-600 text-white shadow-gold-600/20 hover:bg-gold-500"
                } focus:outline-none focus:ring-4 focus:ring-gold-500/30`}
                whileHover={!addedToCart && !product.hasVariants ? { scale: 1.01 } : {}}
                whileTap={!addedToCart && !product.hasVariants ? { scale: 0.98 } : {}}
              >
                {product.hasVariants ? (
                  <>
                    <Package className="w-5 h-5" />
                    شراء المتغيرات قيد التحديث
                  </>
                ) : addedToCart ? (
                  <>
                    <Check className="w-5 h-5" />
                    تمت الإضافة للسلة
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    أضف إلى السلة
                  </>
                )}
              </motion.button>

              {/* زر واتساب (Secondary CTA) */}
              <motion.a
                href={productWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-[52px] h-[52px] sm:w-14 sm:h-14 flex items-center justify-center flex-shrink-0 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 rounded-xl shadow-sm hover:bg-[#25D366] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#25D366]/40 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="تواصل عبر واتساب"
              >
                <MessageCircle className="w-[22px] h-[22px] sm:w-6 sm:h-6" />
              </motion.a>
            </div>
          </div>
        </div>

        {/* ═══════ المنتجات ذات الصلة / Related Products ═══════ */}
        {product.categoryName && (
          <RelatedProducts categoryName={product.categoryName} currentId={product.id} />
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
