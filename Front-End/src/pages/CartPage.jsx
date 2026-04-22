import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShoppingCart, Loader2, Check, MapPin, CreditCard, Banknote, AlertCircle, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

function formatPrice(price, currency) {
  const formatted = price >= 1000 ? price.toLocaleString('en-US') : price.toString();
  const symbol = api.CurrencySymbol[currency] || '';
  return `${formatted} ${symbol}`;
}

const CartPage = () => {
  const { items, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);
  const [error, setError] = useState('');

  const [checkoutForm, setCheckoutForm] = useState({
    shippingAddress: '',
    paymentMethod: 0, // 0 = CashOnDelivery
  });

  const handleCheckout = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (!checkoutForm.shippingAddress.trim()) {
      setError('الرجاء إدخال عنوان التوصيل');
      return;
    }

    setCheckoutLoading(true);
    setError('');

    try {
      await api.createOrder({
        buyerId: '00000000-0000-0000-0000-000000000000',
        shippingAddress: checkoutForm.shippingAddress,
        paymentMethod: checkoutForm.paymentMethod,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      setCheckoutDone(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء إنشاء الطلب');
    } finally {
      setCheckoutLoading(false);
    }
  };

  if (checkoutDone) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-8"
          >
            <Check className="w-12 h-12 text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">تم إنشاء الطلب بنجاح! 🎉</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">شكراً لك! سيتم التواصل معك قريباً لتأكيد الطلب.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/my-orders"
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
            >
              متابعة طلباتي
            </Link>
            <Link
              to="/"
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              متابعة التسوق
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-24 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 mb-6">
            <ShoppingCart className="w-12 h-12 text-slate-300 dark:text-slate-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-slate-200 mb-2">سلة التسوق فارغة</h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8">لم تقم بإضافة أي منتجات بعد. ابدأ بتصفح المنتجات!</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            تصفح المنتجات
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
            سلة التسوق
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-600 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            إفراغ السلة
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="flex-1 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div
                  key={item.productId}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 sm:p-5 flex gap-4 items-center shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* صورة المنتج */}
                  <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600">
                      <img
                        src={item.mainImageUrl || 'https://images.unsplash.com/photo-1560472355-536de3962603?w=200&q=60'}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>

                  {/* التفاصيل */}
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${item.productId}`}>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        {item.title}
                      </h3>
                    </Link>
                    <p className="text-indigo-600 dark:text-indigo-400 font-bold text-sm sm:text-base mt-1">
                      {formatPrice(item.price, item.currency)}
                    </p>

                    {/* أزرار الكمية */}
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-bold text-slate-800 dark:text-white text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= (item.stockQuantity || 9999)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          item.quantity >= (item.stockQuantity || 9999)
                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                            : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {item.quantity >= (item.stockQuantity || 9999) && (
                      <div className="flex items-center gap-1 mt-1.5 text-amber-600 dark:text-amber-400">
                        <AlertTriangle className="w-3 h-3" />
                        <span className="text-[11px] font-medium">الحد الأقصى للمخزون ({item.stockQuantity})</span>
                      </div>
                    )}
                  </div>

                  {/* حذف */}
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-2 text-slate-300 dark:text-slate-600 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:w-[340px]">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm sticky top-24">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5">ملخص الطلب</h3>

              <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between text-slate-500">
                  <span>المنتجات ({items.length})</span>
                  <span className="font-semibold text-slate-800 dark:text-white">{cartTotal.toLocaleString('en-US')}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>التوصيل</span>
                  <span className="text-green-600 font-semibold">مجاناً</span>
                </div>
                <hr className="border-slate-100 dark:border-slate-700" />
                <div className="flex justify-between">
                  <span className="font-bold text-slate-900 dark:text-white text-base">الإجمالي</span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-lg">{cartTotal.toLocaleString('en-US')}</span>
                </div>
              </div>

              {!showCheckout ? (
                <button
                  onClick={() => setShowCheckout(true)}
                  className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.98]"
                >
                  إتمام الطلب
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  {/* عنوان التوصيل */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">عنوان التوصيل</label>
                    <div className="relative">
                      <MapPin className="absolute right-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        value={checkoutForm.shippingAddress}
                        onChange={(e) => { setCheckoutForm({...checkoutForm, shippingAddress: e.target.value}); setError(''); }}
                        placeholder="المدينة، الحي، الشارع..."
                        rows={2}
                        className="w-full pr-10 pl-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-white dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-none"
                      />
                    </div>
                  </div>

                  {/* طريقة الدفع */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1.5">طريقة الدفع</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 0})}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          checkoutForm.paymentMethod === 0
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <Banknote className="w-4 h-4" />
                        عند الاستلام
                      </button>
                      <button
                        onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 1})}
                        className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          checkoutForm.paymentMethod === 1
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                            : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        <CreditCard className="w-4 h-4" />
                        تحويل بنكي
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-500 text-xs font-medium">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={handleCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-500 transition-all shadow-lg shadow-green-600/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    {checkoutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        جاري إنشاء الطلب...
                      </>
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        تأكيد الطلب
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
