import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import * as api from '../../services/api';

// Helper to resolve order currency (same as original)
function resolveOrderCurrency(order) {
  const itemCurrency = order?.items?.[0]?.product?.currency || order?.orderItems?.[0]?.product?.currency;
  if (order?.currency && order.currency !== 'YER_Sanaa') return order.currency;
  return itemCurrency || order?.currency;
}

const SellerSalesTab = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await api.getSales();
        setSales(data || []);
      } catch (err) {
        setError('تعذر تحميل المبيعات: ' + (err.message || ''));
      }
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-4 flex items-center justify-between bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
            <span className="flex items-center gap-2"><AlertCircle className="w-4 h-4" /> {error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 text-agate-500 animate-spin" /></div>
      ) : sales.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">لا توجد مبيعات</h3>
          <p className="text-slate-500 dark:text-slate-400">ستظهر هنا طلبات المشترين عند وصولها.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map(order => {
            const displayCurrency = resolveOrderCurrency(order);
            return (
              <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">طلب #{order.id?.slice(0, 8)?.toUpperCase()}</span>
                  <span className="text-xs font-medium px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                    {order.status || 'Pending'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">{order.items?.length || 0} منتج</span>
                  <span className="text-lg font-extrabold text-agate-600 dark:text-agate-400">
                    {order.totalAmount?.toLocaleString('en-US') || 0} {api.getCurrencySymbol ? api.getCurrencySymbol(displayCurrency) : ''}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};

export default SellerSalesTab;
