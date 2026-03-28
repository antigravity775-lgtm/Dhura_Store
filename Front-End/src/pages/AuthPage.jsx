import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Eye, EyeOff, Phone, Lock, User, MapPin, Loader2, ArrowRight, AlertCircle, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const cities = ['صنعاء', 'عدن', 'تعز', 'إب', 'المكلا', 'الحديدة', 'ذمار', 'حجة', 'صعدة', 'مأرب'];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: (direction) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const AuthPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    email: '',
    password: '',
    name: '',
    city: '',
    role: 3, // 2=Seller, 3=Buyer
  });

  // Redirect if already logged in
  React.useEffect(() => {
    if (isAuthenticated) navigate('/', { replace: true });
  }, [isAuthenticated, navigate]);

  const switchView = (toLogin) => {
    setDirection(toLogin ? -1 : 1);
    setIsLogin(toLogin);
    setShowPassword(false);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(form.email.trim(), form.password);
      } else {
        await register({
          fullName: form.name,
          email: form.email.trim(),
          password: form.password,
          city: form.city,
          role: parseInt(form.role),
        });
      }
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'حدث خطأ، حاول مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-950 px-4 py-12" dir="rtl">

      {/* ========== خلفية متحركة ========== */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-bl from-slate-900 via-indigo-950 to-slate-900"></div>

        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, -30, 0],
            opacity: [0.2, 0.35, 0.2],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/20 blur-[140px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            x: [0, -40, 0],
            y: [0, 40, 0],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          className="absolute bottom-[-20%] left-[-10%] w-[55%] h-[55%] rounded-full bg-blue-600/15 blur-[130px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
          className="absolute top-[40%] left-[30%] w-[25%] h-[35%] rounded-full bg-purple-500/15 blur-[100px]"
        />

        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* ========== بطاقة المصادقة ========== */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative w-full max-w-md z-10"
      >
        {/* الشعار */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="relative w-14 h-14 rounded-full bg-white flex items-center justify-center p-0.5 overflow-hidden shadow-2xl">
              <img src="/Logo.png" alt="شعار متجر الجعدي" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-300" />
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <span className="font-extrabold text-3xl text-white tracking-tight drop-shadow-md">متجر الجعدي</span>
          </Link>
          <p className="text-indigo-200/60 text-sm mt-3 font-medium">
            {isLogin ? 'مرحباً بعودتك! سجّل دخولك للمتابعة' : 'أنشئ حسابك وابدأ التسوق'}
          </p>
        </div>

        {/* بطاقة النموذج */}
        <div className="bg-white/[0.07] backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-black/20 overflow-hidden">

          {/* تبويبات التسجيل / الدخول */}
          <div className="flex border-b border-white/10">
            <button
              onClick={() => switchView(true)}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                isLogin ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              تسجيل الدخول
              {isLogin && (
                <motion.div
                  layoutId="authTab"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-400 rounded-full"
                />
              )}
            </button>
            <button
              onClick={() => switchView(false)}
              className={`flex-1 py-4 text-sm font-bold transition-all relative ${
                !isLogin ? 'text-white' : 'text-white/40 hover:text-white/60'
              }`}
            >
              حساب جديد
              {!isLogin && (
                <motion.div
                  layoutId="authTab"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-indigo-400 rounded-full"
                />
              )}
            </button>
          </div>

          {/* محتوى النموذج */}
          <div className="p-6 sm:p-8">

            {/* رسالة الخطأ */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-medium px-4 py-3 rounded-xl"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.form
                key={isLogin ? 'login' : 'register'}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                 {/* الاسم الكامل - التسجيل فقط */}
                 {!isLogin && (
                   <div>
                     <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">الاسم الكامل</label>
                     <div className="relative">
                       <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                         <User className="w-5 h-5 text-white/30" />
                       </div>
                       <input
                         type="text"
                         name="name"
                         value={form.name}
                         onChange={handleChange}
                         required
                         placeholder="أدخل اسمك الكامل"
                         className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 focus:bg-white/[0.08] transition-all"
                       />
                     </div>
                   </div>
                 )}
                 
                 {/* البريد الإلكتروني - كلا النموذجين */}
                 <div>
                   <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">البريد الإلكتروني</label>
                   <div className="relative">
                     <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                       <Mail className="w-5 h-5 text-white/30" />
                     </div>
                     <input
                       type="email"
                       name="email"
                       value={form.email}
                       onChange={handleChange}
                       required
                       placeholder="example@domain.com"
                       className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 focus:bg-white/[0.08] transition-all"
                     />
                   </div>
                 </div>



                {/* المدينة - التسجيل فقط */}
                {!isLogin && (
                  <div>
                    <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">المدينة</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <MapPin className="w-5 h-5 text-white/30" />
                      </div>
                      <select
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        required
                        className="w-full pr-12 pl-4 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 focus:bg-white/[0.08] transition-all appearance-none cursor-pointer"
                      >
                        <option value="" disabled className="bg-slate-900 text-slate-400">اختر مدينتك</option>
                        {cities.map(city => (
                          <option key={city} value={city} className="bg-slate-900 text-white">{city}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}



                {/* كلمة المرور */}
                <div>
                  <label className="block text-xs font-bold text-white/60 mb-2 uppercase tracking-wider">كلمة المرور</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <Lock className="w-5 h-5 text-white/30" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="أدخل كلمة المرور"
                      minLength={6}
                      className="w-full pr-12 pl-12 py-3.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/25 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/60 focus:border-indigo-500/40 focus:bg-white/[0.08] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30 hover:text-white/60 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* نسيت كلمة المرور */}
                {isLogin && (
                  <div className="text-left">
                    <button type="button" className="text-xs text-indigo-300/70 hover:text-indigo-300 transition-colors font-medium">
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                )}

                {/* زر الإرسال */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2.5 py-4 bg-indigo-600 text-white rounded-xl font-bold text-base hover:bg-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/40 transition-all shadow-xl shadow-indigo-600/20 disabled:opacity-70 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>جاري المعالجة...</span>
                    </>
                  ) : (
                    isLogin ? 'تسجيل الدخول' : 'إنشاء الحساب'
                  )}
                </button>

                {/* فاصل */}
                <div className="relative flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-white/10"></div>
                  <span className="text-[11px] font-semibold text-white/25 uppercase tracking-widest select-none">أو</span>
                  <div className="flex-1 h-px bg-white/10"></div>
                </div>

                {/* تبديل العرض */}
                <p className="text-center text-sm text-white/40">
                  {isLogin ? 'ليس لديك حساب؟' : 'لديك حساب بالفعل؟'}{' '}
                  <button
                    type="button"
                    onClick={() => switchView(!isLogin)}
                    className="text-indigo-300 hover:text-indigo-200 font-bold transition-colors"
                  >
                    {isLogin ? 'سجّل الآن' : 'سجّل دخولك'}
                  </button>
                </p>
              </motion.form>
            </AnimatePresence>
          </div>
        </div>

        {/* العودة للرئيسية */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-white/30 hover:text-white/60 transition-colors font-medium group"
          >
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            العودة للصفحة الرئيسية
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
