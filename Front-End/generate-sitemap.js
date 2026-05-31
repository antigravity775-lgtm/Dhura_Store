import fs from 'fs';
import path from 'path';

const API_URL = 'https://6eeb.com/api';
const BASE_URL = 'https://6eeb.com';

async function generateSitemap() {
  console.log('Generating sitemap...');
  try {
    // 1. Fetch all products (assuming pageSize=1000 retrieves them all)
    const res = await fetch(`${API_URL}/products?pageSize=1000`);
    if (!res.ok) {
      throw new Error(`API responded with status ${res.status}`);
    }
    const data = await res.json();

    // Handle standard or paginated responses
    const products = Array.isArray(data) ? data : (data.items || data.products || []);
    console.log(`Found ${products.length} products from the API.`);

    // 2. Define static routes
    const staticRoutes = [
      '',
      '/products',
      '/about',
      '/contact',
      '/privacy-policy',
      '/credits'
    ];

    // 3. Build XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

    const today = new Date().toISOString().split('T')[0];

    // Add static routes
    for (const route of staticRoutes) {
      xml += `  <url>
    <loc>${BASE_URL}${route}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${route === '' ? '1.0' : '0.8'}</priority>
  </url>\n`;
    }

    // Add product routes
    for (const product of products) {
      // Assuming product.id exists and product isn't hidden
      if (product && product.id && !product.isHidden) {
        xml += `  <url>
    <loc>${BASE_URL}/product/${product.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>\n`;
      }
    }

    xml += `</urlset>`;

    // 4. Save to public directory so Vite copies it to dist
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml);
    console.log(`✅ sitemap.xml successfully generated in the public folder!`);

  } catch (error) {
    console.error('❌ Failed to generate sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
