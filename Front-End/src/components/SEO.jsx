import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import useSWR from 'swr';
import * as api from '../services/api';

const SEO = ({
  title,
  description = "متجر قصة - أروع العطور الفاخرة التي تلبي كافة الأذواق وتضفي لمسة من الأناقة على إطلالتك.",
  image = "https://www.gisaah.com/Logo.png",
  type = "website"
}) => {
  const location = useLocation();
  const currentUrl = `https://www.gisaah.com${location.pathname}`;

  // Fetch store info for global SEO defaults
  const { data: storeInfo } = useSWR('globalStoreInfo', api.getStoreInfo, {
    revalidateOnFocus: false,
    dedupingInterval: 600000 // 10 minutes cache
  });

  const finalTitle = title ? `${title} | ${storeInfo?.seoTitle || 'قصة'}` : (storeInfo?.seoTitle || 'قصة | Gisaah');
  const finalDescription = description !== "متجر قصة - أروع العطور الفاخرة التي تلبي كافة الأذواق وتضفي لمسة من الأناقة على إطلالتك."
    ? description
    : (storeInfo?.seoDescription || description);

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
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={finalTitle} />
      <meta property="twitter:description" content={finalDescription} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
