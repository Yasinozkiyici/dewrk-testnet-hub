import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TESTNETS_TAG, testnetTag } from '@/lib/cache';
import { TestnetDetail } from '@/components/testnets/TestnetDetail';
import { normalizeTestnetDetail } from '@/components/testnets/normalize';
import type { TestnetDetailRecord } from '@/components/testnets/types';

function getBaseUrl() {
  const headersList = headers();
  const protocol = headersList.get('x-forwarded-proto') ?? 'https';
  const host = headersList.get('host');
  if (host) {
    return `${protocol}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4000';
}

async function fetchTestnet(slug: string): Promise<TestnetDetailRecord | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/testnets/${slug}`, {
    next: { tags: [TESTNETS_TAG, testnetTag(slug)] }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to load testnet');
  }

  const data = await response.json();
  return normalizeTestnetDetail(data);
}

export default async function TestnetDetailPage({ params }: { params: { slug: string } }) {
  const result = await fetchTestnet(params.slug);
  if (!result) {
    notFound();
  }
  const detail = result;

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-4 py-14 lg:px-6">
      <Link
        href="/testnets"
        className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-[var(--ink-2)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>
      <TestnetDetail testnet={detail} variant="page" />
    </div>
  );
}
