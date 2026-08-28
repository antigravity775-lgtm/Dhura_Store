import React from 'react';
import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  isLoadingMore?: boolean;
  loadingCount?: number;
  onQuickAdd?: (product: Product) => void;
  onClick?: (product: Product) => void;
  onFavorite?: (product: Product, isFavorite: boolean) => void;
  title?: string;
  className?: string;
  compact?: boolean;
  variant?: 'default' | 'listing';
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  isLoading = false,
  isLoadingMore = false,
  loadingCount = 12,
  onQuickAdd,
  onClick,
  onFavorite,
  title,
  className = '',
  compact = true,
  variant = 'default',
}) => {
  const gridClass = variant === 'listing'
    ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-2.5'
    : 'grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5 md:gap-3';

  return (
    <div className={`w-full ${className}`}>
      {title && (
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-3">
          {title}
        </h2>
      )}

      <div className={gridClass}>
        {isLoading ? (
          Array.from({ length: loadingCount }).map((_, index) => (
            <ProductCard key={`skeleton-initial-${index}`} isLoading compact={compact} />
          ))
        ) : (
          <>
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                compact={compact}
                onQuickAdd={onQuickAdd}
                onClick={onClick}
                onFavorite={onFavorite}
              />
            ))}
            {isLoadingMore &&
              Array.from({ length: 5 }).map((_, index) => (
                <ProductCard key={`skeleton-more-${index}`} isLoading compact={compact} />
              ))}
          </>
        )}
      </div>
    </div>
  );
};
