'use client';

import React from 'react';
import type { TestnetListRow } from './types';
import { Eye } from 'lucide-react';
import { STATUS_VARIANTS, cn } from '@/lib/ui';
import { formatUSD } from '@/lib/format';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ProjectLogo } from '@/components/testnets/ProjectLogo';

interface TestnetGridProps {
  rows: TestnetListRow[];
}

export function TestnetGrid({ rows }: TestnetGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpen = (row: TestnetListRow) => {
    const params = new URLSearchParams(searchParams);
    params.set('slug', row.slug);
    router.replace(`${pathname ?? '/testnets'}?${params.toString()}`);
  };

  return (
    <div className="w-full">
      {/* Header row */}
      <div className="grid grid-cols-[2.4fr_1fr_1fr_1fr_auto] items-center border-b border-white/20 pb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">
        <span>Project</span>
        <span>Status</span>
        <span>Reward</span>
        <span>Total Raised</span>
        <span aria-hidden="true" />
      </div>

      {/* Data rows */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px] divide-y divide-white/10">
          {rows.map((t) => {
            const funding = formatUSD(t.totalRaisedUSD);
            return (
              <div
                key={t.slug}
                className="grid grid-cols-[2.4fr_1fr_1fr_1fr_auto] items-center gap-2 py-3 transition-all duration-150 hover:bg-white/50 hover:shadow-[0_8px_16px_-12px_rgba(15,23,42,0.45)]"
                onClick={() => handleOpen(t)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleOpen(t);
                  }
                }}
              >
                <div className="flex min-w-0 items-center gap-4">
                  <ProjectLogo
                    name={t.name}
                    slug={t.slug}
                    logoUrl={t.logoUrl}
                    websiteUrl={t.websiteUrl}
                    githubUrl={t.githubUrl}
                    size={42}
                    roundedClassName="rounded-2xl"
                  />
                  <div className="min-w-0 leading-tight">
                    <p className="truncate text-sm font-semibold text-[var(--ink-1)]">{t.name}</p>
                    <p className="truncate text-xs text-[var(--ink-3)]">{t.network ?? '—'}</p>
                  </div>
                </div>

                <div>
                  <span className={cn(STATUS_VARIANTS[t.status ?? 'UPCOMING'] ?? STATUS_VARIANTS.UPCOMING)}>
                    {t.status ?? 'UPCOMING'}
                  </span>
                </div>

                <div className="truncate text-sm text-[var(--ink-2)]">
                  {t.rewardNote || t.rewardType || '—'}
                </div>

                <div className="text-sm text-[var(--ink-1)]">
                  {funding.isEmpty ? '—' : funding.display}
                </div>

                <div className="hidden justify-end md:flex" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/60 bg-white/80 text-[var(--ink-2)] transition hover:border-white hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                    aria-label={`Open ${t.name}`}
                    onClick={() => handleOpen(t)}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
