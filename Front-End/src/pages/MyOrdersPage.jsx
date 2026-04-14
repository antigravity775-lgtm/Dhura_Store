import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Loader2, Calendar, MapPin, CreditCard, ShoppingBag, ArrowRight, AlertCircle, Clock, CheckCircle, XCircle, Truck, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import Layout from '../components/Layout';
import * as api from '../services/api';

const statusConfig = {
  Pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800', icon: Clock },
  Confirmed: { label: 'تم التأكيد', color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', icon: ShieldCheck },
  Processing: { label: 'جاري التجهيز', color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800', icon: Package },
  Shipped: { label: 'تم الشحن', color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800', icon: Truck },
  Delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800', icon: CheckCircle },
  Cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800', icon: XCircle },
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadOrders() {
      try {
        const data = await api.getMyOrders();
        if (mounted) setOrders(data || []);
      } catch (err) {
        if (mounted) setError(err.message || 'حدث خطأ في تحميل الطلبات');
      }
      if (mounted) setLoading(false);
    }

    loadOrders();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            <p className="text-slate-500 dark:text-slate-400 font-medium">جاري تحميل الطلبات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            طلباتي
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            متابعة التسوق
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
              <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-2">لا توجد طلبات</h2>
            <p className="text-slate-500 dark:text-slate-400 mb-8">لم تقم بإنشاء أي طلبات بعد. ابدأ بتصفح المنتجات!</p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status] || statusConfig.Pending;
              const StatusIcon = status.icon;
              const orderDate = new Date(order.orderDate).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              const isExpanded = expandedOrder === order.id;
              const orderItems = order.orderItems || [];

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Order Header */}
                  <div className="p-5 sm:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm">طلب #{order.id?.slice(0, 8)?.toUpperCase()}</h3>
                          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {orderDate}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                    </div>

                    {/* Order Details */}
                    <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400 mb-4">
                      {order.shippingAddress && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                          {order.shippingAddress}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                        {order.paymentMethod === 'COD' || order.paymentMethod === 'CashOnDelivery' ? 'الدفع عند الاستلام' : order.paymentMethod === 'BankTransfer' ? 'تحويل بنكي' : order.paymentMethod || 'الدفع عند الاستلام'}
                      </span>
                    </div>

                    {/* Items Count and Total */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                      <button
                        onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                        className="flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors"
                      >
                        {orderItems.length} منتج
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <div className="text-left">
                        <span className="text-xs text-slate-400">الإجمالي</span>
                        <div className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                          {Number(order.totalAmount || 0).toLocaleString('en-US')} {api.CurrencySymbol[order.currency] || 'ريال'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Items */}
                  <AnimatePresence>
                    {isExpanded && orderItems.length > 0 && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 sm:px-6 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-4">
                          {orderItems.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-700 flex-shrink-0 border border-slate-200 dark:border-slate-600">
                                <img
                                  src={item.product?.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=100&q=60'}
                                  alt={item.product?.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{item.product?.title || 'منتج'}</p>
                                <p className="text-xs text-slate-400 mt-0.5">
                                  الكمية: {item.quantity} × {Number(item.unitPrice || 0).toLocaleString('en-US')}
                                </p>
                              </div>
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
                                {(item.quantity * Number(item.unitPrice || 0)).toLocaleString('en-US')}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default MyOrdersPage;
