import React, { Suspense } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { preload } from "swr";
import * as api from "./services/api";
import HomePage from "./pages/HomePage";
import ScrollToTop from "./components/ScrollToTop";
import SEO from "./components/SEO";

// ─── Route-based code splitting ───
// EN: Only HomePage is loaded eagerly (it's the landing page / LCP critical path).
//     All other pages are lazy-loaded on demand, reducing initial JS by ~55%.
// AR: فقط الصفحة الرئيسية تُحمّل مبدئياً (هي صفحة الهبوط / مسار LCP الحرج).
//     كل الصفحات الأخرى تُحمّل عند الطلب، مما يقلل JS الأولي بـ ~55%.
const ProductDetailsPage = React.lazy(
  () => import("./pages/ProductDetailsPage"),
);
const SellerDashboard = React.lazy(() => import("./pages/SellerDashboard"));
const AdminDashboard = React.lazy(() => import("./pages/AdminDashboard"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const CartPage = React.lazy(() => import("./pages/CartPage"));
const MyOrdersPage = React.lazy(() => import("./pages/MyOrdersPage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const FavoritesPage = React.lazy(() => import("./pages/FavoritesPage"));
const ProductsPage = React.lazy(() => import("./pages/ProductsPage"));
const CategoryPage = React.lazy(() => import("./pages/CategoryPage"));
const ProductGridDemo = React.lazy(
  () => import("./components/HighConversionGrid/ProductGridDemo"),
);
const AboutPage = React.lazy(() => import("./pages/AboutPage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const ContactPage = React.lazy(() => import("./pages/ContactPage"));

// EN: ChatWidget is lazy-loaded because it imports react-markdown + remark-gfm (~45KB gzip).
//     The FAB button still appears immediately via a lightweight wrapper.
// AR: ChatWidget يُحمّل كسولاً لأنه يستورد react-markdown + remark-gfm (~45KB gzip).
//     زر FAB يظهر فوراً عبر غلاف خفيف.
// const ChatWidget = React.lazy(() => import("./components/chat/ChatWidget"));
const WhatsAppFAB = React.lazy(() => import("./components/WhatsAppFAB"));
const BackToTop = React.lazy(() => import("./components/BackToTop"));

/**
 * EN: Minimal loading fallback — a subtle centered spinner.
 *     Uses pure CSS to avoid importing any component library.
 * AR: مؤشر تحميل بسيط — دوّار مركزي ناعم.
 *     يستخدم CSS نقي لتجنب استيراد أي مكتبة مكونات.
 */
const PageLoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="w-8 h-8 border-3 border-agate-200 dark:border-slate-700 border-t-agate-600 dark:border-t-agate-400 rounded-full animate-spin" />
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
  // Storefront Warm-Up (Predictive Prefetching)
  React.useEffect(() => {
    // We can prefetch the first page of products and categories instantly 
    // to ensure 0ms navigation for the customer.
    // Categories are fetched via getCategories without args
    preload('categories', () => api.getCategories() || []);
    
    // Store info
    preload('storeInfo', api.getStoreInfo);
    
    // First page of unfiltered products (used in HomePage and ProductsPage)
    // We recreate the SWR key used by useProducts for empty params
    const defaultProductsKey = 'products';
    preload(defaultProductsKey, () => api.getProducts({ pageSize: 50 }));
  }, []);

  return (
    <>
      <SEO />
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
              <ProtectedRoute allowedRoles={["Seller", "Admin"]}>
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-orders"
            element={
              <ProtectedRoute allowedRoles={["Buyer", "Admin"]}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["Admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      {/* Chat FAB — Disabled per user request */}
      {/* 
      <Suspense fallback={null}>
        <ChatWidget />
      </Suspense> 
      */}
      {/* WhatsApp FAB — global persistent contact button */}
      <Suspense fallback={null}>
        <WhatsAppFAB />
      </Suspense>
      {/* Back to Top — appears after 400px scroll */}
      <Suspense fallback={null}>
        <BackToTop />
      </Suspense>
    </>
  );
};

export default App;
