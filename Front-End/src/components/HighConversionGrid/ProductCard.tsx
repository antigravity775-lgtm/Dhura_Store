import React, { useState } from 'react';
import { Star, Plus, Heart } from 'lucide-react';

/**
 * EN: Import Cloudinary URL optimizer as a safety net.
 *     Images should already be optimized in mapToProduct(), but this
 *     catches any cases where raw URLs slip through.
 * AR: استيراد مُحسّن روابط Cloudinary كطبقة أمان.
 *     الصور يجب أن تكون محسّنة بالفعل في mapToProduct()، لكن هذا
 *     يلتقط أي حالات تمر فيها روابط خام.
 */
import { getOptimizedImageUrl } from '../../utils/cloudinaryUrl';

export interface Product {
  id: string | number;
  title: string;
  image: string;
  price: number;
  currencySymbol?: string;
  originalPrice?: number;
  rating: number; // 0-5
  reviewCount: number;
  badge?: 'Sale' | 'Local' | null;
  isFavorite?: boolean;
  isPromoted?: boolean;
  discountPrice?: number;
  promotionLabel?: string;
}

interface ProductCardProps {
  product?: Product;
  isLoading?: boolean;
  onQuickAdd?: (product: Product) => void;
  onClick?: (product: Product) => void;
  onFavorite?: (product: Product, isFavorite: boolean) => void;
}

/**
 * EN: React.memo prevents this component from re-rendering when the parent
 *     re-renders but the props haven't changed. This is critical for the
 *     "Load More" pattern — when new products are appended, existing cards
 *     should NOT re-render.
 * 
 * AR: React.memo يمنع إعادة رسم هذا المكون عندما يُعاد رسم الأب
 *     لكن الخصائص لم تتغير. هذا حرج لنمط "تحميل المزيد" — عند إضافة
 *     منتجات جديدة، البطاقات الموجودة يجب ألا تُعاد رسمها.
 */
