import { PrismaClient } from '@prisma/client';


// Prevent multiple instances during dev hot reload
const globalForPrisma = globalThis;


export const prisma = globalForPrisma.prisma ?? new PrismaClient({
log: ['warn', 'error'],
});


if (!globalForPrisma.prisma) globalForPrisma.prisma = prisma;