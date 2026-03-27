const { PrismaClient } = require('@prisma/client');

// Prisma Client instance with logging
const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

// Eagerly connect and log status
prisma.$connect()
  .then(() => console.log('✅ Prisma connected to database'))
  .catch((err) => console.error('❌ Prisma connection failed:', err.message));

module.exports = prisma;