'use client';

import { useMemo, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { TestnetListRow } from './types';
import { TestnetRow } from './TestnetRow';
import { NA_CHIP_CLASS, cn } from '@/lib/ui';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ProjectLogo } from '@/components/testnets/ProjectLogo';

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
      <div className="rounded-2xl border border-border/30 bg-white/40 backdrop-blur-md shadow-sm overflow-hidden">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-white/60 backdrop-blur-sm">
            <tr className="text-xs uppercase text-muted-foreground tracking-wide">
              <th className="px-5 py-3 text-left font-medium">Project</th>
              <th className="px-5 py-3 text-left font-medium">Status</th>
              <th className="px-5 py-3 text-left font-medium">Reward</th>
              <th className="px-5 py-3 text-right font-medium">Total Raised</th>
            </tr>
          </thead>
          <tbody>
            {data.map((t) => (
              <tr
                key={t.slug}
                onClick={() => handleActivate(t)}
                className={cn(
                  'cursor-pointer transition-all hover:bg-white/70',
                  activeSlug === t.slug ? 'bg-white/60' : ''
                )}
              >
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <ProjectLogo
                      name={t.name}
                      slug={t.slug}
                      logoUrl={t.logoUrl}
                      websiteUrl={t.websiteUrl}
                      githubUrl={t.githubUrl}
                      size={38}
                      roundedClassName="rounded-md"
                    />
                    <div>
                      <p className="font-medium text-[15px] leading-tight">{t.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.network}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span
                    className={cn(
                      'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                      t.status === 'LIVE' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    )}
                  >
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{t.rewardType ?? 'Points'}</td>
                <td className="px-5 py-4 text-right font-semibold">
                  ${typeof t.totalRaisedUSD === 'number'
                    ? t.totalRaisedUSD.toLocaleString()
                    : Number(t.totalRaisedUSD ?? 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {isPending && (
          <div className="border-t border-white/40 bg-white/60 px-4 py-3 text-right">
            <span className={cn(NA_CHIP_CLASS, 'inline-flex items-center gap-1 bg-white/80 text-[var(--ink-2)]')}>Updating…</span>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
