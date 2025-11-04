import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TESTNETS_TAG, testnetTag, safeRevalidateTag } from '@/lib/cache';
import { getMockProjectCardKPIs } from '@/lib/mock-kpi-data';

export const dynamic = 'force-dynamic';

function mapTestnetForList(testnet: Awaited<ReturnType<typeof prisma.testnet.findFirst>>) {
  if (!testnet) return null;
  const discordRoles = Array.isArray(testnet.discordRoles as any) ? (testnet.discordRoles as any[]) : [];

  return {
    id: testnet.id,
    name: testnet.name,
    slug: testnet.slug,
    network: testnet.network,
    status: testnet.status,
    difficulty: testnet.difficulty,
    shortDescription: testnet.shortDescription,
    logoUrl: testnet.logoUrl,
    estTimeMinutes: testnet.estTimeMinutes,
    rewardType: testnet.rewardType,
    rewardNote: testnet.rewardNote,
    kycRequired: testnet.kycRequired,
    requiresWallet: testnet.requiresWallet,
    tags: (testnet.tags as any) ?? [],
    tasksCount: testnet.tasksCount,
    updatedAt: testnet.updatedAt?.toISOString?.() ?? null,
    hasDashboard: testnet.hasDashboard,
    totalRaisedUSD: testnet.totalRaisedUSD ?? null,
    dashboardUrl: testnet.dashboardUrl,
    websiteUrl: testnet.websiteUrl,
    githubUrl: testnet.githubUrl,
    twitterUrl: testnet.twitterUrl,
    discordUrl: testnet.discordUrl,
    startDate: testnet.startDate ? testnet.startDate.toISOString() : null,
    hasFaucet: testnet.hasFaucet ?? false,
    rewardCategory: testnet.rewardCategory ?? null,
    rewardRangeUSD: testnet.rewardRangeUSD ? Number(testnet.rewardRangeUSD) : null,
    discordRolesCount: discordRoles.length
  };
}

function mapMockDataToTestnetListRow(mock: ReturnType<typeof getMockProjectCardKPIs>[0]): any {
  return {
    id: mock.id,
    name: mock.name,
    slug: mock.slug,
    network: mock.lead.network || 'Unknown',
    status: typeof mock.status === 'object' ? mock.status.current : mock.status,
    difficulty: 'MEDIUM',
    shortDescription: null,
    logoUrl: null,
    estTimeMinutes: mock.deadline.estimatedTimeMinutes,
    rewardType: null,
    rewardNote: null,
    kycRequired: false,
    requiresWallet: true,
    tags: mock.techStack.tags || [],
    tasksCount: 0,
    updatedAt: new Date().toISOString(),
    hasDashboard: false,
    totalRaisedUSD: mock.funding.totalRaisedUSD,
    dashboardUrl: null,
    websiteUrl: null,
    githubUrl: null,
    twitterUrl: null,
    discordUrl: null,
    startDate: null,
    hasFaucet: false,
    rewardCategory: null,
    rewardRangeUSD: null,
    discordRolesCount: 0
  };
}

