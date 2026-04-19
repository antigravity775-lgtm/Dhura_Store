import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';
import { PackageSearch, Loader2, AlertCircle, CheckCircle, Clock, ShieldCheck, Truck, XCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const statusConfig = {
  Pending: { label: 'قيد الانتظار', icon: Clock, color: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800' },
  Confirmed: { label: 'تم التأكيد', icon: ShieldCheck, color: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' },
  Processing: { label: 'جاري التجهيز', icon: Package, color: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' },
  Shipped: { label: 'تم الشحن', icon: Truck, color: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' },
  Delivered: { label: 'تم التوصيل', icon: CheckCircle, color: 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' },
  Cancelled: { label: 'ملغي', icon: XCircle, color: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800' },
};

const TrackOrderPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) return;
    let mounted = true;
    setLoading(true);
    api.getMyOrders()
      .then((data) => { if (mounted) setOrders(data || []); })
      .catch((err) => { if (mounted) setError(err.message || 'تعذر تحميل الطلبات'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [isAuthenticated]);

  const normalizedQuery = useMemo(() => query.trim().toLowerCase(), [query]);

  const matchedOrder = useMemo(() => {
    if (!normalizedQuery) return null;
    return orders.find((o) => String(o.id || '').toLowerCase() === normalizedQuery)
      || orders.find((o) => String(o.id || '').toLowerCase().startsWith(normalizedQuery));
  }, [orders, normalizedQuery]);

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
          تتبع الطلب
        </h1>

        {!isAuthenticated ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center flex-shrink-0">
                <PackageSearch className="w-5 h-5 text-amber-700 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-slate-700 dark:text-slate-200 font-semibold mb-2">
                  لتتبع طلبك، يرجى تسجيل الدخول أولاً.
                </p>
                <Link to="/auth" className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-dhura-500 text-white font-bold hover:bg-dhura-400 transition-colors">
                  تسجيل الدخول
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8">
              <label className="block text-sm font-extrabold text-slate-800 dark:text-slate-100 mb-2">
                رقم الطلب
              </label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="مثال: 9f3a1c2b..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400 text-right"
              />

              {loading && (
                <div className="mt-4 flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  جاري تحميل الطلبات...
                </div>
              )}

              {error && (
                <div className="mt-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {normalizedQuery && !loading && !error && (
              <div className="mt-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 sm:p-8">
                {matchedOrder ? (
                  (() => {
                    const status = statusConfig[matchedOrder.status] || statusConfig.Pending;
                    const Icon = status.icon;
                    return (
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">طلب</div>
                          <div className="text-lg font-extrabold text-slate-900 dark:text-white">
                            #{String(matchedOrder.id).slice(0, 8).toUpperCase()}
                          </div>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold border ${status.color}`}>
                          <Icon className="w-4 h-4" />
                          {status.label}
                        </span>
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    لم يتم العثور على طلب بهذا الرقم ضمن حسابك.
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default TrackOrderPage;

