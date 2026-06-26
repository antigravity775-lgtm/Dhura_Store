require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const prisma = new PrismaClient();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

function generateSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    // Remove special characters except letters, numbers, and hyphens
    .replace(/[^\w\-]+/g, '')
    // Remove multiple consecutive hyphens
    .replace(/\-\-+/g, '-')
    // Remove leading and trailing hyphens
    .replace(/^-+|-+$/g, '');
}

async function translateBatch(titles) {
  try {
    const prompt = `Translate the following Arabic product titles into short, concise English suitable for e-commerce URLs (e.g., 'Men Perfume', 'Oud Incense').
    Return ONLY a valid JSON array of strings in the exact same order. Do not include markdown formatting or the \`\`\`json block.
    
    Titles:
    ${JSON.stringify(titles, null, 2)}
    `;

    const result = await model.generateContent(prompt);
    let responseText = result.response.text();
    // Clean up markdown just in case
    responseText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const translatedArray = JSON.parse(responseText);
    
    if (!Array.isArray(translatedArray) || translatedArray.length !== titles.length) {
      throw new Error("Translation array length mismatch or invalid format");
    }
    
    return translatedArray;
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    // Fallback: return empty strings to force fallback to short ID
    return titles.map(() => "");
  }
}

async function main() {
  console.log('Fetching products from database...');
  const products = await prisma.$queryRaw`SELECT id, title FROM "Product"`;
  
  if (products.length === 0) {
    console.log('No products found.');
    return;
  }

  console.log(`Found ${products.length} products. Translating and generating English slugs...`);

  const BATCH_SIZE = 20;
  let count = 0;
  const usedSlugs = new Set();

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(products.length / BATCH_SIZE)}...`);
    
    const titles = batch.map(p => p.title);
    const translatedTitles = await translateBatch(titles);

    for (let j = 0; j < batch.length; j++) {
      const product = batch[j];
      const englishTitle = translatedTitles[j] || product.title; // fallback to original if empty
      
      let baseSlug = generateSlug(englishTitle);
      let slug = baseSlug;
      
      // If the English translation produced an empty slug (e.g. only symbols), fallback to a standard prefix
      if (!slug) {
        slug = `product-${product.id.substring(0, 6)}`;
      }

      // Check for collisions
      let counter = 1;
      while (usedSlugs.has(slug)) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      
      usedSlugs.add(slug);

      try {
        await prisma.$executeRaw`UPDATE "Product" SET slug = ${slug} WHERE id = ${product.id}::uuid`;
        console.log(`Updated: ${product.title} -> [${englishTitle}] -> ${slug}`);
        count++;
      } catch (err) {
        console.error(`Failed to update ${product.title}:`, err.message);
      }
    }
    
    // Add a small delay between batches to respect API limits
    if (i + BATCH_SIZE < products.length) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\nSuccessfully translated and backfilled ${count} English product slugs!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
