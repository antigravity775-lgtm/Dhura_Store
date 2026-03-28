import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, Tag, DollarSign, Home,
  Loader2, AlertCircle, CheckCircle, X, Trash2, ShieldBan, ShieldCheck,
  UserCog, Plus, Edit3, Save, RefreshCw, TrendingUp, ShoppingCart,
  UserPlus, Ban, Crown, Info, Phone, Mail, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import AddProductForm from '../components/AddProductForm';

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'Admin';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Categories
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: '', iconUrl: '' });

  // Exchange Rates
  const [rates, setRates] = useState({ USD_to_YER_Sanaa: 0, USD_to_YER_Aden: 0 });
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesSaving, setRatesSaving] = useState(false);

  // ─── Store Info ───
  const [storeInfo, setStoreInfo] = useState({
    aboutUsText: '', contactEmail: '', contactPhone: '',
    facebookUrl: '', twitterUrl: '', whatsappUrl: '', instagramUrl: ''
  });
  const [storeInfoLoading, setStoreInfoLoading] = useState(false);
  const [storeInfoSaving, setStoreInfoSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate('/auth', { replace: true });
      return;
    }
    loadDashboard();
  }, [isAuthenticated, isAdmin]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  // ─── Dashboard ───
  async function loadDashboard() {
    setStatsLoading(true);
    try {
      const data = await api.getAdminDashboard();
      setStats(data);
    } catch (err) {
      setError('تعذر تحميل الإحصائيات: ' + (err.message || ''));
    }
    setStatsLoading(false);
  }

  // ─── Users ───
  async function loadUsers() {
    setUsersLoading(true);
    try {
      const data = await api.getAdminUsers();
      setUsers(data || []);
    } catch (err) {
      setError('تعذر تحميل المستخدمين: ' + (err.message || ''));
    }
    setUsersLoading(false);
  }

  const handleBlockUser = async (id) => {
    try {
      await api.blockUser(id);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isBlocked: !u.isBlocked } : u));
      showSuccess('تم تحديث حالة المستخدم');
    } catch (err) {
      setError('فشل تحديث الحالة: ' + (err.message || ''));
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await api.changeUserRole(id, newRole);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
      showSuccess('تم تغيير دور المستخدم');
    } catch (err) {
      setError('فشل تغيير الدور: ' + (err.message || ''));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع!')) return;
    try {
      await api.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showSuccess('تم حذف الحساب بنجاح');
    } catch (err) {
      setError('فشل حذف الحساب: ' + (err.message || ''));
    }
  };

  // ─── Products ───
  async function loadProducts() {
    setProductsLoading(true);
    try {
      const data = await api.getAdminProducts();
      setProducts(data || []);
    } catch (err) {
      setError('تعذر تحميل المنتجات: ' + (err.message || ''));
    }
    setProductsLoading(false);
  }

  const handleDeleteProduct = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    try {
      await api.deleteAdminProduct(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      showSuccess('تم حذف المنتج بنجاح');
    } catch (err) {
      setError('فشل حذف المنتج: ' + (err.message || ''));
    }
  };

  const handleProductCreated = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccess(editingProduct ? 'تم تعديل المنتج بنجاح! ✅' : 'تم إضافة المنتج بنجاح! 🎉');
    loadProducts();
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const closeProductModal = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  // ─── Categories ───
  async function loadCategories() {
    setCategoriesLoading(true);
    try {
      const data = await api.getCategories();
      setCategories(data || []);
    } catch (err) {
      setError('تعذر تحميل التصنيفات: ' + (err.message || ''));
    }
    setCategoriesLoading(false);
  }

  const openCategoryForm = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, iconUrl: cat.iconUrl || '' });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: '', iconUrl: '' });
    }
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) { setError('اسم التصنيف مطلوب'); return; }
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, {
          name: categoryForm.name,
          iconUrl: categoryForm.iconUrl || null,
        });
        setCategories(prev => prev.map(c =>
          c.id === editingCategory.id ? { ...c, name: categoryForm.name, iconUrl: categoryForm.iconUrl } : c
        ));
        showSuccess('تم تحديث التصنيف');
      } else {
        const newId = await api.createCategory({
          name: categoryForm.name,
          iconUrl: categoryForm.iconUrl || null,
        });
        setCategories(prev => [...prev, { id: newId, name: categoryForm.name, iconUrl: categoryForm.iconUrl }]);
        showSuccess('تم إضافة التصنيف بنجاح 🎉');
      }
      setShowCategoryForm(false);
    } catch (err) {
      setError('فشل حفظ التصنيف: ' + (err.message || ''));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      showSuccess('تم حذف التصنيف');
    } catch (err) {
      setError('فشل حذف التصنيف: ' + (err.message || ''));
    }
  };

  // ─── Exchange Rates ───
  async function loadRates() {
    setRatesLoading(true);
    try {
      const data = await api.getExchangeRates();
      setRates({
        USD_to_YER_Sanaa: data.usD_to_YER_Sanaa ?? data.USD_to_YER_Sanaa ?? 0,
        USD_to_YER_Aden: data.usD_to_YER_Aden ?? data.USD_to_YER_Aden ?? 0,
      });
    } catch (err) {
      setError('تعذر تحميل أسعار الصرف: ' + (err.message || ''));
    }
    setRatesLoading(false);
  }

  const handleUpdateRates = async () => {
    if (rates.USD_to_YER_Sanaa <= 0 || rates.USD_to_YER_Aden <= 0) {
      setError('أسعار الصرف يجب أن تكون أكبر من صفر');
      return;
    }
    setRatesSaving(true);
    try {
      await api.updateExchangeRates(rates);
      showSuccess('تم تحديث أسعار الصرف بنجاح ✅');
    } catch (err) {
      setError('فشل تحديث الأسعار: ' + (err.message || ''));
    }
    setRatesSaving(false);
  };

  // ─── Store Info ───
  async function loadStoreInfo() {
    setStoreInfoLoading(true);
    try {
      const data = await api.getStoreInfo();
      setStoreInfo({
        aboutUsText: data.aboutUsText || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        facebookUrl: data.facebookUrl || '',
        twitterUrl: data.twitterUrl || '',
        whatsappUrl: data.whatsappUrl || '',
        instagramUrl: data.instagramUrl || '',
      });
    } catch (err) {
      setError('تعذر تحميل معلومات المتجر: ' + (err.message || ''));
    }
    setStoreInfoLoading(false);
  }

  const handleUpdateStoreInfo = async () => {
    setStoreInfoSaving(true);
    try {
      await api.updateStoreInfo(storeInfo);
      showSuccess('تم تحديث معلومات المتجر بنجاح ✅');
    } catch (err) {
      setError('فشل تحديث معلومات المتجر: ' + (err.message || ''));
    }
    setStoreInfoSaving(false);
  };

  // ─── Tab Change ───
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'users' && users.length === 0) loadUsers();
    if (tab === 'products' && products.length === 0) loadProducts();
    if (tab === 'categories' && categories.length === 0) loadCategories();
    if (tab === 'rates') loadRates();
    if (tab === 'storeInfo' && !storeInfo.aboutUsText) loadStoreInfo();
  };

  const tabItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'users', label: 'المستخدمين', icon: Users },
    { id: 'products', label: 'المحتوى', icon: Package },
    { id: 'categories', label: 'التصنيفات', icon: Tag },
    { id: 'rates', label: 'أسعار الصرف', icon: DollarSign },
    { id: 'storeInfo', label: 'معلومات المتجر', icon: Info },
  ];

  const getRoleBadge = (role) => {
    const styles = {
      Admin: 'bg-purple-50 text-purple-700 border-purple-200',
      Seller: 'bg-blue-50 text-blue-700 border-blue-200',
      Buyer: 'bg-slate-50 text-slate-600 border-slate-200',
    };
    const labels = { Admin: 'مسؤول', Seller: 'بائع', Buyer: 'مشتري' };
    return (
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${styles[role] || styles.Buyer}`}>
        {labels[role] || role}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans" dir="rtl">

      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0.5 shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700">
               <img src="/Logo.png" alt="شعار متجر الجعدي" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg leading-none">لوحة المسؤول</h1>
              <p className="text-xs text-slate-400 mt-0.5">مرحباً، {user?.fullName || 'مسؤول'}</p>
            </div>
          </div>
          <Link
            to="/"
            className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors flex items-center gap-1"
          >
            <Home className="w-4 h-4" />
            الرئيسية
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-between bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</span>
              <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-4 flex items-center justify-between bg-green-50 border border-green-200 text-green-600 text-sm px-4 py-3 rounded-xl">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</span>
              <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabItems.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ======================== DASHBOARD TAB ======================== */}
        {activeTab === 'dashboard' && (
          <div>
            {statsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : stats ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
                {[
                  { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                  { label: 'إجمالي المنتجات', value: stats.totalProducts, icon: Package, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                  { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-amber-50 text-amber-600 border-amber-100' },
                  { label: 'عدد البائعين', value: stats.totalSellers, icon: UserCog, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                  { label: 'طلبات اليوم', value: stats.todayOrders, icon: TrendingUp, color: 'bg-rose-50 text-rose-600 border-rose-100' },
                  { label: 'مستخدمين جدد اليوم', value: stats.todayNewUsers, icon: UserPlus, color: 'bg-purple-50 text-purple-600 border-purple-100' },
                ].map(stat => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border p-4 sm:p-5 ${stat.color}`}
                  >
                    <stat.icon className="w-6 h-6 mb-2 opacity-80" />
                    <div className="text-2xl sm:text-3xl font-extrabold">{stat.value}</div>
                    <div className="text-xs font-medium opacity-60 mt-1">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">لا توجد بيانات</div>
            )}
          </div>
        )}

        {/* ======================== USERS TAB ======================== */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">إدارة المستخدمين</h2>
            {usersLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا يوجد مستخدمين</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map(u => (
                  <motion.div
                    key={u.id}
                    layout
                    className={`bg-white rounded-2xl border p-4 sm:p-5 flex flex-col sm:flex-row gap-3 sm:items-center transition-all ${
                      u.isBlocked ? 'border-red-200 bg-red-50/30' : 'border-slate-200 hover:shadow-md'
                    }`}
                  >
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 text-sm sm:text-base">{u.fullName}</h3>
                        {getRoleBadge(u.role)}
                        {u.isVerified && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-50 border border-green-200 text-green-600 text-[10px] font-bold rounded-md">
                            <ShieldCheck className="w-3 h-3" /> موثق
                          </span>
                        )}
                        {u.isBlocked && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold rounded-md">
                            <Ban className="w-3 h-3" /> محظور
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-xs text-slate-400">
                        <span>{u.phoneNumber}</span>
                        {u.email && <span>{u.email}</span>}
                        <span>{u.city}</span>
                        <span>منتجات: {u.productCount}</span>
                        <span>طلبات: {u.orderCount}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {/* Block / Unblock */}
                      <button
                        onClick={() => handleBlockUser(u.id)}
                        className={`p-2 rounded-xl transition-all text-sm ${
                          u.isBlocked
                            ? 'text-green-500 hover:bg-green-50 hover:text-green-700'
                            : 'text-amber-500 hover:bg-amber-50 hover:text-amber-700'
                        }`}
                        title={u.isBlocked ? 'إلغاء الحظر' : 'حظر'}
                      >
                        {u.isBlocked ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                      </button>

                      {/* Promote to Seller */}
                      {u.role === 'Buyer' && (
                        <button
                          onClick={() => handleChangeRole(u.id, 'Seller')}
                          className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                          title="ترقية إلى بائع"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      )}
                      {/* Demote to Buyer */}
                      {u.role === 'Seller' && (
                        <button
                          onClick={() => handleChangeRole(u.id, 'Buyer')}
                          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                          title="تخفيض إلى مشتري"
                        >
                          <UserCog className="w-4 h-4" />
                        </button>
                      )}

                      {/* Delete */}
                      {u.role !== 'Admin' && (
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="حذف الحساب"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================== PRODUCTS TAB ======================== */}
        {activeTab === 'products' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">إدارة المحتوى</h2>
              <button
                onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                إضافة منتج
              </button>
            </div>

            {/* Add/Edit Product Modal */}
            <AnimatePresence>
              {showProductForm && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={closeProductModal}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
                  >
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                      </h3>
                      <button onClick={closeProductModal} className="p-1 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                    <AddProductForm
                      onSuccess={handleProductCreated}
                      onCancel={closeProductModal}
                      editProduct={editingProduct}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {productsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد منتجات</h3>
              </div>
            ) : (
              <div className="grid gap-4">
                {products.map(product => (
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
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base truncate">{product.title}</h3>
                        {product.isPromoted && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold rounded-md shadow-sm">
                            ⭐ مُروَّج
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        {product.discountPrice ? (
                          <>
                            <span className="text-slate-400 line-through text-xs">
                              {Number(product.price).toLocaleString('en-US')} {api.CurrencySymbol[product.currency] || 'ريال'}
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                              {Number(product.discountPrice).toLocaleString('en-US')} {api.CurrencySymbol[product.currency] || 'ريال'}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-red-50 dark:bg-red-900/30 text-red-500 rounded-md">
                              -{Math.round(((product.price - product.discountPrice) / product.price) * 100)}%
                            </span>
                          </>
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                            {Number(product.price || 0).toLocaleString('en-US')} {api.CurrencySymbol[product.currency] || 'ريال'}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          product.isHidden ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400' : 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        }`}>
                          {product.isHidden ? 'مخفي' : 'نشط'}
                        </span>
                        {product.categoryName && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-600">
                            {product.categoryName}
                          </span>
                        )}
                        {product.promotionLabel && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800">
                            {product.promotionLabel}
                          </span>
                        )}
                        <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                          البائع: {product.sellerName}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => openEditProductModal(product)}
                        className="p-2.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="تعديل المنتج"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================== CATEGORIES TAB ======================== */}
        {activeTab === 'categories' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">إدارة التصنيفات</h2>
              <button
                onClick={() => openCategoryForm()}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                إضافة تصنيف
              </button>
            </div>

            {/* Category Form Modal */}
            <AnimatePresence>
              {showCategoryForm && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
                  onClick={() => setShowCategoryForm(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl"
                  >
                    <div className="flex items-center justify-between p-5 border-b border-slate-100">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {editingCategory ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
                      </h3>
                      <button onClick={() => setShowCategoryForm(false)} className="p-1 hover:bg-slate-100 rounded-lg">
                        <X className="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                    <div className="p-5 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">اسم التصنيف</label>
                        <input
                          type="text"
                          value={categoryForm.name}
                          onChange={e => setCategoryForm(f => ({ ...f, name: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400"
                          placeholder="مثال: عسل بلدي"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">أيقونة التصنيف (اختياري)</label>
                        {categoryForm.iconUrl && (
                          <div className="mb-2 flex items-center gap-2">
                            <img src={categoryForm.iconUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                            <button
                              type="button"
                              onClick={() => setCategoryForm(f => ({ ...f, iconUrl: '' }))}
                              className="text-xs text-red-500 hover:text-red-700 font-semibold"
                            >إزالة</button>
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files[0];
                            if (!file) return;
                            try {
                              const url = await api.uploadCategoryIcon(file);
                              setCategoryForm(f => ({ ...f, iconUrl: url }));
                            } catch (err) {
                              setError('فشل رفع الأيقونة: ' + (err.message || ''));
                            }
                          }}
                          className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        />
                      </div>
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleSaveCategory}
                          className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 transition-all"
                        >
                          <Save className="w-4 h-4" />
                          {editingCategory ? 'تحديث' : 'إضافة'}
                        </button>
                        <button
                          onClick={() => setShowCategoryForm(false)}
                          className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {categoriesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <Tag className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-800 mb-2">لا توجد تصنيفات</h3>
                <p className="text-slate-500 mb-4">ابدأ بإضافة أول تصنيف!</p>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map(cat => (
                  <motion.div
                    key={cat.id}
                    layout
                    className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md transition-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      {cat.iconUrl ? (
                        <img src={cat.iconUrl} alt="" className="w-10 h-10 rounded-xl object-cover border border-slate-100" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-indigo-400" />
                        </div>
                      )}
                      <span className="font-bold text-slate-800">{cat.name}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openCategoryForm(cat)}
                        className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                        title="تعديل"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
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
          </div>
        )}

        {/* ======================== EXCHANGE RATES TAB ======================== */}
        {activeTab === 'rates' && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-6">إدارة أسعار الصرف</h2>
            {ratesLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              </div>
            ) : (
              <div className="max-w-lg">
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 sm:p-8 shadow-sm"
                >
                  {/* Header Alert */}
                  <div className="flex items-center gap-3 mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                    <DollarSign className="w-6 h-6 text-amber-600 flex-shrink-0" />
                    <div>
                      <p className="font-bold text-amber-800 text-sm">تحديث سعر الصرف اليومي</p>
                      <p className="text-xs text-amber-600 mt-0.5">تحديث الأسعار هنا سيؤثر على جميع أسعار المنتجات في الموقع تلقائياً</p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* USD → Sanaa */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        🇺🇸 دولار → ريال صنعاء
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={rates.USD_to_YER_Sanaa}
                          onChange={e => setRates(r => ({ ...r, USD_to_YER_Sanaa: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400"
                          dir="ltr"
                          min="1"
                          step="0.01"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">ريال</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">1 دولار = {rates.USD_to_YER_Sanaa?.toLocaleString('en-US')} ريال صنعاء</p>
                    </div>

                    {/* USD → Aden */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                        🇺🇸 دولار → ريال عدن
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={rates.USD_to_YER_Aden}
                          onChange={e => setRates(r => ({ ...r, USD_to_YER_Aden: parseFloat(e.target.value) || 0 }))}
                          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-400"
                          dir="ltr"
                          min="1"
                          step="0.01"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">ريال</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">1 دولار = {rates.USD_to_YER_Aden?.toLocaleString('en-US')} ريال عدن</p>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleUpdateRates}
                      disabled={ratesSaving}
                      className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60 active:scale-[0.98]"
                    >
                      {ratesSaving ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <RefreshCw className="w-5 h-5" />
                      )}
                      {ratesSaving ? 'جاري التحديث...' : 'تحديث أسعار الصرف'}
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            {/* ─── Store Info Tab ─── */}
            {activeTab === 'storeInfo' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">معلومات المتجر الأساسية</h2>
                    <p className="text-sm text-slate-500 mt-1">تحديث معلومات "من نحن" وروابط التواصل الاجتماعي التي تظهر في الفوتر.</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                >
                  <div className="p-6 space-y-6 max-w-2xl">
                    {/* About Us */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                        <Info className="w-4 h-4 inline ml-1.5" />
                        من نحن
                      </label>
                      <textarea
                        value={storeInfo.aboutUsText}
                        onChange={(e) => setStoreInfo({ ...storeInfo, aboutUsText: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 min-h-[120px] resize-y"
                        placeholder="نبذة عن المتجر ورؤيته..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Email */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <Mail className="w-4 h-4 inline ml-1.5" />
                          الايميل الخاص بالمتجر
                        </label>
                        <input
                          type="email"
                          value={storeInfo.contactEmail}
                          onChange={(e) => setStoreInfo({ ...storeInfo, contactEmail: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
                          dir="ltr"
                          placeholder="info@store.com"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <Phone className="w-4 h-4 inline ml-1.5" />
                          رقم التواصل السريع
                        </label>
                        <input
                          type="text"
                          value={storeInfo.contactPhone}
                          onChange={(e) => setStoreInfo({ ...storeInfo, contactPhone: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
                          dir="ltr"
                          placeholder="+967 77..."
                        />
                      </div>

                      {/* WhatsApp */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <LinkIcon className="w-4 h-4 inline ml-1.5" />
                          رابط واتساب
                        </label>
                        <input
                          type="url"
                          value={storeInfo.whatsappUrl}
                          onChange={(e) => setStoreInfo({ ...storeInfo, whatsappUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
                          dir="ltr"
                          placeholder="https://wa.me/..."
                        />
                      </div>

                      {/* Facebook */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <LinkIcon className="w-4 h-4 inline ml-1.5" />
                          رابط فيسبوك
                        </label>
                        <input
                          type="url"
                          value={storeInfo.facebookUrl}
                          onChange={(e) => setStoreInfo({ ...storeInfo, facebookUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
                          dir="ltr"
                          placeholder="https://facebook.com/..."
                        />
                      </div>

                      {/* Twitter */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <LinkIcon className="w-4 h-4 inline ml-1.5" />
                          رابط إكس (تويتر)
                        </label>
                        <input
                          type="url"
                          value={storeInfo.twitterUrl}
                          onChange={(e) => setStoreInfo({ ...storeInfo, twitterUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
                          dir="ltr"
                          placeholder="https://x.com/..."
                        />
                      </div>

                      {/* Instagram */}
                      <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                          <LinkIcon className="w-4 h-4 inline ml-1.5" />
                          رابط إنستغرام
                        </label>
                        <input
                          type="url"
                          value={storeInfo.instagramUrl}
                          onChange={(e) => setStoreInfo({ ...storeInfo, instagramUrl: e.target.value })}
                          className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-left"
                          dir="ltr"
                          placeholder="https://instagram.com/..."
                        />
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handleUpdateStoreInfo}
                        disabled={storeInfoSaving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-60 active:scale-[0.98]"
                      >
                        {storeInfoSaving ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                        {storeInfoSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
