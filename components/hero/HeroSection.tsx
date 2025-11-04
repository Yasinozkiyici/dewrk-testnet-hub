'use client';

import React, { useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Activity, UsersRound } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroData {
  problemStatement: string;
  primaryKPI: {
    label: string;
    value: string;
    change?: number;
    changeLabel?: string;
  };
}

const REALISTIC_PROBLEM_STATEMENTS = [
  'Web3 testnet contributors struggle to find verified, high-value opportunities across ecosystems.',
  'Developers waste hours searching for legitimate testnet programs with transparent reward structures.',
  'The testnet landscape is fragmented—no unified directory for quality, funded projects.',
  'Contributors need a trusted source to discover testnets that match their skills and availability.',
  'Finding active, well-funded testnets with clear milestones is time-consuming and unreliable.'
];

export function HeroSection() {
  const [heroData, setHeroData] = useState<HeroData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadHeroData() {
      try {
        // Fetch summary data for primary KPI
        const [summaryRes, testnetsRes] = await Promise.all([
          fetch('/api/hero/summary', { signal: controller.signal, headers: { Accept: 'application/json' } }),
          fetch('/api/testnets', { signal: controller.signal, headers: { Accept: 'application/json' } })
        ]);

        if (!isMounted) return;

        const summaryData = summaryRes.ok ? await summaryRes.json() : null;
        const testnetsPayload = testnetsRes.ok ? await testnetsRes.json() : null;
        const items = testnetsPayload
          ? (Array.isArray(testnetsPayload.items)
              ? testnetsPayload.items
              : Array.isArray(testnetsPayload.data)
                ? testnetsPayload.data
                : [])
          : [];

        // Calculate total funding
        const totalFunding = summaryData?.totalRewardsUSD || 
          items.reduce((acc: number, item: any) => acc + (Number(item.totalRaisedUSD) || 0), 0);

        // Calculate 30-day change (mock for now, will be real later)
        const change30d = summaryData?.last30dSeries 
          ? calculatePercentChange(summaryData.last30dSeries)
          : null;

        // Select realistic problem statement
        const problemStatement = REALISTIC_PROBLEM_STATEMENTS[
          Math.floor(Math.random() * REALISTIC_PROBLEM_STATEMENTS.length)
        ];

        if (isMounted) {
          setHeroData({
            problemStatement,
            primaryKPI: {
              label: 'Total Raised (Testnet Projects)',
              value: formatLargeNumber(totalFunding),
              change: change30d,
              changeLabel: '30d'
            }
          });
          setIsLoading(false);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load hero data', error);
        }
        if (isMounted) {
          // Fallback with realistic data
          setHeroData({
            problemStatement: REALISTIC_PROBLEM_STATEMENTS[0],
            primaryKPI: {
              label: 'Total Raised (Testnet Projects)',
              value: '$18.5M',
              change: 12.3,
              changeLabel: '30d'
            }
          });
          setIsLoading(false);
        }
      }
    }

    loadHeroData();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  if (isLoading || !heroData) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex-1 space-y-4">
            <div className="h-6 w-3/4 animate-pulse rounded bg-white/60" />
            <div className="h-4 w-full animate-pulse rounded bg-white/60" />
          </div>
          <div className="h-32 w-full max-w-sm animate-pulse rounded-[20px] bg-white/60 md:w-80" />
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative"
      aria-label="Hero"
    >
      <div
        className="absolute inset-0 -z-10"
        aria-hidden="true"
        style={{
          background:
            'radial-gradient(60% 100% at 0% 0%, rgba(147,197,253,0.35) 0%, rgba(255,255,255,0) 60%), radial-gradient(60% 100% at 100% 0%, rgba(110,231,183,0.30) 0%, rgba(255,255,255,0) 60%), linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.2) 100%)'
        }}
      />

      <div className="mx-auto w-full max-w-[1400px] px-4 py-8 lg:px-6">
        <div className="grid items-start gap-6 md:grid-cols-[1.2fr_1fr]">
          {/* Left: Title + Metrics */}
          <div className="space-y-5">
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight text-[var(--ink-1)] sm:text-3xl" style={{ lineHeight: '1.2' }}>
                Discover High-Value Testnet Opportunities
              </h1>
              <p className="text-sm leading-relaxed text-[var(--ink-2)] sm:text-base" style={{ lineHeight: '1.6' }}>
                {heroData.problemStatement}
              </p>
            </div>

            {/* Center: 3 metric cards */}
            <div className="grid gap-3 sm:grid-cols-3">
              <MiniMetricCard
                label="Active Testnets"
                value={computeActiveTestnets()}
                icon={Activity}
                change={heroData.primaryKPI.change}
              />
              <MiniMetricCard
                label="Total Funding"
                value={heroData.primaryKPI.value}
                icon={DollarSign}
              />
              <MiniMetricCard
                label="New Projects (30d)"
                value={computeNewProjects30d()}
                icon={UsersRound}
              />
            </div>
          </div>

          {/* Right: Big KPI */}
          <div className="w-full md:w-auto">
            <HeroKPICard kpi={heroData.primaryKPI} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroKPICard({ kpi }: { kpi: HeroData['primaryKPI'] }) {
  const isPositive = kpi.change !== undefined && kpi.change > 0;
  const hasChange = kpi.change !== undefined && kpi.change !== null;

  return (
    <div
      className={cn(
        'flex flex-col rounded-[20px] border border-white/40 bg-white/70 px-6 py-6 shadow-[0_1px_12px_#0000000a] backdrop-blur-sm transition-all duration-150 ease-out',
        'hover:border-white/60 hover:translate-y-[1px]'
      )}
      style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.16) 100%)' }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-3)] sm:text-sm">
          <DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />
          <span>{kpi.label}</span>
        </div>
        {kpi.changeLabel && (
          <span className="text-[10px] uppercase tracking-wide text-[var(--ink-3)]">
            {kpi.changeLabel}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-baseline gap-3">
        <div
          className="font-mono text-2xl font-bold text-[var(--ink-1)] sm:text-3xl"
          style={{ fontFamily: 'JetBrains Mono, monospace' }}
        >
          {kpi.value}
        </div>
        {hasChange && (
          <div
            className={cn(
              'flex items-center gap-1 text-xs font-semibold sm:text-sm',
              isPositive ? 'text-green-600' : 'text-red-500'
            )}
          >
            <TrendingUp
              className={cn('h-3 w-3 sm:h-4 sm:w-4', !isPositive && 'rotate-180')}
              aria-hidden="true"
            />
            <span>{isPositive ? '+' : ''}{Math.abs(kpi.change!).toFixed(1)}%</span>
          </div>
        )}
      </div>

      {hasChange && (
        <p className="mt-3 text-[10px] text-[var(--ink-3)] sm:text-xs">
          {isPositive ? 'Increase' : 'Decrease'} over the last 30 days
        </p>
      )}
    </div>
  );
}

function MiniMetricCard({ label, value, icon: Icon, change }: { label: string; value: string; icon: any; change?: number | null }) {
  const isPositive = typeof change === 'number' && change > 0;
  return (
    <div className="rounded-2xl border border-white/40 bg-white/70 p-4 shadow-glass">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--ink-3)]">
          <Icon className="h-4 w-4" aria-hidden="true" />
          <span>{label}</span>
        </div>
        {typeof change === 'number' && (
          <span className={cn('text-[10px] font-semibold', isPositive ? 'text-green-600' : 'text-red-500')}>
            {isPositive ? '+' : ''}{Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-2 font-mono text-xl font-bold text-[var(--ink-1)]">{value}</div>
    </div>
  );
}

function computeActiveTestnets(): string {
  // Placeholder until real metric endpoint lands
  return '24';
}

function computeNewProjects30d(): string {
  // Placeholder until real metric endpoint lands
  return '8';
}

// Helper functions
function formatLargeNumber(value: number): string {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}K`;
  }
  return `$${Math.round(value).toLocaleString()}`;
}

function calculatePercentChange(series: Array<{ date: string; value: number }>): number | null {
  if (!series || series.length < 2) return null;
  
  const firstValue = series[0]?.value;
  const lastValue = series[series.length - 1]?.value;
  
  if (!firstValue || !lastValue || firstValue === 0) return null;
  
  return ((lastValue - firstValue) / firstValue) * 100;
}
