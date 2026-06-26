import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Package,
  ShoppingCart,
  UserCog,
  TrendingUp,
  UserPlus,
  Loader2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import * as api from '../../services/api';

const AdminDashboardTab = ({ stats, statsLoading, orders }) => {
  // Generate mock chart data from orders if available, otherwise fallback
  const revenueData = useMemo(() => {
    if (!orders || orders.length === 0) return [];
    
    // Group orders by date (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    }).reverse();

    const dataMap = {};
    last7Days.forEach(dateStr => { dataMap[dateStr] = 0; });

    orders.forEach(order => {
      if (!order.totalAmount || order.status === 'Cancelled') return;
      const dateStr = new Date(order.orderDate).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
      if (dataMap[dateStr] !== undefined) {
        dataMap[dateStr] += Number(order.totalAmount);
      }
    });

    return last7Days.map(date => ({
      name: date,
      revenue: dataMap[date],
    }));
  }, [orders]);

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-agate-500 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center py-20 text-slate-400">لا توجد بيانات</div>;
  }

  const statCards = [
    { label: 'إجمالي المستخدمين', value: stats.totalUsers, icon: Users, color: 'bg-agate-50 dark:bg-agate-900/30 text-agate-600 dark:text-agate-400 border-agate-100 dark:border-agate-800/50' },
    { label: 'إجمالي المنتجات', value: stats.totalProducts, icon: Package, color: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50' },
    { label: 'إجمالي الطلبات', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-agate-50 dark:bg-agate-900/30 text-agate-600 dark:text-agate-400 border-agate-100 dark:border-agate-800/50' },
    { label: 'عدد البائعين', value: stats.totalSellers, icon: UserCog, color: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50' },
    { label: 'طلبات اليوم', value: stats.todayOrders, icon: TrendingUp, color: 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800/50' },
    { label: 'مستخدمين جدد اليوم', value: stats.todayNewUsers, icon: UserPlus, color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50' },
  ];

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-5">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`rounded-2xl border p-4 sm:p-5 ${stat.color}`}
          >
            <stat.icon className="w-6 h-6 mb-2 opacity-80" />
            <div className="text-2xl sm:text-3xl font-extrabold">{stat.value}</div>
            <div className="text-xs font-medium opacity-60 mt-1">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      {revenueData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart: Revenue Trend */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">إيرادات آخر 7 أيام</h3>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DAA520" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#DAA520" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#DAA520', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#DAA520" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart: Daily Orders Volume (can be expanded later) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">حجم المبيعات (أيام)</h3>
            <div className="h-[300px] w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickMargin={10} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(0)}k` : value} />
                  <Tooltip 
                    cursor={{fill: 'rgba(218, 165, 32, 0.1)'}}
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                    itemStyle={{ color: '#DAA520', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="revenue" fill="#DAA520" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardTab;
