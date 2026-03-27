import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const ctx = useContext(FavoritesContext);
  if (!ctx) throw new Error('useFavorites must be used within FavoritesProvider');
  return ctx;
};

const STORAGE_KEY = 'favorite_products';

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  const addFavorite = useCallback((product) => {
    setFavorites(prev => {
      if (prev.some(p => p.id === product.id)) return prev;
      return [...prev, {
        id: product.id,
        title: product.title,
        price: product.price,
        currency: product.currency,
        condition: product.condition,
        categoryName: product.categoryName,
        mainImageUrl: product.mainImageUrl,
        stockQuantity: product.stockQuantity,
      }];
    });
  }, []);

  const removeFavorite = useCallback((productId) => {
    setFavorites(prev => prev.filter(p => p.id !== productId));
  }, []);

  const isFavorite = useCallback((productId) => {
    return favorites.some(p => p.id === productId);
  }, [favorites]);

  const toggleFavorite = useCallback((product) => {
    if (isFavorite(product.id)) {
      removeFavorite(product.id);
    } else {
      addFavorite(product);
    }
  }, [isFavorite, removeFavorite, addFavorite]);

  const favoritesCount = favorites.length;

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite, toggleFavorite, favoritesCount }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesContext;
