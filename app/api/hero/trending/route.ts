import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMockTrendingTestnets } from '@/lib/mock-kpi-data';

// TODO: wire to Supabase + cron later. Currently returns top 3 by updatedAt.

export async function GET() {
  try {
    const testnets = await prisma.testnet.findMany({
      where: {
        status: 'LIVE'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        network: true,
        updatedAt: true,
        tasksCount: true,
        totalRaisedUSD: true
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 3
    });

    if (!testnets.length) {
      return NextResponse.json({ trending: getMockTrendingTestnets(3) });
    }

    const trending = testnets.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logoUrl,
      network: t.network || 'Unknown',
      metric7d: t.tasksCount || 0,
      reward: t.totalRaisedUSD ? `$${Math.round(Number(t.totalRaisedUSD) / 1000)}K` : 'N/A'
    }));

    return NextResponse.json({ trending });
  } catch (error) {
    console.error('[hero/trending]', error);
    return NextResponse.json({ trending: getMockTrendingTestnets(3) });
  }
}

