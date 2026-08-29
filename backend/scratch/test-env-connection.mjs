import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
try {
  const r = await prisma.$queryRaw`SELECT current_database() AS db, COUNT(*)::int AS products FROM "Product"`;
  console.log('Connected OK:', r[0]);
} catch (e) {
  console.error('Connection failed:', e.message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
