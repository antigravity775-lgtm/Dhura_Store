import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, MessageCircle, MapPin, User, ShieldCheck, Heart, Share2, ChevronLeft, ChevronRight, Clock, Tag, Package, ShoppingCart, Check, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import * as api from '../services/api';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';

// Fallback database for when API is down
const fallbackDB = {
  1: { id: 1, title: 'انفرتر طاقة شمسية Growatt 5kW برو', price: 950000, currency: 1, condition: 1, categoryName: 'الطاقة الشمسية', description: 'انفرتر طاقة شمسية عالي الكفاءة...', mainImageUrl: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=1000&q=80' },
  2: { id: 2, title: 'ماك بوك برو M2 شاشة 14 انش', price: 1850, currency: 3, condition: 2, categoryName: 'لابتوبات', description: 'ماك بوك برو 14 انش بمعالج M2...', mainImageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1000&q=80' },
  3: { id: 3, title: 'آيفون 15 برو ماكس 256 جيجا', price: 1100, currency: 3, condition: 1, categoryName: 'هواتف', description: 'آيفون 15 برو ماكس الجديد كلياً...', mainImageUrl: 'https://images.unsplash.com/photo-1695048132961-0eab789a421b?w=1000&q=80' },
};

function formatPrice(price, currency) {
  const formatted = price >= 1000 ? price.toLocaleString('en-US') : price.toString();
  const symbol = api.CurrencySymbol[currency] || 'ريال';
  return `${formatted} ${symbol}`;
}

const ProductSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-pulse w-full">
    <div className="w-36 h-5 bg-slate-200 rounded-lg mb-8"></div>
    <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">
      <div className="w-full lg:w-[55%] flex flex-col gap-4">
        <div className="w-full aspect-[4/3] bg-slate-200 rounded-3xl"></div>
      </div>
      <div className="w-full lg:w-[45%] flex flex-col gap-5">
        <div className="flex gap-2">
          <div className="w-16 h-7 bg-slate-200 rounded-lg"></div>
          <div className="w-24 h-7 bg-slate-200 rounded-lg"></div>
        </div>
        <div className="w-full h-10 bg-slate-200 rounded-xl"></div>
        <div className="w-3/4 h-10 bg-slate-200 rounded-xl"></div>
        <div className="w-40 h-12 bg-slate-200 rounded-xl"></div>
        <div className="w-full h-px bg-slate-200 my-2"></div>
        <div className="space-y-2.5">
          <div className="w-28 h-6 bg-slate-200 rounded"></div>
          <div className="w-full h-4 bg-slate-200 rounded"></div>
          <div className="w-full h-4 bg-slate-200 rounded"></div>
        </div>
        <div className="w-full h-16 bg-slate-200 rounded-2xl mt-auto"></div>
      </div>
    </div>
  </div>
);

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setNotFound(false);
    setAddedToCart(false);

    async function load() {
      try {
        const data = await api.getProductById(id);
        if (mounted) {
          setProduct(data);
          setLoading(false);
        }
      } catch {
        // Try fallback
        const fb = fallbackDB[id];
        if (fb && mounted) {
          setProduct(fb);
          setLoading(false);
        } else if (mounted) {
          setNotFound(true);
          setLoading(false);
        }
      }
    }

    load();
    return () => { mounted = false; };
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  if (loading) {
    return <Layout><ProductSkeleton /></Layout>;
  }

  if (notFound || !product) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 mb-6">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">المنتج غير موجود</h2>
          <p className="text-slate-500 mb-6">لم نتمكن من العثور على هذا المنتج. ربما تم حذفه أو أن الرابط غير صحيح.</p>
          <Link to="/" className="inline-flex px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700">
            العودة للرئيسية
          </Link>
        </div>
      </Layout>
    );
  }

  const conditionText = api.ConditionMap[product.condition] || 'جديد';
  const imageUrl = product.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=1000&q=80';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 mb-12 w-full">

        {/* زر الرجوع */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-indigo-600 transition-colors mb-8 group font-medium text-sm focus:outline-none"
        >
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          العودة للمنتجات
        </Link>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-14">

          {/* ========== العمود الأيمن: الصورة ========== */}
          <div className="w-full lg:w-[55%] flex flex-col gap-4 select-none">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-sm">
              <img
                src={imageUrl}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>

          {/* ========== العمود الأيسر: تفاصيل المنتج ========== */}
          <div className="w-full lg:w-[45%] flex flex-col">

            {/* شارات المعلومات */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${
                product.condition === 1
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <Package className="w-3.5 h-3.5" />
                {conditionText}
              </span>
              {product.categoryName && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  <Tag className="w-3.5 h-3.5" />
                  {product.categoryName}
                </span>
              )}
              {product.stockQuantity > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-600 border border-green-100">
                  متوفر ({product.stockQuantity})
                </span>
              )}
            </div>

            {/* العنوان */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
              {product.title}
            </h1>

            {/* السعر وأزرار الإجراء */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-3xl sm:text-4xl font-black text-indigo-600 tracking-tight">
                {formatPrice(product.price, product.currency)}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => product && toggleFavorite(product)}
                  className={`p-2.5 rounded-xl border transition-all duration-200 ${
                    product && isFavorite(product.id)
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                  }`}
                  aria-label="إضافة للمفضلة"
                >
                  <Heart className="w-5 h-5" fill={product && isFavorite(product.id) ? 'currentColor' : 'none'} />
                </button>
                <button
                  className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all"
                  aria-label="مشاركة المنتج"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>

            <hr className="border-slate-200/80 mb-6" />

            {/* الوصف */}
            {product.description && (
              <div className="mb-6">
                <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                  الوصف
                </h3>
                <p className="text-slate-600 leading-relaxed text-[15px] whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            <div className="flex-grow"></div>

            {/* أزرار الإجراء */}
            <div className="mt-4 flex flex-col gap-3 sticky bottom-4 lg:static">
              {/* زر إضافة للسلة */}
              <motion.button
                onClick={handleAddToCart}
                disabled={addedToCart}
                className={`w-full flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-lg shadow-lg transition-all ${
                  addedToCart
                    ? 'bg-green-500 text-white shadow-green-500/25'
                    : 'bg-indigo-600 text-white shadow-indigo-600/25 hover:bg-indigo-500'
                } focus:outline-none focus:ring-4 focus:ring-indigo-400/50`}
                whileHover={!addedToCart ? { scale: 1.02 } : {}}
                whileTap={!addedToCart ? { scale: 0.98 } : {}}
              >
                {addedToCart ? (
                  <>
                    <Check className="w-6 h-6" />
                    تمت الإضافة للسلة ✓
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-6 h-6" />
                    أضف إلى السلة
                  </>
                )}
              </motion.button>

              {/* زر واتساب */}
              <motion.a
                href={`https://wa.me/967775181863?text=${encodeURIComponent(`مرحباً! أنا مهتم بالمنتج: ${product.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 px-8 rounded-2xl font-bold text-lg shadow-lg shadow-green-500/25 hover:bg-[#1fb855] focus:outline-none focus:ring-4 focus:ring-green-400/50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="w-6 h-6" />
                تواصل عبر واتساب
              </motion.a>

              <div className="text-center bg-amber-50 rounded-xl py-2.5 px-4 border border-amber-100">
                <p className="text-xs text-amber-700 font-medium flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  لا ترسل أموالاً مقدماً أبداً. قابل البائع في مكان عام وآمن.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailsPage;
