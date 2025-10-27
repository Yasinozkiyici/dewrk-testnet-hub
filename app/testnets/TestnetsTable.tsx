'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { TestnetTable } from '@/components/testnets/TestnetTable';
import type { TestnetListRow } from '@/components/testnets/types';

interface TestnetsTableProps {
  testnets: TestnetListRow[];
}

function TestnetsTableContent({ testnets }: TestnetsTableProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get('slug');

  return <TestnetTable rows={testnets} activeSlug={activeSlug} />;
}

export function TestnetsTable({ testnets }: TestnetsTableProps) {
  return (
    <Suspense fallback={<div className="rounded-3xl border border-white/30 bg-white/70 p-8 text-center text-sm text-[var(--ink-3)]">Loading...</div>}>
      <TestnetsTableContent testnets={testnets} />
    </Suspense>
  );
}

export type { TestnetListRow };
