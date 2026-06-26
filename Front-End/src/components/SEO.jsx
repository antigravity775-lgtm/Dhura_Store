import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';
import * as api from '../services/api';

const SEO = ({
  title,
  description,
  image,
  type = "website"
}) => {
  const location = useLocation();
  const currentUrl = `https://6eeb.com${location.pathname === '/' ? '' : location.pathname}`;

  // Fetch store info for global SEO defaults
  const { data: storeInfo } = useSWR('globalStoreInfo', api.getStoreInfo, {
    revalidateOnFocus: false,
    dedupingInterval: 600000 // 10 minutes cache
  });

  const defaultTitle = 'TEEB | طيب — متجر العطور الفاخرة';
  const defaultDescription = 'في زمن الكوبي خليك مع طيب , عطور اصلية ١٠٠٪ باقل من آلموقع الرسمي';
  const defaultImage = 'https://6eeb.com/og-share.png';

  const finalTitle = title ? `${title} | ${storeInfo?.seoTitle || 'طيب'}` : (storeInfo?.seoTitle || defaultTitle);
  const finalDescription = description || storeInfo?.seoDescription || defaultDescription;
  const finalImage = image || defaultImage;

  return (
    <Helmet>
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export default SEO;
