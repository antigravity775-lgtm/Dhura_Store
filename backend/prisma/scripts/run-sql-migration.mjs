/**
 * Run migrations via pg (uses pooler DATABASE_URL — avoids hanging prisma migrate CLI).
 * Images are backed up and copied to ProductImage[] BEFORE legacy columns are dropped.
 */

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '../..');
const BACKUP_DIR = path.join(ROOT, 'data/backups');

function splitSql(sql) {
  const cleaned = sql.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
  const statements = [];
  let current = '';
  let inString = false;

  for (let i = 0; i < cleaned.length; i++) {
    const ch = cleaned[i];
    if (ch === "'" && cleaned[i - 1] !== '\\') inString = !inString;
    if (ch === ';' && !inString) {
      const stmt = current.trim();
      if (stmt && !stmt.split('\n').every((l) => !l.trim() || l.trim().startsWith('--'))) {
        statements.push(stmt);
      }
      current = '';
    } else {
      current += ch;
    }
  }
  const tail = current.trim();
  if (tail && !tail.split('\n').every((l) => !l.trim() || l.trim().startsWith('--'))) {
    statements.push(tail);
  }
  return statements;
}

async function runFile(client, filePath, label) {
  const sql = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const statements = splitSql(sql);
  console.log(`\n▶ ${label} (${statements.length} statements)`);
  for (const stmt of statements) {
    try {
      await client.query(stmt);
    } catch (err) {
      const ignorable = /already exists|duplicate key|does not exist/i.test(err.message);
      if (ignorable) {
        console.log(`   ⚠ skip: ${err.message.split('\n')[0]}`);
      } else {
        console.error(`   ✗ failed on: ${stmt.slice(0, 80)}...`);
        throw err;
      }
    }
  }
  console.log(`   ✅ ${label} done`);
}

async function backupImages(client) {
  console.log('\n📦 Step 1: Backing up mainImageUrl...');
  if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR, { recursive: true });

  const { rows } = await client.query(`
    SELECT id, title, slug, "mainImageUrl"
    FROM "Product"
    WHERE "mainImageUrl" IS NOT NULL AND TRIM("mainImageUrl") <> ''
    ORDER BY "createdAt" ASC
  `);

  const file = path.join(BACKUP_DIR, `legacy-mainImageUrl-backup-${Date.now()}.json`);
  fs.writeFileSync(file, JSON.stringify({ exportedAt: new Date().toISOString(), products: rows }, null, 2));
  console.log(`   ✅ ${rows.length} URLs saved → ${file}`);
  return rows.length;
}

async function copyImagesToArray(client) {
  console.log('\n🖼️  Step 3: Copying mainImageUrl → ProductImage[]...');

  const { rows } = await client.query(`
    SELECT id, "mainImageUrl" FROM "Product"
    WHERE "mainImageUrl" IS NOT NULL AND TRIM("mainImageUrl") <> ''
  `);

  let created = 0;
  for (const p of rows) {
    const existing = await client.query(
      `SELECT id FROM "ProductImage" WHERE "productId" = $1 AND "isPrimary" = true LIMIT 1`,
      [p.id]
    );
    if (existing.rows.length > 0) continue;

    await client.query(
      `INSERT INTO "ProductImage" (id, url, "altText", "sortOrder", "isPrimary", "productId", "createdAt")
       VALUES ($1, $2, NULL, 0, true, $3, NOW())`,
      [randomUUID(), p.mainImageUrl, p.id]
    );
    created++;
  }

  const { rows: missing } = await client.query(`
    SELECT COUNT(*)::int AS c FROM "Product" p
    WHERE NOT EXISTS (SELECT 1 FROM "ProductImage" pi WHERE pi."productId" = p.id)
  `);

  if (missing[0].c > 0) throw new Error(`${missing[0].c} products still missing images`);

  console.log(`   ✅ Created ${created} ProductImage rows for ${rows.length} products`);
}

