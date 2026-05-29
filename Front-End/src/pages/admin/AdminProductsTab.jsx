import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Package,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Loader2,
} from 'lucide-react';
import * as api from '../../services/api';

const AdminProductsTab = ({ products, productsLoading, openEditProductModal, handleDeleteProduct }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [productVisibilityFilter, setProductVisibilityFilter] = useState("all");

  return (
    <div>
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة المحتوى والمنتجات</h2>
          <button 
            onClick={() => openEditProductModal(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gold-600 hover:bg-gold-500 rounded-lg transition-colors shadow-sm shadow-gold-600/20"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو القسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-gold-500/50 transition-all text-slate-900 dark:text-white"
            />
          </div>
          <select
            value={productVisibilityFilter}
            onChange={(e) => setProductVisibilityFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-gold-500/50 transition-all text-slate-700 dark:text-slate-200"
          >
            <option value="all">كل المنتجات</option>
            <option value="visible">الظاهرة فقط</option>
            <option value="hidden">المخفية فقط</option>
          </select>
        </div>
      </div>

      {productsLoading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-gold-500 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد منتجات</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">قم بإضافة أول منتج لمتجرك لتبدأ البيع</p>
          <button onClick={() => openEditProductModal(null)} className="flex items-center gap-2 mx-auto px-6 py-3 bg-gold-600 text-white font-bold rounded-xl hover:bg-gold-500 transition-colors shadow-lg shadow-gold-600/20">
            <Plus className="w-5 h-5" /> إضافة منتج جديد
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {products
            .filter(p => {
              if (productVisibilityFilter === 'visible' && p.isHidden) return false;
              if (productVisibilityFilter === 'hidden' && !p.isHidden) return false;
              if (!searchQuery.trim()) return true;
              return p.title?.toLowerCase().includes(searchQuery.toLowerCase()) || p.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
            })
            .map((p, index) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.02 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col group hover:shadow-md transition-all">
                <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-800">
                  <img src={p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=400&q=80'} alt={p.title} className="w-full h-full object-cover" />
                  {p.isHidden && (
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold rounded-lg flex items-center gap-1">
                      مخفي
                    </div>
                  )}
                  {p.isPromoted && (
                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-gold-500 text-white text-[10px] font-bold rounded-lg shadow-sm">
                      مميز ⭐
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-2 leading-snug">{p.title}</h3>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-3">
                    <Tag className="w-3.5 h-3.5" />
                    <span className="truncate">{p.categoryName || 'بدون تصنيف'}</span>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                    <span className="font-extrabold text-gold-600 dark:text-gold-400 text-sm">
                      {p.price.toLocaleString('en-US')} {api.getCurrencySymbol(p.currency)}
                    </span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEditProductModal(p)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
};

export default AdminProductsTab;
