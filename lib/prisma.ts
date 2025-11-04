import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Always use DATABASE_URL (pooler) - it works for both build and runtime
// DIRECT_URL is only used for migrations, not runtime queries
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.VERCEL_ENV === 'production' 
    ? ['error', 'warn', 'info'] // Production'da da info logları göster
    : process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
