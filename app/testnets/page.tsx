import { headers } from 'next/headers';
import Link from 'next/link';
import { TestnetsTable, type TestnetListRow } from './TestnetsTable';
import { TestnetDrawerPortal } from './TestnetDrawerPortal';
import { TESTNETS_TAG } from '@/lib/cache';
import { CompactFilterBar } from './CompactFilterBar';
import NewsletterForm from '@/components/newsletter-form';
import HeroStats from '@/components/HeroStats';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface TestnetListResponse {
  data: TestnetListRow[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

function getBaseUrl() {
  const headersList = headers();
  const forwardedProto = headersList.get('x-forwarded-proto');
  const host = headersList.get('host');
  if (host) {
    return `${forwardedProto ?? 'https'}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4000';
}

type InsightHighlight = {
  topCategory: string | null;
  emergingProjects: Array<{ name: string; category?: string | null; summary?: string | null; slug?: string; sourceUrl?: string | null }>;
  forYou: Array<{ name: string; slug: string; reason: string }>;
};

async function fetchTestnets(searchParams: Record<string, string | string[] | undefined>) {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/testnets', baseUrl);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length) {
      url.searchParams.set(key, value);
    }
  });

  if (!url.searchParams.has('pageSize')) {
    url.searchParams.set('pageSize', '40');
  }

  const response = await fetch(url.toString(), {
    next: { tags: [TESTNETS_TAG] },
    cache: 'no-store'
  });

  if (!response.ok) {
    // Fallback to empty list so UI remains functional in smoke tests
    return { data: [], pagination: { total: 0, page: 1, pageSize: 0, totalPages: 0 } } as TestnetListResponse;
  }

  const json = await response.json();
  // Support both legacy { data, pagination } and current { items }
  const items: TestnetListRow[] = Array.isArray(json?.items)
    ? (json.items as TestnetListRow[])
    : (json?.data as TestnetListRow[] | undefined) ?? [];
  
  // Pagination bilgisini her zaman oluştur
  const paginationData = json?.pagination || {
    total: items.length,
    page: 1,
    pageSize: items.length,
    totalPages: 1
  };
  
  return {
    data: items,
    pagination: paginationData
  } as TestnetListResponse;
}

async function fetchInsightsHighlights(): Promise<InsightHighlight | null> {
  const snapshot = await prisma.insightSnapshot.findFirst({ orderBy: { createdAt: 'desc' } });
  if (!snapshot) return null;
  return {
    topCategory: snapshot.topCategory ?? null,
    emergingProjects: Array.isArray(snapshot.emergingProjects) ? snapshot.emergingProjects : [],
    forYou: Array.isArray(snapshot.forYou) ? snapshot.forYou : []
  };
}

export default async function TestnetsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { data, pagination } = await fetchTestnets(searchParams);
  const insights = await fetchInsightsHighlights();
  const forYou = Array.isArray(insights?.forYou) ? insights!.forYou : [];
  const emerging = Array.isArray(insights?.emergingProjects) ? insights!.emergingProjects : [];

  return (
    <div className="w-full">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-10 pb-8">
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight mb-2">
          Discover High-Value Testnet Opportunities
        </h1>
        <p className="text-[13.5px] text-muted-foreground mb-4 max-w-[620px] leading-relaxed">
          Developers need a trusted source to discover testnets that match their skills and availability.
        </p>
        <HeroStats />
      </section>

      {/* STICKY FILTER BAR */}
      <div className="sticky top-[72px] z-30 w-full border-b border-white/20 bg-white/70 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-[1280px] items-center gap-2 px-4 py-2 lg:px-6">
          <CompactFilterBar />
        </div>
      </div>

      {/* TABLE */}
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 pb-20 lg:px-6 space-y-12">
        {forYou.length > 0 && (
          <section className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-glass">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[var(--ink-1)]">For You</h2>
                <p className="text-xs text-[var(--ink-3)]">Personalised suggestions based on recent community activity.</p>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {forYou.slice(0, 6).map((item) => {
                const match = data?.find((row) => row.slug === item.slug);
                return (
                  <Link
                    key={item.slug}
                    href={`/testnets?slug=${item.slug}`}
                    className="group flex flex-col justify-between rounded-2xl border border-white/40 bg-white/70 p-4 transition hover:border-white/60"
                  >
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--ink-1)] group-hover:text-[var(--mint)]">{item.name}</h3>
                      <p className="mt-2 text-xs text-[var(--ink-3)]">{item.reason}</p>
                    </div>
                    {match?.network && <p className="mt-4 text-xs text-[var(--ink-2)]">Network: {match.network}</p>}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {(insights?.topCategory || emerging.length) && (
          <section className="rounded-3xl border border-white/30 bg-white/70 p-6 shadow-glass">
            <div className="grid gap-4 md:grid-cols-[1fr_2fr]">
              <div className="rounded-2xl border border-white/40 bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Trending Category</p>
                <p className="mt-2 text-lg font-semibold text-[var(--ink-1)]">{insights?.topCategory ?? '—'}</p>
                <p className="mt-1 text-xs text-[var(--ink-3)]">Based on recent join activity</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Emerging Projects</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {emerging.slice(0, 4).map((item) => (
                    <a
                      key={item.slug ?? item.name}
                      href={item.sourceUrl ?? '#'}
                      target={item.sourceUrl ? '_blank' : undefined}
                      rel={item.sourceUrl ? 'noreferrer' : undefined}
                      className="rounded-2xl border border-white/40 bg-white/70 p-3 text-sm transition hover:border-white/60"
                    >
                      <p className="font-semibold text-[var(--ink-1)]">{item.name}</p>
                      {item.category && <p className="text-xs text-[var(--ink-3)]">{item.category}</p>}
                      {item.summary && <p className="mt-2 text-xs text-[var(--ink-3)] line-clamp-3">{item.summary}</p>}
                    </a>
                  ))}
                  {emerging.length === 0 && <p className="text-xs text-[var(--ink-3)]">AI discovery has not surfaced new projects yet.</p>}
                </div>
              </div>
            </div>
          </section>
        )}

        <TestnetsTable testnets={data ?? []} pagination={pagination} />
        <NewsletterForm />
      </div>

      <TestnetDrawerPortal />
    </div>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [active, sum] = await Promise.all([
      prisma.testnet.count({ where: { status: 'LIVE' as any } }),
      prisma.testnet.aggregate({ _sum: { totalRaisedUSD: true } })
    ]);
    const totalFunding = Number(sum._sum.totalRaisedUSD ?? 0).toLocaleString();
    const title = `Testnets (${active} live) — Dewrk`;
    const description = `Discover high-value testnet opportunities. Total funding: $${totalFunding}.`;
    const url = 'https://dewrk.com/testnets';
    return {
      title,
      description,
      alternates: { canonical: url },
      openGraph: { title, description, url, siteName: 'Dewrk', type: 'website' },
      twitter: { card: 'summary_large_image', title, description }
    };
  } catch {
    return { title: 'Testnets — Dewrk' };
  }
}
