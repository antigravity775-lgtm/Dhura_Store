/**
 * structuredData.js — JSON-LD Schema Factory Functions
 *
 * EN: Generates structured data (JSON-LD) for Google Rich Results.
 *     Each function returns a plain object ready to be serialized as JSON
 *     and injected via <script type="application/ld+json">.
 *
 * AR: ينشئ بيانات مهيكلة (JSON-LD) لنتائج جوجل الغنية.
 *     كل دالة ترجع كائن جاهز للتسلسل كـ JSON وحقنه عبر <script>.
 */

const BASE_URL = 'https://www.gisaah.com';

/**
 * Currency code mapping from internal enum to ISO 4217
 */
const CURRENCY_ISO = {
  YER_Sanaa: 'YER',
  YER_Aden: 'YER',
  USD: 'USD',
  SAR: 'SAR',
  EUR: 'EUR',
  1: 'YER',
  2: 'YER',
  3: 'USD',
  4: 'SAR',
  5: 'EUR',
};

/**
 * Build Product structured data
 *
 * @param {Object} product - Product data from API
 * @returns {Object} JSON-LD Product schema
 */
export function buildProductSchema(product) {
  if (!product) return null;

  const currency = CURRENCY_ISO[product.currency] || 'YER';
  const price = product.discountPrice
    ? Number(product.discountPrice)
    : Number(product.price);
  const availability = product.stockQuantity > 0
    ? 'https://schema.org/InStock'
    : 'https://schema.org/OutOfStock';

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: (product.description || '').substring(0, 500),
    image: product.mainImageUrl || `${BASE_URL}/Logo.png`,
    sku: product.id,
    brand: {
      '@type': 'Brand',
      name: product.categoryName || 'GISAAH',
    },
    offers: {
      '@type': 'Offer',
      url: `${BASE_URL}/product/${product.slug || product.id}`,
      priceCurrency: currency,
      price: price.toFixed(2),
      availability,
      seller: {
        '@type': 'Organization',
        name: 'GISAAH | قصة',
      },
      itemCondition: product.condition === 'Used' || product.condition === 2
        ? 'https://schema.org/UsedCondition'
        : 'https://schema.org/NewCondition',
    },
  };

  // Add high price for discount display
  if (product.discountPrice && product.price) {
    schema.offers.highPrice = Number(product.price).toFixed(2);
  }

  return schema;
}

/**
 * Build BreadcrumbList structured data
 *
 * @param {Array<{name: string, url: string}>} items - Breadcrumb items
 * @returns {Object} JSON-LD BreadcrumbList schema
 */
export function buildBreadcrumbSchema(items) {
  if (!items || items.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url ? `${BASE_URL}${item.url}` : undefined,
    })),
  };
}

/**
 * Build Organization structured data
 *
 * @param {Object} storeInfo - Store settings from API
 * @returns {Object} JSON-LD Organization schema
 */
export function buildOrganizationSchema(storeInfo = {}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GISAAH | قصة',
    url: BASE_URL,
    logo: `${BASE_URL}/Logo.png`,
    image: `${BASE_URL}/og-share.png`,
    description: storeInfo.seoDescription || 'متجر العطور الفاخرة الأصلية في اليمن',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Arabic', 'English'],
    },
    sameAs: [],
  };

  if (storeInfo.contactPhone) {
    schema.contactPoint.telephone = storeInfo.contactPhone;
  }
  if (storeInfo.contactEmail) {
    schema.contactPoint.email = storeInfo.contactEmail;
  }
  if (storeInfo.instagramUrl) schema.sameAs.push(storeInfo.instagramUrl);
  if (storeInfo.facebookUrl) schema.sameAs.push(storeInfo.facebookUrl);
  if (storeInfo.twitterUrl) schema.sameAs.push(storeInfo.twitterUrl);
  if (storeInfo.whatsappUrl) schema.sameAs.push(storeInfo.whatsappUrl);

  return schema;
}

/**
 * Build WebSite structured data with SearchAction (sitelinks search box)
 *
 * @returns {Object} JSON-LD WebSite schema
 */
export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GISAAH | قصة',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Build FAQPage structured data
 *
 * @param {Array<{question: string, answer: string}>} faqs
 * @returns {Object} JSON-LD FAQPage schema
 */
export function buildFAQSchema(faqs) {
  if (!faqs || faqs.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * Build ItemList structured data (for product listing pages)
 *
 * @param {Array} products - List of products
 * @param {string} listName - Name of the list (e.g., category name)
 * @returns {Object} JSON-LD ItemList schema
 */
export function buildItemListSchema(products, listName = 'منتجات متجر قصة') {
  if (!products || products.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${BASE_URL}/product/${product.slug || product.id}`,
      name: product.title,
    })),
  };
}
