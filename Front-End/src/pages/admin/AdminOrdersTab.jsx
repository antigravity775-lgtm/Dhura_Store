import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  ClipboardList,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Eye,
  ChevronDown,
  ChevronUp,
  Download,
  Loader2,
} from 'lucide-react';
import * as api from '../../services/api';
import * as XLSX from 'xlsx';
import {
  AdminToolbar,
  AdminSearch,
  AdminFilterChips,
  AdminCard,
  AdminEmptyState,
  AdminLoading,
  AdminGhostButton,
  AdminFadeIn,
  adminSelectClass,
} from './AdminUI';

const AdminOrdersTab = ({ orders, ordersLoading, mutateOrders, showSuccess, setError }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.updateAdminOrderStatus(orderId, newStatus);
      mutateOrders();
      showSuccess("تم تحديث حالة الطلب بنجاح ✅");
    } catch (err) {
      setError(err.message || "فشل تحديث حالة الطلب");
    }
  };

  const filteredOrders = React.useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => {
      if (orderStatusFilter !== "All" && o.status !== orderStatusFilter) return false;
      if (!searchQuery.trim()) return true;
      return o.buyer?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
             o.id?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [orders, orderStatusFilter, searchQuery]);

  const handleExportExcel = () => {
    if (filteredOrders.length === 0) return;
    
    const exportData = filteredOrders.map(order => ({
      'رقم الطلب': order.id,
      'تاريخ الطلب': new Date(order.orderDate).toLocaleDateString("ar-EG"),
      'اسم المشتري': order.buyer?.fullName || 'غير معروف',
      'رقم الهاتف': order.buyer?.phoneNumber || 'غير متوفر',
      'العنوان': order.shippingAddress,
      'طريقة الدفع': order.paymentMethod,
      'الإجمالي': order.totalAmount,
      'الحالة': order.status,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلبات");
    XLSX.writeFile(wb, `orders_export_${new Date().toLocaleDateString("en-US")}.xlsx`);
  };

  const orderStatusOptions = [
    { value: "All", label: "الكل" },
    { value: "Pending", label: "قيد الانتظار" },
    { value: "Confirmed", label: "مؤكد" },
    { value: "Shipped", label: "تم الشحن" },
    { value: "Delivered", label: "تم التوصيل" },
    { value: "Cancelled", label: "ملغي" },
  ];

  const orderStatusBadge = (status) => {
    const cfg = {
      Pending: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800", Icon: Clock },
      Confirmed: { label: "مؤكد", color: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800", Icon: CheckCircle },
      Processing: { label: "جاري التجهيز", color: "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800", Icon: Package },
      Shipped: { label: "تم الشحن", color: "bg-gold-100 text-gold-700 border-gold-200 dark:bg-gold-900/30 dark:text-gold-400 dark:border-gold-800", Icon: Truck },
      Delivered: { label: "تم التوصيل", color: "bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800", Icon: CheckCircle },
      Cancelled: { label: "ملغي", color: "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800", Icon: XCircle },
    };
    const c = cfg[status] || cfg.Pending;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${c.color}`}>
        <c.Icon className="w-3.5 h-3.5" />
        {c.label}
      </span>
    );
  };

  return (
    <div>
      <AdminToolbar
        title="إدارة الطلبات"
        subtitle={`${filteredOrders.length} طلب`}
        icon={ClipboardList}
        actions={
          <AdminGhostButton onClick={handleExportExcel}>
            <Download className="w-4 h-4" />
            تصدير Excel
          </AdminGhostButton>
        }
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <AdminSearch
            className="flex-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث بالاسم أو رقم الطلب..."
          />
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className={`${adminSelectClass} sm:w-44`}
          >
            {orderStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div className="mt-3">
          <AdminFilterChips
            items={orderStatusOptions.map((o) => ({ id: o.value, label: o.label }))}
            value={orderStatusFilter}
            onChange={setOrderStatusFilter}
          />
        </div>
      </AdminToolbar>

      {ordersLoading ? (
        <AdminLoading label="جاري تحميل الطلبات..." />
      ) : orders.length === 0 ? (
        <AdminEmptyState
          icon={ClipboardList}
          title="لا توجد طلبات"
          description="لم يتم استلام أي طلبات بعد أو لا توجد نتائج للبحث"
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order, index) => {
              const isExpanded = expandedOrderId === order.id;
              const orderItems = order.orderItems || [];
              const orderDate = new Date(order.orderDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

              return (
                <AdminFadeIn key={order.id} delay={index * 0.03}>
                <AdminCard className="!p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">طلب #{order.id?.slice(0, 8)?.toUpperCase()}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          <span className="text-xs text-slate-400">{orderDate}</span>
                          <span className="text-xs text-slate-300 dark:text-slate-600">•</span>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{order.buyer?.fullName}</span>
                        </div>
                      </div>
                    </div>
                    {orderStatusBadge(order.status)}
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">📍 {order.shippingAddress}</span>
                    <span className="flex items-center gap-1">💳 {order.paymentMethod}</span>
                    <span className="font-bold text-gold-600 dark:text-gold-400">الإجمالي: {Number(order.totalAmount || 0).toLocaleString("en-US")} ريال</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-gold-600 bg-bone dark:bg-slate-800 hover:bg-gold-50 rounded-lg transition-all">
                      <Eye className="w-3.5 h-3.5" /> {orderItems.length} منتج {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <div className="flex-1" />
                    {order.status === "Pending" && (
                      <>
                        <button onClick={() => handleOrderStatusUpdate(order.id, "Confirmed")} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-all">
                          <CheckCircle className="w-3.5 h-3.5" /> تأكيد الطلب
                        </button>
                        <button onClick={() => handleOrderStatusUpdate(order.id, "Cancelled")} className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-all">
                          <XCircle className="w-3.5 h-3.5" /> رفض
                        </button>
                      </>
                    )}
                  </div>

                  {isExpanded && orderItems.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-dashed border-slate-200 dark:border-slate-700">
                      <div className="grid gap-3">
                        {orderItems.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/50">
                            <img src={item.productImageUrl || item.product?.imageUrl || item.product?.mainImageUrl} alt={item.productTitle || item.product?.title} className="w-12 h-12 object-cover rounded-md" />
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.productTitle || item.product?.title}</h4>
                              <p className="text-xs text-slate-500">الكمية: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </AdminCard>
                </AdminFadeIn>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTab;