export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  isLoading = false,
  onQuickAdd,
  onClick,
  onFavorite
}) => {
  const [isFavoriteLocal, setIsFavoriteLocal] = useState(product?.isFavorite ?? false);

  React.useEffect(() => {
    if (product?.isFavorite !== undefined) {
      setIsFavoriteLocal(product.isFavorite);
    }
  }, [product?.isFavorite]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavoriteLocal;
    setIsFavoriteLocal(newState);
    if (product) {
      onFavorite?.(product, newState);
    }
  };
  // Skeleton Loading State
  if (isLoading || !product) {
    return (
      <div className="flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 p-3 h-full animate-pulse">
        {/* Skeleton Image */}
        <div className="aspect-square bg-gray-200 dark:bg-slate-700 rounded-lg w-full mb-3" />

        {/* Skeleton Title (2 lines) */}
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-3/4 mb-3" />

        {/* Skeleton Rating */}
        <div className="flex gap-1 mb-3 items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 dark:bg-slate-700 rounded-full" />
          ))}
          <div className="w-8 h-3 bg-gray-200 dark:bg-slate-700 rounded ml-2" />
        </div>

        {/* Skeleton Price & Button */}
        <div className="mt-auto flex justify-between items-end pt-2">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-10" />
            <div className="h-6 bg-gray-200 dark:bg-slate-700 rounded w-16" />
          </div>
          <div className="w-9 h-9 bg-gray-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>
    );
  }

  const { title, image, price, currencySymbol = '$', originalPrice, rating, reviewCount, badge, isPromoted, discountPrice, promotionLabel } = product;
  const numPrice = Number(price) || 0;
  const numDiscountPrice = (discountPrice !== undefined && discountPrice !== null && String(discountPrice) !== '') ? Number(discountPrice) : null;
  const numOriginalPrice = (originalPrice !== undefined && originalPrice !== null) ? Number(originalPrice) : null;

  const hasDiscount = numDiscountPrice !== null && !isNaN(numDiscountPrice);
  const displayPrice = hasDiscount ? numDiscountPrice : numPrice;
  const discountPercentage = hasDiscount 
    ? Math.round(((numPrice - numDiscountPrice) / numPrice) * 100) 
    : (numOriginalPrice ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100) : 0);
  const hasPromoRibbon = isPromoted || !!promotionLabel;

  // Split price into whole and fractional parts for Amazon-style prominent display
  const priceWhole = Math.floor(displayPrice);
  const priceFraction = (displayPrice % 1).toFixed(2).substring(2);

  return (
    <div
      dir="ltr"
      className={`group flex flex-col bg-white dark:bg-[#1A1510]/50 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] border p-3 h-full transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] cursor-pointer ${
        isPromoted
          ? 'border-dhura-300 dark:border-dhura-600 ring-2 ring-dhura-400/30 dark:ring-dhura-500/20'
          : 'border-gray-100/60 dark:border-dhura-900'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      onClick={() => onClick?.(product)}
    >
      {/* Image Container with Badge */}
      <div className="relative aspect-[4/5] w-full mb-3 bg-white dark:bg-[#1A1510] rounded-xl overflow-hidden flex items-center justify-center border border-gray-50 dark:border-dhura-900/50">
        <img
          src={getOptimizedImageUrl(image, 400)}
          alt={title}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Absolute Banner/Badge */}
        {badge && !hasPromoRibbon && (
          <div className="absolute top-0 left-0 z-10 w-full flex justify-start pointer-events-none">
            <span className={`px-2.5 py-1 text-[10px] sm:text-xs font-bold tracking-wide text-white rounded-br-xl shadow-sm ${badge === 'Sale' ? 'bg-gradient-to-r from-orange-500 to-amber-500' : 'bg-gradient-to-r from-teal-500 to-emerald-500'
              }`}>
              {badge === 'Sale' ? 'تخفيض' : badge === 'Local' ? 'محلي' : badge}
            </span>
          </div>
        )}

        {/* Promotion Ribbon — Glassmorphism */}
        {hasPromoRibbon && (
          <div className="absolute top-0 left-0 z-10 w-full flex justify-start pointer-events-none">
            <span className="px-2.5 py-1 text-[10px] sm:text-xs font-bold text-white rounded-br-xl shadow-lg bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-500/90 backdrop-blur-md border-b border-r border-white/20">
              {promotionLabel || '⭐ مميز'}
            </span>
          </div>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
            <span className="px-2 py-0.5 text-[10px] sm:text-[11px] font-bold text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-md shadow-md">
              -{discountPercentage}%
            </span>
          </div>
        )}

        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 shadow-sm backdrop-blur-sm transition-all duration-200"
          aria-label={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            size={16} 
            className={isFavoriteLocal ? 'fill-red-500 text-red-500' : ''} 
          />
        </button>
      </div>

      <div className="flex flex-col flex-grow">
        {/* Title: Truncated to 2 lines */}
        <h3
          className="text-[13px] sm:text-sm font-medium text-gray-900 dark:text-slate-100 line-clamp-2 leading-snug mb-1.5 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors"
          title={title}
        >
          {title}
        </h3>

        {/* 5-Star Rating Component & Review Count */}
        <div className="flex items-center gap-1.5 mb-2.5">
          <div className="flex items-center space-x-[2px] rtl:space-x-reverse">
            {Array.from({ length: 5 }).map((_, i) => {
              const isFilled = i < Math.floor(rating);
              const isHalf = !isFilled && i < rating;

              return (
                <div key={i} className="relative w-[12px] h-[12px] sm:w-[14px] sm:h-[14px]">
                  <Star className="w-full h-full text-gray-200 dark:text-slate-600 absolute" />
                  {(isFilled || isHalf) && (
                    <div className={`absolute top-0 left-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}>
                      <Star className="w-full h-full text-amber-400 fill-amber-400" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-amber-400">
              {Number(rating).toFixed(1)}/5
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
              ({reviewCount.toLocaleString()})
            </span>
          </div>
        </div>

        {/* Pricing Layout & Quick Add Action */}
        <div className="mt-auto flex items-end justify-between relative pt-2">
          <div className="flex flex-col">
            {/* Discount pricing: show original with strikethrough */}
            {hasDiscount && (
              <div className="flex items-center text-[11px] mb-0.5 space-x-1.5">
                <span className="text-gray-400 dark:text-slate-500 line-through">
                  {numPrice.toFixed(2)} {currencySymbol}
                </span>
              </div>
            )}
            {/* Legacy Sale badge pricing */}
            {!hasDiscount && badge === 'Sale' && numOriginalPrice !== null && (
              <div className="flex items-center text-[11px] mb-0.5 space-x-1.5">
                <span className="text-[#CC0C39] font-medium bg-red-50 px-1 py-0.5 rounded-sm whitespace-nowrap">
                  {discountPercentage}% off
                </span>
                <span className="text-gray-500 line-through">
                  {numOriginalPrice.toFixed(2)} {currencySymbol}
                </span>
              </div>
            )}

            {/* Prominent Price Display */}
            <div className={`flex items-start leading-none ${
              hasDiscount ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-slate-100'
            }`}>
              <span className="text-xs font-semibold mt-[2px] ml-1">{currencySymbol}</span>
              <span className="text-xl sm:text-2xl font-bold">{priceWhole}</span>
              <span className="text-xs font-semibold mt-[2px]">.{priceFraction}</span>
            </div>
          </div>

          {/* Quick Add Button in Thumb Zone */}
          <button
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering parent card click
              onQuickAdd?.(product);
            }}
            aria-label={`Quick add ${title} to cart`}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-50 dark:bg-indigo-900/40 text-blue-600 dark:text-indigo-400 hover:bg-blue-600 dark:hover:bg-indigo-600 hover:text-white transition-all duration-200 active:scale-90 flex-shrink-0 shadow-sm"
          >
            <Plus size={20} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
});

// EN: Display name for React DevTools debugging
// AR: اسم العرض لتصحيح أخطاء React DevTools
ProductCard.displayName = 'ProductCard';
