import { headers } from 'next/headers';
import { Suspense } from 'react';
import { TestnetsTable, type TestnetListItem } from './TestnetsTable';
import { Filters } from './Filters';
import { TESTNETS_TAG } from '@/lib/cache';

interface TestnetListResponse {
  data: TestnetListItem[];
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
    cache: 'force-cache'
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
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-16">
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-3)]">Directory</p>
          <h1 className="text-3xl font-semibold text-[var(--ink-1)]">Testnet Programs</h1>
        </div>
        <p className="max-w-2xl text-sm text-[var(--ink-2)]">
          Explore live and upcoming testnets with curated metadata on rewards, KYC requirements, funding
          capacity, and the steps required to get started. Listings are verified weekly by the Dewrk core
          team.
        </p>
        <div className="text-xs text-[var(--ink-3)]">
          Showing {data.length} of {pagination.total} entries
        </div>
      </header>
      <Suspense fallback={<div className="text-sm text-[var(--ink-3)]">Loading filters…</div>}>
        <Filters />
      </Suspense>
      <TestnetsTable testnets={data} />
    </div>
  );
}
