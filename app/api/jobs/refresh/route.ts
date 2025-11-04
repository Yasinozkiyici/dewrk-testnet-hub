import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { appendRefreshLog } from '@/lib/jobs/refresh';
import { TESTNETS_TAG, testnetTag } from '@/lib/cache';

const METRICS_TAG = 'metrics';
const LEADERBOARDS_TAG = 'leaderboards';
const HEALTH_TAG = 'health';

const FUNDING_OVERRIDES: Record<string, number> = {
  'scroll-sepolia': 83000000,
  'mantle-sepolia': 3000000000,
  'optimism-sepolia': 178000000,
  'arbitrum-stylus': 120000000,
  'linea-sepolia': 725000000,
  'starknet-goerli': 282000000,
  'zksync-era-testnet': 458000000,
  'base-sepolia': 100000000,
  'fuel-beta-5': 80000000,
  'celestia-mocha': 55000000,
  'sui-testnet': 336000000,
  'aptos-testnet': 400000000,
  'solana-devnet': 3350000000,
  'celo-alfajores': 56000000,
  'fraxtal-holesky': 525000000,
  'polygon-zkevm-cardona': 451000000,
  'blast-sepolia': 20000000
};

const LEADERBOARD_BOOST: Record<string, number> = {
  '0xfueldev': 42,
  optimistic_eve: 28,
  starknet_cairo_pro: 26,
  scroll_builder_xyz: 24,
  mantlepunk: 21,
  basecamp_eth: 18,
  celestia_light: 15,
  fuel_sway_master: 12,
  zk_era_builder: 10,
  fraxtal_maxi: 8,
  sui_mover: 6,
  aptos_architect: 5
};

export const dynamic = 'force-dynamic';

export async function runDataRefresh() {
  const start = Date.now();
  const notes: string[] = [];

  try {
    const testnets = await prisma.testnet.findMany({ select: { id: true, slug: true } });

    await Promise.all(
      testnets.map(async (testnet) => {
        const funding = FUNDING_OVERRIDES[testnet.slug];
        if (typeof funding === 'number') {
          await prisma.testnet.update({
            where: { id: testnet.id },
            data: { totalRaisedUSD: funding }
          });
        }
      })
    );

    const leaderboards = await prisma.leaderboardEntry.findMany({
      select: { id: true, entityId: true, metricValue: true }
    });

    await Promise.all(
      leaderboards.map(async (entry) => {
        const boost = LEADERBOARD_BOOST[entry.entityId];
        if (typeof boost === 'number') {
          await prisma.leaderboardEntry.update({
            where: { id: entry.id },
            data: {
              metricValue: Number(entry.metricValue) + boost,
              change: boost
            }
          });
        }
      })
    );

    await revalidateTag(TESTNETS_TAG);
    await Promise.all(testnets.map((testnet) => revalidateTag(testnetTag(testnet.slug))));
    await revalidateTag(LEADERBOARDS_TAG);
    await revalidateTag(METRICS_TAG);
    await revalidateTag(HEALTH_TAG);

    const durationMs = Date.now() - start;
    await appendRefreshLog({
      timestamp: new Date().toISOString(),
      durationMs,
      testnetsUpdated: testnets.length,
      leaderboardsUpdated: leaderboards.length,
      notes
    });

    return {
      ok: true as const,
      durationMs,
      testnetsUpdated: testnets.length,
      leaderboardsUpdated: leaderboards.length
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    notes.push(message);
    const durationMs = Date.now() - start;
    await appendRefreshLog({
      timestamp: new Date().toISOString(),
      durationMs,
      testnetsUpdated: 0,
      leaderboardsUpdated: 0,
      notes
    });
    console.error('[jobs/refresh]', message);
    return { ok: false as const, error: message, durationMs };
  }
}

export async function POST() {
  const result = await runDataRefresh();
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }
  return NextResponse.json(result);
}
