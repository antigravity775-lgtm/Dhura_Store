import React, { useRef, useEffect, useState } from 'react';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { Product } from './ProductCard';
import { getOptimizedImageUrl } from '../../utils/cloudinaryUrl';

interface ProductBeltProps {
  products: Product[];
  title?: string;
  /** Direction of scroll: 'left' | 'right' */
  direction?: 'left' | 'right';
  /** px per second */
  speed?: number;
  onQuickAdd?: (product: Product) => void;
}

/**
 * EN: React.memo on BeltCard prevents re-rendering every belt card when
 *     the parent belt re-renders (e.g., during scroll or hover events).
 * AR: React.memo على BeltCard يمنع إعادة رسم كل بطاقة حزام عندما
 *     يُعاد رسم الحزام الأب (مثل أثناء أحداث التمرير أو التمرير).
 */
const BeltCard: React.FC<{ 
  product: Product; 
  onQuickAdd?: (p: Product) => void;
  onClick?: (p: Product) => void;
  onFavorite?: (p: Product, isFavorite: boolean) => void;
}> = React.memo(({
  product,
  onQuickAdd,
  onClick,
  onFavorite
}) => {
  if (!product) return null;

  const [isFavoriteLocal, setIsFavoriteLocal] = useState(product.isFavorite ?? false);

  useEffect(() => {
    if (product.isFavorite !== undefined) {
      setIsFavoriteLocal(product.isFavorite);
    }
  }, [product.isFavorite]);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavoriteLocal;
    setIsFavoriteLocal(newState);
    if (product) {
      onFavorite?.(product, newState);
    }
  };
  const { title, image, price, currencySymbol = '$', originalPrice, rating, badge, isPromoted, discountPrice, promotionLabel } = product;
  const hasDiscount = discountPrice !== undefined && discountPrice !== null;
  const displayPrice = hasDiscount ? discountPrice : price;
  const hasPromoRibbon = isPromoted || !!promotionLabel;

  return (
    <div
      className={`group relative flex-shrink-0 w-[160px] sm:w-[190px] bg-white dark:bg-slate-800 rounded-2xl shadow-md border overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1.5 mx-2 ${
        isPromoted
          ? 'border-indigo-300 dark:border-indigo-600 ring-2 ring-indigo-400/30 dark:ring-indigo-500/20 shadow-indigo-500/10'
          : 'border-gray-100 dark:border-slate-700'
      }`}
      style={{ userSelect: 'none' }}
      onClick={() => onClick?.(product)}
    >
      {/* Badge */}
      {badge && !hasPromoRibbon && (
        <span
          className={`absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white rounded-full shadow ${
            badge === 'Sale' ? 'bg-rose-500' : 'bg-emerald-500'
          }`}
        >
          {badge}
        </span>
      )}

      {/* Promotion Ribbon — Glassmorphism */}
      {hasPromoRibbon && (
        <span className="absolute top-2 left-2 z-10 px-2 py-0.5 text-[10px] font-bold text-white rounded-full shadow-lg bg-gradient-to-r from-indigo-600/90 via-purple-600/90 to-pink-500/90 backdrop-blur-md border border-white/20">
          {promotionLabel || '⭐ مميز'}
        </span>
      )}

      {/* Image */}
      <div className="relative aspect-square bg-gray-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
        <img
          src={getOptimizedImageUrl(image, 380)}
          alt={title}
          draggable={false}
          className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        
        {/* Favorite Button */}
        <button
          onClick={handleFavoriteClick}
          className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-white/80 hover:bg-white text-gray-400 hover:text-red-500 shadow-sm backdrop-blur-sm transition-all duration-200"
          aria-label={isFavoriteLocal ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart 
            size={14} 
            className={isFavoriteLocal ? 'fill-red-500 text-red-500' : ''} 
          />
        </button>
      </div>

      {/* Info */}
      <div className="p-2.5">
        <p className="text-[11px] sm:text-xs font-medium text-gray-800 dark:text-slate-200 line-clamp-2 leading-snug mb-1.5 min-h-[2.5em]">
          {title}
        </p>

        {/* Stars */}
        <div className="flex items-center gap-0.5 mb-1.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={10}
              className={i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
            />
          ))}
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between" dir="ltr">
          <div>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through block">
                {Number(price).toFixed(0)} {currencySymbol}
              </span>
            )}
            {!hasDiscount && originalPrice !== undefined && originalPrice !== null && (
              <span className="text-[10px] text-gray-400 line-through block">
                {Number(originalPrice).toFixed(0)} {currencySymbol}
              </span>
            )}
            <span className={`text-sm font-extrabold ${hasDiscount ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
              {Number(displayPrice || 0).toFixed(0)} {currencySymbol}
            </span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickAdd?.(product);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 active:scale-90 transition-all duration-150 shadow"
            aria-label={`Add ${title}`}
          >
            <ShoppingCart size={13} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
});

BeltCard.displayName = 'BeltCard';

export const ProductBelt: React.FC<ProductBeltProps & { onClick?: (p: Product) => void, onFavorite?: (p: Product, isFavorite: boolean) => void }> = ({
  products,
  title,
  onQuickAdd,
  onClick,
  onFavorite
}) => {
  if (!products.length) return null;

  return (
    <section className="w-full relative py-6 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900">
      {title && (
        <h3 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white text-center mb-4 px-4">
          {title}
        </h3>
      )}

      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-r from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 sm:w-16 bg-gradient-to-l from-white dark:from-slate-900 to-transparent z-10 pointer-events-none" />

      {/* Scrolling track */}
      <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory px-4 sm:px-8 pb-6 pt-2 w-full touch-pan-x">
        {products.filter(p => !!p).map((product) => (
          <div key={product.id || Math.random()} className="snap-start shrink-0">
            <BeltCard 
              product={product} 
              onQuickAdd={onQuickAdd} 
              onClick={onClick} 
              onFavorite={onFavorite} 
            />
          </div>
        ))}
      </div>
    </section>
  );
};
