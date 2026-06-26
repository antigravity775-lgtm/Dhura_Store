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
import RelatedProducts from "../components/RelatedProducts";
import * as api from "../services/api";
import { getOptimizedImageUrl, IMAGE_WIDTHS } from "../utils/cloudinaryUrl";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";


// Fallback database for when API is down
const fallbackDB = {
  1: {
    id: 1,
    title: "انفرتر طاقة شمسية Growatt 5kW برو",
    price: 950000,
    currency: 1,
    condition: 1,
    categoryName: "الطاقة الشمسية",
    description: "انفرتر طاقة شمسية عالي الكفاءة...",
    mainImageUrl:
      "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1000&q=80",
  },
  2: {
    id: 2,
    title: "ماك بوك برو M2 شاشة 14 انش",
    price: 1850,
    currency: 3,
    condition: 2,
    categoryName: "لابتوبات",
    description: "ماك بوك برو 14 انش بمعالج M2...",
    mainImageUrl:
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&q=80",
  },
  3: {
    id: 3,
    title: "آيفون 15 برو ماكس 256 جيجا",
    price: 1100,
    currency: 3,
    condition: 1,
    categoryName: "هواتف",
    description: "آيفون 15 برو ماكس الجديد كلياً...",
    mainImageUrl:
      "https://images.unsplash.com/photo-1695048132961-0eab789a421b?w=1000&q=80",
  },
};

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
              ? 'text-agate-400 fill-agate-400'
              : i === full + 1 && half
                ? 'text-agate-400 fill-agate-200'
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
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);

  const [errorType, setErrorType] = useState(null); // 'not_found' or 'server_error'

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setErrorType(null);
    setAddedToCart(false);

    async function load() {
      try {
        const data = await api.getProductById(id);
        if (mounted) {
          setProduct(data);
          setLoading(false);
        }
      } catch (err) {
        // Check if the error is a 404
        const is404 = err.message?.includes('404');

        // Try fallback
        const fb = fallbackDB[id];
        if (fb && mounted) {
          setProduct(fb);
          setLoading(false);
        } else if (mounted) {
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
  }, [id]);

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

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.title || "متجر طِيب",
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
          }} className="px-8 py-3.5 bg-agate-600 text-white font-bold rounded-2xl hover:bg-agate-700 transition-all shadow-lg shadow-agate-200 dark:shadow-none active:scale-95">
            {errorType === 'server_error' ? 'إعادة المحاولة' : 'العودة للصفحة الرئيسية'}
          </button>
        </div>
      </Layout>
    );
  }

  const conditionText = api.ConditionMap[product.condition] || "جديد";
  const rawImageUrl =
    product.mainImageUrl ||
    "https://images.unsplash.com/photo-1560472355-536de3962603?w=1000&q=80";
  const imageUrl = getOptimizedImageUrl(rawImageUrl, IMAGE_WIDTHS.DETAIL);

  return (
    <Layout>
      <SEO
        title={product.title}
        description={product.description?.substring(0, 160) || `تسوق ${product.title} بأفضل الأسعار على متجر طيب.`}
        image={imageUrl}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-12 w-full">
        {/* زر الرجوع */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-agate-600 transition-colors mb-8 group font-medium text-sm focus:outline-none"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          العودة للمنتجات
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
          {/* ========== العمود الأيمن: الصورة ========== */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4 select-none">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm">
              <img
                src={imageUrl}
                alt={product.title}
                width="800"
                height="600"
                fetchpriority="high"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ========== العمود الأيسر: تفاصيل المنتج ========== */}
          <div className="w-full lg:w-[45%] flex flex-col">
            {/* شارات المعلومات */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${product.condition === 1
                  ? "bg-agate-100 dark:bg-agate-900/40 text-agate-700 dark:text-agate-300 border border-agate-200 dark:border-agate-700"
                  : "bg-agate-50 dark:bg-agate-900/30 text-agate-700 dark:text-agate-300 border border-agate-200 dark:border-agate-700"
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
              {product.stockQuantity > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-700">
                  متوفر ({product.stockQuantity})
                </span>
              )}
              {product.isPromoted && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-agate-500 to-purple-500 text-white shadow-md shadow-agate-500/20">
                  ⭐ منتج مميز
                </span>
              )}
              {product.promotionLabel && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-agate-50 dark:bg-agate-900/30 text-agate-700 dark:text-agate-300 border border-agate-200 dark:border-agate-700">
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
            {product.stockQuantity > 0 && product.stockQuantity <= 5 && (
              <div className="inline-flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-600 dark:text-red-400 rounded-xl px-3 py-1.5 text-xs font-bold mb-3 animate-pulse">
                <Zap className="w-3.5 h-3.5" />
                متبقي {product.stockQuantity} قطعة فقط!
              </div>
            )}
            {product.stockQuantity === 0 && (
              <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-xl px-3 py-1.5 text-xs font-bold mb-3">
                نفد المخزون
              </div>
            )}

            {/* السعر وأزرار الإجراء */}
            <div className="flex items-center justify-between mb-6">
              <div>
                {product.discountPrice ? (
                  <>
                    <div className="text-lg text-slate-400 dark:text-slate-500 line-through mb-1">
                      {formatPrice(product.price, product.currency)}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                        {formatPrice(
                          Number(product.discountPrice),
                          product.currency,
                        )}
                      </span>
                      <span className="px-2.5 py-1 text-sm font-bold text-white bg-red-500 rounded-lg shadow-sm">
                        -
                        {Math.round(
                          ((product.price - product.discountPrice) /
                            product.price) *
                          100,
                        )}
                        %
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-3xl sm:text-4xl font-black text-agate-600 dark:text-agate-400 tracking-tight">
                    {formatPrice(product.price, product.currency)}
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
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-agate-600 dark:hover:text-agate-400 hover:border-agate-200 dark:hover:border-agate-700 transition-all"
                  aria-label="مشاركة المنتج"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <hr className="border-slate-200/80 dark:border-slate-700 mb-6" />

            {/* الوصف */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-agate-500 rounded-full"></div>
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
                disabled={addedToCart}
                className={`flex-1 flex items-center justify-center gap-2 h-[52px] sm:h-14 rounded-xl font-extrabold text-[15px] sm:text-base shadow-lg transition-all ${addedToCart
                  ? "bg-emerald-500 text-white shadow-emerald-500/20"
                  : "bg-agate-600 text-white shadow-agate-600/20 hover:bg-agate-500"
                  } focus:outline-none focus:ring-4 focus:ring-agate-500/30`}
                whileHover={!addedToCart ? { scale: 1.01 } : {}}
                whileTap={!addedToCart ? { scale: 0.98 } : {}}
              >
                {addedToCart ? (
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
          <RelatedProducts categoryName={product.categoryName} currentId={id} />
        )}
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
