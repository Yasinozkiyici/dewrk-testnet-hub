import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

/**
 * Debug endpoint to check Vercel environment variables and database connection
 * GET /api/debug/db
 */
export async function GET() {
  const dbUrl = process.env.DATABASE_URL;
  const directUrl = process.env.DIRECT_URL;
  
  // Mask sensitive parts
  const maskUrl = (url: string | undefined) => {
    if (!url) return 'NOT SET';
    try {
      const parsed = new URL(url);
      const masked = `${parsed.protocol}//${parsed.username}:***@${parsed.hostname}:${parsed.port}${parsed.pathname}${parsed.search}`;
      return masked;
    } catch {
      return url.substring(0, 50) + '...';
    }
  };

  const info = {
    environment: {
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
    },
    database: {
      hasDatabaseUrl: !!dbUrl,
      databaseUrl: maskUrl(dbUrl),
      databaseUrlPort: dbUrl?.includes(':6543') ? '6543 (pooler)' : dbUrl?.includes(':5432') ? '5432 (direct)' : 'unknown',
      hasDirectUrl: !!directUrl,
      directUrl: maskUrl(directUrl),
      directUrlPort: directUrl?.includes(':6543') ? '6543 (pooler)' : directUrl?.includes(':5432') ? '5432 (direct)' : 'unknown',
    },
    connection: {} as any,
    data: {} as any
  };

  try {
    // Test connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as test`.catch(() => null);
    info.connection.test = connectionTest ? 'OK' : 'FAILED';

    // Count records
    const [testnetCount, ecosystemCount, leaderboardCount] = await Promise.all([
      prisma.testnet.count().catch(() => 0),
      prisma.ecosystem.count().catch(() => 0),
      prisma.leaderboard.count().catch(() => 0)
    ]);

    info.data = {
      testnetCount,
      ecosystemCount,
      leaderboardCount
    };

    // Get sample
    if (testnetCount > 0) {
      const sample = await prisma.testnet.findMany({
        take: 3,
        select: {
          slug: true,
          name: true,
          network: true
        }
      }).catch(() => []);
      info.data.sampleTestnets = sample;
    }
  } catch (error) {
    info.connection.error = error instanceof Error ? error.message : String(error);
  }

  return NextResponse.json(info, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}

