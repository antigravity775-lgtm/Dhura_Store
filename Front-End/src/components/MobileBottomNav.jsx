/**
 * MobileBottomNav — شريط التنقل السفلي للجوال
 *
 * Fixed 4-tab bottom navigation, md:hidden.
 * Tabs: Home | Categories | Cart | Account
 * Favorites moved to upper header — NOT in bottom nav.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, ShoppingCart, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const tabs = [
  { to: '/', icon: Home, label: 'الرئيسية', id: 'nav-home' },
  { to: '/categories', icon: LayoutGrid, label: 'الفئات', id: 'nav-categories' },
  { to: '/cart', icon: ShoppingCart, label: 'السلة', id: 'nav-cart', badge: 'cart' },
  { to: '/profile', icon: User, label: 'حسابي', id: 'nav-account', authRequired: true },
];

const MobileBottomNav = React.memo(() => {
  const { pathname } = useLocation();
  const { cartCount } = useCart();
  const { isAuthenticated } = useAuth();

  function getBadge(badge) {
    if (badge === 'cart') return cartCount;
    return 0;
  }

  function isTabActive(to) {
    if (to === '/') return pathname === '/';
    if (to === '/categories') {
      return pathname.startsWith('/categories') || pathname.startsWith('/category/');
    }
    if (to === '/profile') {
      return pathname.startsWith('/profile') || pathname.startsWith('/auth') || pathname.startsWith('/my-orders');
    }
    return pathname.startsWith(to);
  }

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="التنقل السفلي"
    >
      <div className="flex items-stretch justify-around h-14">
        {tabs.map(({ to, icon: Icon, label, id, badge, authRequired }) => {
          const count = getBadge(badge);
          const isActive = isTabActive(to);
          const destination = authRequired && !isAuthenticated ? '/auth' : to;

          return (
            <Link
              key={id}
              id={id}
              to={destination}
              className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 min-w-0 px-1 transition-colors duration-200 touch-target ${
                isActive
                  ? 'text-gold-600 dark:text-gold-400'
                  : 'text-slate-400 dark:text-slate-500 hover:text-gold-500 dark:hover:text-gold-400'
              }`}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {isActive && (
                <span className="absolute top-0 inset-x-4 h-0.5 bg-gold-500 rounded-b-full" />
              )}

              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {count > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-[16px] h-4 bg-rose-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center px-0.5 border border-white dark:border-slate-900">
                    {count > 99 ? '99+' : count}
                  </span>
                )}
              </div>

              <span className={`text-[10px] font-semibold leading-none truncate max-w-full ${isActive ? 'text-gold-600 dark:text-gold-400' : ''}`}>
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
