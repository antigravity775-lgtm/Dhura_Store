import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://6eeb.com';
const API_URL = 'https://dhura-store.vercel.app/api';

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
  return date.toISOString().split('T')[0];
}

async function generateSitemap() {
  console.log('Generating sitemap...');
  
  const today = formatDate(new Date());
  
  // 1. Static Pages
  const staticPages = [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/products', priority: 0.9, changefreq: 'daily' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/contact', priority: 0.7, changefreq: 'monthly' },
    { url: '/privacy-policy', priority: 0.5, changefreq: 'yearly' },
    { url: '/auth', priority: 0.5, changefreq: 'monthly' },
    { url: '/cart', priority: 0.6, changefreq: 'weekly' },
  ];

  let sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  // Add static pages
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
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  // 3. Dynamic Products
  const products = await fetchProducts();
  for (const product of products) {
    const id = product.slug || product.id || product._id || product.productId;
    if (!id) continue;
    const updatedAt = product.updatedAt ? formatDate(new Date(product.updatedAt)) : today;
    sitemapXml += `  <url>
    <loc>${BASE_URL}/product/${id}</loc>
    <lastmod>${updatedAt}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  sitemapXml += `</urlset>`;

  // Ensure public directory exists
  if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  }

  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapXml);
  console.log(`Generated sitemap with ${staticPages.length + categories.length + products.length} URLs.`);

  // Generate robots.txt
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /seller
Disallow: /profile
Disallow: /my-orders

Sitemap: ${BASE_URL}/sitemap.xml
`;
  fs.writeFileSync(path.join(PUBLIC_DIR, 'robots.txt'), robotsTxt);
  console.log('Generated robots.txt.');
}

generateSitemap().catch(console.error);
