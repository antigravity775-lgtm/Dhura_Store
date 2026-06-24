/**
 * SEO.jsx — Enhanced Meta & Structured Data Component
 *
 * Full-featured SEO component using react-helmet-async.
 * Supports:
 * - Dynamic title/description with store name suffix
 * - Per-page OG images with dimensions
 * - Multiple JSON-LD blocks via jsonLd prop
 * - noIndex for auth/cart/profile pages
 * - og:type (website, product, article)
 * - og:locale, og:site_name, hreflang
 * - Explicit canonical override via canonicalPath
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';
import * as api from '../services/api';

const SITE_NAME = 'GISAAH | قصة';
const BASE_URL = 'https://www.gisaah.com';
const DEFAULT_IMAGE = `${BASE_URL}/og-share.png`;
const DEFAULT_DESCRIPTION = 'في زمن الكوبي خليك مع قصة — عطور أصلية ١٠٠٪ بأسعار أقل من الموقع الرسمي مع توصيل سريع.';

const SEO = ({
  title,
  description,
  image,
  type = 'website',
  canonicalPath,
  jsonLd,
  noIndex = false,
}) => {
  const location = useLocation();
  const canonical = canonicalPath
    ? `${BASE_URL}${canonicalPath}`
    : `${BASE_URL}${location.pathname}`;

  // Fetch store info for dynamic defaults
  const { data: storeInfo } = useSWR('globalStoreInfo', api.getStoreInfo, {
    revalidateOnFocus: false,
    dedupingInterval: 600000, // 10 minutes
  });

  const storeName = storeInfo?.seoTitle || SITE_NAME;
  const finalTitle = title ? `${title} | ${storeName}` : storeName;
  const finalDescription = description || storeInfo?.seoDescription || DEFAULT_DESCRIPTION;
  const finalImage = image || DEFAULT_IMAGE;

  // Normalize jsonLd: accept single object or array
  const schemas = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* Canonical */}
      <link rel="canonical" href={canonical} />

      {/* hreflang — Arabic (Yemen) */}
      <link rel="alternate" hrefLang="ar" href={canonical} />
      <link rel="alternate" hrefLang="ar-YE" href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonical} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={finalTitle} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="ar_YE" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonical} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      <meta name="twitter:image:alt" content={finalTitle} />

      {/* JSON-LD Structured Data */}
      {schemas.filter(Boolean).map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEO;
