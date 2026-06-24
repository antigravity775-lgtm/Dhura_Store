/**
 * Breadcrumbs — مكون التنقل التفصيلي
 *
 * EN: Visual breadcrumb navigation + BreadcrumbList JSON-LD for SEO.
 *     RTL-aware with proper arrow direction. Responsive design
 *     with truncation on mobile for long breadcrumb chains.
 *
 * AR: تنقل تفصيلي مرئي + بيانات BreadcrumbList المهيكلة لـ SEO.
 *     متوافق مع RTL مع اتجاه أسهم صحيح.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { buildBreadcrumbSchema } from '../utils/structuredData';
import { Helmet } from 'react-helmet-async';

/**
 * @param {Array<{name: string, url?: string}>} items - Breadcrumb chain
 *   Last item is the current page (no link). First item is always الرئيسية.
 *
 * Example:
 *   <Breadcrumbs items={[
 *     { name: 'الرئيسية', url: '/' },
 *     { name: 'العطور', url: '/category/العطور' },
 *     { name: 'عطر ديور ساوفاج' }
 *   ]} />
 */
const Breadcrumbs = ({ items = [] }) => {
  if (!items || items.length === 0) return null;

  const schema = buildBreadcrumbSchema(items);

  return (
    <>
      {/* JSON-LD for search engines */}
      {schema && (
        <Helmet>
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        </Helmet>
      )}

      {/* Visual breadcrumbs */}
      <nav
        aria-label="التنقل التفصيلي"
        className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 mb-5 overflow-x-auto scrollbar-hide"
      >
        <ol className="flex items-center gap-1 list-none p-0 m-0 flex-nowrap whitespace-nowrap">
          {items.map((item, index) => {
            const isLast = index === items.length - 1;

            return (
              <li key={index} className="flex items-center gap-1 min-w-0">
                {/* Separator arrow (except before first item) */}
                {index > 0 && (
                  <ChevronLeft className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                )}

                {isLast ? (
                  // Current page — no link, emphasized
                  <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-none">
                    {item.name}
                  </span>
                ) : (
                  // Linked ancestor
                  <Link
                    to={item.url || '/'}
                    className="hover:text-gold-600 dark:hover:text-gold-400 transition-colors truncate max-w-[120px] sm:max-w-none"
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};

export default Breadcrumbs;
