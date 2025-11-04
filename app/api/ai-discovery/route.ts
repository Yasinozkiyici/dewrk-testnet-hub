import slugify from 'slugify';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

type DiscoveryCandidate = {
  name: string;
  description?: string | null;
  network?: string | null;
  website?: string | null;
  sourceUrl?: string | null;
};

const CATEGORY_KEYWORDS: Array<{ category: string; keywords: string[] }> = [
  { category: 'ZK', keywords: ['zk', 'zero-knowledge', 'starknet', 'scroll', 'zksync', 'mina'] },
  { category: 'Layer2', keywords: ['rollup', 'optimism', 'arbitrum', 'op stack', 'layer 2', 'l2'] },
  { category: 'Modular', keywords: ['modular', 'celestia', 'fuel', 'dymension', 'avail'] },
  { category: 'Points', keywords: ['points', 'airdrop', 'campaign', 'quest'] },
  { category: 'Appchain', keywords: ['appchain', 'cosmos', 'parachain', 'substrate'] }
];

function normaliseSlug(name: string) {
  return slugify(name, { lower: true, strict: true });
}

function detectCategory(text: string | undefined | null): string | undefined {
  if (!text) return undefined;
  const lower = text.toLowerCase();
  for (const { category, keywords } of CATEGORY_KEYWORDS) {
    if (keywords.some((keyword) => lower.includes(keyword))) {
      return category;
    }
  }
  return undefined;
}

function summarise(text: string | undefined | null): string | undefined {
  if (!text) return undefined;
  const trimmed = text.trim();
  if (trimmed.length <= 320) return trimmed;
  return `${trimmed.slice(0, 317)}…`;
}

async function fetchMessariProjects(): Promise<DiscoveryCandidate[]> {
  const url = 'https://data.messari.io/api/v2/projects';
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (process.env.MESSARI_API_KEY) {
    headers['x-messari-api-key'] = process.env.MESSARI_API_KEY;
  }

  try {
    const res = await fetch(url, { headers, next: { revalidate: 3600 } });
    if (!res.ok) throw new Error(`Messari responded with ${res.status}`);
    const payload = await res.json();
    const projects: DiscoveryCandidate[] = Array.isArray(payload?.data)
      ? payload.data.slice(0, 100).map((item: any) => ({
          name: item?.name ?? item?.slug ?? 'Unknown Project',
          description: item?.profile?.general?.overview ?? item?.profile?.general?.description ?? item?.description,
          network: item?.profile?.general?.sector ?? item?.profile?.general?.category,
          website: item?.profile?.general?.website ?? item?.profile?.general?.official_links?.[0]?.link,
          sourceUrl: item?.slug ? `https://messari.io/asset/${item.slug}` : undefined
        }))
      : [];
    return projects.filter((project) => project.description && /testnet|devnet|beta/i.test(project.description));
  } catch (error) {
    console.warn('[ai-discovery] Messari fetch failed', error);
    return [];
  }
}

async function fallbackProjects(): Promise<DiscoveryCandidate[]> {
  return [
    {
      name: 'Lyra Testnet',
      description: 'Lyra is building a modular rollup with shared sequencing and is recruiting early builders for its public testnet.',
      network: 'Modular',
      website: 'https://lyra.finance',
      sourceUrl: 'https://blog.lyra.finance/testnet-announcement'
    },
    {
      name: 'Monad Testnet',
      description: 'Monad is an EVM-compatible L1 focused on parallel execution and currently running an incentivised testnet.',
      network: 'Layer1',
      website: 'https://monad.xyz',
      sourceUrl: 'https://monad.xyz/testnet'
    },
    {
      name: 'Dymension RollApp Hub',
      description: 'Dymension enables modular rollapps with high throughput. Their latest devnet invites teams to launch app-chains.',
      network: 'Modular',
      website: 'https://dymension.xyz',
      sourceUrl: 'https://blog.dymension.xyz/devnet'
    }
  ];
}

async function gatherCandidates(): Promise<DiscoveryCandidate[]> {
  const [messari] = await Promise.all([fetchMessariProjects()]);
  const combined = [...messari];
  if (!combined.length) {
    combined.push(...(await fallbackProjects()));
  }
  return combined;
}

export async function runAiDiscovery() {
  const candidates = await gatherCandidates();
  if (!candidates.length) {
    return { added: 0, items: [] as any[] };
  }

  const [existingTestnets, existingDiscoveries] = await Promise.all([
    prisma.testnet.findMany({ select: { slug: true } }),
    prisma.aiDiscovery.findMany({ select: { slug: true } })
  ]);
  const existingSlugs = new Set<string>([...existingTestnets.map((x) => x.slug), ...existingDiscoveries.map((x) => x.slug)]);

  const inserted: Array<{ name: string; slug: string; category?: string; summary?: string; sourceUrl?: string }> = [];

  for (const candidate of candidates.slice(0, 30)) {
    const slug = normaliseSlug(candidate.name);
    if (!slug || existingSlugs.has(slug)) continue;

    const summary = summarise(candidate.description);
    const category = detectCategory(`${candidate.description ?? ''} ${candidate.network ?? ''}`);

    const record = await prisma.aiDiscovery.create({
      data: {
        name: candidate.name,
        slug,
        network: candidate.network ?? null,
        category: category ?? null,
        summary: summary ?? null,
        sourceUrl: candidate.sourceUrl ?? candidate.website ?? null,
        metadata: {
          website: candidate.website ?? null,
          description: candidate.description ?? null
        }
      }
    });

    existingSlugs.add(slug);
    inserted.push({
      name: record.name,
      slug: record.slug,
      category: record.category ?? undefined,
      summary: record.summary ?? undefined,
      sourceUrl: record.sourceUrl ?? undefined
    });
  }

  return { added: inserted.length, items: inserted };
}

export const dynamic = 'force-dynamic';

export async function GET() {
  const discoveries = await prisma.aiDiscovery.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20
  });
  return NextResponse.json({ items: discoveries, timestamp: new Date().toISOString() });
}

export async function POST() {
  const result = await runAiDiscovery();
  return NextResponse.json(result);
}
