import React from 'react';
import { ProductCard, Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  isLoading?: boolean;
  loadingCount?: number;
  onQuickAdd?: (product: Product) => void;
  onClick?: (product: Product) => void;
  onFavorite?: (product: Product, isFavorite: boolean) => void;
  title?: string;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  isLoading = false,
  loadingCount = 8,
  onQuickAdd,
  onClick,
  onFavorite,
  title,
  className = ''
}) => {
  return (
    <div className={`w-full max-w-7xl mx-auto px-2 sm:px-4 py-6 ${className}`}>
      {title && (
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 pl-1">
          {title}
        </h2>
      )}
      
      {/* 
        Responsive Grid Details:
        - 1 column below 380px (very small devices)
        - 2 columns onwards from 380px (mobile)
        - 3 columns on sm (tablet)
        - 4 columns md/lg, 5 columns xl+
      */}
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
        {isLoading
          ? Array.from({ length: loadingCount }).map((_, index) => (
              <ProductCard key={`skeleton-${index}`} isLoading={true} />
            ))
          : products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onQuickAdd={onQuickAdd}
                onClick={onClick}
                onFavorite={onFavorite}
              />
            ))}
      </div>
    </div>
  );
};
