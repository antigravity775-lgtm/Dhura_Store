import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, ImagePlus, AlertCircle, Cloud, CheckCircle, Sparkles } from 'lucide-react';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AddProductForm = ({ onSuccess, onCancel, editProduct }) => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const isEdit = !!editProduct;

  const getInitialCondition = (cond) => {
    if (cond === 'New') return 1;
    if (cond === 'Used') return 2;
    if (cond === 'Refurbished') return 3;
    return typeof cond === 'number' ? cond : (parseInt(cond) || 1);
  };

  const [form, setForm] = useState({
    title: editProduct?.title || '',
    description: editProduct?.description || '',
    price: editProduct?.price?.toString() || '',
    currency: editProduct?.currency || 'USD',
    condition: getInitialCondition(editProduct?.condition),
    stockQuantity: editProduct?.stockQuantity || 1,
    categoryId: editProduct?.categoryId || '',
    mainImageUrl: editProduct?.mainImageUrl || '',
    isPromoted: editProduct?.isPromoted || false,
    isHidden: editProduct?.isHidden || false,
    discountPrice: editProduct?.discountPrice?.toString() || '',
    promotionLabel: editProduct?.promotionLabel || '',
  });

  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await api.getCategories();
        setCategories(data || []);
      } catch {
        setCategories([
          { id: 'cat1', name: 'الطاقة الشمسية' },
          { id: 'cat2', name: 'لابتوبات' },
          { id: 'cat3', name: 'هواتف' },
          { id: 'cat4', name: 'البن اليمني' },
        ]);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleImageUpload = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('يرجى اختيار ملف صورة صالح');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploading(true);
    setError('');
    try {
      const url = await api.uploadImageToCloudinary(file);
      setForm(prev => ({ ...prev, mainImageUrl: url }));
    } catch (err) {
      setError(err.message || 'فشل رفع الصورة، جرّب لصق رابط الصورة يدوياً');
    }
    setUploading(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => setDragActive(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.title?.trim() || !form.price || (!isEdit && !form.categoryId) || !form.description?.trim()) {
      setError('يرجى ملء جميع الحقول المطلوبة للتأكيد');
      return;
    }

    // Validate discount price
    if (form.discountPrice && parseFloat(form.discountPrice) >= parseFloat(form.price)) {
      setError('سعر الخصم يجب أن يكون أقل من السعر الأصلي');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEdit) {
        await api.updateProduct(editProduct.id, {
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          currency: form.currency,
          stockQuantity: parseInt(form.stockQuantity),
          condition: parseInt(form.condition),
          categoryId: form.categoryId || editProduct.categoryId,
          mainImageUrl: form.mainImageUrl || null,
          isPromoted: form.isPromoted,
          isHidden: form.isHidden,
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          promotionLabel: form.promotionLabel || null,
        });
      } else {
        await api.createProduct({
          title: form.title,
          description: form.description,
          price: parseFloat(form.price),
          currency: form.currency,
          condition: parseInt(form.condition),
          stockQuantity: parseInt(form.stockQuantity),
          categoryId: form.categoryId,
          sellerId: user?.id,
          mainImageUrl: form.mainImageUrl || null,
          isPromoted: form.isPromoted,
          isHidden: form.isHidden,
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          promotionLabel: form.promotionLabel || null,
        });
      }
      onSuccess?.();
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="p-5 sm:p-6 space-y-4">

      {error && (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm px-4 py-3 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* العنوان */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">عنوان المنتج</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          placeholder="مثال: آيفون 15 برو ماكس 256 جيجا"
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
        />
      </div>

      {/* السعر + العملة */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">السعر</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="1"
            placeholder="0"
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">العملة</label>
          <select
            name="currency"
            value={form.currency}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 appearance-none cursor-pointer bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="USD">دولار ($)</option>
            <option value="SAR">ريال سعودي (SAR)</option>
            <option value="YER_Sanaa">ريال (صنعاء)</option>
            <option value="YER_Aden">ريال (عدن)</option>
          </select>
        </div>
      </div>

      {/* ── إعدادات الظهور ── */}
      <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div>
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">إخفاء المنتج</label>
          <span className="text-xs text-slate-500 dark:text-slate-400">عند تفعيله، لن يظهر المنتج للعملاء في المتجر</span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={form.isHidden}
          onClick={() => setForm(prev => ({ ...prev, isHidden: !prev.isHidden }))}
          className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
            form.isHidden
              ? 'bg-red-500 shadow-lg shadow-red-500/25'
              : 'bg-slate-200 dark:bg-slate-600'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
              form.isHidden ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* ── ترويج المنتج / Promotion Section ── */}
      <div className="bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/30 dark:from-indigo-900/20 dark:via-purple-900/10 dark:to-pink-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-800/40 p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">إعدادات الترويج</span>
        </div>

        {/* Toggle Switch for isPromoted */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">منتج مُروّج (مميز)</label>
          <button
            type="button"
            role="switch"
            aria-checked={form.isPromoted}
            onClick={() => setForm(prev => ({ ...prev, isPromoted: !prev.isPromoted }))}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 ${
              form.isPromoted
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg shadow-indigo-500/25'
                : 'bg-slate-200 dark:bg-slate-600'
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                form.isPromoted ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Discount Price */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">سعر الخصم (اختياري)</label>
          <input
            type="number"
            name="discountPrice"
            value={form.discountPrice}
            onChange={handleChange}
            min="0"
            step="0.01"
            placeholder="أقل من السعر الأصلي"
            className={`w-full px-4 py-3 border rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 ${
              form.discountPrice && form.price && parseFloat(form.discountPrice) >= parseFloat(form.price)
                ? 'border-red-400 dark:border-red-500 ring-2 ring-red-400/30'
                : 'border-slate-200 dark:border-slate-600'
            }`}
          />
          {form.discountPrice && form.price && parseFloat(form.discountPrice) >= parseFloat(form.price) && (
            <p className="mt-1 text-xs text-red-500 font-medium flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              سعر الخصم يجب أن يكون أقل من السعر الأصلي
            </p>
          )}
          {form.discountPrice && form.price && parseFloat(form.discountPrice) < parseFloat(form.price) && (
            <p className="mt-1 text-xs text-emerald-500 font-medium">
              خصم {Math.round(((parseFloat(form.price) - parseFloat(form.discountPrice)) / parseFloat(form.price)) * 100)}%
            </p>
          )}
        </div>

        {/* Promotion Label */}
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">نص الترويج (اختياري)</label>
          <input
            type="text"
            name="promotionLabel"
            value={form.promotionLabel}
            onChange={handleChange}
            placeholder='مثال: "عرض محدود" أو "الأكثر مبيعاً"'
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* القسم */}
      {!isEdit && (
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">القسم</label>
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 appearance-none cursor-pointer bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
          >
            <option value="" disabled>اختر القسم</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* الحالة + الكمية */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">الحالة</label>
          <div className="flex gap-2">
            {[
              { val: 1, label: 'جديد' },
              { val: 2, label: 'مستعمل' },
            ].map(opt => (
              <button
                key={opt.val}
                type="button"
                onClick={() => setForm(prev => ({ ...prev, condition: opt.val }))}
                className={`flex-1 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                  parseInt(form.condition) === opt.val
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-300 dark:border-indigo-600 text-indigo-700 dark:text-indigo-300'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">الكمية</label>
          <input
            type="number"
            name="stockQuantity"
            value={form.stockQuantity}
            onChange={handleChange}
            min="1"
            className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400"
          />
        </div>
      </div>

      {/* رفع الصورة */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">صورة المنتج</label>
          
          {form.mainImageUrl ? (
            <div 
              className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 cursor-pointer group"
              onClick={() => fileInputRef.current?.click()}
              title="اضغط لتغيير الصورة"
            >
              <img src={form.mainImageUrl} alt="preview" className="w-full h-40 object-cover group-hover:opacity-75 transition-opacity" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-sm bg-black/50 px-3 py-1.5 rounded-lg flex items-center gap-2">
                  <ImagePlus className="w-4 h-4" /> تغيير الصورة
                </span>
              </div>
              <div className="absolute top-2 left-2 flex gap-1 z-10">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setForm(prev => ({ ...prev, mainImageUrl: '' })); }}
                  className="p-1.5 bg-red-500 text-white rounded-lg shadow-lg hover:bg-red-600 transition-colors"
                  title="حذف الصورة"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-lg z-10 shadow-md">
                <CheckCircle className="w-3 h-3" />
                تم الرفع
              </div>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`relative flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                dragActive
                  ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20'
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <span className="text-sm font-medium text-indigo-600">جاري رفع الصورة...</span>
                </>
              ) : (
                <>
                  <div className="p-3 bg-indigo-100 rounded-xl">
                    <Cloud className="w-6 h-6 text-indigo-500" />
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">اسحب الصورة هنا أو اضغط للاختيار</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG — حد أقصى 5 ميجابايت</span>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
              e.target.value = ''; // Reset input to allow re-selection
            }}
          />

          {/* رابط يدوي بديل */}
          <div className="mt-2">
            <details className="text-xs">
              <summary className="text-slate-400 cursor-pointer hover:text-indigo-500 transition-colors">أو أدخل رابط الصورة يدوياً</summary>
              <input
                type="url"
                name="mainImageUrl"
                value={form.mainImageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                dir="ltr"
                className="mt-2 w-full px-3 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 text-left"
              />
            </details>
          </div>
        </div>

      {/* الوصف */}
      <div>
        <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">وصف المنتج</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          placeholder="اكتب وصفاً تفصيلياً للمنتج..."
          className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 resize-none"
        />
      </div>

      {/* الأزرار */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {isEdit ? 'جاري الحفظ...' : 'جاري النشر...'}
            </>
          ) : (
            isEdit ? 'حفظ التغييرات' : 'نشر المنتج'
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
};

export default AddProductForm;
