/**
 * diagnoseImages.js
 * Run: node src/scripts/diagnoseImages.js
 * Lists products missing images and shows the ديفا product detail.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1) Search for دیفا / ديفا
  const diva = await prisma.product.findMany({
    where: { title: { contains: 'ديفا', mode: 'insensitive' } },
    include: { images: { orderBy: { sortOrder: 'asc' } } },
  });

  console.log('\n===== Search: ديفا =====');
  if (diva.length === 0) {
    console.log('No product found with title containing "ديفا"');
  } else {
    for (const p of diva) {
      console.log(`\nProduct: ${p.title}`);
      console.log(`  ID:     ${p.id}`);
      console.log(`  Slug:   ${p.slug}`);
      console.log(`  Status: ${p.status}`);
      console.log(`  Images (${p.images.length}):`);
      p.images.forEach((img, i) => {
        console.log(`    [${i}] isPrimary=${img.isPrimary} sortOrder=${img.sortOrder}`);
        console.log(`        url=${img.url}`);
      });
    }
  }

  // 2) Products with NO images at all
  const noImages = await prisma.product.findMany({
    where: {
      status: 'Active',
      images: { none: {} },
    },
    select: { id: true, title: true, slug: true },
    take: 20,
  });

  console.log(`\n===== Active products with 0 images: ${noImages.length} =====`);
  noImages.forEach(p => console.log(`  - ${p.title} (${p.slug})`));

  // 3) Products where isPrimary is set on NONE of their images
  const allWithImages = await prisma.product.findMany({
    where: { status: 'Active', images: { some: {} } },
    include: { images: { select: { isPrimary: true } } },
    select: { id: true, title: true, images: true },
  });
  const noPrimary = allWithImages.filter(p => !p.images.some(img => img.isPrimary));
  console.log(`\n===== Active products with images but NO isPrimary=true: ${noPrimary.length} =====`);
  noPrimary.forEach(p => console.log(`  - ${p.title} (${p.images.length} images, none primary)`));

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
