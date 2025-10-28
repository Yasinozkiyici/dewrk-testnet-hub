import Link from 'next/link';
import { headers } from 'next/headers';
import { TestnetsTable, type TestnetListRow } from './testnets/TestnetsTable';
import { TestnetDrawerPortal } from './testnets/TestnetDrawerPortal';

export const dynamic = 'force-dynamic';

interface TestnetListResponse {
  data: TestnetListRow[];
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

async function fetchFeaturedTestnets() {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/testnets', baseUrl);
  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Failed to load testnets');
  }
  const payload = (await response.json()) as { items: TestnetListRow[] } | TestnetListResponse;

  if ('items' in payload) {
    return payload.items as TestnetListRow[];
  }

  return payload.data;
}

export default async function LandingPage() {
  const testnets = await fetchFeaturedTestnets();
  
  const stats = {
    total: testnets.length,
    live: testnets.filter((t) => t.status === 'LIVE').length,
    beta: testnets.filter((t) => t.status === 'BETA').length,
    avgTime: Math.round(
      testnets.reduce((acc, t) => acc + (t.estTimeMinutes || 0), 0) / testnets.length
    ),
  };

  return (
    <div className="mx-auto w-full max-w-[1280px] px-6 py-8"
      style={{ '--page-gutter': '24px' } as React.CSSProperties}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-glass">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">Total</div>
          <div className="mt-1 text-2xl font-semibold text-[var(--ink-1)]">{stats.total}</div>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-glass">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">Live</div>
          <div className="mt-1 text-2xl font-semibold text-green-600">{stats.live}</div>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-glass">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">Beta</div>
          <div className="mt-1 text-2xl font-semibold text-blue-600">{stats.beta}</div>
        </div>
        <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-glass">
          <div className="text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">Avg. Time</div>
          <div className="mt-1 text-2xl font-semibold text-[var(--ink-1)]">{stats.avgTime}m</div>
        </div>
      </div>

      {/* Compact Filter Bar */}
      <div className="rounded-2xl border border-white/40 bg-white/60 px-4 py-3 shadow-glass">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            placeholder="Search testnets..."
            className="flex-1 rounded-lg border border-white/40 bg-white/80 px-3 py-2 text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--aqua)]"
          />
          <Link
            href="/testnets"
            className="rounded-lg border border-white/40 bg-white/80 px-4 py-2 text-xs font-semibold text-[var(--ink-1)] transition hover:border-white/60"
          >
            Advanced Filters
          </Link>
        </div>
      </div>

      {/* Testnets Table */}
      <section className="flex flex-col gap-4">
        <TestnetsTable testnets={testnets} />
      </section>

      <TestnetDrawerPortal />
    </div>
  );
}
