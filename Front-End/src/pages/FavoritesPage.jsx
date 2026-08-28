import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, Trash2, ShoppingBag } from 'lucide-react';
import Layout from '../components/Layout';
import ProductCard from '../components/ProductCard';
import * as api from '../services/api';
import { useFavorites } from '../context/FavoritesContext';
import { useCart } from '../context/CartContext';

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
  const { addToCart } = useCart();

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
            className="hidden sm:inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-gold-600 transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            تصفح المنتجات
          </Link>
        </div>

        {/* المنتجات المفضلة */}
        {favorites.length > 0 ? (
          <AnimatePresence mode="popLayout">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {favorites.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow relative group"
                >
                  {/* Image (RTL - Right Side) */}
                  <Link
                    to={`/product/${product.slug || product.id}`}
                    className="w-28 sm:w-40 flex-shrink-0 bg-slate-50 dark:bg-slate-800 relative"
                  >
                    <img
                      src={product.imageUrl || product.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800&q=80'}
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </Link>

                  {/* Content (Left Side) */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          to={`/product/${product.slug || product.id}`}
                          className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 line-clamp-2 hover:text-gold-600 dark:hover:text-gold-400 transition-colors leading-snug"
                        >
                          {product.title}
                        </Link>
                        
                        <button
                          onClick={(e) => { e.preventDefault(); removeFavorite(product.id); }}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors flex-shrink-0 focus:outline-none"
                          title="إزالة من المفضلة"
                        >
                          <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                      
                      {/* Optional Brand/Condition text */}
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {api.ConditionEn[product.condition] || 'جديد'}
                      </p>
                    </div>

                    <div className="mt-3 flex items-end justify-between">
                      <div className="text-base sm:text-lg font-black text-gold-600 dark:text-gold-400 leading-none">
                        {formatPrice(product.price, product.currency)}
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          addToCart({ ...product }, 1);
                        }}
                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs sm:text-sm font-bold rounded-xl hover:bg-gold-600 dark:hover:bg-gold-500 transition-colors flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="hidden sm:inline">أضف للسلة</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-gold-600 text-white font-bold rounded-xl hover:bg-gold-700 transition-colors"
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
