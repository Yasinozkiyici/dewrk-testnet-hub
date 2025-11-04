'use client';

import React, { memo, useMemo } from 'react';
import { ExternalLink, Users, Droplet, Eye } from 'lucide-react';
import { formatUpdatedAt, formatUSD, safeUrl } from '@/lib/format';
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

// Realistic lead contact options
function getLeadContact(testnet: TestnetListRow): { type: string; value: string; url?: string } | null {
  // Priority: Discord > Twitter > Website > Network
  if (testnet.discordUrl) {
    return {
      type: 'Discord',
      value: 'Join Community',
      url: testnet.discordUrl
    };
  }
  if (testnet.twitterUrl) {
    return {
      type: 'Twitter',
      value: '@' + testnet.twitterUrl.split('/').pop() || 'Follow',
      url: testnet.twitterUrl
    };
  }
  if (testnet.websiteUrl) {
    return {
      type: 'Website',
      value: 'Visit Site',
      url: testnet.websiteUrl
    };
  }
  if (testnet.network) {
    return {
      type: 'Network',
      value: testnet.network
    };
  }
  return null;
}

// Calculate next milestone
function getNextMilestone(testnet: TestnetListRow): { label: string; date?: string } | null {
  const updated = formatUpdatedAt(testnet.updatedAt ?? undefined);
  
  if (!updated.iso) {
    return null;
  }

  const updatedDate = new Date(updated.iso);
  const now = new Date();
  const daysSinceUpdate = Math.floor((now.getTime() - updatedDate.getTime()) / (1000 * 60 * 60 * 24));

  // If updated recently, show next expected update
  if (daysSinceUpdate < 7) {
    const nextUpdate = new Date(updatedDate);
    nextUpdate.setDate(nextUpdate.getDate() + 14); // Typically 2 weeks between updates
    
    return {
      label: 'Next update',
      date: nextUpdate.toISOString().split('T')[0]
    };
  }

  // If stale, show when it was last updated
  if (daysSinceUpdate > 30) {
    return {
      label: 'Last updated',
      date: updatedDate.toISOString().split('T')[0]
    };
  }

  // Active project, show next milestone estimate
  const estTimeMinutes = testnet.estTimeMinutes;
  if (estTimeMinutes) {
    const completionDate = new Date(updatedDate);
    completionDate.setMinutes(completionDate.getMinutes() + estTimeMinutes);
    
    return {
      label: 'Est. completion',
      date: completionDate.toISOString().split('T')[0]
    };
  }

  return {
    label: 'Updated',
    date: updatedDate.toISOString().split('T')[0]
  };
}

export const TestnetRow = memo(function TestnetRow({ testnet, onActivate, isActive }: TestnetRowProps) {
  const funding = formatUSD(testnet.totalRaisedUSD);
  const updated = formatUpdatedAt(testnet.updatedAt ?? undefined);
  const status = testnet.status ?? 'UPCOMING';
  const difficulty = testnet.difficulty ?? 'MEDIUM';
  const networkLabel = testnet.network ?? '—';

  const dashboardUrl = safeUrl(testnet.dashboardUrl);
  const leadContact = useMemo(() => getLeadContact(testnet), [testnet]);
  const nextMilestone = useMemo(() => getNextMilestone(testnet), [testnet]);

  const formattedStart = useMemo(() => {
    if (!testnet.startDate) return null;
    const d = new Date(testnet.startDate);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }, [testnet.startDate]);

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
        'group cursor-pointer align-middle transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mint)] focus-visible:ring-offset-2',
        isActive 
          ? 'bg-[var(--mint)]/10 ring-1 ring-[var(--mint)]/40' 
          : 'hover:bg-muted/40 hover:border-l-4 hover:border-l-[var(--mint)]/30 hover:translate-y-[1px]'
      )}
      data-state={isActive ? 'active' : 'inactive'}
      aria-label={`${testnet.name} on ${networkLabel}`}
    >
      {/* Project Name & Logo */}
      <td className="sticky left-0 z-10 bg-white/70 px-4 py-4 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)] group-hover:bg-white/90">
        <span className="sr-only">{`Open details for ${testnet.name}`}</span>
        <div className="flex items-center gap-3">
          <ProjectLogo
            name={testnet.name}
            slug={testnet.slug}
            logoUrl={testnet.logoUrl}
            websiteUrl={testnet.websiteUrl}
            githubUrl={testnet.githubUrl}
            size={40}
            roundedClassName="rounded-lg"
          />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="truncate text-sm font-semibold text-[var(--ink-1)]">{testnet.name}</span>
            <span className="truncate text-xs text-[var(--ink-3)]">{networkLabel}</span>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={STATUS_VARIANTS[status] ?? STATUS_VARIANTS.UPCOMING}>{status}</span>
      </td>

      {/* Reward */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-xs font-medium text-[var(--ink-1)]">{testnet.rewardType || testnet.rewardCategory || '—'}</span>
          {testnet.rewardCategory && (
            <span className="text-[10px] text-[var(--ink-3)]">{testnet.rewardCategory}</span>
          )}
        </div>
      </td>

      {/* Faucet */}
      <td className="px-4 py-3">
        {testnet.hasFaucet ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/70 px-2 py-0.5 text-xs font-medium text-[var(--ink-2)]">
            <Droplet className="h-3 w-3" aria-hidden="true" /> Faucet
          </span>
        ) : (
          <span className="text-xs text-[var(--ink-3)]">—</span>
        )}
      </td>

      {/* Funding */}
      <td className="px-4 py-3">
        {funding.isEmpty ? <span className="text-xs text-[var(--ink-3)]">—</span> : <span className="text-xs font-medium text-[var(--ink-1)]">{funding.display}</span>}
        {formattedStart && (
          <div className="mt-1 text-[10px] text-[var(--ink-3)]">Start: {formattedStart}</div>
        )}
        {typeof testnet.discordRolesCount === 'number' && testnet.discordRolesCount > 0 && (
          <div className="mt-1 text-[10px] text-[var(--ink-3)]">Discord roles: {testnet.discordRolesCount}</div>
        )}
      </td>

      {/* Actions */}
      <td className="sticky right-0 z-10 bg-white/70 px-4 py-3 text-right shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.06)] group-hover:bg-white/90">
        <div className="flex items-center justify-end gap-2">
          {dashboardUrl && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/70 px-2.5 py-1.5 text-xs font-semibold text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                  aria-label="Open dashboard"
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </TooltipTrigger>
              <TooltipContent>Open Dashboard</TooltipContent>
            </Tooltip>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onActivate();
            }}
            className="inline-flex items-center gap-1 rounded-lg border border-white/50 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--ink-1)] transition hover:border-[var(--mint)]/40 hover:bg-[var(--mint)]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          >
            <Eye className="h-3.5 w-3.5" aria-hidden="true" /> View
          </button>
        </div>
      </td>
    </tr>
  );
});
