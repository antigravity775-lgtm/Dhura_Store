import React, { useState, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
  ShoppingCart,
  MessageCircle,
  Minus,
  Plus,
  ChevronDown,
  Truck,
  ShieldCheck,
  Star,
} from "lucide-react";
import Layout from "../components/Layout";
import SEO from "../components/SEO";
import Breadcrumbs from "../components/Breadcrumbs";
import RelatedProducts from "../components/RelatedProducts";
import BannerRenderer from "../components/BannerRenderer";
import * as api from "../services/api";
import { getOptimizedImageUrl, getRawCloudinaryUrl, IMAGE_WIDTHS } from "../utils/cloudinaryUrl";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { buildProductSchema } from "../utils/structuredData";
import { trackViewItem, trackAddToCart } from "../utils/analytics";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function formatPrice(price, currency) {
  const num = Number(price) || 0;
  const formatted = num >= 1000 ? num.toLocaleString("en-US") : num.toString();
  const symbol = api.CurrencySymbol[currency] || "ريال";
  return `${formatted} ${symbol}`;
}

function getVariantLabel(variant) {
  return variant.attributes?.map((a) => a.value).join(" - ") || variant.sku || "متغير";
}

function ProductSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 animate-pulse">
      <div className="hidden md:block w-48 h-3 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
      <div className="flex flex-col lg:flex-row gap-5 lg:gap-8">
        <div className="w-full lg:w-[52%] aspect-square bg-slate-200 dark:bg-slate-700 rounded-xl" />
        <div className="w-full lg:w-[48%] space-y-3">
          <div className="h-7 w-3/4 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-4 w-1/3 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-10 w-1/2 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl mt-4" />
        </div>
      </div>
    </div>
  );
}

function CompactStarRating({ rating, reviewCount, onReviewsClick }) {
  const numRating = Number(rating) || 0;
  const full = Math.floor(numRating);
  return (
    <button
      type="button"
      onClick={onReviewsClick}
      className="inline-flex items-center gap-1.5 text-right hover:opacity-80 transition-opacity"
      aria-label="الانتقال إلى التقييمات"
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`w-3.5 h-3.5 ${i <= full ? "text-gold-400 fill-gold-400" : "text-slate-300 dark:text-slate-600"}`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{numRating.toFixed(1)}</span>
      {reviewCount > 0 && (
        <span className="text-xs text-slate-400">({Number(reviewCount).toLocaleString()} تقييم)</span>
      )}
    </button>
  );
}

function AccordionSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  if (!children) return null;
  return (
    <div className="border-b border-slate-200/80 dark:border-slate-700/80">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-3.5 text-right"
      >
        <span className="text-sm font-bold text-slate-900 dark:text-white">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{children}</div>}
    </div>
  );
}

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
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const reviewsRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [storeInfo, setStoreInfo] = useState(null);
  const [errorType, setErrorType] = useState(null);
  const [brokenGalleryUrls, setBrokenGalleryUrls] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setErrorType(null);
    setAddedToCart(false);
    setSelectedImageIndex(0);
    setBrokenGalleryUrls(new Set());
    setQuantity(1);

    async function load() {
      try {
        let data;
        if (UUID_REGEX.test(slug)) {
          data = await api.getProductById(slug);
          if (data?.slug && mounted) {
            navigate(`/product/${data.slug}`, { replace: true });
            return;
          }
        } else {
          data = await api.getProductBySlug(slug);
        }
        if (mounted) {
          setProduct(data);
          if (data.hasVariants && data.variants?.length > 0) {
            setSelectedVariantId(data.variants[0].id);
          }
          setLoading(false);
          trackViewItem(data);
        }
      } catch (err) {
        const is404 = err.message?.includes("404") || err.status === 404;
        if (mounted) {
          setNotFound(true);
          setErrorType(is404 ? "not_found" : "server_error");
          setLoading(false);
        }
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug, navigate]);

  useEffect(() => {
    let mounted = true;
    api.getStoreInfo().then((info) => { if (mounted) setStoreInfo(info); }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const selectedVariant = useMemo(() => {
    if (!product?.hasVariants || !product.variants) return null;
    return product.variants.find((v) => v.id === selectedVariantId) || null;
  }, [product, selectedVariantId]);

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : Number(product?.price || 0);
  const displayDiscount = selectedVariant
    ? (selectedVariant.discountPrice ? Number(selectedVariant.discountPrice) : null)
    : (product?.discountPrice ? Number(product.discountPrice) : null);
  const displayStock = selectedVariant ? selectedVariant.stockQuantity : (product?.stockQuantity || 0);
  const finalPrice = displayDiscount ?? displayPrice;
  const hasDiscount = displayDiscount !== null && displayDiscount < displayPrice;
  const discountPercent = hasDiscount ? Math.round(((displayPrice - displayDiscount) / displayPrice) * 100) : 0;
  const savingsAmount = hasDiscount ? displayPrice - displayDiscount : 0;

  const reviews = product?.reviews || [];
  const reviewCount = reviews.length > 0 ? reviews.length : (product?.reviewCount ?? 0);
  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : (product?.rating ?? (reviewCount > 0 ? 4 : 0));

  const buildCartProduct = () => {
    if (!product) return null;
    if (product.hasVariants && selectedVariant) {
      const label = getVariantLabel(selectedVariant);
      return {
        ...product,
        id: `${product.id}::${selectedVariant.id}`,
        price: selectedVariant.price,
        discountPrice: selectedVariant.discountPrice,
        stockQuantity: selectedVariant.stockQuantity,
        title: `${product.title} (${label})`,
        imageUrl: product.imageUrl,
        mainImageUrl: product.mainImageUrl,
      };
    }
    return product;
  };

  const handleAddToCart = () => {
    const cartProduct = buildCartProduct();
    if (!cartProduct || displayStock <= 0) return;
    addToCart(cartProduct, quantity);
    trackAddToCart(cartProduct, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.title || "متجر طيب",
      text: `شاهد هذا المنتج: ${product?.title}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ الرابط!");
      }
    } catch { /* cancelled */ }
  };

  const whatsappMessage = `مرحباً! أنا مهتم بالمنتج: ${product?.title || ""}\nالرابط: ${window.location.href}`;
  const formattedContactPhone = useMemo(() => {
    const digits = (storeInfo?.contactPhone || "").replace(/\D/g, "");
    if (!digits) return "";
    return digits.startsWith("967") ? digits : `967${digits}`;
  }, [storeInfo?.contactPhone]);

  const productWhatsAppUrl = useMemo(() => {
    const link = (storeInfo?.whatsappUrl || "").trim();
    let base = "";
    if (link && !link.includes("chat.whatsapp.com")) {
      base = link.startsWith("http") ? link : `https://${link}`;
    } else if (formattedContactPhone) {
      base = `https://wa.me/${formattedContactPhone}`;
    }
    if (!base) return "";
    try {
      const url = new URL(base);
      url.searchParams.set("text", whatsappMessage);
      return url.toString();
    } catch {
      return `${base}?text=${encodeURIComponent(whatsappMessage)}`;
    }
  }, [storeInfo?.whatsappUrl, formattedContactPhone, whatsappMessage]);

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return <Layout><ProductSkeleton /></Layout>;
  }

  if (notFound) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
            {errorType === "server_error" ? "خطأ في الاتصال" : "المنتج غير موجود"}
          </h2>
          <button
            type="button"
            onClick={() => (errorType === "server_error" ? window.location.reload() : navigate("/"))}
            className="mt-4 px-6 py-2.5 bg-gold-600 text-white font-bold rounded-xl text-sm"
          >
            {errorType === "server_error" ? "إعادة المحاولة" : "العودة للرئيسية"}
          </button>
        </div>
      </Layout>
    );
  }

  const galleryImages = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : (product.imageUrl ? [product.imageUrl] : ["https://images.unsplash.com/photo-1560472355-536de3962603?w=1000&q=80"]);

  const safeIndex = Math.min(selectedImageIndex, galleryImages.length - 1);
  const activeImageRawUrl = galleryImages[safeIndex];
  const activeImageUrl = brokenGalleryUrls.has(activeImageRawUrl)
    ? getRawCloudinaryUrl(activeImageRawUrl)
    : getOptimizedImageUrl(activeImageRawUrl, IMAGE_WIDTHS.DETAIL);

  const handleGalleryImageError = (url) => {
    setBrokenGalleryUrls((prev) => {
      if (prev.has(url)) return prev;
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  const getGalleryThumbUrl = (url) => (
    brokenGalleryUrls.has(url)
      ? getRawCloudinaryUrl(url)
      : getOptimizedImageUrl(url, 120)
  );
  const productSchema = buildProductSchema(product);
  const categorySlug = product.category?.slug || product.categoryName;
  const breadcrumbItems = [
    { name: "الرئيسية", url: "/" },
    { name: "الفئات", url: "/categories" },
    ...(product.categoryName ? [{ name: product.categoryName, url: `/category/${encodeURIComponent(categorySlug)}` }] : []),
    { name: product.title },
  ];

  const trustItems = [
    storeInfo?.shippingOfferText ? { icon: Truck, text: storeInfo.shippingOfferText } : null,
    productWhatsAppUrl ? { icon: MessageCircle, text: "دعم سريع عبر واتساب" } : null,
    displayStock > 0 ? { icon: ShieldCheck, text: "متوفر للطلب" } : null,
  ].filter(Boolean);

  const descPreview = product.description?.length > 180 && !descExpanded
    ? `${product.description.slice(0, 180).trim()}...`
    : product.description;

  const purchaseBlock = (
    <div className="flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-2">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-snug flex-1">
          {product.title}
        </h1>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            type="button"
            onClick={() => toggleFavorite(product)}
            className={`p-2 rounded-lg border transition-colors ${
              isFavorite(product.id)
                ? "border-rose-200 text-rose-500 bg-rose-50 dark:bg-rose-900/20"
                : "border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500"
            }`}
            aria-label="المفضلة"
          >
            <Heart className="w-4 h-4" fill={isFavorite(product.id) ? "currentColor" : "none"} />
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-gold-600 transition-colors"
            aria-label="مشاركة"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {(reviewCount > 0 || avgRating > 0) && (
        <div className="mb-3">
          <CompactStarRating rating={avgRating} reviewCount={reviewCount} onReviewsClick={scrollToReviews} />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {hasDiscount && (
          <span className="px-2 py-0.5 text-[11px] font-bold text-white bg-rose-500 rounded-md">
            خصم {discountPercent}%
          </span>
        )}
        {displayStock > 0 ? (
          <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-md border border-emerald-200/60 dark:border-emerald-800/40">
            متوفر
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[11px] font-semibold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md">
            نفد المخزون
          </span>
        )}
        {product.isPromoted && (
          <span className="px-2 py-0.5 text-[11px] font-semibold text-gold-700 dark:text-gold-300 bg-gold-50 dark:bg-gold-900/20 rounded-md">
            منتج مميز
          </span>
        )}
      </div>

      <div className="mb-5">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {formatPrice(finalPrice, product.currency)}
        </div>
        {hasDiscount && (
          <>
            <div className="text-sm text-slate-400 line-through mt-0.5">
              {formatPrice(displayPrice, product.currency)}
            </div>
            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
              وفر {formatPrice(savingsAmount, product.currency)}
            </div>
          </>
        )}
        {!hasDiscount && product.hasVariants && (
          <p className="text-xs text-slate-500 mt-1">يبدأ من هذا السعر</p>
        )}
      </div>

      {product.hasVariants && product.variants?.length > 0 && (
        <div className="mb-4">
          <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">الخيارات</p>
          <p className="text-xs text-slate-500 mb-2">اختر الخيار المناسب</p>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((variant) => {
              const label = getVariantLabel(variant);
              const isSelected = selectedVariantId === variant.id;
              const isOutOfStock = variant.stockQuantity <= 0;
              const vPrice = variant.discountPrice ?? variant.price;
              return (
                <button
                  key={variant.id}
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-bold border transition-all ${
                    isSelected
                      ? "border-gold-500 bg-gold-50 dark:bg-gold-900/30 text-gold-800 dark:text-gold-200"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-gold-300"
                  } ${isOutOfStock ? "opacity-50 line-through" : ""}`}
                >
                  {label}
                  <span className="block text-[10px] font-medium opacity-70 mt-0.5">
                    {formatPrice(vPrice, product.currency)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="mb-5">
        <p className="text-sm font-bold text-slate-900 dark:text-white mb-2">الكمية</p>
        <div className="inline-flex items-center border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800"
            aria-label="تقليل الكمية"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(displayStock || 999, q + 1))}
            disabled={quantity >= displayStock}
            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40"
            aria-label="زيادة الكمية"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 mb-4 lg:hidden">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={displayStock <= 0 || addedToCart}
          className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            addedToCart
              ? "bg-emerald-600 text-white"
              : displayStock <= 0
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gold-600 text-white"
          }`}
        >
          {addedToCart ? <><Check className="w-5 h-5" /> تمت الإضافة للسلة</> : <><ShoppingCart className="w-5 h-5" /> أضف إلى السلة</>}
        </button>
        {productWhatsAppUrl && (
          <a
            href={productWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-[#25D366]/30 text-[#25D366]"
          >
            <MessageCircle className="w-4 h-4" />
            اطلب الآن
          </a>
        )}
      </div>

      <div className="hidden lg:flex flex-col gap-2.5 mb-4">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={displayStock <= 0 || addedToCart}
          className={`w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            addedToCart
              ? "bg-emerald-600 text-white"
              : displayStock <= 0
                ? "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                : "bg-gold-600 hover:bg-gold-500 text-white shadow-md shadow-gold-600/20"
          }`}
        >
          {addedToCart ? <><Check className="w-5 h-5" /> تمت الإضافة</> : <><ShoppingCart className="w-5 h-5" /> أضف إلى السلة</>}
        </button>
        {productWhatsAppUrl && (
          <a
            href={productWhatsAppUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            اطلب الآن
          </a>
        )}
      </div>

      {trustItems.length > 0 && (
        <div className="space-y-2 pt-1">
          {trustItems.map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
              <Icon className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      )}

      <div className="hidden lg:block mt-4">
        <BannerRenderer placement="sidebar" className="w-full" />
      </div>
    </div>
  );

  const galleryBlock = (
    <div className="w-full">
      <div className="relative aspect-square rounded-xl overflow-hidden bg-bone-100 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70">
        <img
          src={activeImageUrl}
          alt={product.title}
          className="w-full h-full object-contain p-3 sm:p-4"
          fetchPriority="high"
          onError={() => handleGalleryImageError(activeImageRawUrl)}
        />
        {galleryImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => setSelectedImageIndex((i) => (i - 1 + galleryImages.length) % galleryImages.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-slate-900/80 rounded-full flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-700"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setSelectedImageIndex((i) => (i + 1) % galleryImages.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-slate-900/80 rounded-full flex items-center justify-center shadow-sm border border-slate-200/80 dark:border-slate-700"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {galleryImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`rounded-full transition-all ${idx === safeIndex ? "w-4 h-1.5 bg-gold-500" : "w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600"}`}
                  aria-label={`صورة ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
      {galleryImages.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto scrollbar-hide">
          {galleryImages.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedImageIndex(idx)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                idx === safeIndex ? "border-gold-400" : "border-slate-200 dark:border-slate-700 opacity-70"
              }`}
            >
              <img
                src={getGalleryThumbUrl(url)}
                alt=""
                className="w-full h-full object-contain bg-bone-50 dark:bg-slate-800 p-1"
                onError={() => handleGalleryImageError(url)}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <SEO
        title={product.title}
        description={product.description?.substring(0, 160) || `تسوق ${product.title} على متجر طيب.`}
        image={galleryImages[0]}
        type="product"
        canonicalPath={`/product/${product.slug}`}
        jsonLd={[productSchema]}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 pb-28 lg:pb-12">
        <Breadcrumbs compact items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-5 lg:gap-8 lg:items-start">
          <div className="w-full lg:w-[52%] order-1 lg:order-2">{galleryBlock}</div>
          <div className="w-full lg:w-[48%] order-2 lg:order-1">{purchaseBlock}</div>
        </div>

        <div className="mt-8 lg:mt-10 max-w-3xl">
          {product.description && (
            <div className="mb-6">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-2 pb-2 border-b border-slate-200 dark:border-slate-700">
                الوصف
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {descPreview}
              </p>
              {product.description.length > 180 && (
                <button
                  type="button"
                  onClick={() => setDescExpanded((v) => !v)}
                  className="mt-2 text-xs font-bold text-gold-600 dark:text-gold-400 hover:underline"
                >
                  {descExpanded ? "عرض أقل" : "عرض المزيد"}
                </button>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white/50 dark:bg-slate-900/30 px-4">
            {product.attributes?.length > 0 && (
              <AccordionSection title="المواصفات">
                <div className="space-y-2">
                  {product.attributes.map((attr, idx) => {
                    const attrName = attr.categoryAttribute?.name || "مواصفة";
                    let displayValue = attr.value;
                    if (attr.categoryAttribute?.type === "BOOLEAN") {
                      displayValue = attr.value === "true" || attr.value === "1" ? "نعم" : "لا";
                    } else if (attr.categoryAttribute?.type === "MULTI_SELECT") {
                      displayValue = attr.value.split(",").join("، ");
                    }
                    return (
                      <div key={attr.id || idx} className="flex justify-between gap-4 text-xs sm:text-sm py-1 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <span className="text-slate-500">{attrName}</span>
                        <span className="font-medium text-slate-800 dark:text-slate-200 text-left" dir="auto">{displayValue}</span>
                      </div>
                    );
                  })}
                </div>
              </AccordionSection>
            )}
            {storeInfo?.shippingOfferText && (
              <AccordionSection title="الشحن والتوصيل">{storeInfo.shippingOfferText}</AccordionSection>
            )}
          </div>

          {(reviews.length > 0 || reviewCount > 0) && (
            <section ref={reviewsRef} className="mt-8" id="reviews">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3">التقييمات</h2>
              <div className="mb-4">
                <CompactStarRating rating={avgRating} reviewCount={reviewCount} onReviewsClick={() => {}} />
              </div>
              {reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 bg-white dark:bg-slate-800/50">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {review.user?.fullName || "عميل"}
                        </span>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star key={i} className={`w-3 h-3 ${i <= review.rating ? "text-gold-400 fill-gold-400" : "text-slate-300"}`} />
                          ))}
                        </div>
                      </div>
                      {review.title && <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">{review.title}</p>}
                      {review.body && <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{review.body}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">لا توجد تقييمات مكتوبة بعد.</p>
              )}
            </section>
          )}
        </div>

        <BannerRenderer placement="product" className="mt-8" />

        {product.categoryName && (
          <div className="mt-8">
            <RelatedProducts categoryName={product.categoryName} currentId={product.id} />
          </div>
        )}
      </div>

      <div
        className="lg:hidden fixed inset-x-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 px-3 py-2.5"
        style={{ bottom: "calc(3.5rem + env(safe-area-inset-bottom))" }}
      >
        <div className="flex items-center gap-3 max-w-6xl mx-auto">
          <div className="flex-1 min-w-0">
            <p className="text-base font-black text-slate-900 dark:text-white truncate">
              {formatPrice(finalPrice, product.currency)}
            </p>
            {hasDiscount && (
              <p className="text-[10px] text-slate-400 line-through">{formatPrice(displayPrice, product.currency)}</p>
            )}
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={displayStock <= 0 || addedToCart}
            className={`flex-shrink-0 h-11 px-5 rounded-xl font-bold text-sm flex items-center gap-2 ${
              addedToCart
                ? "bg-emerald-600 text-white"
                : displayStock <= 0
                  ? "bg-slate-200 text-slate-400"
                  : "bg-gold-600 text-white"
            }`}
          >
            {addedToCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
            {addedToCart ? "تمت الإضافة" : "أضف للسلة"}
          </button>
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
