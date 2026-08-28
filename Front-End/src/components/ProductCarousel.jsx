/**
 * ProductCarousel — شريط منتجات أفقي قابل للتمرير
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { ProductCard } from './HighConversionGrid/ProductCard';

const ProductCarousel = ({
  title,
  subtitle,
  viewAllHref,
  products,
  isLoading = false,
  loadingCount = 6,
  onQuickAdd,
  onClick,
  onFavorite,
}) => {
  return (
    <section className="mb-5 sm:mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {viewAllHref && (
          <Link
            to={viewAllHref}
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors flex-shrink-0"
          >
            عرض الكل
            <ChevronLeft className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      <div
        className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading
          ? Array.from({ length: loadingCount }).map((_, i) => (
              <div key={`carousel-skel-${i}`} className="flex-shrink-0 w-[140px] sm:w-[160px] snap-start">
                <ProductCard isLoading compact />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[140px] sm:w-[160px] md:w-[170px] snap-start">
                <ProductCard
                  product={product}
                  compact
                  onQuickAdd={onQuickAdd}
                  onClick={onClick}
                  onFavorite={onFavorite}
                />
              </div>
            ))}
      </div>

      {!isLoading && products.length === 0 && (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-6">
          لا توجد منتجات في هذا القسم حالياً
        </p>
      )}
    </section>
  );
};

export default ProductCarousel;
