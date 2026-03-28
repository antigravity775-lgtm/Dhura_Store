import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, MapPin, DollarSign, Loader2, Check, AlertCircle, ArrowRight, Save, Lock, Key } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import * as api from '../services/api';

const cities = ['صنعاء', 'عدن', 'تعز', 'إب', 'المكلا', 'الحديدة', 'ذمار', 'حجة', 'صعدة', 'مأرب'];

const ProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, loadUserFromToken } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: '', email: '', city: '' });
  const [preferredCurrency, setPreferredCurrency] = useState(() => {
    return localStorage.getItem('preferred_currency') || 'YER';
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  // Password Change State
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdError, setPwdError] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/auth', { replace: true });
      return;
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      try {
        const profile = await api.getProfile();
        if (mounted) {
          setForm({
            fullName: profile.fullName || '',
            email: profile.email || '',
            city: profile.city || '',
          });
        }
      } catch {
        // Use data from auth context as fallback
        if (mounted && user) {
          setForm({
            fullName: user.fullName || '',
            email: user.email || '',
            city: user.city || '',
          });
        }
      }
      if (mounted) setLoading(false);
    }

    if (isAuthenticated) loadProfile();
    return () => { mounted = false; };
  }, [isAuthenticated, user]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
    setSaved(false);
  };

  const handleCurrencyChange = (curr) => {
    setPreferredCurrency(curr);
    localStorage.setItem('preferred_currency', curr);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      await api.updateProfile({
        userId: user?.id || '',
        fullName: form.fullName,
        email: form.email || '',
        city: form.city,
      });
      await loadUserFromToken();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message || 'حدث خطأ أثناء حفظ البيانات');
    } finally {
      setSaving(false);
    }
  };

  const handlePwdChange = (e) => {
    setPwdForm({ ...pwdForm, [e.target.name]: e.target.value });
    setPwdError('');
    setPwdSaved(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdError('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      setPwdError('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setPwdSaving(true);
    setPwdError('');
    setPwdSaved(false);

    try {
      await api.changePassword(pwdForm.currentPassword, pwdForm.newPassword);
      setPwdSaved(true);
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (err) {
      setPwdError(err.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setPwdSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 md:py-12 mb-12">

        {/* العنوان */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-2xl">
              <User className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            </div>
            الملف الشخصي
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-base">تعديل بياناتك الشخصية وإعداداتك</p>
        </div>

        {/* بطاقة النموذج */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden"
        >
          <form onSubmit={handleSubmit}>

            {/* قسم المعلومات الشخصية */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                المعلومات الشخصية
              </h2>

              {/* الاسم الكامل */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">الاسم الكامل</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <User className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700 transition-all"
                    placeholder="أدخل اسمك الكامل"
                  />
                </div>
              </div>

              {/* البريد الإلكتروني — للعرض فقط */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">البريد الإلكتروني</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="email"
                    value={user?.email || ''}
                    readOnly
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed text-left focus:outline-none"
                  />
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">البريد الإلكتروني لا يمكن تغييره</p>
              </div>

              {/* المدينة */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">المدينة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <select
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 focus:bg-white dark:focus:bg-slate-700 transition-all appearance-none cursor-pointer"
                  >
                    <option value="" disabled>اختر مدينتك</option>
                    {cities.map(city => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* خط فاصل */}
            <div className="border-t border-slate-100 dark:border-slate-700"></div>

            {/* قسم الإعدادات */}
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="w-1 h-5 bg-indigo-500 rounded-full"></div>
                الإعدادات
              </h2>

              {/* العملة المفضلة */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-3">العملة المفضلة للعرض</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('YER')}
                    className={`flex items-center justify-center gap-2.5 py-4 rounded-xl border-2 text-sm font-bold transition-all ${
                      preferredCurrency === 'YER'
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-lg">🇾🇪</span>
                    ريال يمني
                    {preferredCurrency === 'YER' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCurrencyChange('USD')}
                    className={`flex items-center justify-center gap-2.5 py-4 rounded-xl border-2 text-sm font-bold transition-all ${
                      preferredCurrency === 'USD'
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    دولار أمريكي
                    {preferredCurrency === 'USD' && <Check className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">هذا يحدد العملة المعروضة أولاً في الأسعار</p>
              </div>

              {/* نوع الحساب */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">نوع الحساب</label>
                <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className={`w-2.5 h-2.5 rounded-full ${user?.role === 'Seller' ? 'bg-amber-400' : 'bg-green-400'}`}></span>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {user?.role === 'Seller' ? 'بائع' : user?.role === 'Admin' ? 'مدير' : 'مشتري'}
                  </span>
                </div>
              </div>
            </div>

            {/* خط فاصل */}
            <div className="border-t border-slate-100"></div>

            {/* رسالة الخطأ / النجاح وزر الحفظ */}
            <div className="p-6 sm:p-8">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {saved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-3 rounded-xl"
                >
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>تم حفظ التغييرات بنجاح</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 transition-all shadow-lg shadow-indigo-600/15 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري الحفظ...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    حفظ التغييرات
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* بطاقة تغيير كلمة المرور */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden mt-8"
        >
          <form onSubmit={handlePasswordSubmit}>
            <div className="p-6 sm:p-8 space-y-6">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <div className="w-1 h-5 bg-pink-500 rounded-full"></div>
                تغيير كلمة المرور
              </h2>

              {/* كلمة المرور الحالية */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">كلمة المرور الحالية</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="currentPassword"
                    value={pwdForm.currentPassword}
                    onChange={handlePwdChange}
                    required
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 focus:bg-white dark:focus:bg-slate-700 transition-all text-left"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* كلمة المرور الجديدة */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">كلمة المرور الجديدة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Key className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="newPassword"
                    value={pwdForm.newPassword}
                    onChange={handlePwdChange}
                    required
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 focus:bg-white dark:focus:bg-slate-700 transition-all text-left"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* تأكيد كلمة المرور الجديدة */}
              <div>
                <label className="block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2">تأكيد كلمة المرور الجديدة</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Check className="w-5 h-5 text-slate-400" />
                  </div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={pwdForm.confirmPassword}
                    onChange={handlePwdChange}
                    required
                    dir="ltr"
                    className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400 focus:bg-white dark:focus:bg-slate-700 transition-all text-left"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* خط فاصل */}
            <div className="border-t border-slate-100 dark:border-slate-700"></div>

            {/* رسالة الخطأ / النجاح وزر الحفظ لكلمة المرور */}
            <div className="p-6 sm:p-8">
              {pwdError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{pwdError}</span>
                </motion.div>
              )}

              {pwdSaved && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm font-medium px-4 py-3 rounded-xl"
                >
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>تم تغيير كلمة المرور بنجاح</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={pwdSaving}
                className="w-full flex items-center justify-center gap-2.5 py-4 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold text-base hover:bg-slate-700 dark:hover:bg-slate-600 focus:outline-none focus:ring-4 focus:ring-slate-500/30 transition-all shadow-lg shadow-slate-900/10 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {pwdSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري التحديث...
                  </>
                ) : (
                  <>
                    <Key className="w-5 h-5" />
                    تحديث كلمة المرور
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProfilePage;
