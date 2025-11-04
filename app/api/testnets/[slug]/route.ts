import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TESTNETS_TAG, testnetTag, safeRevalidateTag } from '@/lib/cache';

export const dynamic = 'force-dynamic';

function mapTestnetDetail(testnet: NonNullable<Awaited<ReturnType<typeof prisma.testnet.findUnique>>>) {
  return {
    id: testnet.id,
    slug: testnet.slug,
    name: testnet.name,
    network: testnet.network,
    status: testnet.status,
    difficulty: testnet.difficulty,
    shortDescription: testnet.shortDescription,
    description: testnet.description,
    tags: (testnet.tags as any) ?? [],
    categories: (testnet.categories as any) ?? [],
    highlights: (testnet.highlights as any) ?? [],
    prerequisites: (testnet.prerequisites as any) ?? [],
    estTimeMinutes: testnet.estTimeMinutes,
    rewardType: testnet.rewardType,
    rewardNote: testnet.rewardNote,
    rewardRangeUSD: testnet.rewardRangeUSD ? Number(testnet.rewardRangeUSD) : null,
    rewardCategory: testnet.rewardCategory ?? null,
    startDate: testnet.startDate ? testnet.startDate.toISOString() : null,
    hasFaucet: testnet.hasFaucet ?? null,
    kycRequired: testnet.kycRequired,
    requiresWallet: testnet.requiresWallet,
    totalRaisedUSD: testnet.totalRaisedUSD ?? null,
    hasDashboard: testnet.hasDashboard,
    dashboardUrl: testnet.dashboardUrl,
    logoUrl: testnet.logoUrl,
    heroImageUrl: testnet.heroImageUrl,
    tasksCount: testnet.tasksCount,
    updatedAt: testnet.updatedAt?.toISOString?.() ?? null,
    socials: {
      website: testnet.websiteUrl ?? undefined,
      github: testnet.githubUrl ?? undefined,
      twitter: testnet.twitterUrl ?? undefined,
      discord: testnet.discordUrl ?? undefined
    },
    gettingStarted: (() => {
      const value = testnet.gettingStarted as unknown;
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    })(),
    discordRoles: Array.isArray(testnet.discordRoles as any) ? (testnet.discordRoles as any[]) : [],
    tasks: []
  };
}

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { slug } = params;

  try {
    const testnet = await prisma.testnet.findUnique({ where: { slug } });

    if (!testnet) {
      return NextResponse.json({
        error: 'TestnetNotFound',
        timestamp: new Date().toISOString()
      }, { status: 404 });
    }

    safeRevalidateTag(TESTNETS_TAG);
    safeRevalidateTag(testnetTag(slug));

    return NextResponse.json({
      ...mapTestnetDetail(testnet),
      timestamp: new Date().toISOString(),
      source: 'prisma'
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[api/testnets/${slug}]`, message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
