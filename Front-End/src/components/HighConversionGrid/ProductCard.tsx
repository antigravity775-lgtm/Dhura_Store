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
      <div className="flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full animate-pulse">
        {/* Skeleton Image */}
        <div className="aspect-square bg-gray-200 rounded-lg w-full mb-3" />

        {/* Skeleton Title (2 lines) */}
        <div className="h-4 bg-gray-200 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />

        {/* Skeleton Rating */}
        <div className="flex gap-1 mb-3 items-center">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
          ))}
          <div className="w-8 h-3 bg-gray-200 rounded ml-2" />
        </div>

        {/* Skeleton Price & Button */}
        <div className="mt-auto flex justify-between items-end pt-2">
          <div className="space-y-1">
            <div className="h-3 bg-gray-200 rounded w-10" />
            <div className="h-6 bg-gray-200 rounded w-16" />
          </div>
          <div className="w-9 h-9 bg-gray-200 rounded-full" />
        </div>
      </div>
    );
  }

  const { title, image, price, currencySymbol = '$', originalPrice, rating, reviewCount, badge } = product;
  const discountPercentage = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // Split price into whole and fractional parts for Amazon-style prominent display
  const priceWhole = Math.floor(price);
  const priceFraction = (price % 1).toFixed(2).substring(2);

  return (
    <div
      dir="ltr"
      className="group flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 p-3 h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] cursor-pointer"
      role="button"
      tabIndex={0}
      aria-label={`View details for ${title}`}
      onClick={() => onClick?.(product)}
    >
      {/* Image Container with Badge */}
      <div className="relative aspect-square w-full mb-3 bg-white rounded-lg overflow-hidden flex items-center justify-center border border-gray-50">
        <img
          src={getOptimizedImageUrl(image, 400)}
          alt={title}
          className="w-full h-full object-contain p-2 mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Absolute Banner/Badge */}
        {badge && (
          <div className="absolute top-0 left-0 z-10 w-full flex justify-start pointer-events-none">
            <span className={`px-2 py-1 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-white rounded-br-lg shadow-sm ${badge === 'Sale' ? 'bg-[#CC0C39]' : 'bg-emerald-600'
              }`}>
              {badge}
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
          className="text-[13px] sm:text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1.5 group-hover:text-amber-700 transition-colors"
          title={title}
        >
          {title}
        </h3>

        {/* 5-Star Rating Component & Review Count */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center space-x-[2px]">
            {Array.from({ length: 5 }).map((_, i) => {
              const isFilled = i < Math.floor(rating);
              const isHalf = !isFilled && i < rating;

              return (
                <div key={i} className="relative w-[14px] h-[14px]">
                  <Star className="w-[14px] h-[14px] text-gray-300 absolute" />
                  {(isFilled || isHalf) && (
                    <div className={`absolute top-0 left-0 overflow-hidden ${isHalf ? 'w-1/2' : 'w-full'}`}>
                      <Star className="w-[14px] h-[14px] text-[#FFA41C] fill-[#FFA41C]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-[11px] sm:text-xs text-blue-600 hover:underline hover:text-amber-700 cursor-pointer ml-1">
            {reviewCount.toLocaleString()}
          </span>
        </div>

        {/* Pricing Layout & Quick Add Action */}
        <div className="mt-auto flex items-end justify-between relative pt-2">
          <div className="flex flex-col">
            {/* Crossed-out original price & savings pill */}
            {badge === 'Sale' && originalPrice && (
              <div className="flex items-center text-[11px] mb-0.5 space-x-1.5">
                <span className="text-[#CC0C39] font-medium bg-red-50 px-1 py-0.5 rounded-sm whitespace-nowrap">
                  {discountPercentage}% off
                </span>
                <span className="text-gray-500 line-through">
                  {originalPrice.toFixed(2)} {currencySymbol}
                </span>
              </div>
            )}

            {/* Prominent Price Display */}
            <div className="flex items-start text-gray-900 leading-none">
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
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all duration-200 active:scale-90 flex-shrink-0 shadow-sm"
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
