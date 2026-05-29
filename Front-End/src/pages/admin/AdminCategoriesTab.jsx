import React from 'react';
import { motion } from 'framer-motion';
import {
  Tag,
  Plus,
  Edit3,
  Trash2,
  Loader2,
} from 'lucide-react';

const AdminCategoriesTab = ({ categories, categoriesLoading, openCategoryForm, handleDeleteCategory }) => {
  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة التصنيفات</h2>
        <button 
          onClick={() => openCategoryForm(null)}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold text-white bg-gold-600 hover:bg-gold-500 rounded-xl transition-colors shadow-sm shadow-gold-600/20"
        >
          <Plus className="w-4 h-4" />
          إضافة تصنيف جديد
        </button>
      </div>

      {categoriesLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Tag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد تصنيفات</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">قم بإضافة أول تصنيف لترتيب منتجاتك</p>
          <button onClick={() => openCategoryForm(null)} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gold-600 text-white font-bold rounded-xl hover:bg-gold-500 transition-colors shadow-lg shadow-gold-600/20">
            <Plus className="w-5 h-5" /> إضافة تصنيف
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat, index) => (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.03 }} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4 group hover:border-gold-200 dark:hover:border-gold-800 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-gold-50 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex items-center justify-center flex-shrink-0">
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
        </div>
      )}
    </div>
  );
};

export default AdminCategoriesTab;
