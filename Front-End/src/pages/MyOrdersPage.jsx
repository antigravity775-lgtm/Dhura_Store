import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Package, Loader2, Calendar, MapPin, CreditCard, ShoppingBag, ArrowRight, AlertCircle, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
import Layout from '../components/Layout';
import * as api from '../services/api';

const statusConfig = {
  Pending: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock },
  Confirmed: { label: 'تم التأكيد', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle },
  Shipped: { label: 'تم الشحن', color: 'bg-indigo-100 text-indigo-700 border-indigo-200', icon: Truck },
  Delivered: { label: 'تم التوصيل', color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle },
  Cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700 border-red-200', icon: XCircle },
};

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
            <p className="text-slate-500 font-medium">جاري تحميل الطلبات...</p>
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
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Package className="w-8 h-8 text-indigo-600" />
            طلباتي
          </h1>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowRight className="w-4 h-4" />
            متابعة التسوق
          </Link>
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm font-medium px-4 py-3 rounded-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 mb-6">
              <ShoppingBag className="w-12 h-12 text-slate-300" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-800 mb-2">لا توجد طلبات</h2>
            <p className="text-slate-500 mb-8">لم تقم بإنشاء أي طلبات بعد. ابدأ بتصفح المنتجات!</p>
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

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">طلب #{order.id?.slice(0, 8)?.toUpperCase()}</h3>
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
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                    {order.shippingAddress && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4 text-slate-400" />
                        {order.shippingAddress}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-slate-400" />
                      {order.paymentMethod || 'الدفع عند الاستلام'}
                    </span>
                  </div>

                  {/* Items Count and Total */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm text-slate-500">
                      {order.items?.length || 0} منتج
                    </span>
                    <div className="text-left">
                      <span className="text-xs text-slate-400">الإجمالي</span>
                      <div className="text-lg font-extrabold text-indigo-600">
                        {order.totalAmount?.toLocaleString('en-US') || '0'} {order.currency || 'ريال'}
                      </div>
                    </div>
                  </div>
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
