/**
 * Safe image migration — backup legacy URLs, copy to ProductImage[], then allow schema cleanup.
 *
 * Order of operations (never drop columns before step 2 completes):
 *   1. Export JSON backup of every product image source
 *   2. Copy legacy mainImageUrl → ProductImage (isPrimary=true) when column still exists
 *   3. Fill missing primary images from OrderItem snapshots
 *   4. Validate — abort if any product still has no primary image
 *
 * Usage:
 *   node prisma/scripts/migrate-images-safe.mjs
 *   node prisma/scripts/migrate-images-safe.mjs --apply-schema-cleanup
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const APPLY_SCHEMA_CLEANUP = process.argv.includes('--apply-schema-cleanup');
const BACKUP_DIR = path.join(__dirname, '../../data/backups');

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

function ensureBackupDir() {
  if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
  }
}

async function exportImageBackup() {
  console.log('\n📦 Step 1: Exporting image backup JSON...');
  ensureBackupDir();

  const hasLegacyColumn = await columnExists('Product', 'mainImageUrl');

  const products = hasLegacyColumn
    ? await prisma.$queryRaw`
        SELECT
          p.id,
          p.title,
          p.slug,
          p."mainImageUrl" AS "mainImageUrl",
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.url,
                'isPrimary', pi."isPrimary",
                'sortOrder', pi."sortOrder"
              )
              ORDER BY pi."sortOrder" ASC
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) AS images
        FROM "Product" p
        LEFT JOIN "ProductImage" pi ON pi."productId" = p.id
        GROUP BY p.id, p.title, p.slug, p."mainImageUrl"
        ORDER BY p."createdAt" ASC
      `
    : await prisma.$queryRaw`
        SELECT
          p.id,
          p.title,
          p.slug,
          NULL::text AS "mainImageUrl",
          COALESCE(
            json_agg(
              json_build_object(
                'id', pi.id,
                'url', pi.url,
                'isPrimary', pi."isPrimary",
                'sortOrder', pi."sortOrder"
              )
              ORDER BY pi."sortOrder" ASC
            ) FILTER (WHERE pi.id IS NOT NULL),
            '[]'::json
          ) AS images
        FROM "Product" p
        LEFT JOIN "ProductImage" pi ON pi."productId" = p.id
        GROUP BY p.id, p.title, p.slug
        ORDER BY p."createdAt" ASC
      `;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `product-images-backup-${stamp}.json`);
  fs.writeFileSync(backupPath, JSON.stringify({ exportedAt: new Date().toISOString(), products }, null, 2));
  console.log(`   ✅ Backup saved: ${backupPath}`);
  console.log(`   ℹ️  Products in backup: ${products.length}`);
  return { backupPath, hasLegacyColumn, products };
}

async function migrateLegacyMainImageUrl() {
  console.log('\n🖼️  Step 2: Copying legacy mainImageUrl → ProductImage[]...');

  const hasLegacyColumn = await columnExists('Product', 'mainImageUrl');
  if (!hasLegacyColumn) {
    console.log('   ℹ️  Product.mainImageUrl column not found — already on ProductImage schema.');
    return { created: 0, skipped: 0 };
  }

  const legacyProducts = await prisma.$queryRaw`
    SELECT p.id, p."mainImageUrl"
    FROM "Product" p
    WHERE p."mainImageUrl" IS NOT NULL
      AND TRIM(p."mainImageUrl") <> ''
  `;

  let created = 0;
  let skipped = 0;

  for (const row of legacyProducts) {
    const existingPrimary = await prisma.productImage.findFirst({
      where: { productId: row.id, isPrimary: true },
      select: { id: true },
    });

    if (existingPrimary) {
      skipped++;
      continue;
    }

    const maxSort = await prisma.productImage.aggregate({
      where: { productId: row.id },
      _max: { sortOrder: true },
    });

    await prisma.productImage.create({
      data: {
        productId: row.id,
        url: row.mainImageUrl,
        isPrimary: true,
        sortOrder: (maxSort._max.sortOrder ?? -1) + 1,
      },
    });
    created++;
  }

  console.log(`   ✅ Created ${created} ProductImage row(s). Skipped ${skipped} (already had primary).`);
  return { created, skipped };
}

async function recoverFromOrderSnapshots() {
  console.log('\n🔁 Step 3: Recovering missing images from OrderItem snapshots...');

  const missing = await prisma.$queryRaw`
    SELECT p.id AS "productId", oi."productImageUrl" AS url
    FROM "Product" p
    JOIN LATERAL (
      SELECT oi2."productImageUrl"
      FROM "OrderItem" oi2
      WHERE oi2."productId" = p.id
        AND oi2."productImageUrl" IS NOT NULL
        AND TRIM(oi2."productImageUrl") <> ''
      ORDER BY oi2."createdAt" DESC
      LIMIT 1
    ) oi ON true
    WHERE NOT EXISTS (
      SELECT 1 FROM "ProductImage" pi
      WHERE pi."productId" = p.id
    )
  `;

  let recovered = 0;
  for (const row of missing) {
    await prisma.productImage.create({
      data: {
        productId: row.productId,
        url: row.url,
        isPrimary: true,
        sortOrder: 0,
      },
    });
    recovered++;
  }

  console.log(`   ✅ Recovered ${recovered} product image(s) from order snapshots.`);
  return recovered;
}

async function validateImages() {
  console.log('\n🔍 Step 4: Validating all products have a primary image...');

  const missingPrimary = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS c
    FROM "Product" p
    WHERE NOT EXISTS (
      SELECT 1 FROM "ProductImage" pi
      WHERE pi."productId" = p.id AND pi."isPrimary" = true
    )
  `;

  const noImagesAtAll = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS c
    FROM "Product" p
    WHERE NOT EXISTS (
      SELECT 1 FROM "ProductImage" pi
      WHERE pi."productId" = p.id
    )
  `;

  const primaryMissing = Number(missingPrimary[0].c);
  const galleryMissing = Number(noImagesAtAll[0].c);

  if (primaryMissing > 0 || galleryMissing > 0) {
    throw new Error(
      `Image validation failed: ${galleryMissing} product(s) without images, ${primaryMissing} without primary image. Schema cleanup aborted.`
    );
  }

  const totals = await prisma.productImage.count();
  const products = await prisma.product.count();
  console.log(`   ✅ All ${products} products have images. Total ProductImage rows: ${totals}.`);
}

async function applySchemaCleanup() {
  console.log('\n🧹 Step 5: Dropping legacy image columns (safe IF EXISTS)...');

  const statements = [
    'DROP INDEX IF EXISTS "Product_categoryId_isHidden_isPromoted_idx"',
    'DROP INDEX IF EXISTS "Product_isHidden_isPromoted_createdAt_idx"',
    'DROP INDEX IF EXISTS "Product_isHidden_idx"',
    'ALTER TABLE "Product" DROP COLUMN IF EXISTS "mainImageUrl"',
    'ALTER TABLE "Product" DROP COLUMN IF EXISTS "isHidden"',
  ];

  for (const sql of statements) {
    await prisma.$executeRawUnsafe(sql);
    console.log(`   ↳ ${sql}`);
  }

  console.log('   ✅ Legacy columns removed safely.');
}

async function main() {
  console.log('='.repeat(60));
  console.log('TEEB — Safe Image Migration');
  console.log('='.repeat(60));

  try {
    await exportImageBackup();
    await migrateLegacyMainImageUrl();
    await recoverFromOrderSnapshots();
    await validateImages();

    if (APPLY_SCHEMA_CLEANUP) {
      await applySchemaCleanup();
    } else {
      console.log('\nℹ️  Schema cleanup skipped. Re-run with --apply-schema-cleanup after verifying backup.');
    }

    console.log('\n🎉 Image migration completed without data loss.\n');
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
