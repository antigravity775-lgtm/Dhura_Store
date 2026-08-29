/**
 * Verify every product has images in ProductImage[] and optionally auto-fix from legacy column.
 * Usage: node scripts/checkImages.js
 */
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function columnExists(table, column) {
  const rows = await prisma.$queryRaw`
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = ${table}
      AND column_name = ${column}
    LIMIT 1
  `;
  return rows.length > 0;
}

async function checkImages() {
  const hasLegacyColumn = await columnExists('Product', 'mainImageUrl');

  const products = await prisma.product.findMany({
    include: { images: true },
  });

  let missing = 0;
  for (const p of products) {
    if (p.images.length > 0) continue;

    missing++;
    let legacyUrl = null;

    if (hasLegacyColumn) {
      const row = await prisma.$queryRaw`
        SELECT "mainImageUrl" FROM "Product" WHERE id = ${p.id}::uuid LIMIT 1
      `;
      legacyUrl = row[0]?.mainImageUrl ?? null;
    }

    if (!legacyUrl) {
      console.log(`Product ${p.id} (${p.title}) has no images and no legacy URL`);
      continue;
    }

    await prisma.productImage.create({
      data: {
        productId: p.id,
        url: legacyUrl,
        isPrimary: true,
        sortOrder: 0,
      },
    });
    console.log(`Auto-fixed Product ${p.id} from legacy mainImageUrl`);
  }

  console.log(`Total missing before fix: ${missing}`);
}

checkImages()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
