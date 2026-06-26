import React from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Loader2,
} from 'lucide-react';
import useSWRInfinite from "swr/infinite";
import * as api from '../../services/api';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';

const AdminCategoriesTab = ({ openCategoryForm }) => {
  const getKeyCategories = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null;
    return ["adminCategories", pageIndex + 1];
  };

  const {
    data: categoriesData,
    size: categoriesSize,
    setSize: setCategoriesSize,
    isLoading: categoriesLoadingInitial,
    isValidating: categoriesValidating,
    mutate: mutateCategories,
  } = useSWRInfinite(getKeyCategories, async ([_key, pageNumber]) => {
    return api.getCategories({ pageNumber, pageSize: 15 });
  });

  const categories = categoriesData ? [].concat(...categoriesData.filter(Boolean)) : [];
  const categoriesLoading = categoriesLoadingInitial && !categories.length;
  const categoriesLoadingMore = categoriesValidating || (categoriesSize > 0 && categoriesData && typeof categoriesData[categoriesSize - 1] === "undefined");
  const categoriesIsEmpty = categoriesData?.[0]?.length === 0;
  const categoriesIsReachingEnd = categoriesIsEmpty || (categoriesData && categoriesData[categoriesData.length - 1]?.length < 15);

  const handleDeleteCategory = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
    try {
      await api.deleteCategory(id);
      mutateCategories();
      alert("تم حذف التصنيف");
    } catch (err) {
      alert("فشل حذف التصنيف: " + (err.message || ""));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة التصنيفات</h2>
        <button 
          onClick={() => openCategoryForm(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-agate-600 hover:bg-agate-500 rounded-xl transition-colors shadow-sm shadow-agate-600/20"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف جديد
        </button>
      </div>

      {categoriesLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-agate-500 animate-spin" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Tag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد تصنيفات</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">قم بإضافة أول تصنيف لترتيب منتجاتك</p>
          <button onClick={() => openCategoryForm(null)} className="flex items-center gap-2 mx-auto px-6 py-3 bg-agate-600 text-white font-bold rounded-xl hover:bg-agate-500 transition-colors shadow-lg shadow-agate-600/20">
            <Plus className="w-5 h-5" /> إضافة تصنيف
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-agate-200 dark:hover:border-agate-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-agate-50 dark:bg-agate-900/30 text-agate-600 dark:text-agate-400 flex items-center justify-center flex-shrink-0">
                {cat.iconUrl ? <img src={cat.iconUrl} alt={cat.name} className="w-7 h-7 object-contain" /> : <Tag className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{cat.name}</h3>
                <div className="text-xs text-slate-500 mt-1">{cat.productsCount || 0} منتجات</div>
              </div>
              <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openCategoryForm(cat)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDeleteCategory(cat.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}

          {/* Skeleton Loaders for Infinite Scroll */}
          {categoriesLoadingMore && (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-cat-${i}`} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-800 flex-shrink-0"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Infinite Scroll Trigger */}
      {!categoriesLoading && !categoriesIsReachingEnd && (
        <InfiniteScrollTrigger
          onIntersect={() => setCategoriesSize(categoriesSize + 1)}
          isLoadingMore={categoriesLoadingMore}
          isReachingEnd={categoriesIsReachingEnd}
        />
      )}

      {/* Completion State */}
      {categoriesIsReachingEnd && categories.length > 0 && (
        <div className="flex justify-center mt-8 pb-4">
          <p className="text-sm font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800/50 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800">
            تم تحميل جميع التصنيفات ✨
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesTab;
