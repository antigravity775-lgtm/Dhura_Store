import { useEffect, useState } from 'react';

export const BANNER_IMPRESSION_KEY = 'gisaah_banner_impressions';
export const POPUP_DISMISS_KEY = 'gisaah_popup_dismissed';

export function useIsMobile(breakpoint = 767) {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${breakpoint}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [breakpoint]);

  return isMobile;
}

export function getTrackedSet(key = BANNER_IMPRESSION_KEY) {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(key) || '[]'));
  } catch {
    return new Set();
  }
}

export function markTracked(id, key = BANNER_IMPRESSION_KEY) {
  try {
    const set = getTrackedSet(key);
    set.add(id);
    sessionStorage.setItem(key, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

export function getDismissedPopups() {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(POPUP_DISMISS_KEY) || '[]'));
  } catch {
    return new Set();
  }
}

export function markPopupDismissed(id) {
  try {
    const set = getDismissedPopups();
    set.add(id);
    sessionStorage.setItem(POPUP_DISMISS_KEY, JSON.stringify([...set]));
  } catch { /* ignore */ }
}

export function filterVisibleBanners(banners, isMobile) {
  if (!banners?.length) return [];
  return banners.filter((b) => (isMobile ? b.showOnMobile : b.showOnDesktop));
}
