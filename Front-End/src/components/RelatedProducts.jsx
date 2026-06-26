/**
 * RelatedProducts — المنتجات ذات الصلة
 *
 * Horizontally scrollable row of related products.
 * Uses useProducts filtered by categoryName, excludes current product.
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';
import * as api from '../services/api';
import { ShoppingCart, Heart } from 'lucide-react';

function formatPrice(price, currency) {
  const formatted = price >= 1000 ? price.toLocaleString('en-US') : price.toString();
  const symbol = api.CurrencySymbol[currency] || 'ريال';
  return `${formatted} ${symbol}`;
}

const RelatedProducts = React.memo(({ categoryName, currentId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: products, isLoading } = useProducts({});

  const related = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter(p => String(p.id) !== String(currentId) && p.categoryName === categoryName)
      .slice(0, 6);
  }, [products, currentId, categoryName]);

  const handleAdd = useCallback((e, p) => {
    e.stopPropagation();
    addToCart(p, 1);
  }, [addToCart]);

  const handleFav = useCallback((e, p) => {
    e.stopPropagation();
    toggleFavorite(p);
  }, [toggleFavorite]);

  if (isLoading) {
    return (
      <div className="mt-10 mb-4">
        <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4 animate-pulse" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 h-56 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!related.length) return null;

  return (
    <section className="mt-10 mb-4">
      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <span className="w-1 h-5 bg-agate-500 rounded-full inline-block" />
        منتجات من نفس الفئة
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
        {related.map((p) => {
          const img = getOptimizedImageUrl(
            p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=70',
            IMAGE_WIDTHS.GRID_CARD
          );
          const fav = isFavorite(p.id);
          return (
            <motion.div
              key={p.id}
              className="flex-shrink-0 w-40 sm:w-44 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md overflow-hidden cursor-pointer group transition-shadow"
              onClick={() => navigate(`/product/${p.slug || p.id}`)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.18 }}
            >
              <div className="relative w-full h-32 overflow-hidden bg-slate-100 dark:bg-slate-700">
                <img src={img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <button
                  onClick={(e) => handleFav(e, p)}
                  className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center shadow transition-colors ${fav ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-400 hover:text-rose-500'}`}
                >
                  <Heart className="w-3.5 h-3.5" fill={fav ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="p-3">
                <p className="text-xs font-bold text-slate-800 dark:text-white line-clamp-2 leading-snug mb-1.5">{p.title}</p>
                <p className="text-xs font-extrabold text-agate-600 dark:text-agate-400 mb-2">
                  {formatPrice(p.discountPrice ? Number(p.discountPrice) : p.price, p.currency)}
                </p>
                <button
                  onClick={(e) => handleAdd(e, p)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 bg-agate-50 dark:bg-agate-900/30 text-agate-700 dark:text-agate-300 rounded-xl text-[11px] font-bold hover:bg-agate-100 dark:hover:bg-agate-900/50 transition-colors"
                >
                  <ShoppingCart className="w-3 h-3" />
                  أضف للسلة
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
});

RelatedProducts.displayName = 'RelatedProducts';
export default RelatedProducts;
