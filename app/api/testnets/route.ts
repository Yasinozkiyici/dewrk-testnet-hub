import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TESTNETS_TAG, testnetTag, safeRevalidateTag } from '@/lib/cache';
import { getMockProjectCardKPIs } from '@/lib/mock-kpi-data';

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

export async function GET(request: Request) {
  try {
    safeRevalidateTag(TESTNETS_TAG);

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1'));
    const pageSizeParam = searchParams.get('pageSize');
    const pageSize = Math.min(
      200,
      Math.max(1, pageSizeParam ? Number.parseInt(pageSizeParam) : 40)
    );
    const skip = (page - 1) * pageSize;

    const [testnets, total] = await Promise.all([
      prisma.testnet.findMany({
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.testnet.count()
    ]);

    if (!testnets.length) {
      const fallback = getMockProjectCardKPIs(pageSize);
      return NextResponse.json({
        items: fallback,
        pagination: {
          total: 0,
          page,
          pageSize,
          totalPages: 0
        },
        timestamp: new Date().toISOString(),
        source: 'mock'
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
    console.error('[api/testnets] Failed to load testnets', message);
    return NextResponse.json(
      {
        items: getMockProjectCardKPIs(6),
        source: 'mock',
        error: message
      },
      { status: 500 }
    );
  }
}
