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
      <div className="flex flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/70 p-16 text-center shadow-glass">
        <div className="rounded-full bg-[var(--mint)]/10 p-6">
          <svg
            className="h-12 w-12 text-[var(--ink-3)]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <p className="mt-6 text-lg font-semibold text-[var(--ink-1)]">No testnets found</p>
        <p className="mt-2 max-w-md text-sm text-[var(--ink-3)]">
          No results match your current filters. Try adjusting your search or clearing some filters.
        </p>
        <button
          onClick={() => {
            if (typeof window !== 'undefined') {
              window.location.href = pathname ?? '/testnets';
            }
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/90 px-5 py-2.5 text-sm font-semibold text-[var(--ink-1)] transition hover:border-[var(--mint)]/40 hover:bg-[var(--mint)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          Reset filters
        </button>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={120} skipDelayDuration={0}>
      <div className="rounded-3xl border border-white/30 bg-white/70 shadow-glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] table-fixed border-collapse text-sm text-[var(--ink-2)]" role="table">
            <caption className="sr-only">Testnet programs directory</caption>
            <colgroup>
              <col className="w-[24%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
              <col className="w-[18%]" />
              <col className="w-[8%]" />
              <col className="w-[10%]" />
              <col className="w-[10%]" />
            </colgroup>
            <thead className="bg-white/80 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-white/80 px-3 py-3 text-left shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                  Name & Network
                </th>
                <th scope="col" className="px-3 py-3 text-left">Status</th>
                <th scope="col" className="px-3 py-3 text-left">Difficulty</th>
                <th scope="col" className="px-3 py-3 text-left">Est. Time</th>
                <th scope="col" className="px-3 py-3 text-left">Reward</th>
                <th scope="col" className="px-3 py-3 text-center">Tasks</th>
                <th scope="col" className="px-3 py-3 text-left">Updated</th>
                <th scope="col" className="sticky right-0 z-10 bg-white/80 px-3 py-3 text-right shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                  Action
                </th>
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
        </div>
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
