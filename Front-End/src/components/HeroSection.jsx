/**
 * HeroSection — قسم الهيرو مع عرض دوّار للبانرات
 */

import React, { useEffect, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import useSWR from 'swr';
import * as api from '../services/api';
import { useIsMobile, filterVisibleBanners } from './banners/bannerUtils';

const AUTO_PLAY_MS = 5500;

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut', staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const SESSION_KEY = 'gisaah_hero_impression';

function getHeroTrackedSet() {
  try { return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]')); }
  catch { return new Set(); }
}

function markHeroTracked(id) {
  try {
    const set = getHeroTrackedSet();
    set.add(id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

function getAlignClasses(textAlign) {
  switch (textAlign) {
    case 'left':
      return { text: 'text-left', items: 'items-end', textGradient: 'bg-gradient-to-r from-gold-400 to-gold-200' };
    case 'center':
      return { text: 'text-center', items: 'items-center', textGradient: 'bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400' };
    default:
      return { text: 'text-right', items: 'items-start', textGradient: 'bg-gradient-to-l from-gold-400 to-gold-200' };
  }
}

function HeroSlideContent({ banner, shouldAnimate }) {
  const headlineParts = banner.title ? banner.title.split('\n') : [];
  const titleLine1 = headlineParts[0] || '';
  const titleLine2 = headlineParts.slice(1).join(' ');
  const align = getAlignClasses(banner.textAlign);

  return (
    <motion.div
      className={`flex-1 flex flex-col ${align.items} ${align.text} relative z-10 w-full`}
      variants={containerVariants}
      initial="hidden"
      animate={shouldAnimate ? 'visible' : 'hidden'}
    >
      {banner.subtitle && (
        <motion.div
          variants={itemVariants}
          className="inline-flex items-center gap-2 bg-gold-500/15 border border-gold-500/30 rounded-full px-3 py-1 mb-3 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-gold-400" />
          <span className="text-xs sm:text-sm font-bold text-gold-300">{banner.subtitle}</span>
        </motion.div>
      )}

      {(titleLine1 || titleLine2) && (
        <motion.h1
          variants={itemVariants}
          className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight tracking-tight mb-2 drop-shadow-lg"
        >
          {titleLine1}
          {titleLine2 && (
            <span className={`block text-transparent bg-clip-text ${align.textGradient}`}>
              {titleLine2}
            </span>
          )}
        </motion.h1>
      )}

      {banner.description && (
        <motion.p
          variants={itemVariants}
          className={`text-sm sm:text-base text-slate-200 max-w-lg leading-relaxed drop-shadow-md font-medium ${banner.textAlign === 'center' ? 'mx-auto' : ''}`}
        >
          {banner.description}
        </motion.p>
      )}
    </motion.div>
  );
}

const HeroSection = React.memo(() => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const { data: banners, isLoading } = useSWR(
    'banners-hero',
    () => api.getBanners('hero'),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  const visibleBanners = useMemo(
    () => filterVisibleBanners(banners, isMobile),
    [banners, isMobile]
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [shouldAnimateHero, setShouldAnimateHero] = useState(
    () => sessionStorage.getItem('gisaah_intro_seen') === 'true'
  );

  const banner = visibleBanners[currentIndex] ?? null;
  const hasMultiple = visibleBanners.length > 1;

  useEffect(() => {
    setCurrentIndex(0);
  }, [visibleBanners.length, isMobile]);

  useEffect(() => {
    if (!shouldAnimateHero) {
      const handleMoving = () => setShouldAnimateHero(true);
      window.addEventListener('gisaahLogoMoving', handleMoving);
      return () => window.removeEventListener('gisaahLogoMoving', handleMoving);
    }
  }, [shouldAnimateHero]);

  useEffect(() => {
    if (!banner) return;
    const tracked = getHeroTrackedSet();
    if (tracked.has(banner.id)) return;
    markHeroTracked(banner.id);
    api.trackBannerEvent(banner.id, 'impression').catch(() => {});
  }, [banner?.id]);

  useEffect(() => {
    if (paused || !hasMultiple) return undefined;
    const timer = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % visibleBanners.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [paused, hasMultiple, visibleBanners.length]);

  const goTo = useCallback((index) => {
    if (!visibleBanners.length) return;
    const next = ((index % visibleBanners.length) + visibleBanners.length) % visibleBanners.length;
    setCurrentIndex(next);
  }, [visibleBanners.length]);

  const goNext = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const goPrev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  const handleCtaClick = useCallback(() => {
    if (!banner) return;
    api.trackBannerEvent(banner.id, 'click').catch(() => {});
    if (banner.ctaUrl) {
      window.open(banner.ctaUrl, '_blank', 'noopener,noreferrer');
    } else {
      navigate('/products');
    }
  }, [banner, navigate]);

  if (isLoading) {
    return (
      <section className="relative w-full overflow-hidden min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] bg-slate-200 dark:bg-slate-900 animate-pulse" aria-hidden="true">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 h-full flex items-center">
          <div className="w-full max-w-lg space-y-4">
            <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded-full w-1/3" />
            <div className="h-12 bg-slate-300 dark:bg-slate-800 rounded-xl w-3/4" />
            <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded-full w-1/2" />
          </div>
        </div>
      </section>
    );
  }

  if (!banner) return null;

  const bgImage = isMobile && banner.mobileImageUrl ? banner.mobileImageUrl : banner.imageUrl;
  const bgColor = banner.bgColor || 'transparent';
  const overlayAlpha = Math.round((banner.overlayOpacity / 100) * 255).toString(16).padStart(2, '0');
  const overlayColor = `#000000${overlayAlpha}`;

  return (
    <section
      className="relative z-0 w-full overflow-hidden min-h-[220px] sm:min-h-[260px] lg:min-h-[300px] flex flex-col justify-end group"
      style={{ backgroundColor: bgColor !== 'transparent' ? bgColor : undefined }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="بانرات العروض الرئيسية"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={banner.id}
          className="absolute inset-0"
          initial={{ opacity: 0, x: isMobile ? 30 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: isMobile ? -30 : -50 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          {bgImage && (
            <div className="absolute inset-0 overflow-hidden">
              <img
                src={bgImage}
                alt={banner.title || 'بانر ترويجي'}
                className="w-full h-full object-cover object-[center_10%] md:object-center"
                fetchPriority={currentIndex === 0 ? 'high' : 'auto'}
              />
              <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: overlayColor }} />
              <div
                className={`absolute inset-0 pointer-events-none bg-gradient-to-t ${
                  banner.textAlign === 'center' ? 'from-black/80 via-black/30' : 'from-black/60'
                } to-transparent`}
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-9 mt-auto">
        <div className={`flex flex-col ${banner.textAlign === 'center' ? 'items-center' : ''}`}>
          <AnimatePresence mode="wait">
            <div key={`content-${banner.id}`} className="w-full">
              <HeroSlideContent banner={banner} shouldAnimate={shouldAnimateHero} />
              {banner.ctaText && (
                <motion.button
                  type="button"
                  onClick={handleCtaClick}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="mt-4 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-gold-600 hover:bg-gold-500 text-white text-sm font-bold shadow-md transition-colors"
                >
                  {banner.ctaText}
                </motion.button>
              )}
            </div>
          </AnimatePresence>
        </div>
      </div>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="البانر السابق"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center backdrop-blur-sm border border-white/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="البانر التالي"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5"
            role="tablist"
            aria-label="مؤشرات البانر"
          >
            {visibleBanners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                role="tab"
                aria-selected={i === currentIndex}
                aria-label={`البانر ${i + 1}`}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === currentIndex
                    ? 'w-5 h-1.5 bg-gold-400'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute bottom-0 inset-x-0 h-6 bg-gradient-to-t from-bone dark:from-slate-950 to-transparent pointer-events-none z-10" />
    </section>
  );
});

HeroSection.displayName = 'HeroSection';
export default HeroSection;
