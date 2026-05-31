import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({ title, description, image, url }) => {
  const location = useLocation();
  const currentUrl = url || `https://6eeb.com${location.pathname === '/' ? '' : location.pathname}`;
  
  const defaultTitle = 'TEEB | طِيب — متجر العطور الفاخرة';
  const defaultDescription = 'في زمن الكوبي خليك مع طِيب , عطور اصلية ١٠٠٪ باقل من آلموقع الرسمي';
  const defaultImage = 'https://6eeb.com/og-share.png';

  const seoTitle = title ? `${title} | TEEB` : defaultTitle;
  const seoDescription = description || defaultDescription;
  const seoImage = image || defaultImage;

  return (
    <Helmet>
      <title>{seoTitle}</title>
      <meta name="description" content={seoDescription} />
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph */}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={seoDescription} />
      <meta property="og:image" content={seoImage} />

      {/* Twitter */}
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={seoDescription} />
      <meta name="twitter:image" content={seoImage} />
    </Helmet>
  );
};

export default SEO;
