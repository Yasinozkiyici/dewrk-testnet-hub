import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type InsightPayload = {
  topCategory: string | null;
  emergingProjects: Array<{ name: string; category?: string | null; summary?: string | null; slug?: string; sourceUrl?: string | null }>;
  userCorrelation: Array<{ source: string; related: string[] }>;
  forYou: Array<{ name: string; slug: string; reason: string }>;
  timestamp: string;
};

function getSessionId(payload: any): string | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload.sessionId ?? payload.session_id ?? payload.session ?? null;
}

function getTestnetSlug(payload: any): string | null {
  if (!payload || typeof payload !== 'object') return null;
  return payload.testnetSlug ?? payload.slug ?? payload.testnet ?? null;
}

function deriveCategory(testnet: { categories?: any; tags?: any; network?: string | null }): string | null {
  if (Array.isArray(testnet.categories) && testnet.categories.length) {
    return String(testnet.categories[0]);
  }
  if (Array.isArray(testnet.tags)) {
    const categoryTag = testnet.tags.find((tag: string) => /zk|rollup|modular|points/i.test(tag));
    if (categoryTag) return categoryTag;
  }
  if (typeof testnet.network === 'string') {
    const network = testnet.network.toLowerCase();
    if (network.includes('zk')) return 'ZK';
    if (network.includes('rollup') || network.includes('l2')) return 'Rollup';
  }
  return null;
}

export async function generateInsights(): Promise<InsightPayload> {
  const now = new Date();
  const lookback = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [events, testnets, discoveries] = await Promise.all([
    prisma.userEvent.findMany({
      where: {
        eventName: { in: ['join_testnet', 'read_guide'] },
        createdAt: { gte: lookback }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.testnet.findMany({
      select: { slug: true, name: true, network: true, categories: true, tags: true, totalRaisedUSD: true }
    }),
    prisma.aiDiscovery.findMany({ orderBy: { createdAt: 'desc' }, take: 8 })
  ]);

  const testnetMap = new Map(testnets.map((t) => [t.slug, t]));

  const categoryCounts = new Map<string, number>();
  const joinCounts = new Map<string, number>();
  const sessions = new Map<string, Set<string>>();

  for (const event of events) {
    const payload = event.payload ?? {};
    const slug = getTestnetSlug(payload);
    if (!slug || !testnetMap.has(slug)) continue;

    if (event.eventName === 'join_testnet') {
      joinCounts.set(slug, (joinCounts.get(slug) ?? 0) + 1);
      const category = deriveCategory(testnetMap.get(slug)!);
      if (category) {
        categoryCounts.set(category, (categoryCounts.get(category) ?? 0) + 1);
      }
    }

    const sessionId = getSessionId(payload);
    if (sessionId) {
      if (!sessions.has(sessionId)) {
        sessions.set(sessionId, new Set());
      }
      sessions.get(sessionId)!.add(slug);
    }
  }

  const sortedCategories = Array.from(categoryCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  const correlationsMap = new Map<string, Map<string, number>>();
  sessions.forEach((slugs) => {
    const list = Array.from(slugs);
    for (let i = 0; i < list.length; i += 1) {
      for (let j = 0; j < list.length; j += 1) {
        if (i === j) continue;
        const source = list[i];
        const target = list[j];
        if (!correlationsMap.has(source)) correlationsMap.set(source, new Map());
        const targetMap = correlationsMap.get(source)!;
        targetMap.set(target, (targetMap.get(target) ?? 0) + 1);
      }
    }
  });

  const userCorrelation = Array.from(correlationsMap.entries()).map(([source, targets]) => {
    const sortedTargets = Array.from(targets.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([slug]) => testnetMap.get(slug)?.name ?? slug);
    return {
      source: testnetMap.get(source)?.name ?? source,
      related: sortedTargets
    };
  });

  const topJoins = Array.from(joinCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([slug, count]) => ({ slug, count }));

  const forYou = topJoins.map(({ slug, count }) => ({
    slug,
    name: testnetMap.get(slug)?.name ?? slug,
    reason: `Popular with ${count} recent joins`
  }));

  const finalForYou = forYou.length
    ? forYou
    : discoveries.slice(0, 3).map((item) => ({
        slug: item.slug,
        name: item.name,
        reason: 'Newly surfaced by AI discovery'
      }));

  const emergingProjects = discoveries.slice(0, 5).map((item) => ({
    name: item.name,
    slug: item.slug,
    category: item.category,
    summary: item.summary,
    sourceUrl: item.sourceUrl
  }));

  const payload: InsightPayload = {
    topCategory: sortedCategories[0] ?? null,
    emergingProjects,
    userCorrelation,
    forYou: finalForYou,
    timestamp: now.toISOString()
  };

  await prisma.insightSnapshot.create({
    data: {
      topCategory: payload.topCategory,
      emergingProjects: payload.emergingProjects,
      userCorrelation: payload.userCorrelation,
      forYou: payload.forYou
    }
  });

  return payload;
}

function serialiseSnapshot(snapshot: any): InsightPayload {
  return {
    topCategory: snapshot?.topCategory ?? null,
    emergingProjects: Array.isArray(snapshot?.emergingProjects) ? snapshot.emergingProjects : [],
    userCorrelation: Array.isArray(snapshot?.userCorrelation) ? snapshot.userCorrelation : [],
    forYou: Array.isArray(snapshot?.forYou) ? snapshot.forYou : [],
    timestamp: snapshot?.createdAt ? new Date(snapshot.createdAt).toISOString() : new Date().toISOString()
  };
}

export async function GET() {
  const latest = await prisma.insightSnapshot.findFirst({ orderBy: { createdAt: 'desc' } });
  if (latest) {
    return NextResponse.json(serialiseSnapshot(latest));
  }
  const generated = await generateInsights();
  return NextResponse.json(generated);
}

export async function POST() {
  const payload = await generateInsights();
  return NextResponse.json(payload);
}
