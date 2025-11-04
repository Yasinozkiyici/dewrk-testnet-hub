'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, TrendingUp, Users, Award } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';

interface LeaderboardEntry {
  id: string;
  rank: number;
  entityName: string;
  entityImage?: string | null;
  metricValue: number;
  change?: number | null;
  metadata?: any;
}

interface Leaderboard {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  category: string;
  metricType: string;
  period: string;
  entries: LeaderboardEntry[];
}

export function LeaderboardSection() {
  const [leaderboards, setLeaderboards] = useState<Leaderboard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLeaderboards() {
      try {
        const res = await fetch('/api/leaderboards', { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setLeaderboards(data.items || []);
        }
      } catch (error) {
        console.warn('Failed to load leaderboards', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadLeaderboards();
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (leaderboards.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-12 text-center shadow-glass">
          <Trophy className="mx-auto h-12 w-12 text-[var(--ink-3)]" />
          <p className="mt-4 text-sm text-[var(--ink-3)]">No leaderboards available yet</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink-1)]">Leaderboards</h2>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Top performers across testnet contributions, projects, and ecosystems
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {leaderboards.map((leaderboard) => (
          <LeaderboardCard key={leaderboard.id} leaderboard={leaderboard} />
        ))}
      </div>
    </section>
  );
}

function LeaderboardCard({ leaderboard }: { leaderboard: Leaderboard }) {
  const getIcon = () => {
    switch (leaderboard.category) {
      case 'contributors':
        return <Users className="h-5 w-5" />;
      case 'projects':
        return <Award className="h-5 w-5" />;
      case 'ecosystems':
        return <Trophy className="h-5 w-5" />;
      default:
        return <TrendingUp className="h-5 w-5" />;
    }
  };

  const formatMetric = (value: number, type: string) => {
    switch (type) {
      case 'tasks_completed':
        return `${Math.round(value)} tasks`;
      case 'funding':
        return `$${value >= 1000 ? `${(value / 1000).toFixed(1)}K` : Math.round(value)}`;
      case 'testnets_launched':
        return `${Math.round(value)} testnets`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="flex flex-col rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass transition-all duration-150 ease-out hover:border-white/60 hover:translate-y-[1px]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-[var(--ink-1)]">
          {getIcon()}
          <span>{leaderboard.title}</span>
        </div>
        <span className="text-[10px] uppercase tracking-wide text-[var(--ink-3)]">
          {leaderboard.period}
        </span>
      </div>

      {leaderboard.description && (
        <p className="mt-2 text-xs text-[var(--ink-3)]">{leaderboard.description}</p>
      )}

      <div className="mt-4 space-y-2">
        {leaderboard.entries.slice(0, 5).map((entry) => (
          <div
            key={entry.id}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 transition',
              entry.rank <= 3 ? 'bg-white/60' : 'bg-white/30'
            )}
          >
            <span
              className={cn(
                'flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold',
                entry.rank === 1
                  ? 'bg-yellow-400 text-yellow-900'
                  : entry.rank === 2
                    ? 'bg-gray-300 text-gray-700'
                    : entry.rank === 3
                      ? 'bg-amber-600 text-amber-100'
                      : 'bg-white/80 text-[var(--ink-3)]'
              )}
            >
              {entry.rank}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[var(--ink-1)]">
                {entry.entityName}
              </p>
              <p className="text-xs text-[var(--ink-3)]">
                {formatMetric(entry.metricValue, leaderboard.metricType)}
              </p>
            </div>
            {entry.change !== undefined && entry.change !== null && (
              <span
                className={cn(
                  'text-xs font-semibold',
                  entry.change > 0 ? 'text-green-600' : entry.change < 0 ? 'text-red-500' : 'text-[var(--ink-3)]'
                )}
              >
                {entry.change > 0 ? '+' : ''}
                {entry.change.toFixed(1)}%
              </span>
            )}
          </div>
        ))}
      </div>

      {leaderboard.entries.length > 5 && (
        <Link
          href={`/leaderboards/${leaderboard.slug}` as Route}
          className="mt-4 inline-flex items-center justify-center gap-1 rounded-lg border border-white/40 bg-white/70 px-3 py-2 text-xs font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          View full leaderboard
        </Link>
      )}
    </div>
  );
}

