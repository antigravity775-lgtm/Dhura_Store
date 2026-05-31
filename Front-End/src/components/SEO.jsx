import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
  title,
  description = "متجر قصة - أروع العطور الفاخرة التي تلبي كافة الأذواق وتضفي لمسة من الأناقة على إطلالتك.",
  image = "https://www.gisaah.com/Logo.png",
  type = "website"
}) => {
  const location = useLocation();
  const currentUrl = `https://www.gisaah.com${location.pathname}`;

  return (
    <Helmet>
      <title>{title ? `${title} | قصة` : 'قصة | Gisaah'}</title>
      <meta name="description" content={description} />

      {/* Canonical Link */}
      <link rel="canonical" href={currentUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title ? `${title} | قصة` : 'قصة | Gisaah'} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={title ? `${title} | قصة` : 'قصة | Gisaah'} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
