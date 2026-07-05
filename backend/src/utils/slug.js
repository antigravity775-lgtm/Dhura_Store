function generateSlug(text) {
  return String(text || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function generateUniqueProductSlug(prisma, title, productId) {
  let baseSlug = generateSlug(title);
  if (!baseSlug || baseSlug.length < 3) {
    baseSlug = `product-${productId.substring(0, 6)}`;
  }

  let slug = baseSlug;
  let counter = 1;
  while (await prisma.product.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

module.exports = { generateSlug, generateUniqueProductSlug };
