import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Users,
  Package,
  Tag,
  DollarSign,
  Home,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  Trash2,
  ShieldBan,
  ShieldCheck,
  UserCog,
  Plus,
  Edit3,
  Save,
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  UserPlus,
  Ban,
  Crown,
  Info,
  Phone,
  Mail,
  Link as LinkIcon,
  Clock,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Eye,
  Megaphone,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import useSWR, { preload } from "swr";
import * as api from "../services/api";
import AddProductForm from "../components/AddProductForm";

// Import Tabs
import AdminDashboardTab from "./admin/AdminDashboardTab";
import AdminOrdersTab from "./admin/AdminOrdersTab";
import AdminUsersTab from "./admin/AdminUsersTab";
import AdminProductsTab from "./admin/AdminProductsTab";
import AdminCategoriesTab from "./admin/AdminCategoriesTab";
import AdminStoreInfoTab from "./admin/AdminStoreInfoTab";
import AdminBannersTab from "./admin/AdminBannersTab";

const logo = "/Logo_192.png";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error("AdminDashboard ErrorBoundary caught an error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-10 bg-white text-red-600 font-mono">
          <h1 className="text-2xl font-bold mb-4">Something went wrong in AdminDashboard.</h1>
          <p className="mb-4">{this.state.error && this.state.error.toString()}</p>
          <pre className="text-sm bg-red-50 p-4 rounded overflow-auto">
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "Admin";

  const [activeTab, setActiveTab] = useState("dashboard");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // SWR Conditional Fetching
  const isAuth = isAuthenticated && isAdmin;

  const {
    data: stats,
    isLoading: statsLoading,
  } = useSWR(isAuth && activeTab === "dashboard" ? "adminDashboard" : null, api.getAdminDashboard);

  const {
    data: usersData,
    isLoading: usersLoading,
    mutate: mutateUsers,
  } = useSWR(isAuth && activeTab === "users" ? "adminUsers" : null, api.getAdminUsers);
  const users = usersData || [];

  // Dashboard Warm-Up (Predictive Prefetching)
  useEffect(() => {
    if (isAuth) {
      preload("adminDashboard", api.getAdminDashboard);
      preload(["adminOrders", "All"], () => api.getAdminOrders("All"));
      preload("adminStoreInfo", api.getStoreInfo);
    }
  }, [isAuth]);

  // Orders
  const {
    data: ordersData,
    isLoading: ordersLoading,
    mutate: mutateOrders,
  } = useSWR(isAuth && (activeTab === "orders" || activeTab === "dashboard") ? ["adminOrders", "All"] : null, () => api.getAdminOrders("All"));
  const orders = ordersData || [];

  // Store Info
  const {
    data: storeInfoData,
    isLoading: storeInfoLoading,
    mutate: mutateStoreInfo,
  } = useSWR(isAuth && activeTab === "storeInfo" ? "adminStoreInfo" : null, api.getStoreInfo);

  const [storeInfo, setStoreInfo] = useState({
    aboutUsText: "", contactEmail: "", contactPhone: "", facebookUrl: "", twitterUrl: "", whatsappUrl: "", instagramUrl: "", shippingOfferText: "", seoTitle: "", seoDescription: "",
  });
  const [storeInfoSaving, setStoreInfoSaving] = useState(false);

  useEffect(() => {
    if (storeInfoData) {
      setStoreInfo({
        aboutUsText: storeInfoData.aboutUsText || "",
        contactEmail: storeInfoData.contactEmail || "",
        contactPhone: storeInfoData.contactPhone || "",
        facebookUrl: storeInfoData.facebookUrl || "",
        twitterUrl: storeInfoData.twitterUrl || "",
        whatsappUrl: storeInfoData.whatsappUrl || "",
        instagramUrl: storeInfoData.instagramUrl || "",
        shippingOfferText: storeInfoData.shippingOfferText || "",
        seoTitle: storeInfoData.seoTitle || "",
        seoDescription: storeInfoData.seoDescription || "",
      });
    }
  }, [storeInfoData]);

  // Modals & Forms local state
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", iconUrl: "" });

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      navigate("/auth", { replace: true });
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const showSuccessMsg = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  const handleBlockUser = async (id) => {
    try {
      await api.blockUser(id);
      mutateUsers();
      showSuccessMsg("تم تحديث حالة المستخدم");
    } catch (err) {
      setError("فشل تحديث الحالة: " + (err.message || ""));
    }
  };

  const handleChangeRole = async (id, newRole) => {
    try {
      await api.changeUserRole(id, newRole);
      mutateUsers();
      showSuccessMsg("تم تغيير دور المستخدم");
    } catch (err) {
      setError("فشل تغيير الدور: " + (err.message || ""));
    }
  };

  const handleDeleteUser = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحساب؟ لا يمكن التراجع!")) return;
    try {
      await api.deleteUser(id);
      mutateUsers();
      showSuccessMsg("تم حذف الحساب بنجاح");
    } catch (err) {
      setError("فشل حذف الحساب: " + (err.message || ""));
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا المنتج؟")) return;
    try {
      await api.deleteAdminProduct(id);
      mutateProducts();
      showSuccessMsg("تم حذف المنتج بنجاح");
    } catch (err) {
      setError("فشل حذف المنتج: " + (err.message || ""));
    }
  };

  const handleProductCreated = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    showSuccessMsg(editingProduct ? "تم تعديل المنتج بنجاح! ✅" : "تم إضافة المنتج بنجاح! 🎉");
    mutateProducts();
  };

  const openEditProductModal = (product) => {
    setEditingProduct(product);
    setShowProductForm(true);
  };

  const closeProductModal = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const openCategoryForm = (cat = null) => {
    if (cat) {
      setEditingCategory(cat);
      setCategoryForm({ name: cat.name, iconUrl: cat.iconUrl || "" });
    } else {
      setEditingCategory(null);
      setCategoryForm({ name: "", iconUrl: "" });
    }
    setShowCategoryForm(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) {
      setError("اسم التصنيف مطلوب");
      return;
    }
    try {
      if (editingCategory) {
        await api.updateCategory(editingCategory.id, { name: categoryForm.name, iconUrl: categoryForm.iconUrl || null });
        mutateCategories();
        showSuccessMsg("تم تحديث التصنيف");
      } else {
        await api.createCategory({ name: categoryForm.name, iconUrl: categoryForm.iconUrl || null });
        mutateCategories();
        showSuccessMsg("تم إضافة التصنيف بنجاح 🎉");
      }
      setShowCategoryForm(false);
    } catch (err) {
      setError("فشل حفظ التصنيف: " + (err.message || ""));
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا التصنيف؟")) return;
    try {
      await api.deleteCategory(id);
      mutateCategories();
      showSuccessMsg("تم حذف التصنيف");
    } catch (err) {
      setError("فشل حذف التصنيف: " + (err.message || ""));
    }
  };

  const handleUpdateStoreInfo = async () => {
    setStoreInfoSaving(true);
    try {
      await api.updateStoreInfo(storeInfo);
      showSuccessMsg("تم تحديث معلومات المتجر بنجاح ✅");
    } catch (err) {
      setError("فشل تحديث معلومات المتجر: " + (err.message || ""));
    }
    setStoreInfoSaving(false);
  };

  const tabItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    { id: "orders",    label: "إدارة الطلبات", icon: ClipboardList },
    { id: "users",     label: "المستخدمين",    icon: Users },
    { id: "products",  label: "المحتوى",        icon: Package },
    { id: "categories",label: "التصنيفات",    icon: Tag },
    { id: "banners",   label: "الإعلانات",    icon: Megaphone },
    { id: "storeInfo", label: "معلومات المتجر", icon: Info },
  ];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-bone dark:bg-slate-950 font-sans" dir="rtl">
      {/* Top Bar */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row gap-3 sm:items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-0 shadow-md shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-100 dark:border-slate-700 ring-1 ring-agate-200/60">
              <img src={logo} alt="شعار TEEB طيب" className="w-full h-full object-cover object-center scale-[1.16]" />
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 dark:text-white text-lg leading-none">لوحة المسؤول</h1>
              <p className="text-xs text-slate-400 mt-0.5">مرحباً، {user?.fullName || "مسؤول"}</p>
            </div>
          </div>
          <Link to="/" className="text-sm text-slate-500 hover:text-agate-600 font-medium transition-colors flex items-center gap-1">
            <Home className="w-4 h-4" /> الرئيسية
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        {/* Notifications */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
              <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</span>
              <button onClick={() => setError("")}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 text-sm px-4 py-3 rounded-xl">
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> {success}</span>
              <button onClick={() => setSuccess("")}><X className="w-4 h-4" /></button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex flex-wrap gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl mb-6 overflow-x-auto">
          {tabItems.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-white dark:bg-slate-700 text-agate-700 dark:text-agate-300 shadow-sm" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        {activeTab === "dashboard"  && <AdminDashboardTab stats={stats} statsLoading={statsLoading} orders={orders} />}
        {activeTab === "orders"     && <AdminOrdersTab orders={orders} ordersLoading={ordersLoading} mutateOrders={mutateOrders} showSuccess={showSuccessMsg} setError={setError} />}
        {activeTab === "users"      && <AdminUsersTab users={users} usersLoading={usersLoading} handleBlockUser={handleBlockUser} handleChangeRole={handleChangeRole} handleDeleteUser={handleDeleteUser} />}
        {activeTab === "products"   && <AdminProductsTab openEditProductModal={openEditProductModal} />}
        {activeTab === "categories" && <AdminCategoriesTab openCategoryForm={openCategoryForm} />}
        {activeTab === "banners"    && <AdminBannersTab showSuccess={showSuccessMsg} setError={setError} />}
        {activeTab === "storeInfo"  && <AdminStoreInfoTab storeInfo={storeInfo} setStoreInfo={setStoreInfo} handleUpdateStoreInfo={handleUpdateStoreInfo} storeInfoSaving={storeInfoSaving} />}

      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showProductForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={closeProductModal}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl dark:border dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
                <button onClick={closeProductModal} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <AddProductForm onSuccess={handleProductCreated} onCancel={closeProductModal} editProduct={editingProduct} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Category Form Modal */}
      <AnimatePresence>
        {showCategoryForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setShowCategoryForm(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-md shadow-2xl dark:border dark:border-slate-700">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{editingCategory ? "تعديل التصنيف" : "إضافة تصنيف جديد"}</h3>
                <button onClick={() => setShowCategoryForm(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">اسم التصنيف</label>
                  <input type="text" value={categoryForm.name} onChange={(e) => setCategoryForm(f => ({ ...f, name: e.target.value }))} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-agate-500/50" placeholder="مثال: عطر نسائي" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">أيقونة التصنيف (اختياري)</label>
                  {categoryForm.iconUrl && (
                    <div className="mb-2 flex items-center gap-2">
                      <img src={categoryForm.iconUrl} alt="" className="w-12 h-12 rounded-xl object-cover border border-slate-200" />
                      <button type="button" onClick={() => setCategoryForm(f => ({ ...f, iconUrl: "" }))} className="text-xs text-red-500 hover:text-red-700 font-semibold">إزالة</button>
                    </div>
                  )}
                  <input type="file" accept="image/*" onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    try {
                      const url = await api.uploadCategoryIcon(file);
                      setCategoryForm(f => ({ ...f, iconUrl: url }));
                    } catch (err) {
                      setError("فشل رفع الأيقونة: " + (err.message || ""));
                    }
                  }} className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 file:mr-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-agate-50 dark:file:bg-agate-900/40 file:text-agate-700 dark:file:text-agate-300" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={handleSaveCategory} className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-agate-600 text-white text-sm font-bold rounded-xl hover:bg-agate-500 transition-all">
                    <Save className="w-4 h-4" /> {editingCategory ? "تحديث" : "إضافة"}
                  </button>
                  <button onClick={() => setShowCategoryForm(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all">إلغاء</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
};

export default AdminDashboard;
