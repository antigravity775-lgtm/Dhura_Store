import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const constraints = await prisma.$queryRaw`
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public."Review"'::regclass
  `;
  console.log('Review constraints:', constraints);

  const triggers = await prisma.$queryRaw`
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'public."ProductAttribute"'::regclass
      AND NOT tgisinternal
  `;
  console.log('ProductAttribute triggers:', triggers);

  const functions = await prisma.$queryRaw`
    SELECT proname
    FROM pg_proc
    WHERE proname = 'enforce_product_attribute_category'
  `;
  console.log('Trigger functions:', functions);
} finally {
  await prisma.$disconnect();
}
