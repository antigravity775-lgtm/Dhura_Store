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
      Shipped: { label: "تم الشحن", color: "bg-agate-100 text-agate-700 border-agate-200 dark:bg-agate-900/30 dark:text-agate-400 dark:border-agate-800", Icon: Truck },
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
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">إدارة الطلبات</h2>
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg transition-colors border border-emerald-200 dark:border-emerald-800"
          >
            <Download className="w-4 h-4" />
            تصدير Excel
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-5 h-5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو رقم الطلب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-agate-500/50 text-slate-900 dark:text-white transition-all"
            />
          </div>
          <select
            value={orderStatusFilter}
            onChange={(e) => setOrderStatusFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-agate-500/50 text-slate-700 dark:text-slate-200"
          >
            {orderStatusOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {ordersLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-agate-500 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <ClipboardList className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد طلبات</h3>
          <p className="text-slate-500 dark:text-slate-400">لم يتم استلام أي طلبات بعد أو لا توجد نتائج للبحث</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders
            .map((order, index) => {
              const isExpanded = expandedOrderId === order.id;
              const orderItems = order.orderItems || [];
              const orderDate = new Date(order.orderDate).toLocaleDateString("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

              return (
                <motion.div key={order.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-5">
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
                    <span className="font-bold text-agate-600 dark:text-agate-400">الإجمالي: {Number(order.totalAmount || 0).toLocaleString("en-US")} ريال</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button onClick={() => setExpandedOrderId(isExpanded ? null : order.id)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-agate-600 bg-bone dark:bg-slate-800 hover:bg-agate-50 rounded-lg transition-all">
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
                            <img src={item.product?.mainImageUrl} alt={item.product?.title} className="w-12 h-12 object-cover rounded-md" />
                            <div className="flex-1">
                              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.product?.title}</h4>
                              <p className="text-xs text-slate-500">الكمية: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default AdminOrdersTab;
