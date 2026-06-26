/**
 * BannerPreview — Live preview component for a banner object.
 *
 * Used in:
 * 1. AdminBannersTab editor panel (real-time preview as admin types)
 * 2. BannerRenderer on the storefront
 *
 * Props:
 *   banner   — the banner data object
 *   compact  — if true, uses a compact 16:9 container (for editor panel)
 */

import React from 'react';
import { ExternalLink } from 'lucide-react';

const PLACEMENT_RATIOS = {
  hero:         'aspect-[16/9] sm:aspect-[21/9] lg:aspect-[3/1] min-h-[300px]',
  promo_home:   'aspect-[4/1]',
  announcement: 'h-16',
  category:     'aspect-[3/1]',
  product:      'aspect-[3/1]',
  sidebar:      'aspect-[9/16]',
  footer:       'aspect-[5/1]',
  popup:        'aspect-[4/3]',
};

const ALIGN_CLASSES = {
  right:  'text-right items-start',
  center: 'text-center items-center',
  left:   'text-left items-end',
};

export default function BannerPreview({ banner, compact = false }) {
  if (!banner) return null;

  const {
    title = '',
    subtitle = '',
    description = '',
    ctaText = '',
    ctaUrl = '',
    imageUrl = '',
    bgColor = '#1A0A0A',
    textAlign = 'right',
    overlayOpacity = 30,
    placement = 'promo_home',
  } = banner;

  const ratioClass = compact ? 'aspect-[16/5]' : (PLACEMENT_RATIOS[placement] || 'aspect-[4/1]');
  const alignClass = ALIGN_CLASSES[textAlign] || ALIGN_CLASSES.right;
  const overlayAlpha = Math.round((overlayOpacity / 100) * 255).toString(16).padStart(2, '0');

  return (
    <div
      className={`relative w-full ${ratioClass} rounded-2xl overflow-hidden flex flex-col justify-end select-none`}
      style={{ background: bgColor || '#1A0A0A' }}
    >
      {/* Background Image */}
      {imageUrl && (
        <img
          src={imageUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}

      {/* Overlay */}
      {overlayOpacity > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `#000000${overlayAlpha}` }}
        />
      )}

      {/* Content */}
      <div className={`relative z-10 p-2 sm:p-4 flex flex-col gap-0.5 ${alignClass}`}>
        {title && (
          <h2 className="text-white font-extrabold text-[10px] sm:text-xs lg:text-sm leading-tight drop-shadow-lg">
            {title}
          </h2>
        )}
        {subtitle && (
          <p className="text-white/80 font-semibold text-[9px] sm:text-[10px] leading-snug drop-shadow">
            {subtitle}
          </p>
        )}
        {description && (
          <p className="text-white/60 text-[8px] leading-relaxed mt-0.5 line-clamp-2">
            {description}
          </p>
        )}
        {ctaText && (
          <div className="mt-1">
            <span className="inline-flex items-center gap-1 bg-agate-500 hover:bg-agate-400 text-white text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-md shadow-lg transition-colors cursor-pointer">
              {ctaText}
              {ctaUrl && <ExternalLink className="w-2 h-2" />}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
