import { PrismaClient } from '@prisma/client'

const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Use DIRECT_URL for production if available (bypasses pooler issues)
const databaseUrl = process.env.VERCEL_ENV === 'production' && process.env.DIRECT_URL 
  ? process.env.DIRECT_URL 
  : process.env.DATABASE_URL;

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  },
  log: process.env.VERCEL_ENV === 'production' 
    ? ['error', 'warn', 'info'] // Production'da da info logları göster
    : process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error']
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
