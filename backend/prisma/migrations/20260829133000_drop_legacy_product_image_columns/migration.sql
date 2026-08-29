-- Safe cleanup: only drop legacy single-image columns AFTER ProductImage[] is populated.
-- Run: node prisma/scripts/migrate-images-safe.mjs
-- Then: npx prisma migrate deploy

DROP INDEX IF EXISTS "Product_categoryId_isHidden_isPromoted_idx";
DROP INDEX IF EXISTS "Product_isHidden_isPromoted_createdAt_idx";
DROP INDEX IF EXISTS "Product_isHidden_idx";

ALTER TABLE "Product" DROP COLUMN IF EXISTS "mainImageUrl";
ALTER TABLE "Product" DROP COLUMN IF EXISTS "isHidden";
