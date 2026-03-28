/**
 * SWR Data Hooks — خطافات جلب البيانات بتقنية SWR
 * 
 * EN: These hooks replace manual useState + useEffect + useCallback patterns
 *     with SWR's built-in stale-while-revalidate caching strategy.
 * 
 *     How SWR caching works on Vercel:
 *     1. First visit: fetches from API, stores in client memory cache
 *     2. Second visit: returns cached data INSTANTLY, then revalidates in background
 *     3. If new data differs from cache, UI updates seamlessly
 *     4. Each unique set of filter params gets its own cache entry
 *     5. dedupingInterval prevents duplicate requests within 60 seconds
 * 
 *     This dramatically reduces Vercel serverless function invocations
 *     and eliminates loading spinners on navigation back to the homepage.
 * 
 * AR: هذه الخطافات تستبدل أنماط useState + useEffect + useCallback اليدوية
 *     بإستراتيجية التخزين المؤقت stale-while-revalidate المدمجة في SWR.
 * 
 *     كيف يعمل تخزين SWR المؤقت على Vercel:
 *     1. الزيارة الأولى: يجلب من الـ API، يخزن في ذاكرة العميل المؤقتة
 *     2. الزيارة الثانية: يرجع البيانات المخزنة فوراً، ثم يحدّث في الخلفية
 *     3. إذا اختلفت البيانات الجديدة عن المخزنة، تتحدث الواجهة بسلاسة
 *     4. كل مجموعة فريدة من معاملات الفلترة تحصل على إدخال كاش خاص بها
 *     5. dedupingInterval يمنع الطلبات المكررة خلال 60 ثانية
 * 
 *     هذا يقلل بشكل كبير من استدعاءات دوال Vercel الخادمة
 *     ويزيل أيقونات التحميل عند العودة للصفحة الرئيسية.
 */

import useSWR from 'swr';
import * as api from '../services/api';

// ─── Products Hook / خطاف المنتجات ───

/**
 * EN: Generates a unique cache key from filter parameters.
 *     SWR uses this key to store and retrieve cached data.
 *     Different filter combinations = different cache entries.
 * 
 * AR: يولّد مفتاح كاش فريد من معاملات الفلترة.
 *     يستخدم SWR هذا المفتاح لتخزين واسترجاع البيانات المخزنة.
 *     مجموعات فلترة مختلفة = إدخالات كاش مختلفة.
 */
function getProductsCacheKey({ city, condition, maxPriceUsd, specialOffers } = {}) {
  const parts = ['products'];
  if (city) parts.push(`city:${city}`);
  if (condition) parts.push(`cond:${condition}`);
  if (maxPriceUsd) parts.push(`max:${maxPriceUsd}`);
  if (specialOffers) parts.push('offers');
  return parts.join('|');
}

/**
 * EN: The fetcher function that SWR calls. It receives the cache key
 *     and the original params to make the actual API call.
 * 
 * AR: دالة الجلب التي يستدعيها SWR. تستقبل مفتاح الكاش
 *     والمعاملات الأصلية لإجراء استدعاء الـ API الفعلي.
 */
async function fetchProducts(_key, params) {
  const apiParams = { pageSize: 50 };
  if (params.city) apiParams.city = params.city;
  if (params.condition) apiParams.condition = parseInt(params.condition);
  if (params.maxPriceUsd) apiParams.maxPriceUsd = parseFloat(params.maxPriceUsd);
  if (params.specialOffers) apiParams.specialOffers = true;
  
  const data = await api.getProducts(apiParams);
  return data || [];
}

