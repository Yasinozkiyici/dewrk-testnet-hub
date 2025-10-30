'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsPill {
  icon: React.ReactNode;
  value: string;
  label: string;
  change?: number;
}

interface UtilityStripProps {
  stats: StatsPill[];
  compact?: boolean;
}

export function UtilityStrip({ stats, compact = false }: UtilityStripProps) {
  return (
    <div
      className={cn(
        'border-b border-white/30 bg-white/80 backdrop-blur-sm transition-all duration-200',
        compact ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'
      )}
    >
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-6 py-2">
        {/* Stats */}
        <div className="flex items-center gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2 rounded-md border border-white/40 bg-white/60 px-3 py-1 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-3)]">{stat.icon}</span>
                <span className="text-sm font-bold text-[var(--ink-1)]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                  {stat.value}
                </span>
                <span className="text-xs font-medium text-[var(--text-3)] uppercase tracking-wide">
                  {stat.label}
                </span>
              </div>
              {stat.change !== undefined && stat.change !== 0 && (
                <div className="flex items-center gap-0.5 text-[10px]">
                  {stat.change > 0 ? (
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-rose-600" />
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* User Preferences */}
        <div className="flex items-center gap-3">
          <button
            className="rounded-md border border-white/40 bg-white/60 px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            aria-label="Theme"
          >
            Theme
          </button>
          <button
            className="rounded-md border border-white/40 bg-white/60 px-3 py-1.5 text-xs font-medium text-[var(--ink-2)] transition hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            aria-label="Language"
          >
            EN
          </button>
        </div>
      </div>
    </div>
  );
}

