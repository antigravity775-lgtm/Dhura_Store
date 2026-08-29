/**
 * RelatedProducts — منتجات قد تعجبك
 */

import React, { useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';
import * as api from '../services/api';
import ProductCarousel from './ProductCarousel';

function mapToProduct(p) {
  const rawImage = p.imageUrl || p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80';
  return {
    id: p.id,
    slug: p.slug || p.id,
    title: p.title,
    description: p.description || null,
    image: getOptimizedImageUrl(rawImage, IMAGE_WIDTHS.GRID_CARD),
    price: p.price,
    currency: p.currency,
    currencySymbol: api.CurrencySymbol[p.currency] || 'ريال',
    rating: p.rating ?? 4,
    reviewCount: p.reviewCount ?? 0,
    badge: p.condition === 'New' ? null : p.condition === 'Used' ? 'Sale' : 'Local',
    isPromoted: p.isPromoted || false,
    discountPrice: p.discountPrice ? Number(p.discountPrice) : undefined,
    promotionLabel: p.promotionLabel || undefined,
  };
}

const RelatedProducts = React.memo(({ categoryName, currentId }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { data: products, isLoading } = useProducts({});

  const related = useMemo(() => {
    if (!products?.length) return [];
    return products
      .filter((p) => String(p.id) !== String(currentId) && p.categoryName === categoryName)
      .slice(0, 8)
      .map((p) => ({ ...mapToProduct(p), isFavorite: isFavorite(p.id) }));
  }, [products, currentId, categoryName, isFavorite]);

  const handleQuickAdd = useCallback((p) => {
    const original = products?.find((prod) => String(prod.id) === String(p.id));
    if (original) addToCart(original, 1);
  }, [products, addToCart]);

  const handleFavoriteToggle = useCallback((p) => {
    const original = products?.find((prod) => String(prod.id) === String(p.id));
    if (original) toggleFavorite(original);
  }, [products, toggleFavorite]);

  if (!isLoading && !related.length) return null;

  return (
    <ProductCarousel
      title="منتجات قد تعجبك"
      products={related}
      isLoading={isLoading}
      onQuickAdd={handleQuickAdd}
      onClick={(p) => navigate(`/product/${p.slug || p.id}`)}
      onFavorite={handleFavoriteToggle}
    />
  );
});

RelatedProducts.displayName = 'RelatedProducts';
export default RelatedProducts;
