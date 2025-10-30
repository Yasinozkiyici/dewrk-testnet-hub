'use client';

import { Zap, TrendingUp, Users, Clock } from 'lucide-react';

interface HeroProps {
  stats: {
    total: number;
    live: number;
    beta: number;
    avgTime: number;
  };
}

export function Hero({ stats }: HeroProps) {
  return (
    <div className="border-b border-white/30 bg-gradient-to-b from-white to-white/95">
      <div className="mx-auto max-w-[1280px] px-6 py-6 sm:py-8">
        {/* Hero Content */}
        <div className="mb-6">
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-[var(--ink-1)] sm:text-3xl">
            Discover Web3 Testnets
          </h1>
          <p className="text-sm text-[var(--ink-2)] sm:text-base">
            Find opportunities, earn rewards, and contribute to the decentralized future.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="group relative overflow-hidden rounded-lg border border-white/40 bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-[var(--mint)]/40 hover:shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--mint)]/0 to-[var(--aqua)]/0 transition-all group-hover:from-[var(--mint)]/5 group-hover:to-[var(--aqua)]/5" />
            <div className="relative">
              <div className="mb-2 inline-flex rounded-md bg-[var(--mint)]/10 p-1.5">
                <Zap className="h-4 w-4 text-[var(--mint)]" />
              </div>
              <div className="text-xl font-bold text-[var(--ink-1)]">{stats.total}</div>
              <div className="mt-0.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wide">Total</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-white/40 bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-emerald-300/40 hover:shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/0 to-emerald-200/0 transition-all group-hover:from-emerald-100/20 group-hover:to-emerald-200/10" />
            <div className="relative">
              <div className="mb-2 inline-flex rounded-md bg-emerald-100 p-1.5">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="text-xl font-bold text-emerald-600">{stats.live}</div>
              <div className="mt-0.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wide">Live</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-white/40 bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-blue-300/40 hover:shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/0 to-blue-200/0 transition-all group-hover:from-blue-100/20 group-hover:to-blue-200/10" />
            <div className="relative">
              <div className="mb-2 inline-flex rounded-md bg-blue-100 p-1.5">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="text-xl font-bold text-blue-600">{stats.beta}</div>
              <div className="mt-0.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wide">Beta</div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-lg border border-white/40 bg-white/80 p-4 backdrop-blur-sm transition-all hover:border-amber-300/40 hover:shadow-sm">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100/0 to-amber-200/0 transition-all group-hover:from-amber-100/20 group-hover:to-amber-200/10" />
            <div className="relative">
              <div className="mb-2 inline-flex rounded-md bg-amber-100 p-1.5">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div className="text-xl font-bold text-[var(--ink-1)]">{stats.avgTime}m</div>
              <div className="mt-0.5 text-xs font-medium text-[var(--text-3)] uppercase tracking-wide">Avg Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

