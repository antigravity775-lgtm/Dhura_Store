import React, { useState } from 'react';
import { Plus, Heart } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/cloudinaryUrl';

export interface Product {
  id: string | number;
  title: string;
  image: string;
  price: number;
  currencySymbol?: string;
  originalPrice?: number;
  rating: number;
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
  compact?: boolean;
  onQuickAdd?: (product: Product) => void;
  onClick?: (product: Product) => void;
  onFavorite?: (product: Product, isFavorite: boolean) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  isLoading = false,
  compact = false,
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

  if (isLoading || !product) {
    return (
      <div className={`flex flex-col bg-white dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700 h-full animate-pulse ${compact ? 'p-1.5' : 'p-2'}`}>
        <div className={`bg-gray-200 dark:bg-slate-700 rounded-md w-full mb-2 ${compact ? 'aspect-square' : 'aspect-square'}`} />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-full mb-1.5" />
        <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-2/3 mb-2" />
        <div className="mt-auto flex justify-between items-end">
          <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded w-14" />
          <div className="w-7 h-7 bg-gray-200 dark:bg-slate-700 rounded-md" />
        </div>
      </div>
    );
  }

  const { title, image, price, currencySymbol = 'ريال', originalPrice, badge, isPromoted, discountPrice, promotionLabel } = product;
  const numPrice = Number(price) || 0;
  const numDiscountPrice = (discountPrice !== undefined && discountPrice !== null && String(discountPrice) !== '') ? Number(discountPrice) : null;
  const numOriginalPrice = (originalPrice !== undefined && originalPrice !== null) ? Number(originalPrice) : null;

  const hasDiscount = numDiscountPrice !== null && !isNaN(numDiscountPrice);
  const displayPrice = hasDiscount ? numDiscountPrice : numPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((numPrice - numDiscountPrice) / numPrice) * 100)
    : (numOriginalPrice ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100) : 0);
  const hasPromoRibbon = isPromoted || !!promotionLabel;

  const paddingClass = compact ? 'p-1.5' : 'p-2';
  const titleClass = compact ? 'text-[11px] leading-snug mb-1' : 'text-xs sm:text-[13px] leading-snug mb-1';
  const priceWholeClass = compact ? 'text-sm font-bold' : 'text-base sm:text-lg font-bold';
  const addBtnClass = compact ? 'w-6 h-6' : 'w-7 h-7 sm:w-8 sm:h-8';
  const heartSize = compact ? 13 : 14;

  return (
    <div
      dir="ltr"
      className={`group flex flex-col bg-white dark:bg-slate-800/80 rounded-lg border h-full transition-all duration-200 hover:shadow-md active:scale-[0.98] cursor-pointer ${paddingClass} ${
        isPromoted
          ? 'border-gold-300/80 dark:border-gold-700 ring-1 ring-gold-400/20'
          : 'border-gray-100 dark:border-slate-700/80'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`عرض ${title}`}
      onClick={() => onClick?.(product)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(product); }}
    >
      <div className="relative aspect-square w-full mb-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-md overflow-hidden">
        <img
          src={getOptimizedImageUrl(image, compact ? 280 : 360)}
          alt={title}
          className="w-full h-full object-contain p-1 transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        {badge && !hasPromoRibbon && (
          <span className={`absolute top-0 left-0 z-10 px-1.5 py-0.5 text-[9px] font-bold text-white rounded-br-md ${
            badge === 'Sale' ? 'bg-orange-500' : 'bg-emerald-500'
          }`}>
            {badge === 'Sale' ? 'تخفيض' : 'محلي'}
          </span>
        )}

        {hasPromoRibbon && (
          <span className="absolute top-0 left-0 z-10 px-1.5 py-0.5 text-[9px] font-bold text-white rounded-br-md bg-gold-600">
            {promotionLabel || 'مميز'}
          </span>
        )}

        {hasDiscount && (
          <span className="absolute bottom-1 left-1 z-10 px-1 py-0.5 text-[9px] font-bold text-white bg-rose-500 rounded">
            -{discountPercentage}%
          </span>
        )}

        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute top-1 right-1 z-20 p-1 rounded-full bg-white/90 hover:bg-white text-gray-400 hover:text-rose-500 shadow-sm transition-colors"
          aria-label={isFavoriteLocal ? 'إزالة من المفضلة' : 'إضافة للمفضلة'}
        >
          <Heart
            size={heartSize}
            className={isFavoriteLocal ? 'fill-rose-500 text-rose-500' : ''}
          />
        </button>
      </div>

      <div className="flex flex-col flex-grow min-h-0">
        <h3
          className={`font-medium text-gray-900 dark:text-slate-100 line-clamp-2 group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors ${titleClass}`}
          title={title}
        >
          {title}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-1 pt-1">
          <div className="flex flex-col min-w-0">
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through truncate">
                {numPrice.toLocaleString('en-US')} {currencySymbol}
              </span>
            )}
            {!hasDiscount && badge === 'Sale' && numOriginalPrice !== null && (
              <span className="text-[10px] text-gray-400 line-through truncate">
                {numOriginalPrice.toFixed(2)} {currencySymbol}
              </span>
            )}
            <span className={`${priceWholeClass} ${hasDiscount ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'} truncate`}>
              {displayPrice.toLocaleString('en-US')}
              <span className="text-[10px] font-semibold mr-0.5">{currencySymbol}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd?.(product);
            }}
            aria-label={`إضافة ${title} للسلة`}
            className={`${addBtnClass} flex items-center justify-center rounded-md bg-slate-900 dark:bg-gold-600 text-white hover:bg-gold-600 dark:hover:bg-gold-500 transition-colors flex-shrink-0`}
          >
            <Plus size={compact ? 14 : 16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
