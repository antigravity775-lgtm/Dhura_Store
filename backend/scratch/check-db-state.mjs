import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const cols = await prisma.$queryRaw`
    SELECT column_name
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'Product'
    ORDER BY ordinal_position
  `;
  console.log('Product columns:', cols.map((c) => c.column_name).join(', '));

  const tables = await prisma.$queryRaw`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `;
  console.log('Tables:', tables.map((t) => t.table_name).join(', '));

  const migrations = await prisma.$queryRaw`
    SELECT migration_name, finished_at
    FROM "_prisma_migrations"
    ORDER BY finished_at
  `;
  console.log('Applied migrations:', migrations);
} finally {
  await prisma.$disconnect();
}
