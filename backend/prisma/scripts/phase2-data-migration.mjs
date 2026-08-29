/**
 * TEEB — Phase 2 Data Migration Script
 * ========================================
 * Run ONCE after the DDL migration (upgrade_catalog_v2) has been applied.
 *
 * Steps:
 *  1. Generate deterministic slugs for all Category rows that lack one.
 *  2. Migrate Product.mainImageUrl → ProductImage table (isPrimary=true).
 *  3. Set Product.status from deprecated isHidden boolean.
 *  4. Populate OrderItem snapshot fields from ProductImage + Product data.
 *  5. Run 5 validation checks — all must return 0.
 *
 * Usage:
 *   node prisma/scripts/phase2-data-migration.mjs
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function toSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06ff]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function shortId(uuid) {
  return uuid.replace(/-/g, "").slice(0, 8);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Category slugs
// ─────────────────────────────────────────────────────────────────────────────

async function migrateCategorySlugs() {
  console.log("\n📂 Step 1: Generating category slugs...");

  const categories = await prisma.category.findMany({
    where: { slug: null },
    select: { id: true, name: true },
  });

  if (categories.length === 0) {
    console.log("   ✅ All categories already have slugs. Skipping.");
    return;
  }

  let updated = 0;
  for (const cat of categories) {
    const slug = `${toSlug(cat.name)}-${shortId(cat.id)}`;
    await prisma.category.update({
      where: { id: cat.id },
      data: { slug },
    });
    console.log(`   ↳ "${cat.name}" → "${slug}"`);
    updated++;
  }

  console.log(`   ✅ ${updated} category slug(s) generated.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Migrate mainImageUrl → ProductImage
// ─────────────────────────────────────────────────────────────────────────────

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

async function migrateProductImages() {
  console.log("\n🖼️  Step 2: Migrating mainImageUrl → ProductImage[]...");

  const hasLegacyColumn = await columnExists("Product", "mainImageUrl");
  if (!hasLegacyColumn) {
    console.log("   ℹ️  Product.mainImageUrl column not found — images already on ProductImage[]. Skipping.");
    return;
  }

  const products = await prisma.$queryRaw`
    SELECT id, "mainImageUrl"
    FROM "Product"
    WHERE "mainImageUrl" IS NOT NULL
      AND TRIM("mainImageUrl") <> ''
  `;

  let created = 0;
  let skipped = 0;

  for (const product of products) {
    const existing = await prisma.productImage.findFirst({
      where: { productId: product.id, isPrimary: true },
    });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.productImage.create({
      data: {
        productId: product.id,
        url: product.mainImageUrl,
        isPrimary: true,
        sortOrder: 0,
      },
    });
    created++;
  }

  console.log(`   ✅ Created ${created} ProductImage row(s). Skipped ${skipped} (already had primary image).`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Set Product.status from isHidden
// ─────────────────────────────────────────────────────────────────────────────

async function migrateProductStatus() {
  console.log("\n🏷️  Step 3: Setting Product.status from isHidden...");

  const hasLegacyColumn = await columnExists("Product", "isHidden");
  if (!hasLegacyColumn) {
    console.log("   ℹ️  Product.isHidden column not found — status already migrated. Skipping.");
    return;
  }

  await prisma.$executeRawUnsafe(`
    UPDATE "Product" SET status = 'Archived'
    WHERE "isHidden" = true AND status = 'Draft'
  `);
  await prisma.$executeRawUnsafe(`
    UPDATE "Product" SET status = 'Active'
    WHERE "isHidden" = false AND status = 'Draft'
  `);

  const archived = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS c FROM "Product" WHERE status = 'Archived'
  `;
  const active = await prisma.$queryRaw`
    SELECT COUNT(*)::int AS c FROM "Product" WHERE status = 'Active'
  `;

  console.log(`   ✅ Archived: ${archived[0].c} | Active: ${active[0].c}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 4 — Populate OrderItem snapshots
// ─────────────────────────────────────────────────────────────────────────────

async function migrateOrderItemSnapshots() {
  console.log("\n📦 Step 4: Populating OrderItem snapshot fields...");

  const orderItems = await prisma.orderItem.findMany({
    where: {
      productId: { not: null },
      productTitle: null,
    },
    select: { id: true, productId: true },
  });

  if (orderItems.length === 0) {
    console.log("   ✅ All OrderItems already have snapshots. Skipping.");
    return;
  }

  let updated = 0;

  for (const item of orderItems) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { title: true, sku: true },
    });

    if (!product) continue;

    const primaryImage = await prisma.productImage.findFirst({
      where: { productId: item.productId, isPrimary: true },
      select: { url: true },
    });

    const fallbackImage = primaryImage?.url ?? (await prisma.productImage.findFirst({
      where: { productId: item.productId },
      orderBy: { sortOrder: 'asc' },
      select: { url: true },
    }))?.url ?? null;

    await prisma.orderItem.update({
      where: { id: item.id },
      data: {
        productTitle: product.title,
        productImageUrl: fallbackImage,
        productSku: product.sku ?? null,
      },
    });

    updated++;
  }

  console.log(`   ✅ ${updated} OrderItem snapshot(s) populated.`);
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 5 — Validation
// ─────────────────────────────────────────────────────────────────────────────

async function validate() {
  console.log("\n🔍 Step 5: Running validation checks...");

  const checks = [
    {
      name: "Categories without a slug",
      count: await prisma.category.count({ where: { slug: null } }),
    },
    {
      name: "Products still in Draft status",
      count: await prisma.product.count({ where: { status: "Draft" } }),
    },
    {
      name: "Products missing primary ProductImage",
      count: await prisma.$queryRaw`
        SELECT COUNT(*)::int AS c FROM "Product" p
        WHERE NOT EXISTS (
          SELECT 1 FROM "ProductImage" pi
          WHERE pi."productId" = p.id AND pi."isPrimary" = true
        )
      `.then((r) => Number(r[0].c)),
    },
    {
      name: "OrderItems missing snapshot (productId present)",
      count: await prisma.orderItem.count({
        where: { productId: { not: null }, productTitle: null },
      }),
    },
  ];

  let allPassed = true;
  for (const check of checks) {
    const status = check.count === 0 ? "✅" : "❌";
    if (check.count !== 0) allPassed = false;
    console.log(`   ${status} ${check.name}: ${check.count}`);
  }

  if (allPassed) {
    console.log("\n🎉 All validation checks passed. Migration complete!\n");
  } else {
    console.error("\n⚠️  Some checks failed — review the output above.\n");
    process.exit(1);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(60));
  console.log("TEEB — Phase 2 Data Migration");
  console.log("=".repeat(60));

  try {
    await migrateCategorySlugs();
    await migrateProductImages();
    await migrateProductStatus();
    await migrateOrderItemSnapshots();
    await validate();
  } catch (err) {
    console.error("\n❌ Migration failed:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
