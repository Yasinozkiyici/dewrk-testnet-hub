import type { PrismaClient } from '@prisma/client';

type LeaderboardSeed = {
  slug: string;
  title: string;
  description: string;
  category: string;
  metricType: string;
  period: string;
  displayOrder: number;
  entries: Array<{
    rank: number;
    entityId: string;
    entityName: string;
    metricValue: number;
    change?: number;
    metadata?: Record<string, unknown>;
  }>;
};

const LEADERBOARDS: LeaderboardSeed[] = [
  {
    slug: 'builder-points-all-time',
    title: 'Top Builder Points (All Time)',
    description: 'Verified Dewrk builders ranked by points earned across Galxe, Zealy, and onchain quests.',
    category: 'contributors',
    metricType: 'points',
    period: 'all_time',
    displayOrder: 1,
    entries: [
      { rank: 1, entityId: '0xfueldev', entityName: '0xFuelDev', metricValue: 842, change: 32, metadata: { source: 'Fuel Zealy', tasksCompleted: 31 } },
      { rank: 2, entityId: 'optimistic_eve', entityName: 'Optimistic_Eve', metricValue: 735, change: 18, metadata: { source: 'Optimism Galxe', tasksCompleted: 28 } },
      { rank: 3, entityId: 'starknet_cairo_pro', entityName: 'CairoWizard', metricValue: 702, change: 12, metadata: { source: 'Starknet Stack Overflow', tasksCompleted: 24 } },
      { rank: 4, entityId: 'scroll_builder_xyz', entityName: 'ScrollBuilderXYZ', metricValue: 648, change: 5, metadata: { source: 'Scroll Guild', tasksCompleted: 22 } },
      { rank: 5, entityId: 'mantlepunk', entityName: 'MantlePunk', metricValue: 611, change: 21, metadata: { source: 'Mantle Crew3', tasksCompleted: 19 } },
      { rank: 6, entityId: 'basecamp_eth', entityName: 'BaseCamp', metricValue: 588, change: 15, metadata: { source: 'Base Questbook', tasksCompleted: 17 } },
      { rank: 7, entityId: 'celestia_light', entityName: 'CelestiaLight', metricValue: 563, change: -4, metadata: { source: 'Celestia Guild', tasksCompleted: 18 } },
      { rank: 8, entityId: 'fuel_sway_master', entityName: 'SwayMaster', metricValue: 541, change: 9, metadata: { source: 'Fuel Zealy', tasksCompleted: 16 } },
      { rank: 9, entityId: 'zk_era_builder', entityName: 'EraBuilder', metricValue: 524, change: 6, metadata: { source: 'zkSync Galxe', tasksCompleted: 15 } },
      { rank: 10, entityId: 'fraxtal_maxi', entityName: 'FraxtalMaxi', metricValue: 506, change: 11, metadata: { source: 'Fraxtal Gold', tasksCompleted: 14 } },
      { rank: 11, entityId: 'sui_mover', entityName: 'SuiMover', metricValue: 498, change: 8, metadata: { source: 'Sui Builder House', tasksCompleted: 13 } },
      { rank: 12, entityId: 'aptos_architect', entityName: 'AptosArchitect', metricValue: 487, change: 4, metadata: { source: 'Aptos Crew3', tasksCompleted: 12 } }
    ]
  },
  {
    slug: 'ecosystem-funding',
    title: 'Ecosystem Funding Leaders',
    description: 'Networks with the highest disclosed ecosystem funding committed to testnet programs.',
    category: 'ecosystems',
    metricType: 'funding_usd',
    period: 'all_time',
    displayOrder: 2,
    entries: [
      { rank: 1, entityId: 'solana', entityName: 'Solana', metricValue: 3350000000, metadata: { reference: 'https://solana.com' } },
      { rank: 2, entityId: 'mantle', entityName: 'Mantle', metricValue: 3000000000, metadata: { reference: 'https://mantle.xyz' } },
      { rank: 3, entityId: 'zksync', entityName: 'zkSync', metricValue: 458000000, metadata: { reference: 'https://zksync.io' } },
      { rank: 4, entityId: 'fuel', entityName: 'Fuel', metricValue: 80000000, metadata: { reference: 'https://fuel.network' } },
      { rank: 5, entityId: 'celestia', entityName: 'Celestia', metricValue: 55000000, metadata: { reference: 'https://celestia.org' } }
    ]
  }
];

export async function seedLeaderboards(prisma: PrismaClient) {
  await prisma.leaderboardEntry.deleteMany();
  await prisma.leaderboard.deleteMany();

  for (const leaderboard of LEADERBOARDS) {
    await prisma.leaderboard.create({
      data: {
        slug: leaderboard.slug,
        title: leaderboard.title,
        description: leaderboard.description,
        category: leaderboard.category,
        metricType: leaderboard.metricType,
        period: leaderboard.period,
        displayOrder: leaderboard.displayOrder,
        entries: {
          create: leaderboard.entries.map((entry) => ({
            rank: entry.rank,
            entityId: entry.entityId,
            entityName: entry.entityName,
            metricValue: entry.metricValue,
            change: entry.change,
            metadata: entry.metadata ?? {}
          }))
        }
      }
    });
  }
}

export { LEADERBOARDS };
