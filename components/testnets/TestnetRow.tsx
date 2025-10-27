'use client';

import { memo, useMemo } from 'react';
import { ExternalLink, Shield, ShieldCheck, Wallet } from 'lucide-react';
import { formatTimeMinutes, formatUpdatedAt, formatUSD, safeUrl } from '@/lib/format';
import { DIFFICULTY_VARIANTS, NA_CHIP_CLASS, STATUS_VARIANTS, TAG_CHIP_CLASS, cn } from '@/lib/ui';
import type { TestnetListRow } from './types';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { ProjectLogo } from './ProjectLogo';

interface TestnetRowProps {
  testnet: TestnetListRow;
  onActivate: () => void;
  isActive?: boolean;
}

const EMPTY_CHIP = <span className={NA_CHIP_CLASS}>N/A</span>;

export const TestnetRow = memo(function TestnetRow({ testnet, onActivate, isActive }: TestnetRowProps) {
  const funding = formatUSD(testnet.totalRaisedUSD);
  const updated = formatUpdatedAt(testnet.updatedAt ?? undefined);
  const estTime = formatTimeMinutes(testnet.estTimeMinutes ?? undefined);
  const tags = Array.isArray(testnet.tags) ? testnet.tags.filter(Boolean) : [];
  const tasksCount = typeof testnet.tasksCount === 'number' ? testnet.tasksCount : 0;
  const status = testnet.status ?? 'UPCOMING';
  const difficulty = testnet.difficulty ?? 'MEDIUM';
  const kycRequired = Boolean(testnet.kycRequired);
  const requiresWallet = Boolean(testnet.requiresWallet);
  const networkLabel = testnet.network ?? '—';

  const dashboardUrl = safeUrl(testnet.dashboardUrl);

  return (
    <tr
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onActivate();
        }
      }}
      className={cn(
        'group h-[56px] cursor-pointer align-middle transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)] focus-visible:ring-offset-0',
        isActive ? 'bg-[var(--mint)]/10 ring-1 ring-[var(--mint)]/40' : 'hover:bg-white/70'
      )}
      data-state={isActive ? 'active' : 'inactive'}
      aria-label={`${testnet.name} on ${networkLabel}`}
    >
      <td className="px-3 py-3">
        <span className="sr-only">{`Open details for ${testnet.name}`}</span>
        <div className="flex items-center gap-3">
          <ProjectLogo
            name={testnet.name}
            slug={testnet.slug}
            logoUrl={testnet.logoUrl}
            websiteUrl={testnet.websiteUrl}
            githubUrl={testnet.githubUrl}
            size={32}
            roundedClassName="rounded-lg"
          />
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm font-semibold text-[var(--ink-1)]">{testnet.name}</span>
            <span className="truncate text-xs text-[var(--ink-3)]">{networkLabel}</span>
          </div>
        </div>
      </td>

      <td className="px-3 py-3">
        <span className={STATUS_VARIANTS[status] ?? STATUS_VARIANTS.UPCOMING}>{status}</span>
      </td>

      <td className="px-3 py-3">
        <span className={DIFFICULTY_VARIANTS[difficulty] ?? DIFFICULTY_VARIANTS.MEDIUM}>
          {difficulty}
        </span>
      </td>

      <td className="px-3 py-3">
        {estTime === 'N/A' ? <span className="text-xs text-[var(--ink-3)]">—</span> : <span className="text-sm text-[var(--ink-2)]">{estTime}</span>}
      </td>

      <td className="px-3 py-3">
        {testnet.rewardType ? (
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-[var(--ink-1)]">{testnet.rewardType}</span>
            {testnet.rewardNote && (
              <span className="line-clamp-1 text-xs text-[var(--ink-3)]">{testnet.rewardNote}</span>
            )}
          </div>
        ) : (
          <span className="text-xs text-[var(--ink-3)]">—</span>
        )}
      </td>

      <td className="px-3 py-3 text-center">
        <span className="text-sm font-medium text-[var(--ink-1)]">{tasksCount}</span>
      </td>

      <td className="px-3 py-3">
        {updated.iso ? (
          <time
            dateTime={updated.iso}
            title={updated.iso}
            className="text-xs text-[var(--ink-2)]"
          >
            {updated.relative}
          </time>
        ) : (
          <span className="text-xs text-[var(--ink-3)]">—</span>
        )}
      </td>

      <td className="px-3 py-3 text-right">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onActivate();
          }}
          className="inline-flex items-center gap-1 rounded-lg border border-white/50 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[var(--ink-1)] transition hover:border-white/70 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          View
        </button>
      </td>
    </tr>
  );
});
