/**
 * TrustStrip — شريط الثقة الاجتماعية
 *
 * 3-column horizontal strip with animated counters.
 * Placed between HeroSection and CategoryGrid.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Package, Star } from 'lucide-react';

const stats = [
  { icon: Users,   value: '+500', label: 'عميل راضٍ',     color: 'text-emerald-500 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: Package, value: '+200', label: 'منتج أصيل',     color: 'text-sky-500 dark:text-sky-400',         bg: 'bg-sky-50 dark:bg-sky-900/20' },
  { icon: Star,    value: '4.8 ★', label: 'تقييم العملاء', color: 'text-gold-500 dark:text-gold-400',       bg: 'bg-gold-50 dark:bg-gold-900/20' },
];

const TrustStrip = React.memo(() => (
  <motion.div
    className="grid grid-cols-3 gap-3 sm:gap-4 my-6 sm:my-8"
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
  >
    {stats.map((stat) => {
      const Icon = stat.icon;
      return (
        <div
          key={stat.label}
          className="flex flex-col items-center gap-2 bg-white dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 rounded-2xl py-4 px-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
        >
          <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
            <Icon className={`w-4.5 h-4.5 ${stat.color}`} />
          </div>
          <span className={`text-xl sm:text-2xl font-black ${stat.color} leading-none`}>{stat.value}</span>
          <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400 text-center leading-tight">{stat.label}</span>
        </div>
      );
    })}
  </motion.div>
));

TrustStrip.displayName = 'TrustStrip';
export default TrustStrip;
