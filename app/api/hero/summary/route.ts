import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMockHeroSummaryResponse } from '@/lib/mock-kpi-data';

// TODO: wire to Supabase + cron later. Currently returns mocked/aggregated data.

export async function GET() {
  try {
    const testnets = await prisma.testnet.findMany({
      select: {
        totalRaisedUSD: true,
        updatedAt: true
      }
    });

    // If no data yet, return mock summary
    const totalRewardsUSD = testnets.reduce((acc, t) => acc + (Number(t.totalRaisedUSD) || 0), 0);

    // Mock last 30 days series (TODO: replace with real time-series data from Supabase)
    const last30dSeries = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: totalRewardsUSD * (0.85 + Math.random() * 0.3)
      };
    });

    if (!testnets.length) {
      const fallback = getMockHeroSummaryResponse();
      return NextResponse.json({
        totalRewardsUSD: 0,
        last30dSeries: last30dSeries.length ? last30dSeries : fallback?.kpis?.funding?.series ?? []
      });
    }

    return NextResponse.json({
      totalRewardsUSD,
      last30dSeries
    });
  } catch (error) {
    // Enhanced error logging with context for Sentry
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorContext = {
      endpoint: '/api/hero/summary',
      method: 'GET',
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    };
    
    console.error('[api/hero/summary] Failed to fetch hero summary', errorContext);
    
    // Fallback to mock summary to keep UI functional
    const fallback = getMockHeroSummaryResponse();
    return NextResponse.json({
      totalRewardsUSD: fallback?.totalReward ?? 0,
      last30dSeries: fallback?.kpis?.funding?.series ?? []
    });
  }
}
