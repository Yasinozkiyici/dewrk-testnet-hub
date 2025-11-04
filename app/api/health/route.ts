import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readLatestRefreshLog } from '@/lib/jobs/refresh';
import { safeRevalidateTag } from '@/lib/cache';

const HEALTH_TAG = 'health';

export async function GET() {
  try {
    safeRevalidateTag(HEALTH_TAG);

    const [testnetCount, ecosystemCount, leaderboardUsers, lastTestnet, lastEcosystem, lastLeaderboard, lastCron] = await Promise.all([
      prisma.testnet.count(),
      prisma.ecosystem.count(),
      prisma.leaderboardEntry.count(),
      prisma.testnet.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.ecosystem.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      prisma.leaderboardEntry.findFirst({ orderBy: { updatedAt: 'desc' }, select: { updatedAt: true } }),
      readLatestRefreshLog()
    ]);

    const timestamps = [lastTestnet?.updatedAt, lastEcosystem?.updatedAt, lastLeaderboard?.updatedAt]
      .filter((value): value is Date => value instanceof Date);

    const lastSync = timestamps.length
      ? new Date(Math.max(...timestamps.map((date) => date.getTime()))).toISOString()
      : lastCron?.timestamp ?? null;

    return NextResponse.json({
      ok: true,
      status: 'healthy',
      lastSync,
      testnets: testnetCount,
      ecosystems: ecosystemCount,
      leaderboardUsers,
      lastJobDurationMs: lastCron?.durationMs ?? null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[api/health]', message);
    return NextResponse.json({ ok: false, status: 'error', error: message }, { status: 503 });
  }
}
