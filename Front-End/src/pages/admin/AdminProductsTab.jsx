import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Package,
  Plus,
  Edit3,
  Trash2,
  Tag,
  Loader2,
  CheckSquare,
  Square,
  Copy,
  ExternalLink,
  ChevronDown,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import * as api from '../../services/api';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import InfiniteScrollTrigger from '../../components/InfiniteScrollTrigger';

// Custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

const AdminProductsTab = ({ openEditProductModal }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'hidden', 'outofstock'
  const [selectedIds, setSelectedIds] = useState(new Set());
  
  // Bulk action states
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // SWR Infinite Fetching
  const getKeyProducts = (pageIndex, previousPageData) => {
    if (previousPageData && !previousPageData.length) return null;
    return ["adminProducts", debouncedSearch, filter, pageIndex + 1];
  };

  const {
    data: productsData,
    size: productsSize,
    setSize: setProductsSize,
    isLoading: productsLoadingInitial,
    isValidating: productsValidating,
    mutate: mutateProducts,
  } = useSWRInfinite(getKeyProducts, async ([_key, search, status, pageNumber]) => {
    return api.getAdminProducts({ pageNumber, pageSize: 15, search, status });
  });

  const products = productsData ? [].concat(...productsData.filter(Boolean)) : [];
  const productsLoading = productsLoadingInitial && !products.length;
  const productsLoadingMore = productsValidating || (productsSize > 0 && productsData && typeof productsData[productsSize - 1] === "undefined");
  const productsIsEmpty = productsData?.[0]?.length === 0;
  const productsIsReachingEnd = productsIsEmpty || (productsData && productsData[productsData.length - 1]?.length < 15);

  // Fetch categories for the bulk move dropdown (Cached automatically by SWR)
  const { data: categories } = useSWR("adminCategoriesAll", () => api.getCategories({ pageSize: 100 }));

  // Computed Properties (Now mostly done on server, but we can still filter out locally if we want, though not needed since server handles it. We just return products)
  const filteredProducts = products;

  // Selection Logic
  const toggleSelection = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    if (selectedIds.size === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredProducts.map(p => p.id)));
    }
  };

  const isAllSelected = filteredProducts.length > 0 && selectedIds.size === filteredProducts.length;

  const handleDeleteProduct = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      // Optimistic update
      mutateProducts(productsData.map(page => page.filter(p => p.id !== id)), { revalidate: false });
      await api.deleteAdminProduct(id);
      mutateProducts();
      alert("تم حذف المنتج بنجاح");
    } catch (err) {
      alert("فشل حذف المنتج: " + (err.message || ""));
      mutateProducts(); // rollback
    }
  };

  // Single Item Actions
  const handleDuplicate = (product) => {
    // Pass everything except id, createdAt, updatedAt
    const { id, createdAt, updatedAt, ...clonedProduct } = product;
    clonedProduct.title = `${clonedProduct.title} (نسخة)`;
    openEditProductModal(clonedProduct);
  };

  // Bulk Actions
  const handleBulkStatus = async (isHidden) => {
    if (selectedIds.size === 0) return;
    setIsBulkLoading(true);
    try {
      // Optimistic bulk update
      const newPages = productsData.map(page => page.map(p => selectedIds.has(p.id) ? { ...p, isHidden } : p));
      mutateProducts(newPages, { revalidate: false });
      
      await api.bulkUpdateAdminProductStatus(Array.from(selectedIds), isHidden);
      mutateProducts();
      setSelectedIds(new Set());
    } catch (err) {
      alert("حدث خطأ أثناء تحديث حالة المنتجات: " + err.message);
      mutateProducts();
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`هل أنت متأكد من حذف ${selectedIds.size} منتج نهائياً؟`)) return;
    setIsBulkLoading(true);
    try {
      // Optimistic bulk delete
      const newPages = productsData.map(page => page.filter(p => !selectedIds.has(p.id)));
      mutateProducts(newPages, { revalidate: false });

      await api.bulkDeleteAdminProducts(Array.from(selectedIds));
      mutateProducts();
      setSelectedIds(new Set());
    } catch (err) {
      alert("حدث خطأ أثناء حذف المنتجات: " + err.message);
      mutateProducts();
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleBulkCategoryChange = async (categoryId) => {
    setIsBulkLoading(true);
    try {
      const selectedCat = categories?.find(c => c.id === categoryId);
      // Optimistic bulk category update
      const newPages = productsData.map(page => page.map(p => selectedIds.has(p.id) ? { ...p, categoryId, categoryName: selectedCat?.name } : p));
      mutateProducts(newPages, { revalidate: false });

      await api.bulkUpdateAdminProductCategory(Array.from(selectedIds), categoryId);
      mutateProducts();
      setSelectedIds(new Set());
      setShowCategorySelector(false);
    } catch (err) {
      alert("حدث خطأ أثناء نقل المنتجات: " + err.message);
      mutateProducts();
    } finally {
      setIsBulkLoading(false);
    }
  };

  // UI Helpers
  const getStatusBadge = (p) => {
    if (p.stockQuantity === 0) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 ring-1 ring-inset ring-red-200 dark:ring-red-800"><AlertCircle className="w-3 h-3" /> نفد المخزون</span>;
    if (p.isHidden) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-inset ring-slate-200 dark:ring-slate-700">مخفي</span>;
    return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-1 ring-inset ring-emerald-200 dark:ring-emerald-800"><CheckCircle2 className="w-3 h-3" /> نشط</span>;
  };

  return (
    <div className="flex flex-col relative min-h-[60vh] pb-24">
      {/* ── STICKY HEADER & FILTERS ── */}
      <div className="sticky top-16 z-20 bg-bone/95 dark:bg-slate-950/95 backdrop-blur-md pb-4 pt-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        
        {/* Top Controls: Search and Add New */}
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ابحث برمز SKU، اسم المنتج، أو القسم..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-agate-500/50 outline-none transition-shadow"
            />
          </div>
          <button 
            onClick={() => openEditProductModal(null)}
            className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold text-white bg-agate-600 hover:bg-agate-500 rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {[
            { id: 'all', label: 'الكل' },
            { id: 'active', label: 'نشط' },
            { id: 'hidden', label: 'مسودة/مخفي' },
            { id: 'outofstock', label: 'نفد المخزون' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                filter === f.id
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-white dark:text-slate-900 dark:border-white shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── BULK ACTION BAR ── */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] sm:w-auto max-w-2xl bg-slate-900 dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-700/50 p-2 sm:p-3 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
          >
            <div className="flex items-center gap-2 text-white px-2">
              <div className="bg-agate-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                {selectedIds.size}
              </div>
              <span className="text-sm font-semibold hidden sm:inline">منتجات محددة</span>
            </div>
            
            <div className="flex items-center gap-1.5 sm:gap-2 flex-1 sm:flex-none overflow-x-auto scrollbar-hide">
              {showCategorySelector ? (
                <div className="flex items-center gap-2 w-full">
                  <select
                    onChange={(e) => {
                      if (e.target.value) handleBulkCategoryChange(e.target.value);
                    }}
                    className="flex-1 bg-slate-800 border border-slate-600 text-white text-xs rounded-lg px-2 py-2 outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>اختر القسم الجديد...</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button onClick={() => setShowCategorySelector(false)} className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 text-white"><X className="w-4 h-4" /></button>
                </div>
              ) : (
                <>
                  <button disabled={isBulkLoading} onClick={() => setShowCategorySelector(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap">
                    <Tag className="w-3.5 h-3.5" /> نقل
                  </button>
                  <button disabled={isBulkLoading} onClick={() => handleBulkStatus(false)} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap">
                    <CheckCircle2 className="w-3 h-3" /> تنشيط
                  </button>
                  <button disabled={isBulkLoading} onClick={() => handleBulkStatus(true)} className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap">
                    إخفاء
                  </button>
                  <button disabled={isBulkLoading} onClick={handleBulkDelete} className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 whitespace-nowrap">
                    <Trash2 className="w-3.5 h-3.5" /> حذف
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── PRODUCTS LIST ── */}
      <div className="flex-1">
        {/* Table Header (Desktop only) */}
        <div className="hidden sm:flex items-center px-4 py-3 bg-slate-100 dark:bg-slate-800/50 rounded-t-xl border-b border-slate-200 dark:border-slate-800 mb-2">
          <div className="w-10 flex items-center justify-center">
            <button onClick={selectAll} className="text-slate-400 hover:text-agate-600 transition-colors">
              {isAllSelected ? <CheckSquare className="w-5 h-5 text-agate-500" /> : <Square className="w-5 h-5" />}
            </button>
          </div>
          <div className="flex-1 text-xs font-bold text-slate-500 uppercase tracking-wider">المنتج</div>
          <div className="w-24 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">السعر</div>
          <div className="w-24 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">المخزون</div>
          <div className="w-32 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">القسم</div>
          <div className="w-24 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">الحالة</div>
          <div className="w-32 text-xs font-bold text-slate-500 uppercase tracking-wider text-left">إجراءات</div>
        </div>

        {/* Mobile Master Checkbox */}
        <div className="sm:hidden flex items-center gap-2 mb-3 px-1">
          <button onClick={selectAll} className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300">
            {isAllSelected ? <CheckSquare className="w-5 h-5 text-agate-500" /> : <Square className="w-5 h-5 text-slate-400" />}
            تحديد الكل
          </button>
        </div>

        {productsLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 text-agate-500 animate-spin mb-4" />
            جاري تحميل المنتجات...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
            <Package className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-1">لا توجد منتجات</h3>
            <p className="text-sm text-slate-500 mb-4">لم يتم العثور على أي منتج يطابق بحثك.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:gap-1">
            {filteredProducts.map((p, index) => {
              const isSelected = selectedIds.has(p.id);
              return (
                <motion.div 
                  key={p.id} 
                  initial={{ opacity: 0, y: 10 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: Math.min(index * 0.02, 0.2) }} 
                  className={`flex flex-col sm:flex-row sm:items-center p-3 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-900 border rounded-xl sm:rounded-lg transition-all ${
                    isSelected ? 'border-agate-400 bg-agate-50/30 dark:border-agate-500/50 dark:bg-agate-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Left Section: Checkbox + Image + Title */}
                  <div className="flex items-center gap-3 flex-1 mb-3 sm:mb-0">
                    <button onClick={() => toggleSelection(p.id)} className="flex-shrink-0 text-slate-400 hover:text-agate-600 transition-colors">
                      {isSelected ? <CheckSquare className="w-5 h-5 text-agate-500" /> : <Square className="w-5 h-5" />}
                    </button>
                    
                    <div className="relative w-12 h-12 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                      <img src={p.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100&q=80'} alt="" className="w-full h-full object-cover" />
                    </div>
                    
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{p.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {p.id.substring(0, 8).toUpperCase()}
                        </span>
                        {p.isPromoted && <span className="text-[10px] text-agate-600 font-bold">⭐ مميز</span>}
                      </div>
                    </div>
                  </div>

                  {/* Right Section / Grid info */}
                  <div className="grid grid-cols-2 sm:flex items-center gap-3 sm:gap-0 sm:ml-auto w-full sm:w-auto text-sm">
                    <div className="flex flex-col sm:items-center sm:w-24">
                      <span className="text-[10px] text-slate-400 sm:hidden">السعر</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {p.price.toLocaleString('en-US')} {api.getCurrencySymbol(p.currency)}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:items-center sm:w-24">
                      <span className="text-[10px] text-slate-400 sm:hidden">المخزون</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">{p.stockQuantity}</span>
                    </div>

                    <div className="flex flex-col sm:items-center sm:w-32 truncate">
                      <span className="text-[10px] text-slate-400 sm:hidden">القسم</span>
                      <span className="text-xs text-slate-600 dark:text-slate-400 truncate w-full sm:text-center">{p.categoryName || '—'}</span>
                    </div>

                    <div className="flex flex-col sm:items-center sm:w-24">
                      <span className="text-[10px] text-slate-400 sm:hidden mb-1">الحالة</span>
                      {getStatusBadge(p)}
                    </div>
                    
                    {/* Actions */}
                    <div className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-start gap-1 mt-2 sm:mt-0 sm:w-32 border-t sm:border-none border-slate-100 dark:border-slate-800 pt-2 sm:pt-0">
                      <button onClick={() => openEditProductModal(p)} title="تعديل" className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDuplicate(p)} title="تكرار" className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 rounded-md transition-colors">
                        <Copy className="w-4 h-4" />
                      </button>
                      <a href={`/products/${p.id}`} target="_blank" rel="noreferrer" title="عرض" className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                      <button onClick={() => handleDeleteProduct(p.id)} title="حذف" className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {/* Skeleton Loaders for Infinite Scroll */}
            {productsLoadingMore && (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 animate-pulse">
                  <div className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-800"></div>
                  <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── INFINITE SCROLL TRIGGER ── */}
      {!productsLoading && !productsIsReachingEnd && (
        <InfiniteScrollTrigger
          onIntersect={() => setProductsSize(productsSize + 1)}
          isLoadingMore={productsLoadingMore}
          isReachingEnd={productsIsReachingEnd}
        />
      )}

      {/* Completion State */}
      {productsIsReachingEnd && filteredProducts.length > 0 && (
        <div className="flex justify-center mt-6 pb-4">
          <p className="text-xs font-bold text-slate-400 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-800">
            تم تحميل جميع المنتجات
          </p>
        </div>
      )}
    </div>
  );
};

export default AdminProductsTab;
