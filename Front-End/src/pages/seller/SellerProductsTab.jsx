import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Package,
  Eye,
  EyeOff,
  Trash2,
  Edit3,
  Loader2,
  X,
} from 'lucide-react';
import AddProductForm from '../../components/AddProductForm';
import * as api from '../../services/api';

const SellerProductsTab = () => {
  const [visibilityFilter, setVisibilityFilter] = useState('all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [togglingIds, setTogglingIds] = useState(new Set());
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyProducts();
      setProducts(data || []);
    } catch (err) {
      setError('تعذر تحميل المنتجات: ' + (err.message || ''));
    }
    setLoading(false);
  };

  const handleToggleVisibility = async (id) => {
    setTogglingIds(prev => new Set(prev).add(id));
    try {
      await api.toggleProductVisibility(id);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, isHidden: !p.isHidden } : p))
      );
      setSuccess('تم تحديث حالة المنتج بنجاح');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError('تعذر تحديث الحالة: ' + (err.message || ''));
    }
    setTogglingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await api.deleteProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      setSuccess('تم حذف المنتج بنجاح');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('تعذر حذف المنتج: ' + (err.message || ''));
    }
  };

  const handleProductCreated = () => {
    setShowAddForm(false);
    setEditingProduct(null);
    setSuccess(editingProduct ? 'تم تعديل المنتج بنجاح! ✅' : 'تم إضافة المنتج بنجاح! 🎉');
    setTimeout(() => setSuccess(''), 3000);
    loadProducts();
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setShowAddForm(true);
  };
  const closeModal = () => {
    setShowAddForm(false);
    setEditingProduct(null);
  };

  const activeProducts = products.filter(p => !p.isHidden);
  const hiddenProducts = products.filter(p => p.isHidden);

  return (
    <>
      {/* Add Product Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">منتجاتي</h2>
        <div className="flex gap-3 w-full sm:w-auto">
          <select
            value={visibilityFilter}
            onChange={e => setVisibilityFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-agate-500/50 text-slate-700 dark:text-slate-200 flex-1 sm:flex-none"
          >
            <option value="all">الكل</option>
            <option value="visible">مرئي فقط</option>
            <option value="hidden">مخفي فقط</option>
          </select>
          <button
            onClick={() => { setEditingProduct(null); setShowAddForm(true); }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-agate-600 text-white text-sm font-bold rounded-xl hover:bg-agate-500 transition-all shadow-lg shadow-agate-600/20 active:scale-[0.98] flex-1 sm:flex-none"
          >
            <Plus className="w-4 h-4" />
            إضافة منتج
          </button>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <AddProductForm onSuccess={handleProductCreated} onCancel={closeModal} editProduct={editingProduct} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success / Error Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
        {success && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Product List */}
      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-agate-500 animate-spin" /></div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد منتجات</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">ابدأ بإضافة أول منتج لك!</p>
          <button onClick={() => setShowAddForm(true)} className="px-6 py-2.5 bg-agate-600 text-white font-bold rounded-xl hover:bg-agate-500">إضافة منتج</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {products
            .filter(p => {
              if (visibilityFilter === 'visible' && p.isHidden) return false;
              if (visibilityFilter === 'hidden' && !p.isHidden) return false;
              return true;
            })
            .map(product => (
              <motion.div
                key={product.id}
                layout
                className={`bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 flex gap-4 items-center transition-all ${
                  product.isHidden ? 'border-slate-200 dark:border-slate-700 opacity-60' : 'border-slate-200 dark:border-slate-700 hover:shadow-md'
                }`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                  <img src={product.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200&q=60'} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{product.title}</h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1.5">
                    <span className="text-agate-600 dark:text-agate-400 font-bold text-sm">
                      {product.price?.toLocaleString('en-US') || 0} {api.CurrencySymbol[product.currency] || 'ريال'}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${product.isHidden ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'}`}> 
                      {product.isHidden ? 'مخفي' : 'نشط'}
                    </span>
                    {product.categoryName && (
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-bone dark:bg-slate-800 text-slate-400 border border-slate-100 dark:border-slate-700">
                        {product.categoryName}
                      </span>
                    )}
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">الكمية: {product.stockQuantity}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => openEditModal(product)} className="p-2 text-slate-300 dark:text-slate-500 hover:text-agate-600 dark:hover:text-agate-400 hover:bg-agate-50 dark:hover:bg-agate-900/30 rounded-xl transition-all" title="تعديل المنتج"><Edit3 className="w-4 h-4" /></button>
                  <button
                    onClick={() => handleToggleVisibility(product.id)}
                    disabled={togglingIds.has(product.id)}
                    className={`p-2 rounded-xl transition-all disabled:opacity-50 ${product.isHidden ? 'text-green-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30' : 'text-agate-400 hover:text-agate-600 hover:bg-agate-50 dark:hover:bg-agate-900/30'}`}
                    title={product.isHidden ? 'إظهار المنتج' : 'إخفاء المنتج'}
                  >
                    {togglingIds.has(product.id) ? <Loader2 className="w-4 h-4 animate-spin" /> : product.isHidden ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="p-2 text-slate-300 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all" title="حذف"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
        </div>
      )}
    </>
  );
};

export default SellerProductsTab;
