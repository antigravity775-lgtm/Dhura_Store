/**
 * MobileBottomNav — شريط التنقل السفلي للجوال
 *
 * EN: Fixed 4-tab bottom navigation for mobile users (md:hidden).
 *     Tabs: Home | Products | Cart (with badge) | Favorites (with badge)
 *     Active state: agate colour + top indicator line.
 *     Safe-area aware for notched phones.
 *
 * AR: شريط تنقل سفلي ثابت بـ 4 تبويبات للجوال.
 *     يحترم منطقة الأمان للشاشات ذات الحافة.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

const TABS = [
  { icon: Home,         label: 'الرئيسية',  path: '/',          exact: true  },
  { icon: ShoppingBag,  label: 'المنتجات',  path: '/products',  exact: false },
  { icon: ShoppingCart, label: 'السلة',     path: '/cart',      exact: false, badge: 'cart'      },
  { icon: Heart,        label: 'المفضلة',   path: '/favorites', exact: false, badge: 'favorites' },
];

const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { cartCount } = useCart();
  const { favoritesCount } = useFavorites();

  const getCount = (badge) => {
    if (badge === 'cart')      return cartCount;
    if (badge === 'favorites') return favoritesCount;
    return 0;
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="التنقل الرئيسي"
    >
      <div className="grid grid-cols-4 h-16">
        {TABS.map(({ icon: Icon, label, path, exact, badge }) => {
          const isActive = exact ? pathname === path : pathname === path || pathname.startsWith(path + '/');
          const count = getCount(badge);

          return (
            <Link
              key={path}
              to={path}
              className={`relative flex flex-col items-center justify-center gap-0.5 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'text-agate-600 dark:text-agate-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute top-0 inset-x-4 h-0.5 bg-agate-500 rounded-b-full" />
              )}

              {/* Icon + badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {count > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 bg-agate-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white dark:border-slate-900 px-0.5 leading-none">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
