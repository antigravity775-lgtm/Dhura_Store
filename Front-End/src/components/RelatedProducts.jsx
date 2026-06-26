/**
 * RelatedProducts — منتجات ذات صلة
 *
 * EN: Horizontally scrollable row of related products from the same category.
 *     Used on Product Detail page and Cart page for upsell/cross-sell.
 *
 * AR: صف قابل للتمرير أفقياً لمنتجات ذات صلة من نفس الفئة.
 */

import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import * as api from '../services/api';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';
import { Heart, ShoppingCart, Star } from 'lucide-react';

function mapCard(p) {
  const rawImage = p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
  const rating = p.rating ?? (3.5 + Math.abs(String(p.id).charCodeAt(0) % 15) / 10);
  return {
    id: p.id,
    title: p.title,
    image: getOptimizedImageUrl(rawImage, IMAGE_WIDTHS.GRID_CARD),
    price: p.price,
    currency: p.currency,
    symbol: api.CurrencySymbol[p.currency] || 'ريال',
    discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
    rating,
    raw: p,
  };
}

const RelatedProducts = ({ categoryName, currentId, title = 'منتجات ذات صلة' }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const { data: products = [], isLoading } = useProducts({
    categoryName: categoryName || '',
  });

  const cards = useMemo(() => {
    return products
      .filter(p => String(p.id) !== String(currentId))
      .slice(0, 8)
      .map(mapCard);
  }, [products, currentId]);

  if (!isLoading && cards.length === 0) return null;

  return (
    <section className="mt-10 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h2>
        {categoryName && (
          <button
            onClick={() => navigate(`/products?category=${encodeURIComponent(categoryName)}`)}
            className="text-xs font-bold text-agate-600 dark:text-agate-400 flex items-center gap-1 hover:underline"
          >
            عرض الكل <ArrowLeft className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 scrollbar-hide snap-x snap-mandatory">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-40 sm:w-48 snap-start rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse"
                style={{ height: 220 }}
              />
            ))
          : cards.map((card) => {
              const liked = isFavorite(card.id);
              return (
                <motion.div
                  key={card.id}
                  whileHover={{ y: -2 }}
                  className="flex-shrink-0 w-40 sm:w-48 snap-start bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 overflow-hidden shadow-sm cursor-pointer group"
                  onClick={() => navigate(`/product/${card.id}`)}
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-900">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    {/* Favorite */}
                    <button
                      className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md shadow transition-all ${
                        liked ? 'bg-rose-500 text-white' : 'bg-white/80 text-slate-400'
                      }`}
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(card.raw); }}
                      aria-label="إضافة للمفضلة"
                    >
                      <Heart className="w-3.5 h-3.5" fill={liked ? 'currentColor' : 'none'} />
                    </button>
                    {/* Discount badge */}
                    {card.discountPrice && (
                      <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-red-500 rounded">
                        -{Math.round(((card.price - card.discountPrice) / card.price) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-1.5">
                      {card.title}
                    </p>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1,2,3,4,5].map(s => (
                        <Star
                          key={s}
                          className={`w-2.5 h-2.5 ${s <= Math.round(card.rating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                          fill="currentColor"
                        />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-agate-600 dark:text-agate-400">
                        {(card.discountPrice ?? card.price).toLocaleString('en-US')}
                        <span className="text-[10px] font-normal mr-0.5">{card.symbol}</span>
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); addToCart(card.raw, 1); }}
                        className="p-1.5 rounded-lg bg-agate-50 dark:bg-agate-900/30 text-agate-600 dark:text-agate-400 hover:bg-agate-100 dark:hover:bg-agate-900/50 transition-colors"
                        aria-label="أضف للسلة"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
      </div>
    </section>
  );
};

export default RelatedProducts;
