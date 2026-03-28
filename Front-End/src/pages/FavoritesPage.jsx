import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import * as api from '../services/api';
import { useFavorites } from '../context/FavoritesContext';

function formatPrice(price, currency) {
  const formatted = price >= 1000 ? price.toLocaleString('en-US') : price.toString();
  const symbol = api.CurrencySymbol[currency] || '';
  return `${formatted} ${symbol}`;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const FavoritesPage = () => {
  const { favorites, removeFavorite } = useFavorites();

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 mb-12">

        {/* العنوان */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 rounded-2xl">
                <Heart className="w-7 h-7 text-rose-500" fill="currentColor" />
              </div>
              المفضلة
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">
              {favorites.length > 0 ? `${favorites.length} منتج محفوظ` : 'لم تحفظ أي منتجات بعد'}
            </p>
          </div>
          <Link
            to="/"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            تصفح المنتجات
          </Link>
        </div>

        {/* المنتجات المفضلة */}
        {favorites.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 xl:gap-7"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {favorites.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  image={product.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80'}
                  title={product.title}
                  price={formatPrice(product.price, product.currency)}
                  city=""
                  condition={api.ConditionEn[product.condition] || 'New'}
                  product={product}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-700"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-900/20 mb-6">
              <Heart className="w-10 h-10 text-rose-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد منتجات في المفضلة</h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
              اضغط على أيقونة القلب ❤️ في أي منتج لحفظه هنا والعودة إليه لاحقاً.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              تصفح المنتجات
            </Link>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default FavoritesPage;
