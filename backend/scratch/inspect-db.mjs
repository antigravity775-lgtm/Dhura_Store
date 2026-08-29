import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const tables = await prisma.$queryRaw`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `;
  console.log('Tables:', tables.map((t) => t.table_name).join(', '));

  const productCols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product'
    ORDER BY ordinal_position
  `;
  console.log('Product columns:', productCols.map((c) => c.column_name).join(', '));

  const counts = await prisma.$queryRaw`
    SELECT
      (SELECT COUNT(*)::int FROM "Product") AS products,
      (SELECT COUNT(*)::int FROM "Category") AS categories,
      (SELECT COUNT(*)::int FROM "User") AS users
  `;
  console.log('Counts:', counts[0]);

  const hasMainImage = productCols.some((c) => c.column_name === 'mainImageUrl');
  if (hasMainImage) {
    const withImage = await prisma.$queryRaw`
      SELECT COUNT(*)::int AS c FROM "Product"
      WHERE "mainImageUrl" IS NOT NULL AND TRIM("mainImageUrl") <> ''
    `;
    console.log('Products with mainImageUrl:', withImage[0].c);
  }

  try {
    const mig = await prisma.$queryRaw`SELECT COUNT(*)::int AS c FROM "_prisma_migrations"`;
    console.log('Migration records:', mig[0].c);
  } catch {
    console.log('Migration records: none (_prisma_migrations missing)');
  }
} finally {
  await prisma.$disconnect();
}
