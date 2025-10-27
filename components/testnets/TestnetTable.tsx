'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { TestnetListRow } from './types';
import { TestnetRow } from './TestnetRow';
import { NA_CHIP_CLASS, cn } from '@/lib/ui';
import { TooltipProvider } from '@/components/ui/tooltip';

interface TestnetTableProps {
  rows: TestnetListRow[];
  activeSlug?: string | null;
  onSelect?: (testnet: TestnetListRow) => void;
}

export function TestnetTable({ rows, activeSlug, onSelect }: TestnetTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const data = useMemo(() => rows, [rows]);

  const handleActivate = (row: TestnetListRow) => {
    if (onSelect) {
      onSelect(row);
      return;
    }

    const params = new URLSearchParams(searchParams);
    params.set('slug', row.slug);

    startTransition(() => {
      const basePath = pathname ?? '/testnets';
      router.replace(`${basePath}?${params.toString()}` as any, { scroll: false });
    });
  };

  if (!data.length) {
    return (
      <div className="rounded-3xl border border-white/40 bg-white/70 p-10 text-center text-sm text-[var(--ink-3)] shadow-glass">
        <p className="font-medium text-[var(--ink-1)]">No results</p>
        <p className="mt-2 text-[var(--ink-3)]">Adjust filters or try a different search query.</p>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={0}>
      <div className="rounded-3xl border border-white/30 bg-white/70 shadow-glass">
        <table className="w-full table-fixed border-collapse text-sm text-[var(--ink-2)]" role="table">
        <caption className="sr-only">Testnet programs directory</caption>
        <colgroup>
          <col className="w-[30%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[12%]" />
          <col className="w-[14%]" />
          <col className="w-[10%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead className="bg-white/80 text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
          <tr>
            <th scope="col" className="px-4 py-3 text-left">Name</th>
            <th scope="col" className="px-4 py-3 text-left">Status</th>
            <th scope="col" className="px-4 py-3 text-left">Difficulty</th>
            <th scope="col" className="px-4 py-3 text-left">Est. Time</th>
            <th scope="col" className="px-4 py-3 text-left">Reward</th>
            <th scope="col" className="px-4 py-3 text-left">Tasks</th>
            <th scope="col" className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/40">
          {data.map((row) => (
            <TestnetRow
              key={row.id}
              testnet={row}
              isActive={activeSlug === row.slug}
              onActivate={() => handleActivate(row)}
            />
          ))}
        </tbody>
      </table>
        {isPending && (
          <div className="border-t border-white/40 bg-white/60 px-4 py-3 text-right">
            <span className={cn(NA_CHIP_CLASS, 'inline-flex items-center gap-1 bg-white/80 text-[var(--ink-2)]')}>
              Updating…
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