async function setProductStatusFromHidden(client) {
  console.log('\n🏷️  Setting status from isHidden...');
  const col = await client.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_name='Product' AND column_name='isHidden' LIMIT 1
  `);
  if (col.rows.length === 0) {
    console.log('   ℹ️  isHidden column gone — skipping');
    return;
  }
  await client.query(`UPDATE "Product" SET status = 'Archived' WHERE "isHidden" = true AND status = 'Draft'`);
  await client.query(`UPDATE "Product" SET status = 'Active' WHERE "isHidden" = false AND status = 'Draft'`);
  console.log('   ✅ Status updated');
}

async function recordMigration(client, name) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
      id VARCHAR(36) PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      finished_at TIMESTAMPTZ,
      migration_name VARCHAR(255) NOT NULL,
      logs TEXT,
      rolled_back_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )
  `);
  const exists = await client.query(
    `SELECT 1 FROM "_prisma_migrations" WHERE migration_name = $1 AND finished_at IS NOT NULL LIMIT 1`,
    [name]
  );
  if (exists.rows.length > 0) return;
  await client.query(
    `INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, applied_steps_count)
     VALUES ($1, $2, NOW(), $3, 1)`,
    [randomUUID(), 'manual', name]
  );
}

async function applyExtraSchema(client) {
  console.log('\n🔧 Step 5: Extra schema patches...');
  const extras = [
    `ALTER TABLE "CategoryAttribute" ADD COLUMN IF NOT EXISTS "options" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "address" TEXT`,
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "locationUrl" TEXT`,
    `CREATE TABLE IF NOT EXISTS "Branch" (
      "id" UUID NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL, "address" TEXT NOT NULL, "city" TEXT NOT NULL,
      "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION,
      "phone" TEXT, "whatsapp" TEXT, "workingHours" TEXT, "mapUrl" TEXT,
      "isActive" BOOLEAN NOT NULL DEFAULT true, "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `ALTER TABLE "Product" DROP COLUMN IF EXISTS "sellerId"`,
    `DROP INDEX IF EXISTS "Product_sellerId_createdAt_idx"`,
  ];
  for (const sql of extras) {
    try { await client.query(sql); } catch (e) {
      if (!/already exists|does not exist/i.test(e.message)) throw e;
    }
  }
  console.log('   ✅ Extra patches applied');
}

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  console.log('='.repeat(60));
  console.log('TEEB — SQL Migration (images safe)');
  console.log('='.repeat(60));

  try {
    await backupImages(client);

    const hasPI = await client.query(
      `SELECT 1 FROM information_schema.tables WHERE table_name='ProductImage' LIMIT 1`
    );

    if (hasPI.rows.length === 0) {
      console.log('\n🏗️  Step 2: Applying catalog v2 schema...');
      await runFile(client, path.join(ROOT, 'prisma/migrations/20260828110456_upgrade_catalog_v2/migration.sql'), 'catalog v2');
      await recordMigration(client, '20260101000000_baseline_existing_schema');
      await recordMigration(client, '20260828110456_upgrade_catalog_v2');
    } else {
      console.log('\n🏗️  Step 2: ProductImage table exists — skipping v2 DDL');
    }

    await copyImagesToArray(client);
    await setProductStatusFromHidden(client);

    console.log('\n🧹 Step 4: Dropping legacy image columns...');
    await runFile(client, path.join(ROOT, 'prisma/migrations/20260829133000_drop_legacy_product_image_columns/migration.sql'), 'drop legacy cols');
    await recordMigration(client, '20260829133000_drop_legacy_product_image_columns');

    await applyExtraSchema(client);

    const { rows: summary } = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM "Product") AS products,
        (SELECT COUNT(*)::int FROM "ProductImage") AS images
    `);
    console.log('\n🎉 Done!', summary[0]);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('\n❌', err.message);
  process.exit(1);
});
