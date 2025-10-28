import Link from 'next/link';
import type { Route } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { TestnetsTable, type TestnetListRow } from './TestnetsTable';
import { Filters } from './Filters';
import { TestnetDrawerPortal } from './TestnetDrawerPortal';
import { TESTNETS_TAG } from '@/lib/cache';
import { cn } from '@/lib/utils';

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

async function fetchTestnets(searchParams: Record<string, string | string[] | undefined>) {
  const baseUrl = getBaseUrl();
  const url = new URL('/api/testnets', baseUrl);

  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string' && value.length) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    next: { tags: [TESTNETS_TAG] },
    cache: 'no-store'
  });

  if (!response.ok) {
    throw new Error('Failed to load testnets');
  }

  return (await response.json()) as TestnetListResponse;
}

export default async function TestnetsPage({
  searchParams
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { data, pagination } = await fetchTestnets(searchParams);

  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-12 lg:px-6">
      <section className="rounded-3xl border border-white/40 bg-white/80 px-6 py-8 shadow-glass">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-wide text-[var(--ink-3)]">Directory</p>
            <h1 className="text-2xl font-semibold text-[var(--ink-1)] sm:text-[28px]">Testnet Programs</h1>
            <p className="mt-3 text-sm text-[var(--ink-2)]">
              Explore live and upcoming testnets with curated metadata on rewards, access requirements,
              and the steps required to get started. Listings are verified weekly by the Dewrk core team.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 text-xs text-[var(--ink-3)]">
            <span>
              Showing <strong className="text-[var(--ink-1)]">{data.length}</strong> of{' '}
              <strong className="text-[var(--ink-1)]">{pagination.total}</strong>
            </span>
            <LinkButton href="/" label="← Back to overview" variant="outline" />
          </div>
        </div>
      </section>

      <Suspense fallback={<div className="text-sm text-[var(--ink-3)]">Loading filters…</div>}>
        <Filters />
      </Suspense>

      <TestnetsTable testnets={data} />
      <TestnetDrawerPortal />
    </div>
  );
}

function LinkButton({ href, label, variant }: { href: string; label: string; variant: 'outline' | 'primary' }) {
  const baseClasses =
    'inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]';
  if (variant === 'primary') {
    return (
      <Link
        href={href as Route}
        className={cn(baseClasses, 'bg-[var(--mint)] text-[var(--ink-1)] shadow-glass hover:bg-[var(--aqua)]')}
      >
        {label}
      </Link>
    );
  }
  return (
    <Link
      href={href as Route}
      className={cn(baseClasses, 'border border-white/40 bg-white/70 text-[var(--ink-2)] hover:border-white/60')}
    >
      {label}
    </Link>
  );
}
