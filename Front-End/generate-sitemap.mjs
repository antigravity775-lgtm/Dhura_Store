import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://www.gisaah.com';
// Use local backend in dev so we always have the latest Prisma client with slug field.
// Override with SITEMAP_API_URL env var to target production.
const API_URL = process.env.SITEMAP_API_URL || 'http://localhost:5001/api';

const PUBLIC_DIR = path.join(__dirname, 'public');

async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products?pageSize=1000`);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    const data = JSON.parse(text);
    const items = Array.isArray(data) ? data : data.items || data.products || [];
    return items.filter(p => !p.isHidden);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function formatDate(date) {
  return new Date(date || Date.now()).toISOString().split('T')[0];
}

function escapeXml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function generateSitemap() {
  console.log('Generating sitemap...');

  const today = formatDate(new Date());

  // 1. Static Pages — exclude auth/cart/profile/my-orders (noIndex)
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/products', priority: 0.9, changefreq: 'daily' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
  ];

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

  // Static pages
  for (const page of staticPages) {
    sitemapXml += `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority.toFixed(1)}</priority>
  </url>
`;
  }

  // 2. Dynamic Categories
  const categories = await fetchCategories();
  for (const category of categories) {
    const name = category.name || category.nameEn || category.id;
    if (!name) continue;
    sitemapXml += `  <url>
    <loc>${BASE_URL}/category/${encodeURIComponent(name)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // 3. Dynamic Products — use slug URL (fall back to id for legacy products)
  const products = await fetchProducts();
  for (const product of products) {
    const slug = product.slug || product.id;
    if (!slug) continue;
    const updatedAt = product.updatedAt ? formatDate(new Date(product.updatedAt)) : today;
    const productUrl = `${BASE_URL}/product/${encodeURIComponent(slug)}`;

    sitemapXml += `  <url>
    <loc>${productUrl}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>`;

    if (product.mainImageUrl) {
      sitemapXml += `
    <image:image>
      <image:loc>${escapeXml(product.mainImageUrl)}</image:loc>
      <image:title>${escapeXml(product.title)}</image:title>
    </image:image>`;
    }

    sitemapXml += `
  </url>
`;
  }

  sitemapXml += `</urlset>`;

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml);
  console.log(`✅ Sitemap generated: ${staticPages.length} static + ${categories.length} categories + ${products.length} products = ${staticPages.length + categories.length + products.length} URLs`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /

# Disallow user-specific & auth pages
Disallow: /admin
Disallow: /seller
Disallow: /profile
Disallow: /my-orders
Disallow: /cart
Disallow: /auth
Disallow: /api/

# Bingbot
User-agent: Bingbot
Allow: /
Disallow: /admin
Disallow: /seller
Disallow: /profile
Disallow: /my-orders
Disallow: /cart
Disallow: /auth

# Yandex
User-agent: YandexBot
Allow: /
Disallow: /admin
Disallow: /seller
Disallow: /profile
Disallow: /my-orders
Disallow: /cart
Disallow: /auth

# Sitemaps
Sitemap: ${BASE_URL}/sitemap.xml
Sitemap: ${BASE_URL}/api/seo/sitemap-index.xml

# Host directive (Yandex)
Host: ${BASE_URL}
`;

  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt);
  console.log('✅ robots.txt generated.');
}

generateSitemap().catch(console.error);
