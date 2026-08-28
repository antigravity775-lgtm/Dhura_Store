/**
 * CategoryTile — عنصر فئة مدمج للتصفح
 *
 * EN: Compact category navigation tile for the /categories directory.
 *     Circular image with contain-fit for logos, name below, optional count.
 *
 * AR: عنصر فئة مدمج لدليل /categories.
 *     صورة دائرية مع contain للشعارات، الاسم بالأسفل، عدد اختياري.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/cloudinaryUrl';

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
const TILE_IMAGE_WIDTH = 140;

function CategoryTileSkeleton() {
  return (
    <div className="flex flex-col items-center gap-1.5 px-1 py-2">
      <div className="w-[60px] h-[60px] sm:w-16 sm:h-16 rounded-full skeleton-shimmer" />
      <div className="h-2.5 w-14 rounded skeleton-shimmer" />
      <div className="h-2 w-10 rounded skeleton-shimmer" />
    </div>
  );
}

const CategoryTile = React.memo(({ category, isLoading = false }) => {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  if (isLoading || !category) return <CategoryTileSkeleton />;

  const { name, slug, iconUrl, _count } = category;
  const productCount = _count?.products ?? category.productCount ?? null;
  const hasImage = iconUrl && !imgError;
  const emoji = CATEGORY_EMOJI_MAP[name] || DEFAULT_EMOJI;
  const href = slug ? `/category/${slug}` : `/category/${encodeURIComponent(name)}`;

  return (
    <button
      type="button"
      onClick={() => navigate(href)}
      className="category-tile group flex flex-col items-center gap-1.5 w-full px-1 py-2 rounded-xl border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700 hover:bg-white/80 dark:hover:bg-slate-800/40 hover:shadow-sm transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/50"
      aria-label={`تصفح قسم ${name}`}
    >
      <div className="w-[60px] h-[60px] sm:w-16 sm:h-16 md:w-[68px] md:h-[68px] rounded-full overflow-hidden bg-bone-100 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/80 flex items-center justify-center p-2 group-hover:border-gold-300/80 dark:group-hover:border-gold-600/60 group-hover:shadow-md transition-all duration-200">
        {hasImage ? (
          <img
            src={getOptimizedImageUrl(iconUrl, TILE_IMAGE_WIDTH)}
            alt=""
            loading="lazy"
            width="68"
            height="68"
            className="max-w-full max-h-full object-contain transition-transform duration-200 group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-2xl sm:text-[1.65rem] select-none leading-none" aria-hidden="true">
            {emoji}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-0.5 w-full min-w-0">
        <span className="text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 text-center leading-tight line-clamp-2 w-full group-hover:text-gold-700 dark:group-hover:text-gold-400 transition-colors">
          {name}
        </span>
        {productCount !== null && productCount !== undefined && (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-none">
            {productCount} منتج
          </span>
        )}
      </div>
    </button>
  );
});

CategoryTile.displayName = 'CategoryTile';
CategoryTile.Skeleton = CategoryTileSkeleton;

export default CategoryTile;