export async function GET(request: Request) {
  try {
    // Prisma bağlantı kontrolü
    const dbUrl = process.env.DATABASE_URL;
    const directUrl = process.env.DIRECT_URL;
    
    console.log('[api/testnets] Environment check:', {
      hasDatabaseUrl: !!dbUrl,
      databaseUrlPrefix: dbUrl ? dbUrl.substring(0, 50) + '...' : 'MISSING',
      hasDirectUrl: !!directUrl,
      directUrlPrefix: directUrl ? directUrl.substring(0, 50) + '...' : 'MISSING'
    });

    if (!dbUrl) {
      console.error('[api/testnets] DATABASE_URL is not set');
      const fallback = getMockProjectCardKPIs(40);
      return NextResponse.json({
        items: fallback.map(mapMockDataToTestnetListRow),
        pagination: {
          total: 0,
          page: 1,
          pageSize: 40,
          totalPages: 0
        },
        timestamp: new Date().toISOString(),
        source: 'mock',
        error: 'DATABASE_URL not configured'
      }, { status: 500 });
    }

    safeRevalidateTag(TESTNETS_TAG);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1'));
    const pageSizeParam = searchParams.get('pageSize');
    const pageSize = Math.min(
      200,
      Math.max(1, pageSizeParam ? Number.parseInt(pageSizeParam) : 40)
    );
    const skip = (page - 1) * pageSize;

    let testnets: any[] = [];
    let total = 0;

    try {
      // Test connection first
      const connectionTest = await prisma.$queryRaw`SELECT 1 as test`.catch(() => null);
      console.log('[api/testnets] Connection test:', connectionTest ? 'OK' : 'FAILED');
      
      // Try count first
      const countResult = await prisma.testnet.count().catch((err) => {
        console.error('[api/testnets] Count query failed:', err instanceof Error ? err.message : String(err));
        return 0;
      });
      console.log(`[api/testnets] Count result: ${countResult}`);
      
      if (countResult === 0) {
        console.warn('[api/testnets] Count is 0, checking if table exists...');
        const tableCheck = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "Testnet"`.catch((err) => {
          console.error('[api/testnets] Raw table check failed:', err instanceof Error ? err.message : String(err));
          return [{ count: 0 }];
        });
        console.log('[api/testnets] Raw table check:', tableCheck);
      }
      
      [testnets, total] = await Promise.all([
        prisma.testnet.findMany({
          orderBy: { updatedAt: 'desc' },
          skip,
          take: pageSize
        }).catch((err) => {
          console.error('[api/testnets] FindMany query failed:', err instanceof Error ? err.message : String(err));
          return [];
        }),
        Promise.resolve(countResult)
      ]);
      console.log(`[api/testnets] Found ${testnets.length} testnets from database, total: ${total}`);
    } catch (dbError) {
      console.error('[api/testnets] Database query failed:', dbError);
      console.error('[api/testnets] Error details:', {
        message: dbError instanceof Error ? dbError.message : String(dbError),
        stack: dbError instanceof Error ? dbError.stack : undefined,
        name: dbError instanceof Error ? dbError.name : undefined
      });
      const fallback = getMockProjectCardKPIs(pageSize);
      return NextResponse.json({
        items: fallback.map(mapMockDataToTestnetListRow),
        pagination: {
          total: 0,
          page,
          pageSize,
          totalPages: 0
        },
        timestamp: new Date().toISOString(),
        source: 'mock',
        error: dbError instanceof Error ? dbError.message : 'Database query failed'
      }, { status: 500 });
    }

    if (!testnets.length) {
      console.warn('[api/testnets] No testnets found in database, using mock data');
      const fallback = getMockProjectCardKPIs(pageSize);
      return NextResponse.json({
        items: fallback.map(mapMockDataToTestnetListRow),
        pagination: {
          total: 0,
          page,
          pageSize,
          totalPages: 0
        },
        timestamp: new Date().toISOString(),
        source: 'mock',
        warning: 'No testnets found in database'
      });
    }

    const mapped = testnets
      .map(mapTestnetForList)
      .filter((item): item is NonNullable<typeof item> => Boolean(item));

    for (const item of mapped) {
      safeRevalidateTag(testnetTag(item.slug));
    }

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json({
      items: mapped,
      pagination: {
        total,
        page,
        pageSize,
        totalPages
      },
      timestamp: new Date().toISOString(),
      source: 'prisma'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error('[api/testnets] Failed to load testnets', message, stack);
    const fallback = getMockProjectCardKPIs(6);
    return NextResponse.json(
      {
        items: fallback.map(mapMockDataToTestnetListRow),
        source: 'mock',
        error: message
      },
      { status: 500 }
    );
  }
}
