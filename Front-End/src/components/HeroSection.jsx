/**
 * HeroSection — قسم الهيرو للصفحة الرئيسية
 *
 * Full-width brand hero above the fold. Contains:
 *  - Brand tagline + value proposition
 *  - Primary CTA button → /products
 *  - Trust pills (3 pills)
 *  - Decorative perfume bottle visual (right side)
 *  - Deep agate/gold gradient background
 *  - Framer Motion fade-in on mount
 */

import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, MessageCircle, Sparkles, ArrowLeft, ArrowRight } from 'lucide-react';
import useSWR from 'swr';
import * as api from '../services/api';


const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut', staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const SESSION_KEY = 'teeb_hero_impression';
function getTrackedSet() {
  try { return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]')); }
  catch { return new Set(); }
}
function markTracked(id) {
  try {
    const set = getTrackedSet();
    set.add(id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch {}
}

const HeroSection = React.memo(() => {
  const navigate = useNavigate();

  // Fetch the active hero banner
  const { data: banners, isLoading } = useSWR('banners-hero', () => api.getBanners('hero'), {
    revalidateOnFocus: false, dedupingInterval: 60000
  });

  const banner = banners?.[0] ?? null;

  // Track impression once per session per banner
  useEffect(() => {
    if (!banner) return;
    const isMobile = window.matchMedia('(max-width: 767px)').matches;
    if (!(isMobile ? banner.showOnMobile : banner.showOnDesktop)) return;

    const tracked = getTrackedSet();
    if (tracked.has(banner.id)) return;
    markTracked(banner.id);
    api.trackBannerEvent(banner.id, 'impression').catch(() => {});
  }, [banner]);

  const handleCtaClick = useCallback(() => {
    if (banner?.id) {
      api.trackBannerEvent(banner.id, 'click').catch(() => {});
    }
    if (banner?.ctaUrl) {
      window.open(banner.ctaUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate('/products');
    }
  }, [banner, navigate]);

  // Determine visibility
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const isVisible = banner ? (isMobile ? banner.showOnMobile : banner.showOnDesktop) : true;

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] bg-slate-200 dark:bg-slate-900 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 h-full flex items-center">
          <div className="w-full max-w-lg space-y-6">
            <div className="h-8 bg-slate-300 dark:bg-slate-800 rounded-full w-1/3"></div>
            <div className="h-16 bg-slate-300 dark:bg-slate-800 rounded-xl w-3/4"></div>
            <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-full w-1/2"></div>
            <div className="h-14 bg-slate-300 dark:bg-slate-800 rounded-2xl w-40 mt-8"></div>
          </div>
        </div>
      </section>
    );
  }

  if (!banner || !isVisible) return null;

  // Map banner fields to hero content
  const headlineParts = banner.title ? banner.title.split('\n') : [];
  const titleLine1 = headlineParts[0] || '';
  const titleLine2 = headlineParts.slice(1).join(' ');
  
  const badgeText = banner.subtitle;
  const description = banner.description;
  const ctaText = banner.ctaText || 'تسوق الآن';
  
  const bgImage = isMobile && banner.mobileImageUrl ? banner.mobileImageUrl : banner.imageUrl;
  const bgColor = banner.bgColor || 'transparent';
  
  // Convert 0-100 to hex for alpha (e.g. 50 -> 80)
  const overlayAlpha = Math.round((banner.overlayOpacity / 100) * 255).toString(16).padStart(2, '0');
  const overlayColor = `#000000${overlayAlpha}`;

  // Alignment classes mapping based on banner.textAlign
  const getAlignClasses = () => {
    switch (banner.textAlign) {
      case 'left': return { text: 'text-left lg:text-left', items: 'items-end', textGradient: 'bg-gradient-to-r from-agate-400 to-agate-200' };
      case 'center': return { text: 'text-center lg:text-center', items: 'items-center', textGradient: 'bg-gradient-to-r from-agate-400 via-agate-200 to-agate-400' };
      default: return { text: 'text-right lg:text-right', items: 'items-start', textGradient: 'bg-gradient-to-l from-agate-400 to-agate-200' };
    }
  };
  const align = getAlignClasses();

  return (
    <section className="relative w-full overflow-hidden min-h-[380px] sm:min-h-[440px] lg:min-h-[500px] flex flex-col justify-end" style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}>
      
      {/* ── Background Layer ── */}
      {bgImage && (
        <div className="absolute inset-0">
          <img src={bgImage} alt={banner.title} className="w-full h-full object-cover" fetchPriority="high" />
          <div className="absolute inset-0" style={{ backgroundColor: overlayColor }} />
          {/* Subtle gradient to ensure text readability */}
          <div className={`absolute inset-0 bg-gradient-to-t ${banner.textAlign === 'center' ? 'from-black/80 via-black/30' : 'from-black/60'} to-transparent`} />
        </div>
      )}

      {/* ── Content ── */}
      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14 mt-auto">
        <div className={`flex flex-col lg:flex-row items-end gap-8 lg:gap-12 ${banner?.textAlign === 'center' ? 'justify-center' : 'justify-between'}`}>

          {/* Text Content */}
          <motion.div
            className={`flex-1 flex flex-col ${align.items} ${align.text} relative z-10 w-full`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            {badgeText && (
              <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-agate-500/15 border border-agate-500/30 rounded-full px-4 py-1.5 mb-5 backdrop-blur-sm shadow-lg shadow-black/20">
                <Sparkles className="w-3.5 h-3.5 text-agate-400" />
                <span className="text-xs sm:text-sm font-bold text-agate-300 tracking-wide">{badgeText}</span>
              </motion.div>
            )}

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight tracking-tight mb-4 drop-shadow-lg"
            >
              {titleLine1}
              {titleLine2 && (
                <span className={`block text-transparent bg-clip-text ${align.textGradient}`}>
                  {titleLine2}
                </span>
              )}
            </motion.h1>

            {/* Sub-headline */}
            {description && (
              <motion.p
                variants={itemVariants}
                className={`text-base sm:text-lg text-slate-200 mb-8 max-w-lg leading-relaxed drop-shadow-md font-medium ${banner?.textAlign === 'center' ? 'mx-auto' : ''}`}
              >
                {description}
              </motion.p>
            )}

            {/* CTA Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCtaClick}
              id="hero-cta-btn"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-gradient-to-l from-agate-500 to-agate-400 text-white font-bold rounded-2xl shadow-xl shadow-agate-900/40 hover:from-agate-400 hover:to-agate-300 transition-all duration-300 text-lg"
            >
              <span>{ctaText}</span>
              {banner?.textAlign === 'left' ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
            </motion.button>


          </motion.div>

        </div>
      </div>

      {/* ── Bottom fade ── */}
      <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-bone dark:from-slate-950 to-transparent" />
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
