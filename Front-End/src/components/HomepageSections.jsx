/**
 * HomepageSections — أقسام الصفحة الرئيسية
 *
 * EN: "Start Shopping" call-to-action section with two paths:
 *     1. Browse All Products → /products
 *     2. Discover Random Products → shuffles product list inline
 *     Modern gradient buttons with micro-animations.
 *
 * AR: قسم "ابدأ التسوق" مع مسارين:
 *     1. تصفح جميع المنتجات → /products
 *     2. اكتشف منتجات عشوائية → يخلط قائمة المنتجات
 *     أزرار بتدرجات حديثة مع رسوم متحركة دقيقة.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Shuffle, ArrowLeft, Sparkles } from 'lucide-react';

const HomepageSections = React.memo(({ onDiscoverRandom }) => {
  const navigate = useNavigate();

  return (
    <section className="mb-8 sm:mb-10">
      {/* Section Header */}
      <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
          <Sparkles className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            ابدأ التسوق
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            اختر طريقة التصفح المفضلة لديك
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {/* Browse All Products */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/products')}
          className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:shadow-indigo-500/30 transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 text-right"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-1/3 translate-y-1/3 group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <ShoppingBag className="w-5 h-5 opacity-80" />
                <span className="text-base sm:text-lg font-bold">تصفح جميع المنتجات</span>
              </div>
              <span className="text-xs sm:text-sm text-indigo-200/80 font-medium">
                استعرض جميع المنتجات المتاحة
              </span>
            </div>
            <ArrowLeft className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300 flex-shrink-0" />
          </div>
        </motion.button>

        {/* Discover Random Products */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDiscoverRandom}
          className="group relative overflow-hidden rounded-2xl p-5 sm:p-6 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-shadow duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 text-right"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-1/3 translate-y-1/3 group-hover:scale-150 transition-transform duration-700" />
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <Shuffle className="w-5 h-5 opacity-80 group-hover:animate-spin" style={{ animationDuration: '2s' }} />
                <span className="text-base sm:text-lg font-bold">اكتشف منتجات عشوائية</span>
              </div>
              <span className="text-xs sm:text-sm text-emerald-200/80 font-medium">
                دع الحظ يختار لك منتجات مميزة
              </span>
            </div>
            <ArrowLeft className="w-5 h-5 opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all duration-300 flex-shrink-0" />
          </div>
        </motion.button>
      </div>
    </section>
  );
});

HomepageSections.displayName = 'HomepageSections';
export default HomepageSections;
