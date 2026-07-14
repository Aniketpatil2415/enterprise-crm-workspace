import { PrismaClient } from '@prisma/client';

// Enterprise Singleton Pattern to prevent connection exhaustion during hot-reloads
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'], // Logs only critical issues to keep terminal clean
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;