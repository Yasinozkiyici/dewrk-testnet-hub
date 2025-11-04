import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMockTopGainers } from '@/lib/mock-kpi-data';

// TODO: wire to Supabase + cron later. Currently returns top 3 by totalRaisedUSD.

export async function GET() {
  try {
    const testnets = await prisma.testnet.findMany({
      where: {
        status: 'LIVE',
        totalRaisedUSD: { not: null }
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        network: true,
        totalRaisedUSD: true,
        estTimeMinutes: true
      },
      orderBy: {
        totalRaisedUSD: 'desc'
      },
      take: 3
    });

    if (!testnets.length) {
      return NextResponse.json({ gainers: getMockTopGainers(3) });
    }

    const gainers = testnets.map((t) => ({
      id: t.id,
      name: t.name,
      slug: t.slug,
      logoUrl: t.logoUrl,
      network: t.network || 'Unknown',
      deltaPct: Math.round(20 + Math.random() * 40),
      rewardIncrease: t.totalRaisedUSD ? `$${Math.round(Number(t.totalRaisedUSD) / 1000)}K` : 'N/A',
      avgTime: t.estTimeMinutes || null
    }));

    return NextResponse.json({ gainers });
  } catch (error) {
    console.error('[hero/gainers]', error);
    return NextResponse.json({ gainers: getMockTopGainers(3) });
  }
}

