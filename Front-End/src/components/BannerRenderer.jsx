/**
 * BannerRenderer — Storefront placement-aware banner component.
 *
 * Supports multiple banners per placement with auto-rotate carousels,
 * rotating announcement bar, per-popup dismiss, and mobile image variants.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useSWR from 'swr';
import * as api from '../services/api';
import BannerPreview from '../pages/admin/banners/BannerPreview';
import BannerCarousel from './banners/BannerCarousel';
import AnnouncementBar from './banners/AnnouncementBar';
import {
  useIsMobile,
  filterVisibleBanners,
  getDismissedPopups,
  markPopupDismissed,
  getTrackedSet,
  markTracked,
  BANNER_IMPRESSION_KEY,
} from './banners/bannerUtils';

const PLACEMENT_DEFAULTS = {
  promo_home: { className: 'w-full my-4 sm:my-5', autoPlayMs: 5500 },
  category: { className: 'w-full my-4 sm:my-5', autoPlayMs: 5500 },
  footer: { className: 'w-full my-4', autoPlayMs: 6000 },
  product: { className: 'w-full my-6', autoPlayMs: 5500 },
  sidebar: { className: 'w-full', autoPlayMs: 6000 },
};

export default function BannerRenderer({ placement, className: classNameProp, overlay = false }) {
  const isMobile = useIsMobile();
  const [dismissedPopups, setDismissedPopups] = useState(() => getDismissedPopups());
  const [popupIndex, setPopupIndex] = useState(0);

  const { data: banners, isLoading } = useSWR(
    `banners-${placement}`,
    () => api.getBanners(placement),
    { revalidateOnFocus: false, dedupingInterval: 10000 }
  );

  const visibleBanners = useMemo(
    () => filterVisibleBanners(banners, isMobile),
    [banners, isMobile]
  );

  const popupBanners = useMemo(
    () => visibleBanners.filter((b) => !dismissedPopups.has(b.id)),
    [visibleBanners, dismissedPopups]
  );

  const popupBanner = popupBanners[popupIndex] ?? null;

  const defaults = PLACEMENT_DEFAULTS[placement] || { className: 'w-full my-4', autoPlayMs: 5500 };
  const className = classNameProp || defaults.className;

  // Single-banner impression tracking (announcement/popup handle their own)
  const singleBanner = visibleBanners.length === 1 ? visibleBanners[0] : null;
  useEffect(() => {
    if (!singleBanner || placement === 'announcement' || placement === 'popup') return;
    const tracked = getTrackedSet(BANNER_IMPRESSION_KEY);
    if (tracked.has(singleBanner.id)) return;
    markTracked(singleBanner.id, BANNER_IMPRESSION_KEY);
    api.trackBannerEvent(singleBanner.id, 'impression').catch(() => {});
  }, [singleBanner?.id, placement]);

  const handlePopupDismiss = useCallback(() => {
    if (!popupBanner) return;
    markPopupDismissed(popupBanner.id);
    setDismissedPopups(getDismissedPopups());
    if (popupIndex < popupBanners.length - 1) {
      setPopupIndex((i) => i + 1);
    }
  }, [popupBanner, popupIndex, popupBanners.length]);

  const handlePopupCtaClick = useCallback(() => {
    if (!popupBanner) return;
    api.trackBannerEvent(popupBanner.id, 'click').catch(() => {});
  }, [popupBanner?.id]);

  useEffect(() => {
    if (!popupBanner) return;
    const tracked = getTrackedSet(BANNER_IMPRESSION_KEY);
    if (tracked.has(popupBanner.id)) return;
    markTracked(popupBanner.id, BANNER_IMPRESSION_KEY);
    api.trackBannerEvent(popupBanner.id, 'impression').catch(() => {});
  }, [popupBanner?.id]);

  if (isLoading) {
    if (placement === 'announcement') {
      return <div className="w-full h-10 bg-gold-500/20 animate-pulse" aria-hidden="true" />;
    }
    if (placement === 'popup') return null;
    return (
      <div className={`${className} aspect-[4/1] rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse`} aria-hidden="true" />
    );
  }

  if (!visibleBanners.length) return null;

  // ── Popup ────────────────────────────────────────────────────────────────────
  if (placement === 'popup') {
    if (!popupBanner) return null;
    return (
      <AnimatePresence>
        <motion.div
          key={popupBanner.id}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handlePopupDismiss}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={handlePopupDismiss}
              className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
            {popupBanner.ctaUrl ? (
              <a
                href={popupBanner.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handlePopupCtaClick}
              >
                <BannerPreview banner={popupBanner} placement="popup" isMobile={isMobile} />
              </a>
            ) : (
              <BannerPreview banner={popupBanner} placement="popup" isMobile={isMobile} />
            )}
            {popupBanners.length > 1 && (
              <p className="text-center text-xs text-white/70 mt-2">
                {popupIndex + 1} / {popupBanners.length}
              </p>
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Announcement bar ─────────────────────────────────────────────────────────
  if (placement === 'announcement') {
    return (
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full"
      >
        <AnnouncementBar banners={visibleBanners} overlay={overlay} />
      </motion.div>
    );
  }

  // ── Single banner (no carousel needed) ─────────────────────────────────────────
  if (visibleBanners.length === 1) {
    const banner = visibleBanners[0];
    const handleCtaClick = () => {
      api.trackBannerEvent(banner.id, 'click').catch(() => {});
    };

    return (
      <motion.div
        className={className}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {banner.ctaUrl ? (
          <a
            href={banner.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleCtaClick}
            className="block rounded-2xl overflow-hidden"
          >
            <BannerPreview banner={banner} placement={placement} isMobile={isMobile} />
          </a>
        ) : (
          <BannerPreview banner={banner} placement={placement} isMobile={isMobile} />
        )}
      </motion.div>
    );
  }

  // ── Multiple banners → carousel ────────────────────────────────────────────────
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <BannerCarousel
        banners={visibleBanners}
        placement={placement}
        isMobile={isMobile}
        autoPlayMs={defaults.autoPlayMs}
        rounded={placement !== 'footer'}
      />
    </motion.div>
  );
}
