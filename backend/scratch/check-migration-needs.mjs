import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const stats = {
    categories: await prisma.category.count(),
    categoriesNoSlug: await prisma.category.count({ where: { slug: null } }),
    products: await prisma.product.count(),
    productsDraft: await prisma.product.count({ where: { status: 'Draft' } }),
    productsActive: await prisma.product.count({ where: { status: 'Active' } }),
    productImages: await prisma.productImage.count(),
    productsNoPrimaryImage: await prisma.$queryRaw`
      SELECT COUNT(*)::int AS c FROM "Product" p
      WHERE NOT EXISTS (
        SELECT 1 FROM "ProductImage" pi
        WHERE pi."productId" = p.id AND pi."isPrimary" = true
      )
    `.then((r) => Number(r[0].c)),
    orderItemsMissingSnapshot: await prisma.orderItem.count({
      where: { productId: { not: null }, productTitle: null },
    }),
    failedMigrations: await prisma.$queryRaw`
      SELECT id, migration_name, started_at, finished_at, rolled_back_at, logs
      FROM "_prisma_migrations"
      WHERE finished_at IS NULL
    `,
  };

  console.log(JSON.stringify(stats, null, 2));

  const catAttrCols = await prisma.$queryRaw`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'CategoryAttribute'
    ORDER BY ordinal_position
  `;
  console.log('CategoryAttribute columns:', catAttrCols.map((c) => c.column_name).join(', '));
} finally {
  await prisma.$disconnect();
}
