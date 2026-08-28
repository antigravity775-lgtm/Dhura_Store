import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Phone,
  Lock,
  User,
  MapPin,
  Loader2,
  ArrowRight,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Truck,
  Store,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import SEO from "../components/SEO";

const logo = "/Logo_192.png";

const cities = [
  "صنعاء", "عدن", "تعز", "إب", "المكلا", "الحديدة", "ذمار", "حجة", "صعدة", "مأرب",
];

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 320, damping: 32 },
  },
  exit: (direction) => ({
    x: direction > 0 ? -40 : 40,
    opacity: 0,
    transition: { duration: 0.2 },
  }),
};

const trustItems = [
  { icon: ShieldCheck, text: "تسوق آمن وموثوق" },
  { icon: Truck, text: "توصيل سريع لجميع المدن" },
  { icon: Sparkles, text: "عروض حصرية للأعضاء" },
];

const inputClass =
  "w-full pr-12 pl-4 py-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-400/40 focus:bg-white/[0.08] transition-all";

function AuthInput({ icon: Icon, className = "", ...props }) {
  return (
    <div className="relative group">
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-white/25 group-focus-within:text-gold-400/80 transition-colors" />
      </div>
      <input className={`${inputClass} ${className}`.trim()} {...props} />
    </div>
  );
}

const AuthPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isLogin, setIsLogin] = useState(true);
  const [direction, setDirection] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    password: "",
    name: "",
    phoneNumber: "",
    city: "",
    role: 3,
  });

  const [lockoutTimeLeft, setLockoutTimeLeft] = useState(0);

  React.useEffect(() => {
    const lockedUntil = localStorage.getItem("auth_lockout_until");
    if (lockedUntil) {
      const remainingMs = parseInt(lockedUntil, 10) - Date.now();
      if (remainingMs > 0) {
        setLockoutTimeLeft(Math.ceil(remainingMs / 1000));
      } else {
        localStorage.removeItem("auth_lockout_until");
      }
    }
  }, []);

  React.useEffect(() => {
    if (lockoutTimeLeft > 0) {
      const timer = setInterval(() => {
        setLockoutTimeLeft((prev) => {
          if (prev <= 1) {
            localStorage.removeItem("auth_lockout_until");
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [lockoutTimeLeft]);

  React.useEffect(() => {
    if (isAuthenticated) navigate("/", { replace: true });
  }, [isAuthenticated, navigate]);

  const switchView = (toLogin) => {
    setDirection(toLogin ? -1 : 1);
    setIsLogin(toLogin);
    setShowPassword(false);
    setError("");
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lockoutTimeLeft > 0) return;
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        await login(form.phoneNumber.trim(), form.password);
      } else {
        await register({
          fullName: form.name,
          phoneNumber: form.phoneNumber.trim(),
          password: form.password,
          city: form.city,
          role: parseInt(form.role, 10),
        });
      }
      navigate("/", { replace: true });
    } catch (err) {
      if (err.status === 429) {
        const match = err.message.match(/بعد (\d+) دقيقة/);
        const minutes = match ? parseInt(match[1], 10) : 15;
        const lockoutEnd = Date.now() + minutes * 60 * 1000;
        localStorage.setItem("auth_lockout_until", lockoutEnd.toString());
        setLockoutTimeLeft(minutes * 60);
        setError("");
      } else {
        setError(err.message || "حدث خطأ، حاول مرة أخرى");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white" dir="rtl">
      <SEO title="تسجيل الدخول" noIndex />

      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* ── Brand panel ── */}
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden p-10 xl:p-14">
          <div className="absolute inset-0 bg-gradient-to-bl from-[#1f1608] via-[#0d0d0d] to-[#050505]" />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-gold-500/20 blur-[120px]"
          />
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.12, 0.25, 0.12] }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute bottom-0 left-0 w-[360px] h-[360px] rounded-full bg-amber-700/25 blur-[100px]"
          />
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
            }}
          />

          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="w-12 h-12 rounded-2xl bg-white overflow-hidden ring-2 ring-gold-400/40 shadow-lg shadow-gold-500/20">
                <img src={logo} alt="GISAAH" className="w-full h-full object-cover scale-[1.14]" />
              </div>
              <span className="text-2xl font-black tracking-tight">GISAAH</span>
            </Link>
          </div>

          <div className="relative z-10 max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 mb-6"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-xs font-bold text-gold-300">تجربة تسوق فاخرة</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="text-4xl xl:text-5xl font-black leading-tight mb-4"
            >
              مرحباً بك في
              <span className="block text-transparent bg-clip-text bg-gradient-to-l from-gold-300 via-gold-400 to-amber-200">
                عالم GISAAH
              </span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-slate-400 text-base leading-relaxed"
            >
              سجّل دخولك للوصول إلى عروضك الحصرية، تتبع طلباتك، وإدارة حسابك بكل سهولة.
            </motion.p>
          </div>

          <div className="relative z-10 space-y-3">
            {trustItems.map(({ icon: Icon, text }, i) => (
              <motion.div
                key={text}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                className="flex items-center gap-3 text-sm text-slate-300"
              >
                <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gold-400" />
                </div>
                {text}
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Form panel ── */}
        <div className="relative flex items-center justify-center px-4 py-10 sm:px-8 lg:px-12 overflow-hidden">
          <div className="absolute inset-0 lg:hidden bg-gradient-to-b from-[#14100a] via-[#0a0a0a] to-[#050505]" />
          <motion.div
            animate={{ opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-gold-500/15 blur-[100px] lg:hidden"
          />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="relative w-full max-w-md z-10"
          >
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <Link to="/" className="inline-flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white overflow-hidden ring-2 ring-gold-400/50 shadow-xl shadow-gold-500/20">
                  <img src={logo} alt="GISAAH" className="w-full h-full object-cover scale-[1.14]" />
                </div>
                <span className="text-2xl font-black">GISAAH</span>
                <p className="text-sm text-slate-400">
                  {isLogin ? "سجّل دخولك للمتابعة" : "أنشئ حسابك وابدأ التسوق"}
                </p>
              </Link>
            </div>

            {/* Toggle pills */}
            <div className="flex p-1 rounded-2xl bg-white/[0.06] border border-white/10 mb-6">
              {[
                { id: true, label: "تسجيل الدخول" },
                { id: false, label: "حساب جديد" },
              ].map(({ id, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => switchView(id)}
                  className={`relative flex-1 py-2.5 text-sm font-bold rounded-xl transition-colors ${
                    isLogin === id ? "text-slate-900" : "text-white/50 hover:text-white/80"
                  }`}
                >
                  {isLogin === id && (
                    <motion.div
                      layoutId="authPill"
                      className="absolute inset-0 bg-gradient-to-l from-gold-400 to-gold-500 rounded-xl shadow-md shadow-gold-500/30"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{label}</span>
                </button>
              ))}
            </div>

            {/* Card */}
            <div className="relative rounded-3xl p-[1px] bg-gradient-to-br from-gold-400/50 via-gold-600/20 to-white/10 shadow-2xl shadow-black/40">
              <div className="rounded-[23px] bg-slate-950/90 backdrop-blur-2xl border border-white/[0.06] overflow-hidden">
                <div className="hidden lg:block px-8 pt-8 pb-2">
                  <h2 className="text-xl font-black text-white">
                    {isLogin ? "تسجيل الدخول" : "إنشاء حساب"}
                  </h2>
                  <p className="text-sm text-slate-400 mt-1">
                    {isLogin ? "أدخل بياناتك للوصول إلى حسابك" : "املأ البيانات للانضمام إلينا"}
                  </p>
                </div>

                <div className="p-6 sm:p-8">
                  <AnimatePresence>
                    {(error || lockoutTimeLeft > 0) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-5 overflow-hidden"
                      >
                        <div className="flex flex-col gap-2 bg-red-500/10 border border-red-500/25 text-red-300 text-sm px-4 py-3 rounded-xl">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>
                              {lockoutTimeLeft > 0
                                ? "تم حظر المحاولات مؤقتاً. يرجى الانتظار."
                                : error}
                            </span>
                          </div>
                          {lockoutTimeLeft > 0 && (
                            <div className="text-center font-mono font-bold text-lg text-red-400 bg-red-500/10 py-2 rounded-lg">
                              {Math.floor(lockoutTimeLeft / 60)}:
                              {String(lockoutTimeLeft % 60).padStart(2, "0")}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence mode="wait" custom={direction}>
                    <motion.form
                      key={isLogin ? "login" : "register"}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      onSubmit={handleSubmit}
                      className="space-y-4"
                    >
                      {!isLogin && (
                        <div>
                          <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                            الاسم الكامل
                          </label>
                          <AuthInput
                            icon={User}
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            placeholder="أدخل اسمك الكامل"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                          رقم الهاتف
                        </label>
                        <AuthInput
                          icon={Phone}
                          type="tel"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          required
                          dir="ltr"
                          placeholder="77xxxxxxx"
                          className="text-right"
                        />
                      </div>

                      {!isLogin && (
                        <>
                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                              المدينة
                            </label>
                            <div className="relative group">
                              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                <MapPin className="w-5 h-5 text-white/25 group-focus-within:text-gold-400/80 transition-colors" />
                              </div>
                              <select
                                name="city"
                                value={form.city}
                                onChange={handleChange}
                                required
                                className={`${inputClass} appearance-none cursor-pointer`}
                              >
                                <option value="" disabled className="bg-slate-900">اختر مدينتك</option>
                                {cities.map((city) => (
                                  <option key={city} value={city} className="bg-slate-900">{city}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wider">
                              نوع الحساب
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { value: 3, label: "مشتري", icon: User },
                                { value: 2, label: "بائع", icon: Store },
                              ].map(({ value, label, icon: Icon }) => (
                                <button
                                  key={value}
                                  type="button"
                                  onClick={() => setForm((f) => ({ ...f, role: value }))}
                                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-bold transition-all ${
                                    form.role === value
                                      ? "bg-gold-500/15 border-gold-400/50 text-gold-300"
                                      : "bg-white/[0.03] border-white/10 text-white/50 hover:border-white/20"
                                  }`}
                                >
                                  <Icon className="w-4 h-4" />
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
                          كلمة المرور
                        </label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                            <Lock className="w-5 h-5 text-white/25 group-focus-within:text-gold-400/80 transition-colors" />
                          </div>
                          <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            placeholder="أدخل كلمة المرور"
                            minLength={6}
                            className={`${inputClass} pl-12`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 left-0 pl-4 flex items-center text-white/30 hover:text-gold-400 transition-colors"
                            tabIndex={-1}
                          >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {isLogin && (
                        <div className="text-left">
                          <button
                            type="button"
                            className="text-xs text-gold-400/80 hover:text-gold-300 font-semibold transition-colors"
                          >
                            نسيت كلمة المرور؟
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isLoading || lockoutTimeLeft > 0}
                        className="relative w-full overflow-hidden flex items-center justify-center gap-2.5 py-4 mt-2 rounded-xl font-bold text-base text-slate-900 bg-gradient-to-l from-gold-400 via-gold-500 to-amber-500 hover:from-gold-300 hover:via-gold-400 hover:to-amber-400 focus:outline-none focus:ring-4 focus:ring-gold-500/30 shadow-lg shadow-gold-600/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            جاري المعالجة...
                          </>
                        ) : lockoutTimeLeft > 0 ? (
                          `محظور (${Math.floor(lockoutTimeLeft / 60)}:${String(lockoutTimeLeft % 60).padStart(2, "0")})`
                        ) : isLogin ? (
                          "تسجيل الدخول"
                        ) : (
                          "إنشاء الحساب"
                        )}
                      </button>

                      <p className="text-center text-sm text-slate-500 pt-1">
                        {isLogin ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}{" "}
                        <button
                          type="button"
                          onClick={() => switchView(!isLogin)}
                          className="text-gold-400 hover:text-gold-300 font-bold transition-colors"
                        >
                          {isLogin ? "سجّل الآن" : "سجّل دخولك"}
                        </button>
                      </p>
                    </motion.form>
                  </AnimatePresence>
                </div>
              </div>
            </div>

            <div className="text-center mt-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-gold-400 transition-colors font-medium group"
              >
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                العودة للصفحة الرئيسية
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
