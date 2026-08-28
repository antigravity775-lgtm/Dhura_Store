/**
 * CategoryBelt — حزام الفئات الأفقي المدمج
 *
 * EN: Compact horizontal scrolling category belt for the homepage.
 *     Small circular icons with labels. Links to individual categories.
 *     "View All" links to /categories dedicated page.
 *
 * AR: حزام فئات أفقي مدمج للصفحة الرئيسية.
 *     أيقونات دائرية صغيرة مع تسميات. يربط بصفحات الفئات.
 *     "عرض الكل" يوجه لصفحة /categories.
 */

import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { getOptimizedImageUrl, IMAGE_WIDTHS } from '../utils/cloudinaryUrl';

const CATEGORY_EMOJI_MAP = {
  'هواتف': '📱',
  'لابتوبات': '💻',
  'إلكترونيات': '🔌',
  'الطاقة الشمسية': '☀️',
  'البن اليمني': '☕',
  'ملابس': '👕',
  'أحذية': '👟',
  'ساعات': '⌚',
  'مجوهرات': '💎',
  'أثاث': '🪑',
  'أجهزة منزلية': '🏠',
  'سيارات': '🚗',
  'رياضة': '⚽',
  'كتب': '📚',
  'ألعاب': '🎮',
  'عطور': '🧴',
  'صحة': '💊',
  'طعام': '🍽️',
  'حيوانات': '🐾',
  'أطفال': '👶',
};

const DEFAULT_EMOJI = '🏷️';
const SKELETON_COUNT = 8;

function BeltItemSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px] sm:w-[76px]">
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full skeleton-shimmer" />
      <div className="h-2.5 w-12 rounded skeleton-shimmer" />
    </div>
  );
}

const CategoryBeltItem = React.memo(({ category }) => {
  const navigate = useNavigate();
  const { name, slug, iconUrl } = category;
  const emoji = CATEGORY_EMOJI_MAP[name] || DEFAULT_EMOJI;
  const href = slug ? `/category/${slug}` : `/category/${encodeURIComponent(name)}`;

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className="group flex flex-col items-center gap-1.5 flex-shrink-0 w-[68px] sm:w-[76px] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50 rounded-lg"
      aria-label={`تصفح قسم ${name}`}
    >
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-sm group-hover:shadow-md group-hover:border-gold-300 dark:group-hover:border-gold-600 transition-all duration-200 group-active:scale-95 flex items-center justify-center">
        {iconUrl ? (
          <img
            src={getOptimizedImageUrl(iconUrl, IMAGE_WIDTHS.CATEGORY_CARD)}
            alt={name}
            loading="lazy"
            width="64"
            height="64"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-2xl sm:text-3xl select-none" aria-hidden="true">
            {emoji}
          </span>
        )}
      </div>
      <span className="text-[11px] sm:text-xs font-semibold text-slate-700 dark:text-slate-300 text-center leading-tight line-clamp-2 w-full group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors">
        {name}
      </span>
    </button>
  );
});

CategoryBeltItem.displayName = 'CategoryBeltItem';

const CategoryBelt = React.memo(({ categories = [], isLoading = false, limit = 16 }) => {
  const scrollRef = useRef(null);
  const visibleCategories = categories.slice(0, limit);

  return (
    <section id="categories-section" className="mb-5 sm:mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
          الفئات
        </h2>
        <Link
          to="/categories"
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-gold-600 dark:text-gold-400 hover:text-gold-700 dark:hover:text-gold-300 transition-colors"
        >
          عرض الكل
          <ChevronLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div
        ref={scrollRef}
        className="category-belt-scroll flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1 snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {isLoading
          ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <BeltItemSkeleton key={`belt-skel-${i}`} />
            ))
          : visibleCategories.map((cat) => (
              <div key={cat.id} className="snap-start">
                <CategoryBeltItem category={cat} />
              </div>
            ))}

        {!isLoading && categories.length > limit && (
          <Link
            to="/categories"
            className="flex flex-col items-center justify-center gap-1.5 flex-shrink-0 w-[68px] sm:w-[76px] snap-start"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-100 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center hover:border-gold-400 hover:bg-gold-50 dark:hover:bg-gold-900/20 transition-colors">
              <ChevronLeft className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              المزيد
            </span>
          </Link>
        )}
      </div>

      {!isLoading && categories.length === 0 && (
        <p className="text-center text-sm text-slate-400 dark:text-slate-500 py-4">
          لا توجد فئات حالياً
        </p>
      )}
    </section>
  );
});

CategoryBelt.displayName = 'CategoryBelt';
export default CategoryBelt;
