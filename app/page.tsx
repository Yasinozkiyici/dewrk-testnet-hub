import { headers } from 'next/headers';
import { Suspense } from 'react';
import { TestnetsTable, type TestnetListRow } from './testnets/TestnetsTable';
import { TestnetDrawerPortal } from './testnets/TestnetDrawerPortal';
import { HeroSection } from '@/components/hero/HeroSection';
import { FilterChipsBar } from '@/components/filters/FilterChipsBar';

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

async function fetchFeaturedTestnets(searchParams: Record<string, string | string[] | undefined> = {}) {
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

  const response = await fetch(url.toString(), { cache: 'no-store' });
  if (!response.ok) {
    return { data: [], pagination: { total: 0, page: 1, pageSize: 40, totalPages: 0 } } as TestnetListResponse;
  }

  const json = await response.json();
  const items: TestnetListRow[] = Array.isArray(json?.items)
    ? (json.items as TestnetListRow[])
    : (json?.data as TestnetListRow[] | undefined) ?? [];
  
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

export default async function LandingPage({
  searchParams
}: {
  searchParams?: { page?: string; pageSize?: string; [key: string]: string | string[] | undefined };
}) {
  let data: TestnetListRow[] = [];
  let pagination = { total: 0, page: 1, pageSize: 40, totalPages: 0 };

  try {
    const result = await fetchFeaturedTestnets(searchParams || {});
    data = result.data;
    pagination = result.pagination;
  } catch (error) {
    console.error('[page] Failed to fetch testnets', error);
    // Fallback: boş array ile devam et
  }

  return (
    <>
      {/* ROOT CAUSE FIX: Gereksiz wrapper div kaldırıldı.
          Layout zaten flex min-h-screen flex-col yapısını sağlıyor,
          burada tekrar wrapper eklemek gereksiz ve potansiyel scroll sorunları yaratabilir. */}
      <div className="pt-6">
        <HeroSection />
      </div>
      {/* Hero divider & spacing */}
      <div className="mx-auto mt-6 w-full max-w-[1400px] px-4 lg:px-6">
        <div className="border-t border-white/20" />
      </div>

      <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6">
        <Suspense fallback={<div className="h-12" />}>
          <FilterChipsBar />
        </Suspense>

        <section className="py-8">
          <TestnetsTable testnets={data ?? []} pagination={pagination} />
        </section>
      </div>

      <TestnetDrawerPortal />
    </>
  );
}
