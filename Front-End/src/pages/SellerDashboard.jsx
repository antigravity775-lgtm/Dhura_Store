import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Package, Eye, EyeOff, Trash2, Edit3, LayoutDashboard, ShoppingBag, Settings,
  BarChart3, Loader2, AlertCircle, CheckCircle, X, DollarSign, Tag, Home, ShieldCheck, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import AddProductForm from '../components/AddProductForm';

const SellerDashboard = () => {
  const { user, isAuthenticated, isSeller } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('products');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [togglingIds, setTogglingIds] = useState(new Set());

  useEffect(() => {
    if (!isAuthenticated || !isSeller) {
      navigate('/auth', { replace: true });
      return;
    }
    loadProducts();
  }, [isAuthenticated, isSeller]);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const data = await api.getMyProducts();
      setProducts(data || []);
    } catch (err) {
      setError('تعذر تحميل المنتجات: ' + (err.message || ''));
    }
    setLoading(false);
  }

  async function loadSales() {
    setSalesLoading(true);
    try {
      const data = await api.getSales();
      setSales(data || []);
    } catch (err) {
      setError('تعذر تحميل المبيعات: ' + (err.message || ''));
    }
    setSalesLoading(false);
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'sales' && sales.length === 0) {
      loadSales();
    }
  };

  const handleToggleVisibility = async (id) => {
    setTogglingIds(prev => new Set(prev).add(id));
    try {
      await api.toggleProductVisibility(id);
      setProducts(prev =>
        prev.map(p => p.id === id ? { ...p, isHidden: !p.isHidden } : p)
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

  const tabItems = [
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'sales', label: 'المبيعات', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans" dir="rtl">

      {/* Top Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-slate-900 text-lg leading-none">لوحة البائع</h1>
                {user?.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 text-[10px] font-bold rounded-lg">
                    <ShieldCheck className="w-3 h-3" />
                    موثوق
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">مرحباً، {user?.fullName || 'بائع'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="text-sm text-slate-400 hover:text-indigo-600 font-medium transition-colors hidden sm:block"
            >
              <User className="w-4 h-4 inline ml-1" />
              الملف الشخصي
            </Link>
            <Link
              to="/"
              className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              الرئيسية
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 mb-8">
          {[
            { label: 'إجمالي المنتجات', value: products.length, icon: Package, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
            { label: 'منتج نشط', value: activeProducts.length, icon: Eye, color: 'bg-green-50 text-green-600 border-green-100' },
            { label: 'منتج مخفي', value: hiddenProducts.length, icon: EyeOff, color: 'bg-slate-100 text-slate-500 border-slate-200' },
            { label: 'المبيعات', value: sales.length, icon: DollarSign, color: 'bg-amber-50 text-amber-600 border-amber-100' },
          ].map(stat => (
            <div key={stat.label} className={`rounded-2xl border p-4 sm:p-5 ${stat.color}`}>
              <stat.icon className="w-6 h-6 mb-2 opacity-80" />
              <div className="text-2xl sm:text-3xl font-extrabold">{stat.value}</div>
              <div className="text-xs font-medium opacity-60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl"
            >
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</span>
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-between bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl"
            >
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</span>
              <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <>
            {/* Add Product Button */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">منتجاتي</h2>
              <button
                onClick={() => { setEditingProduct(null); setShowAddForm(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج
              </button>
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
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                  >
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900">
                        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                      </h3>
                      <button onClick={closeModal} className="p-1 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                    <AddProductForm
                      onSuccess={handleProductCreated}
                      onCancel={closeModal}
                      editProduct={editingProduct}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد منتجات</h3>
                <p className="text-slate-500 mb-6">ابدأ بإضافة أول منتج لك!</p>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500"
                >
                  إضافة منتج
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map((product) => (
                  <motion.div
                    key={product.id}
                    layout
                    className={`bg-white rounded-2xl border p-4 sm:p-5 flex gap-4 items-center transition-all ${
                      product.isHidden ? 'border-slate-200 opacity-60' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-200">
                      <img
                        src={product.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200&q=60'}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate">{product.title}</h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-indigo-600 font-bold text-sm">
                          {product.price?.toLocaleString('en-US') || 0} {api.CurrencySymbol[product.currency] || 'ريال'}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          product.isHidden ? 'bg-slate-100 text-slate-500' : 'bg-green-50 text-green-600'
                        }`}>
                          {product.isHidden ? 'مخفي' : 'نشط'}
                        </span>
                        {product.categoryName && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-400 border border-slate-100">
                            {product.categoryName}
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400">
                          الكمية: {product.stockQuantity}
                        </span>
                      </div>
                    </div>

                    {/* أزرار الإجراءات */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* تعديل */}
                      <button
                        onClick={() => openEditModal(product)}
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="تعديل المنتج"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {/* إخفاء / إظهار */}
                      <button
                        onClick={() => handleToggleVisibility(product.id)}
                        disabled={togglingIds.has(product.id)}
                        className={`p-2 rounded-xl transition-all disabled:opacity-50 ${
                          product.isHidden
                            ? 'text-green-400 hover:text-green-600 hover:bg-green-50'
                            : 'text-amber-400 hover:text-amber-600 hover:bg-amber-50'
                        }`}
                        title={product.isHidden ? 'إظهار المنتج' : 'إخفاء المنتج'}
                      >
                        {togglingIds.has(product.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : product.isHidden ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                      {/* حذف */}
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="حذف"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">المبيعات</h2>
            {salesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : sales.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد مبيعات</h3>
                <p className="text-slate-500">ستظهر هنا طلبات المشترين عند وصولها.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-slate-800 text-sm">طلب #{order.id?.slice(0, 8)?.toUpperCase()}</span>
                      <span className="text-xs font-medium px-3 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                        {order.status || 'Pending'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500">{order.items?.length || 0} منتج</span>
                      <span className="text-lg font-extrabold text-indigo-600">
                        {order.totalAmount?.toLocaleString('en-US') || 0} {order.currency || 'ريال'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SellerDashboard;
