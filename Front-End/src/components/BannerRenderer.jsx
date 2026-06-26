/**
 * BannerRenderer — Storefront placement-aware banner component.
 *
 * Fetches active banners for a specific placement from the backend.
 * Tracks impressions (once per session) and clicks server-side.
 * Respects showOnMobile / showOnDesktop flags.
 * Returns null if no active banners for the given placement.
 *
 * Usage:
 *   <BannerRenderer placement="promo_home" />
 *   <BannerRenderer placement="announcement" />
 *   <BannerRenderer placement="popup" />
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import useSWR from 'swr';
import * as api from '../services/api';
import BannerPreview from '../pages/admin/banners/BannerPreview';

const SESSION_KEY = 'teeb_banner_impressions';

function getTrackedSet() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SESSION_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

function markTracked(id) {
  try {
    const set = getTrackedSet();
    set.add(id);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

const POPUP_DISMISS_KEY = 'teeb_popup_dismissed';

export default function BannerRenderer({ placement }) {
  const [popupDismissed, setPopupDismissed] = useState(() => {
    try { return sessionStorage.getItem(POPUP_DISMISS_KEY) === '1'; } catch { return false; }
  });

  const { data: banners } = useSWR(
    `banners-${placement}`,
    () => api.getBanners(placement),
    { revalidateOnFocus: false, dedupingInterval: 60000 }
  );

  // Pick the first active banner (already sorted by priority from backend)
  const banner = banners?.[0] ?? null;

  // Visibility gate
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;
  const visible = banner &&
    (isMobile ? banner.showOnMobile : banner.showOnDesktop);

  // Track impression once per session per banner
  useEffect(() => {
    if (!visible) return;
    const tracked = getTrackedSet();
    if (tracked.has(banner.id)) return;
    markTracked(banner.id);
    api.trackBannerEvent(banner.id, 'impression').catch(() => {});
  }, [visible, banner?.id]);

  const handleCtaClick = useCallback(() => {
    if (!banner) return;
    api.trackBannerEvent(banner.id, 'click').catch(() => {});
  }, [banner]);

  const handlePopupDismiss = useCallback(() => {
    try { sessionStorage.setItem(POPUP_DISMISS_KEY, '1'); } catch { /* ignore */ }
    setPopupDismissed(true);
  }, []);

  if (!visible) return null;

  // ── Popup placement ──────────────────────────────────────────────────────────
  if (placement === 'popup') {
    if (popupDismissed) return null;
    return (
      <AnimatePresence>
        <motion.div
          key="banner-popup"
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handlePopupDismiss}
        >
          <motion.div
            className="relative w-full max-w-md"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handlePopupDismiss}
              className="absolute top-3 left-3 z-10 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              aria-label="إغلاق"
            >
              <X className="w-4 h-4" />
            </button>
            {banner.ctaUrl ? (
              <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer" onClick={handleCtaClick}>
                <BannerPreview banner={banner} />
              </a>
            ) : (
              <BannerPreview banner={banner} />
            )}
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // ── Announcement bar placement ────────────────────────────────────────────────
  if (placement === 'announcement') {
    return (
      <motion.div
        key="banner-announcement"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full"
      >
        {banner.ctaUrl ? (
          <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer" onClick={handleCtaClick} className="block">
            <BannerPreview banner={banner} />
          </a>
        ) : (
          <BannerPreview banner={banner} />
        )}
      </motion.div>
    );
  }

  // ── Default: promo_home, category, product, sidebar, footer ──────────────────
  return (
    <motion.div
      key={`banner-${placement}`}
      className="w-full my-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {banner.ctaUrl ? (
        <a href={banner.ctaUrl} target="_blank" rel="noopener noreferrer" onClick={handleCtaClick} className="block rounded-2xl overflow-hidden">
          <BannerPreview banner={banner} />
        </a>
      ) : (
        <BannerPreview banner={banner} />
      )}
    </motion.div>
  );
}
