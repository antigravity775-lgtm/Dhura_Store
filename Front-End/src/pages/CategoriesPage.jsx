/**
 * CategoriesPage — صفحة جميع الفئات
 *
 * EN: Premium compact category directory at /categories.
 *     3-column mobile grid, 5–7 columns on desktop.
 *
 * AR: دليل فئات مدمج واحترافي في /categories.
 *     شبكة 3 أعمدة على الجوال، 5–7 على سطح المكتب.
 */

import React, { useState, useMemo } from 'react';
import { Search, LayoutGrid } from 'lucide-react';
import Layout from '../components/Layout';
import SEO from '../components/SEO';
import CategoryTile from '../components/CategoryTile';
import { useCategories } from '../hooks/useProducts';

const SKELETON_COUNT = 12;

const CategoriesPage = () => {
  const { data: categories, isLoading } = useCategories();
  const [searchText, setSearchText] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchText.trim()) return categories;
    const q = searchText.trim().toLowerCase();
    return categories.filter((cat) =>
      cat.name?.toLowerCase().includes(q)
    );
  }, [categories, searchText]);

  return (
    <Layout>
      <SEO title="جميع الفئات" description="تصفح جميع فئات المنتجات في متجر قصة" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-5 pb-24 md:pb-10">
        <header className="mb-4 sm:mb-5">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
            جميع الفئات
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            اكتشف ما يناسبك من جميع أقسام متجر قصة
          </p>
          {!isLoading && categories.length > 0 && (
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              {filteredCategories.length} فئة متاحة
            </p>
          )}
        </header>

        <div className="relative mb-4 sm:mb-5">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400 dark:text-slate-500" />
          </div>
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="block w-full pr-10 pl-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-gold-500/40 focus:border-gold-400 text-sm text-right shadow-sm"
            placeholder="ابحث عن فئة..."
            aria-label="ابحث عن فئة"
          />
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-1.5 sm:gap-2 md:gap-2.5">
          {isLoading
            ? Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <CategoryTile key={`cat-tile-skel-${i}`} isLoading />
              ))
            : filteredCategories.map((cat) => (
                <CategoryTile key={cat.id} category={cat} />
              ))}
        </div>

        {!isLoading && filteredCategories.length === 0 && (
          <div className="text-center py-14 text-slate-400 dark:text-slate-500">
            <LayoutGrid className="w-9 h-9 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-medium">
              {searchText ? 'لا توجد فئات تطابق البحث' : 'لا توجد فئات حالياً'}
            </p>
            {searchText && (
              <button
                type="button"
                onClick={() => setSearchText('')}
                className="mt-3 text-sm font-bold text-gold-600 dark:text-gold-400 hover:underline"
              >
                مسح البحث
              </button>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CategoriesPage;
