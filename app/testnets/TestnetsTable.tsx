'use client';

import { useSearchParams } from 'next/navigation';
import { TestnetTable } from '@/components/testnets/TestnetTable';
import type { TestnetListRow } from '@/components/testnets/types';

interface TestnetsTableProps {
  testnets: TestnetListRow[];
}

export function TestnetsTable({ testnets }: TestnetsTableProps) {
  const searchParams = useSearchParams();
  const activeSlug = searchParams.get('slug');

  return <TestnetTable rows={testnets} activeSlug={activeSlug} />;
}

export type { TestnetListRow };
