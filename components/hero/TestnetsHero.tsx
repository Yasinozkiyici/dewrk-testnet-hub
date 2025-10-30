'use client';

import Link from 'next/link';
import { TrendingUp, ChevronRight, ArrowUp, ArrowDown } from 'lucide-react';

interface TestnetsHeroProps {
  totalRewardsUSD: number;
  trendingTestnets: Array<{ id: string; name: string; logoUrl?: string; network: string; metric7d: string }>;
  topGainers: Array<{ id: string; name: string; logoUrl?: string; network: string; deltaPct: number }>;
}

export function TestnetsHero({ totalRewardsUSD, trendingTestnets, topGainers }: TestnetsHeroProps) {
  return (
    <div className="border-b border-white/30 bg-gradient-to-b from-white to-white/95">
      <div className="mx-auto max-w-[1280px] px-6 py-6">
        <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[var(--ink-1)] sm:text-3xl">
          Discover Web3 Testnets
        </h1>
        <p className="mb-6 text-sm text-[var(--ink-2)] sm:text-base">
          Find opportunities, earn rewards, and contribute to the decentralized future.
        </p>

        {/* 3 Equal-Height Cards Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 md:items-stretch">
          {/* Total Rewards Card */}
          <div className="relative overflow-hidden rounded-[20px] border border-white/30 bg-white/60 p-6 shadow-sm backdrop-blur-[2px]">
            <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">Total Rewards</div>
            <div className="mb-4 text-2xl font-bold text-[var(--ink-1)]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
              ${totalRewardsUSD.toLocaleString()}
            </div>
            <div className="text-xs text-[var(--text-3)]">Last 30d</div>
          </div>

          {/* Trending Testnets Card */}
          <div className="relative flex flex-col overflow-hidden rounded-[20px] border border-white/30 bg-white/60 p-6 shadow-sm backdrop-blur-[2px] min-h-[200px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">Trending Now</div>
              <Link
                href="/testnets?sort=trending"
                className="text-xs font-medium text-[var(--mint)] transition hover:text-[var(--aqua)]"
              >
                View more →
              </Link>
            </div>
            <div className="flex-1 space-y-3">
              {trendingTestnets.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/testnets/${item.id}`}
                  className="flex items-center gap-3 rounded-md p-2 transition hover:bg-white/80"
                >
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt="" className="h-8 w-8 rounded-lg border border-white/40" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-[var(--mint)]/10 text-xs font-bold text-[var(--mint)]">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[var(--ink-1)]">{item.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{item.network}</div>
                  </div>
                  <div className="text-xs text-[var(--text-3)]">{item.metric7d}</div>
                </Link>
              ))}
            </div>
          </div>

          {/* Top Gainers Card */}
          <div className="relative flex flex-col overflow-hidden rounded-[20px] border border-white/30 bg-white/60 p-6 shadow-sm backdrop-blur-[2px] min-h-[200px]">
            <div className="mb-4 flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">Top Gainers</div>
              <Link
                href="/testnets?sort=gainers"
                className="text-xs font-medium text-[var(--mint)] transition hover:text-[var(--aqua)]"
              >
                View more →
              </Link>
            </div>
            <div className="flex-1 space-y-3">
              {topGainers.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/testnets/${item.id}`}
                  className="flex items-center gap-3 rounded-md p-2 transition hover:bg-white/80"
                >
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt="" className="h-8 w-8 rounded-lg border border-white/40" />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-[var(--mint)]/10 text-xs font-bold text-[var(--mint)]">
                      {item.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-[var(--ink-1)]">{item.name}</div>
                    <div className="text-xs text-[var(--text-3)]">{item.network}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold">
                    {item.deltaPct > 0 ? (
                      <>
                        <ArrowUp className="h-3 w-3" />
                        <span>{Math.abs(item.deltaPct).toFixed(1)}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-3 w-3" />
                        <span>{Math.abs(item.deltaPct).toFixed(1)}%</span>
                      </>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

