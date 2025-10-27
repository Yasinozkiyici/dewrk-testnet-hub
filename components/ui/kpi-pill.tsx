import React from 'react';
import { cn } from '@/lib/utils';

interface KpiPillProps {
  label: string;
  value: string | number;
  className?: string;
}

export function KpiPill({ label, value, className }: KpiPillProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/50 bg-white/80 px-3 py-1 shadow-sm',
        className
      )}
    >
      <span className="text-sm font-semibold text-[var(--ink-1)]">{value}</span>
      <span className="text-xs font-medium uppercase tracking-wide text-[var(--ink-3)]">{label}</span>
    </span>
  );
}

