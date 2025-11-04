import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const METRICS_TAG = 'metrics';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await revalidateTag(METRICS_TAG);

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [activeTestnets, totalFunding, newProjects, leaderboardUsers] = await Promise.all([
      prisma.testnet.count({ where: { status: 'LIVE' } }),
      prisma.testnet.aggregate({ _sum: { totalRaisedUSD: true } }),
      prisma.testnet.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.leaderboardEntry.count()
    ]);

    return NextResponse.json({
      activeTestnets,
      totalFundingUSD: Number(totalFunding._sum.totalRaisedUSD ?? 0),
      newProjects30d: newProjects,
      leaderboardUsers,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/metrics]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
