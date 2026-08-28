import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BannerPreview from '../../pages/admin/banners/BannerPreview';
import { markTracked, getTrackedSet, BANNER_IMPRESSION_KEY } from './bannerUtils';
import * as api from '../../services/api';

const DEFAULT_INTERVAL_MS = 5000;

export default function BannerCarousel({
  banners,
  placement,
  isMobile,
  autoPlayMs = DEFAULT_INTERVAL_MS,
  className = '',
  showArrows = true,
  showDots = true,
  rounded = true,
}) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const banner = banners[index];
  const hasMultiple = banners.length > 1;

  useEffect(() => {
    setIndex(0);
  }, [banners.length, isMobile]);

  useEffect(() => {
    if (!banner) return;
    const tracked = getTrackedSet(BANNER_IMPRESSION_KEY);
    if (tracked.has(banner.id)) return;
    markTracked(banner.id, BANNER_IMPRESSION_KEY);
    api.trackBannerEvent(banner.id, 'impression').catch(() => {});
  }, [banner?.id]);

  useEffect(() => {
    if (paused || !hasMultiple) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [paused, hasMultiple, banners.length, autoPlayMs]);

  const goTo = useCallback((next) => {
    if (!banners.length) return;
    setIndex(((next % banners.length) + banners.length) % banners.length);
  }, [banners.length]);

  const handleCtaClick = useCallback(() => {
    if (!banner) return;
    api.trackBannerEvent(banner.id, 'click').catch(() => {});
  }, [banner?.id]);

  if (!banner) return null;

  const wrapClass = `${className} relative group ${rounded ? '' : ''}`.trim();

  const content = (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={banner.id}
        initial={{ opacity: 0, x: isMobile ? 24 : 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: isMobile ? -24 : -40 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      >
        <BannerPreview banner={banner} placement={placement} isMobile={isMobile} rounded={rounded} />
      </motion.div>
    </AnimatePresence>
  );

  return (
    <div
      className={wrapClass}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      {banner.ctaUrl ? (
        <a
          href={banner.ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCtaClick}
          className={`block ${rounded ? 'rounded-2xl overflow-hidden' : ''}`}
        >
          {content}
        </a>
      ) : (
        content
      )}

      {hasMultiple && showArrows && (
        <>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="البانر التالي"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-black/35 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label="البانر السابق"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </>
      )}

      {hasMultiple && showDots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1">
          {banners.map((b, i) => (
            <button
              key={b.id}
              type="button"
              aria-label={`البانر ${i + 1}`}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === index ? 'w-4 h-1 bg-gold-400' : 'w-1 h-1 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
