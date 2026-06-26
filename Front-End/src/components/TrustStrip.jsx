/**
 * TrustStrip — شريط الثقة والإحصائيات
 *
 * EN: 3-stat horizontal trust strip for the homepage.
 *     Shows customer count, product count, and average rating.
 *
 * AR: شريط ثقة أفقي بـ 3 إحصائيات للصفحة الرئيسية.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Package, Star } from 'lucide-react';

const STATS = [
  { icon: Users,   value: '+500',  label: 'عميل راضٍ',    color: 'text-emerald-500' },
  { icon: Package, value: '+200',  label: 'منتج أصيل',    color: 'text-agate-500'   },
  { icon: Star,    value: '4.8 ★', label: 'تقييم العملاء', color: 'text-amber-500'   },
];

const TrustStrip = () => (
  <motion.div
    className="grid grid-cols-3 gap-3 mb-6 sm:mb-8"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 }}
  >
    {STATS.map(({ icon: Icon, value, label, color }) => (
      <div
        key={label}
        className="flex flex-col items-center text-center py-3 px-2 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 shadow-sm"
      >
        <Icon className={`w-5 h-5 ${color} mb-1.5`} />
        <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-none mb-0.5">
          {value}
        </span>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-tight">
          {label}
        </span>
      </div>
    ))}
  </motion.div>
);

export default TrustStrip;
