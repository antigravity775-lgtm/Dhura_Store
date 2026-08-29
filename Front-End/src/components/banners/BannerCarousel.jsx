import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  showDots = true,
  rounded = true,
}) {
  const [index, setIndex] = useState(0);
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
    if (!hasMultiple) return undefined;
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % banners.length);
    }, autoPlayMs);
    return () => clearInterval(timer);
  }, [hasMultiple, banners.length, autoPlayMs]);

  const handleCtaClick = useCallback(() => {
    if (!banner) return;
    api.trackBannerEvent(banner.id, 'click').catch(() => {});
  }, [banner?.id]);

  if (!banner) return null;

  const wrapClass = `${className} relative`.trim();

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
    <div className={wrapClass} aria-roledescription="carousel">
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

      {hasMultiple && showDots && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-2 py-1 rounded-full bg-black/30 backdrop-blur-sm pointer-events-none">
          {banners.map((b, i) => (
            <span
              key={b.id}
              aria-label={`البانر ${i + 1}`}
              className={`rounded-full transition-all ${
                i === index ? 'w-4 h-1 bg-gold-400' : 'w-1 h-1 bg-white/60'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
