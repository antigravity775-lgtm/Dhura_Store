const { PrismaClient } = require('@prisma/client');

// Singleton to avoid exhausting DB connections in serverless (Vercel).
// In dev, we attach to globalThis so hot-reloads don't spawn new clients.
const globalForPrisma = globalThis;

const prisma = globalForPrisma.__prisma || new PrismaClient({
  log: ['error', 'warn'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}

module.exports = prisma;