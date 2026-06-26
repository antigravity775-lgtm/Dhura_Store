/**
 * MobileBottomNav — شريط التنقل السفلي للجوال
 *
 * Fixed 4-tab bottom navigation, md:hidden.
 * Tabs: Home | Products | Cart | Favorites
 * Shows cart + favorites count badges.
 * Uses useLocation for active tab detection.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const tabs = [
  { to: '/',          icon: Home,         label: 'الرئيسية',  id: 'nav-home' },
  { to: '/products',  icon: ShoppingBag,  label: 'المنتجات', id: 'nav-products' },
  { to: '/cart',      icon: ShoppingCart, label: 'السلة',    id: 'nav-cart',      badge: 'cart' },
  { to: '/favorites', icon: Heart,        label: 'المفضلة',  id: 'nav-favorites', badge: 'favorites' },
];

const MobileBottomNav = React.memo(() => {
  const { pathname } = useLocation();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  function getBadge(badge) {
    if (badge === 'cart') return cartCount;
    if (badge === 'favorites') return favoritesCount;
    return 0;
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-2xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="التنقل السفلي"
    >
      <div className="flex items-center justify-around h-16">
        {tabs.map(({ to, icon: Icon, label, id, badge }) => {
          const count = getBadge(badge);
          const isActive =
            to === '/' ? pathname === '/' : pathname.startsWith(to);

          return (
            <Link
              key={id}
              id={id}
              to={to}
              className={`relative flex flex-col items-center justify-center gap-1 min-w-[56px] h-full px-3 transition-all duration-200 touch-target ${
                isActive
                  ? 'text-agate-600 dark:text-agate-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-agate-500 dark:hover:text-agate-400'
              }`}
              aria-label={label}
            >
              {/* Active indicator bar */}
              {isActive && (
                <span className="absolute top-0 inset-x-3 h-0.5 bg-agate-500 rounded-b-full" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'scale-100'}`} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5 border border-white dark:border-slate-900">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-semibold leading-none ${isActive ? 'text-agate-600 dark:text-agate-400' : ''}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

MobileBottomNav.displayName = 'MobileBottomNav';
export default MobileBottomNav;
