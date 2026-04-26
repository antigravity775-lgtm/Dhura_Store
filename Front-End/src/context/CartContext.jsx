import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};

const CART_KEY = 'cart_items';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        const newQty = Math.min(existing.quantity + quantity, product.stockQuantity || 9999);
        return prev.map(i =>
          i.productId === product.id
            ? { ...i, quantity: newQty, stockQuantity: product.stockQuantity }
            : i
        );
      }
      const cappedQty = Math.min(quantity, product.stockQuantity || 9999);
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: product.discountPrice ?? product.price,
          currency: product.currency,
          mainImageUrl: product.mainImageUrl,
          stockQuantity: product.stockQuantity || 9999,
          quantity: cappedQty,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(i => i.productId !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return removeFromCart(productId);
    setItems(prev =>
      prev.map(i => {
        if (i.productId !== productId) return i;
        const maxQty = i.stockQuantity || 9999;
        return { ...i, quantity: Math.min(quantity, maxQty) };
      })
    );
  };

  const clearCart = () => setItems([]);

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const cartTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
