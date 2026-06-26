/**
 * HeroSection — قسم البطل للصفحة الرئيسية
 *
 * EN: Full-width homepage hero with brand tagline, value proposition,
 *     trust pills, and CTA buttons. Dark agate gradient background.
 *     Mobile-first design.
 *
 * AR: قسم البطل الرئيسي مع شعار العلامة التجارية وعرض القيمة
 *     وأزرار الدعوة للإجراء. خلفية متدرجة غامقة.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, MessageCircle, BadgePercent, ShieldCheck, Truck, Sparkles } from 'lucide-react';

const heroImg = '/hero-perfume.png';

const TRUST_PILLS = [
  { icon: ShieldCheck,  text: 'أصلي 100%' },
  { icon: Truck,        text: 'توصيل لكل اليمن' },
  { icon: MessageCircle,text: 'دعم واتساب' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl mb-6 sm:mb-8 select-none"
      style={{
        background: 'linear-gradient(135deg, #1A0A10 0%, #2f0b16 40%, #1A0A10 100%)',
        minHeight: 260,
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute top-0 left-0 w-72 h-72 rounded-full opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #c0213a 0%, transparent 70%)', transform: 'translate(-40%, -40%)' }} />
      <div className="absolute bottom-0 right-0 w-56 h-56 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a01628 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 px-6 sm:px-8 lg:px-12 py-8 sm:py-10">

        {/* ── Text Side ── */}
        <motion.div
          className="flex-1 text-right order-2 sm:order-1"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-agate-500/20 border border-agate-400/30 text-agate-200">
              <Sparkles className="w-3 h-3" />
              متجر طِيب للعطور
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-2"
          >
            العطور الأصيلة
            <br />
            <span className="text-agate-300">بأسعار لا تُقارن</span>
          </motion.h1>

          {/* Sub-headline */}
          <motion.p
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-300/80 mb-5 leading-relaxed max-w-sm"
          >
            أكثر من 200 عطر أصيل — توصيل سريع لجميع مناطق اليمن
          </motion.p>

          {/* Trust pills */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-2 mb-5">
            {TRUST_PILLS.map(({ icon: Icon, text }) => (
              <span
                key={text}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/8 backdrop-blur-sm border border-white/15 text-slate-200"
              >
                <Icon className="w-3 h-3 text-agate-300 flex-shrink-0" />
                {text}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-3">
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-agate-500 hover:bg-agate-400 text-white font-bold rounded-xl text-sm shadow-lg shadow-agate-500/30 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-agate-300"
            >
              <ShoppingBag className="w-4 h-4" />
              تسوق الآن
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products?offers=true')}
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-sm border border-white/20 backdrop-blur-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              <BadgePercent className="w-4 h-4" />
              العروض الحصرية
            </motion.button>
          </motion.div>
        </motion.div>

        {/* ── Image Side ── */}
        <motion.div
          className="flex-shrink-0 order-1 sm:order-2 w-36 h-36 sm:w-48 sm:h-48 lg:w-56 lg:h-56"
          initial={{ opacity: 0, scale: 0.85, rotate: -4 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
        >
          <img
            src={heroImg}
            alt="عطر طِيب الفاخر"
            className="w-full h-full object-contain drop-shadow-2xl"
            fetchpriority="high"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
