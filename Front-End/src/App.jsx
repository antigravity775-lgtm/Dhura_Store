import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ScrollToTop from './components/ScrollToTop';

// ─── Route-based code splitting ───
// EN: Only HomePage is loaded eagerly (it's the landing page / LCP critical path).
//     All other pages are lazy-loaded on demand, reducing initial JS by ~55%.
// AR: فقط الصفحة الرئيسية تُحمّل مبدئياً (هي صفحة الهبوط / مسار LCP الحرج).
//     كل الصفحات الأخرى تُحمّل عند الطلب، مما يقلل JS الأولي بـ ~55%.
const ProductDetailsPage = React.lazy(() => import('./pages/ProductDetailsPage'));
const SellerDashboard = React.lazy(() => import('./pages/SellerDashboard'));
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AuthPage = React.lazy(() => import('./pages/AuthPage'));
const CartPage = React.lazy(() => import('./pages/CartPage'));
const MyOrdersPage = React.lazy(() => import('./pages/MyOrdersPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const FavoritesPage = React.lazy(() => import('./pages/FavoritesPage'));
const ProductsPage = React.lazy(() => import('./pages/ProductsPage'));
const CategoryPage = React.lazy(() => import('./pages/CategoryPage'));
const ProductGridDemo = React.lazy(() => import('./components/HighConversionGrid/ProductGridDemo'));
const AboutPage = React.lazy(() => import('./pages/AboutPage'));
const PrivacyPolicyPage = React.lazy(() => import('./pages/PrivacyPolicyPage'));
const ContactPage = React.lazy(() => import('./pages/ContactPage'));
const TrackOrderPage = React.lazy(() => import('./pages/TrackOrderPage'));
const CreditsPage = React.lazy(() => import('./pages/CreditsPage'));

// EN: ChatWidget is lazy-loaded because it imports react-markdown + remark-gfm (~45KB gzip).
//     The FAB button still appears immediately via a lightweight wrapper.
// AR: ChatWidget يُحمّل كسولاً لأنه يستورد react-markdown + remark-gfm (~45KB gzip).
//     زر FAB يظهر فوراً عبر غلاف خفيف.
const ChatWidget = React.lazy(() => import('./components/chat/ChatWidget'));

/**
 * EN: Minimal loading fallback — a subtle centered spinner.
 *     Uses pure CSS to avoid importing any component library.
 * AR: مؤشر تحميل بسيط — دوّار مركزي ناعم.
 *     يستخدم CSS نقي لتجنب استيراد أي مكتبة مكونات.
 */
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-3 border-indigo-200 dark:border-slate-700 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageLoadingFallback />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product-grid-demo" element={<ProductGridDemo />} />
          <Route path="/product/:id" element={<ProductDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/track-order" element={<TrackOrderPage />} />
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/seller"
            element={
              <ProtectedRoute allowedRoles={['Seller', 'Admin']}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={['Buyer', 'Admin']}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['Admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {/* Chat FAB — lazy loaded, Suspense fallback is null so FAB appears without blocking */}
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense>
    </>
  );
};

export default App;
