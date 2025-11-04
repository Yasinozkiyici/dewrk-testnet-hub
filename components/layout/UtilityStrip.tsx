'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsPillData = {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  srLabel?: string;
};

export function UtilityStrip({ isCompact }: { isCompact?: boolean }) {
  const [stats, setStats] = useState<StatsPillData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadStats() {
      try {
        const response = await fetch('/api/testnets', {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const items = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        if (!isMounted || !items.length) {
          if (isMounted) setIsLoading(false);
          return;
        }

        const total = items.length;
        const live = items.filter((item: any) => 
          String(item.status).toUpperCase() === 'LIVE'
        ).length;
        
        const kycCount = items.filter((item: any) => 
          Boolean(item.kycRequired)
        ).length;
        const kycRate = total > 0 ? Math.round((kycCount / total) * 100) : 0;

        const totalReward = items.reduce((acc: number, item: any) => {
          const reward = Number(item.totalRaisedUSD) || 0;
          return acc + reward;
        }, 0);

        const tasksCount = items.reduce((acc: number, item: any) => {
          return acc + (Number(item.tasksCount) || 0);
        }, 0);

        const networks = new Set(
          items
            .map((item: any) => item.network)
            .filter((n: any) => n && typeof n === 'string')
        ).size;

        const nextStats: StatsPillData[] = [
          {
            label: 'Testnets',
            value: total,
            srLabel: `Total testnets: ${total}`
          },
          {
            label: 'Live',
            value: live,
            change: live > 0 ? Math.round((live / total) * 100) : 0,
            srLabel: `Live testnets: ${live}`
          },
          {
            label: 'Tasks',
            value: tasksCount,
            srLabel: `Total tasks: ${tasksCount}`
          },
          {
            label: 'Reward',
            value: totalReward > 0 ? `$${Math.round(totalReward / 1000)}K` : '$0',
            srLabel: `Total reward: $${totalReward.toLocaleString()}`
          },
          {
            label: 'KYC',
            value: `${kycRate}%`,
            srLabel: `KYC rate: ${kycRate}%`
          },
          {
            label: 'Chains',
            value: networks,
            srLabel: `Unique chains: ${networks}`
          }
        ];

        if (isMounted) {
          setStats(nextStats);
          setIsLoading(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load utility strip stats', error);
        }
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadStats();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (isLoading && stats.length === 0) {
    return (
      <div className="border-b border-white/20 bg-white/60 backdrop-blur-sm">
        <div className="mx-auto flex h-8 w-full max-w-[1400px] items-center justify-between gap-2 px-4 text-[10px]">
          <div className="flex items-center gap-3">
            <div className="h-4 w-16 animate-pulse rounded bg-white/40" />
            <div className="h-4 w-16 animate-pulse rounded bg-white/40" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="border-b border-white/20 backdrop-blur-sm transition-opacity duration-200 ease-out" 
      style={{ 
        opacity: isCompact ? 0.8 : 1,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.047) 0%, rgba(255,255,255,0.104) 100%)'
      }}
    >
      <div className="mx-auto flex h-8 w-full max-w-[1400px] items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {stats.map((stat, index) => (
            <StatsPill key={`${stat.label}-${index}`} {...stat} />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] text-[var(--ink-3)]">
          <span className="hidden sm:inline">Language</span>
          <span className="hidden sm:inline">Theme</span>
          <span className="hidden md:inline">Timezone</span>
        </div>
      </div>
    </div>
  );
}

function StatsPill({ label, value, change, srLabel }: StatsPillData) {
  const hasChange = typeof change === 'number' && !Number.isNaN(change);
  const isPositive = hasChange && change > 0;
  const isNegative = hasChange && change < 0;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded border border-white/30 bg-white/50 px-2 py-0.5 text-[10px] font-medium',
        'text-[var(--ink-2)] transition hover:bg-white/70'
      )}
    >
      <span className="tabular-nums font-semibold text-[var(--ink-1)]" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>{value}</span>
      <span className="uppercase tracking-wide text-[var(--ink-3)]" style={{ fontSize: '11px' }}>{label}</span>
      {hasChange && (
        <span
          className={cn(
            'inline-flex items-center gap-0.5',
            isPositive ? 'text-green-600' : isNegative ? 'text-red-500' : 'text-[var(--ink-3)]'
          )}
          aria-hidden="true"
        >
          {isPositive && <TrendingUp className="h-2.5 w-2.5" />}
          {isNegative && <TrendingDown className="h-2.5 w-2.5" />}
          {!isPositive && !isNegative && <Minus className="h-2.5 w-2.5" />}
          <span className="tabular-nums text-[9px]">{Math.abs(change)}%</span>
        </span>
      )}
      {srLabel && <span className="sr-only">{srLabel}</span>}
    </div>
  );
}

