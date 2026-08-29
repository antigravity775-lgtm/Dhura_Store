/**
 * Full safe migration for legacy DB → v2 schema without losing images.
 *
 * Order:
 *   1. JSON backup of mainImageUrl
 *   2. Mark baseline as applied
 *   3. Apply catalog v2 DDL only (ProductImage table created, mainImageUrl kept)
 *   4. Copy mainImageUrl → ProductImage[]
 *   5. Apply v3 DDL (drop mainImageUrl / isHidden)
 *   6. Phase 2 + Phase 3 scripts
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const MIGRATIONS = path.join(ROOT, 'prisma/migrations');
const V3_DIR = path.join(MIGRATIONS, '20260829133000_drop_legacy_product_image_columns');
const V3_BACKUP = path.join(MIGRATIONS, '_pending_drop_legacy_product_image_columns');
const BACKUP_DIR = path.join(ROOT, 'data/backups');
const prisma = new PrismaClient();

function run(cmd) {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit', env: process.env });
}

async function tableExists(name) {
  const r = await prisma.$queryRaw`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = ${name} LIMIT 1
  `;
  return r.length > 0;
}

async function columnExists(table, column) {
  const r = await prisma.$queryRaw`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table} AND column_name = ${column}
    LIMIT 1
  `;
  return r.length > 0;
}

async function backupLegacyImages() {
  console.log('\n📦 Step 1: Backing up mainImageUrl for all products...');
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const rows = await prisma.$queryRaw`
    SELECT id, title, slug, "mainImageUrl"
    FROM "Product"
    WHERE "mainImageUrl" IS NOT NULL AND TRIM("mainImageUrl") <> ''
    ORDER BY "createdAt" ASC
  `;

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(BACKUP_DIR, `legacy-mainImageUrl-backup-${stamp}.json`);
  fs.writeFileSync(file, JSON.stringify({ exportedAt: new Date().toISOString(), products: rows }, null, 2));
  console.log(`   ✅ Saved ${rows.length} image URLs → ${file}`);
  return file;
}

async function copyImagesToArray() {
  console.log('\n🖼️  Step 4: Copying mainImageUrl → ProductImage[]...');

  const products = await prisma.$queryRaw`
    SELECT id, "mainImageUrl" FROM "Product"
    WHERE "mainImageUrl" IS NOT NULL AND TRIM("mainImageUrl") <> ''
  `;

  let created = 0;
  let skipped = 0;

  for (const p of products) {
    const existing = await prisma.productImage.findFirst({
      where: { productId: p.id, isPrimary: true },
    });
    if (existing) { skipped++; continue; }

    await prisma.productImage.create({
      data: {
        productId: p.id,
        url: p.mainImageUrl,
        isPrimary: true,
        sortOrder: 0,
      },
    });
    created++;
  }

  console.log(`   ✅ Created ${created} ProductImage rows. Skipped ${skipped}.`);

  const missing = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS c FROM "Product" p
    WHERE NOT EXISTS (SELECT 1 FROM "ProductImage" pi WHERE pi."productId" = p.id)
  `;
  if (Number(missing[0].c) > 0) {
    throw new Error(`${missing[0].c} products still have no images — aborting before column drop.`);
  }
}

function hideV3Migration() {
  if (fs.existsSync(V3_DIR) && !fs.existsSync(V3_BACKUP)) {
    fs.renameSync(V3_DIR, V3_BACKUP);
    console.log('   ↳ Temporarily hid v3 migration (drop legacy columns)');
  }
}

function restoreV3Migration() {
  if (fs.existsSync(V3_BACKUP) && !fs.existsSync(V3_DIR)) {
    fs.renameSync(V3_BACKUP, V3_DIR);
    console.log('   ↳ Restored v3 migration');
  }
}

async function main() {
  console.log('='.repeat(60));
  console.log('TEEB — Full Safe Migration (no reset)');
  console.log('='.repeat(60));

  try {
    await backupLegacyImages();

    const hasMigrationsTable = await tableExists('_prisma_migrations');
    const baselineApplied = hasMigrationsTable
      ? (await prisma.$queryRaw`
          SELECT 1 FROM "_prisma_migrations"
          WHERE migration_name = '20260101000000_baseline_existing_schema' AND finished_at IS NOT NULL
          LIMIT 1
        `).length > 0
      : false;

    if (!baselineApplied) {
      console.log('\n📋 Step 2: Marking baseline migration as applied...');
      run('npx prisma migrate resolve --applied "20260101000000_baseline_existing_schema"');
    } else {
      console.log('\n📋 Step 2: Baseline already applied — skipping.');
    }

    const hasProductImage = await tableExists('ProductImage');
    if (!hasProductImage) {
      console.log('\n🏗️  Step 3: Applying catalog v2 schema (keeps mainImageUrl)...');
      hideV3Migration();
      try {
        run('npx prisma migrate deploy');
      } finally {
        restoreV3Migration();
      }
    } else {
      console.log('\n🏗️  Step 3: Catalog v2 tables already exist — skipping DDL.');
    }

    if (await columnExists('Product', 'mainImageUrl')) {
      await copyImagesToArray();

      const v3Done = hasMigrationsTable
        ? (await prisma.$queryRaw`
            SELECT 1 FROM "_prisma_migrations"
            WHERE migration_name = '20260829133000_drop_legacy_product_image_columns'
              AND finished_at IS NOT NULL LIMIT 1
          `).length > 0
        : false;

      if (!v3Done) {
        console.log('\n🧹 Step 5: Dropping legacy mainImageUrl / isHidden columns...');
        run('npx prisma migrate deploy');
      }
    } else {
      console.log('\n🧹 Step 5: Legacy columns already dropped — skipping.');
    }

    console.log('\n📊 Step 6: Phase 2 data migration...');
    run('node prisma/scripts/phase2-data-migration.mjs');

    console.log('\n🔒 Step 7: Phase 3 constraints...');
    run('node prisma/scripts/phase3-constraints.mjs');

    const summary = await prisma.$queryRaw`
      SELECT
        (SELECT COUNT(*)::int FROM "Product") AS products,
        (SELECT COUNT(*)::int FROM "ProductImage") AS images,
        (SELECT COUNT(*)::int FROM "Product" p WHERE EXISTS (
          SELECT 1 FROM "ProductImage" pi WHERE pi."productId" = p.id AND pi."isPrimary" = true
        )) AS with_primary
    `;
    console.log('\n🎉 Migration complete!', summary[0]);
  } catch (err) {
    restoreV3Migration();
    console.error('\n❌ Failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
