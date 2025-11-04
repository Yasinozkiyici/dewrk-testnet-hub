import path from 'path';
import { promises as fs } from 'fs';
import { PrismaClient, Difficulty, Status } from '@prisma/client';
import { seedEcosystems } from './ecosystems';
import { seedLeaderboards } from './leaderboard';

const prisma = new PrismaClient();
const TESTNET_DATA_PATH = path.join(process.cwd(), 'seed-output', 'testnets.json');

type RawEntry = {
  name: string;
  slug: string;
  network?: string | null;
  status?: string | null;
  difficulty?: string | null;
  shortDescription?: string | null;
  websiteUrl?: string | null;
  githubUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  dashboardUrl?: string | null;
  hasDashboard?: boolean;
  totalRaisedUSD?: number | null;
  tags?: unknown;
  highlights?: unknown;
  prerequisites?: unknown;
  gettingStarted?: unknown;
  rewardType?: string | null;
  rewardNote?: string | null;
  hasFaucet?: boolean;
  kycRequired?: boolean;
  requiresWallet?: boolean;
  rewardCategory?: string | null;
  rewardRangeUSD?: number | null;
  estTimeMinutes?: number | null;
  discordRoles?: unknown;
  logoUrl?: string | null;
  createdAt?: string | null;
};

const difficultyMap: Record<string, Difficulty> = {
  EASY: Difficulty.EASY,
  MEDIUM: Difficulty.MEDIUM,
  HARD: Difficulty.HARD
};

const statusMap: Record<string, Status> = {
  LIVE: Status.LIVE,
  PAUSED: Status.PAUSED,
  ENDED: Status.ENDED,
  UPCOMING: Status.UPCOMING
};

function normaliseDifficulty(input?: string | null) {
  if (!input) return Difficulty.MEDIUM;
  const key = input.toUpperCase();
  return difficultyMap[key] ?? Difficulty.MEDIUM;
}

function normaliseStatus(input?: string | null) {
  if (!input) return Status.LIVE;
  const key = input.toUpperCase();
  return statusMap[key] ?? Status.LIVE;
}

function toStringArray(value: unknown, fallback: string[] = []) {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean);
  }
  return fallback;
}

async function loadTestnetDataset(): Promise<RawEntry[]> {
  const raw = await fs.readFile(TESTNET_DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw) as RawEntry[];
  return parsed.slice(0, 120);
}

async function transformEntries(): Promise<any[]> {
  const dataset = await loadTestnetDataset();
  const unique = dataset.filter(
    (entry, index, arr) => arr.findIndex((target) => target.slug === entry.slug) === index
  );

  return unique.slice(0, 100).map((entry) => {
    const description =
      (entry.shortDescription ?? '').length > 400
        ? `${entry.shortDescription?.slice(0, 397)}…`
        : entry.shortDescription ?? null;

    return {
      name: entry.name,
      slug: entry.slug,
      network: entry.network ?? 'Multi-chain',
      status: normaliseStatus(entry.status),
      difficulty: normaliseDifficulty(entry.difficulty),
      rewardType: entry.rewardType ?? 'Tokens',
      rewardNote: entry.rewardNote ?? null,
      shortDescription: description,
      websiteUrl: entry.websiteUrl ?? null,
      githubUrl: entry.githubUrl ?? null,
      twitterUrl: entry.twitterUrl ?? null,
      discordUrl: entry.discordUrl ?? null,
      dashboardUrl: entry.dashboardUrl ?? null,
      hasDashboard: Boolean(entry.hasDashboard ?? entry.dashboardUrl),
      totalRaisedUSD: entry.totalRaisedUSD ?? null,
      tags: toStringArray(entry.tags),
      highlights: toStringArray(entry.highlights),
      prerequisites: toStringArray(entry.prerequisites, [
        `Visit ${entry.websiteUrl ?? 'the official site'} for the documentation`,
        'Configure a compatible wallet',
        'Acquire test assets from the community faucet'
      ]),
      gettingStarted: toStringArray(entry.gettingStarted, [
        `Deploy a sample contract on ${entry.name}`,
        'Submit a transaction and monitor it through an explorer',
        'Share feedback in the community channels'
      ]),
      discordRoles: Array.isArray(entry.discordRoles) ? entry.discordRoles : [],
      hasFaucet: entry.hasFaucet ?? false,
      kycRequired: entry.kycRequired ?? false,
      requiresWallet: entry.requiresWallet ?? true,
      rewardCategory: entry.rewardCategory ?? null,
      rewardRangeUSD: entry.rewardRangeUSD ?? null,
      estTimeMinutes: entry.estTimeMinutes ?? 30,
      logoUrl: entry.logoUrl ?? null,
      createdAt: entry.createdAt ? new Date(entry.createdAt) : new Date()
    };
  });
}

async function seedTestnets() {
  const records = await transformEntries();
  console.log(`🌐 Seeding ${records.length} testnets`);
  await prisma.task.deleteMany();
  await prisma.testnet.deleteMany();
  await prisma.testnet.createMany({
    data: records
  });
}

async function main() {
  try {
    await seedTestnets();
    await seedEcosystems(prisma);
    await seedLeaderboards(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Seed failed', error);
  process.exit(1);
});
