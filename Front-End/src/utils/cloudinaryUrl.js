/**
 * Cloudinary URL Optimizer — أداة تحسين روابط Cloudinary
 * 
 * EN: Transforms raw Cloudinary URLs to include dynamic optimizations:
 *     - f_auto: Serves WebP/AVIF to compatible browsers (40-60% smaller files)
 *     - q_auto: AI-selected quality (no visible degradation)
 *     - w_{width}: Exact pixel width needed (prevents downloading giant images)
 *     - c_limit: Never upscale, only downscale
 *     - dpr_auto: Adapts to device pixel ratio (Retina displays)
 * 
 * AR: يحوّل روابط Cloudinary الخام لتشمل تحسينات ديناميكية:
 *     - f_auto: يقدم صيغة WebP/AVIF للمتصفحات المتوافقة (أصغر بـ 40-60%)
 *     - q_auto: جودة مختارة بالذكاء الاصطناعي (بدون تدهور مرئي)
 *     - w_{width}: العرض الدقيق المطلوب بالبكسل (يمنع تحميل صور ضخمة)
 *     - c_limit: لا تكبير أبداً، فقط تصغير
 *     - dpr_auto: يتكيف مع كثافة بكسلات الجهاز (شاشات ريتينا)
 */

// EN: Regex to match Cloudinary upload URLs
// AR: تعبير نمطي لمطابقة روابط رفع Cloudinary
const CLOUDINARY_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(v\d+\/.+)$/;

// EN: Regex to detect if transformations are already present
// AR: تعبير نمطي للكشف عما إذا كانت التحويلات موجودة بالفعل
const HAS_TRANSFORMS_REGEX = /^(https?:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)([^v][^/]*\/)/;

/**
 * getOptimizedImageUrl — الحصول على رابط الصورة المُحسّن
 * 
 * EN: Takes a raw image URL and returns an optimized Cloudinary URL.
 *     If the URL is not from Cloudinary, returns it unchanged.
 *     If the URL already has transformations, replaces them.
 * 
 * AR: يأخذ رابط صورة خام ويرجع رابط Cloudinary مُحسّن.
 *     إذا لم يكن الرابط من Cloudinary، يرجعه كما هو.
 *     إذا كان الرابط يحتوي تحويلات بالفعل، يستبدلها.
 * 
 * @param {string} url - The original image URL / رابط الصورة الأصلي
 * @param {number} width - Target width in CSS pixels / العرض المستهدف بالبكسل
 * @returns {string} Optimized URL / الرابط المُحسّن
 */
export function getOptimizedImageUrl(url, width = 400) {
  if (!url || typeof url !== 'string') return url;

  // EN: Build the transformation string
  // AR: بناء سلسلة التحويلات
  const transforms = `f_auto,q_auto,w_${width},c_limit`;

  // EN: Case 1 — Clean Cloudinary URL without existing transforms
  // AR: الحالة 1 — رابط Cloudinary نظيف بدون تحويلات موجودة
  const cleanMatch = url.match(CLOUDINARY_REGEX);
  if (cleanMatch) {
    return `${cleanMatch[1]}${transforms}/${cleanMatch[2]}`;
  }

  // EN: Case 2 — Cloudinary URL that already has transforms — replace them
  // AR: الحالة 2 — رابط Cloudinary يحتوي تحويلات بالفعل — استبدلها
  const transformMatch = url.match(HAS_TRANSFORMS_REGEX);
  if (transformMatch) {
    // EN: Find the version/path portion after existing transforms
    // AR: إيجاد جزء الإصدار/المسار بعد التحويلات الموجودة
    const baseUrl = transformMatch[1];
    const afterBase = url.substring(baseUrl.length);
    // EN: Find the version marker (v followed by digits)
    // AR: إيجاد علامة الإصدار (v متبوعة بأرقام)
    const versionMatch = afterBase.match(/(v\d+\/.+)$/);
    if (versionMatch) {
      return `${baseUrl}${transforms}/${versionMatch[1]}`;
    }
  }

  // EN: Case 3 — Not a Cloudinary URL (e.g. Unsplash fallbacks) — return as-is
  // AR: الحالة 3 — ليس رابط Cloudinary (مثل صور Unsplash الاحتياطية) — أرجعه كما هو
  return url;
}

/**
 * Preset widths for common use cases / أعراض محددة مسبقاً للاستخدامات الشائعة
 * 
 * EN: These match the actual rendered sizes in the UI to avoid downloading
 *     unnecessary pixels. Calculated as: CSS width × 2 (for Retina).
 * 
 * AR: تطابق الأحجام المعروضة الفعلية في الواجهة لمنع تحميل بكسلات غير ضرورية.
 *     محسوبة كـ: عرض CSS × 2 (لشاشات ريتينا).
 */
export const IMAGE_WIDTHS = {
  GRID_CARD: 400,      // 2-column mobile grid: ~200px × 2dpr = 400px
  BELT_CARD: 380,      // Belt card: ~190px × 2dpr = 380px
  THUMBNAIL: 150,      // Small thumbnail: ~75px × 2dpr = 150px
  CATEGORY_CARD: 400,  // Category full-bleed card: ~200px × 2dpr = 400px
  DETAIL: 800,         // Product detail page: ~400px × 2dpr = 800px
};