/**
 * useProducts — خطاف المنتجات
 * 
 * EN: Fetches products with SWR caching. Returns the same shape as useState
 *     but with automatic caching, deduplication, and background revalidation.
 * 
 * AR: يجلب المنتجات مع تخزين SWR المؤقت. يرجع نفس الشكل مثل useState
 *     لكن مع تخزين مؤقت تلقائي، منع التكرار، وتحديث في الخلفية.
 * 
 * @param {Object} params - Filter parameters / معاملات الفلترة
 * @param {string} params.city - City filter / فلتر المدينة
 * @param {string} params.condition - Condition filter (1=New, 2=Used, 3=Refurbished) / فلتر الحالة
 * @param {string} params.maxPriceUsd - Max price filter / فلتر السعر الأقصى
 * @returns {{ data: Array, isLoading: boolean, isValidating: boolean, error: Error, mutate: Function }}
 */
export function useProducts({ city = '', condition = '', maxPriceUsd = '', specialOffers = false } = {}) {
  const params = { city, condition, maxPriceUsd, specialOffers };
  const cacheKey = getProductsCacheKey(params);

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    cacheKey,
    // EN: SWR passes the key as the first argument to the fetcher.
    //     We use a wrapper to also pass our params.
    // AR: يمرر SWR المفتاح كأول معامل للجالب.
    //     نستخدم غلاف لتمرير المعاملات أيضاً.
    () => fetchProducts(cacheKey, params),
    {
      // EN: Don't refetch when window regains focus (saves serverless invocations)
      // AR: لا تعيد الجلب عند استعادة التركيز على النافذة (يوفر استدعاءات الخادم)
      revalidateOnFocus: false,

      // EN: Do refetch when internet reconnects (user may have been offline)
      // AR: أعد الجلب عند استعادة الاتصال بالإنترنت (قد يكون المستخدم كان غير متصل)
      revalidateOnReconnect: true,

      // EN: Don't make the same request more than once per 60 seconds
      // AR: لا ترسل نفس الطلب أكثر من مرة كل 60 ثانية
      dedupingInterval: 60000,

      // EN: CRITICAL: Keep showing the previous data while new data loads.
      //     This prevents the skeleton from flashing when filters change.
      // AR: حرج: أبقِ عرض البيانات السابقة أثناء تحميل البيانات الجديدة.
      //     هذا يمنع وميض الهيكل العظمي عند تغيير الفلاتر.
      keepPreviousData: true,

      // EN: Retry failed requests up to 3 times with exponential backoff
      // AR: أعد محاولة الطلبات الفاشلة حتى 3 مرات مع تأخير تصاعدي
      errorRetryCount: 3,

      // EN: Fallback data while loading for the first time
      // AR: بيانات احتياطية أثناء التحميل لأول مرة
      fallbackData: undefined,
    }
  );

  return {
    data: data || [],
    isLoading,        // EN: true only on first load (no cached data) / صحيح فقط في التحميل الأول (بدون بيانات مخزنة)
    isValidating,     // EN: true during any fetch (including background) / صحيح أثناء أي جلب (بما في ذلك في الخلفية)
    error,
    mutate,           // EN: Manually trigger revalidation / تشغيل التحديث يدوياً
  };
}


// ─── Categories Hook / خطاف التصنيفات ───

/**
 * useCategories — خطاف التصنيفات
 * 
 * EN: Fetches categories with aggressive caching (5 min dedup).
 *     Categories rarely change, so we cache them longer.
 * 
 * AR: يجلب التصنيفات مع تخزين مؤقت قوي (5 دقائق منع تكرار).
 *     التصنيفات نادراً ما تتغير، لذلك نخزنها لفترة أطول.
 */
export function useCategories() {
  const { data, error, isLoading } = useSWR(
    'categories',
    async () => {
      const cats = await api.getCategories();
      return cats || [];
    },
    {
      revalidateOnFocus: false,
      // EN: Categories almost never change — 5 minute dedup window
      // AR: التصنيفات لا تتغير تقريباً — نافذة منع تكرار 5 دقائق
      dedupingInterval: 300000,
      // EN: Keep categories cached even when navigating away
      // AR: أبقِ التصنيفات مخزنة حتى عند الانتقال بعيداً
      revalidateOnReconnect: false,
      errorRetryCount: 2,
    }
  );

  return {
    data: data || [],
    isLoading,
    error,
  };
}
