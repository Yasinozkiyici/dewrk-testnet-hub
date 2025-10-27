'use client';

import { TestnetDetail } from '@/components/testnets/TestnetDetail';
import type { TestnetDetailRecord } from '@/components/testnets/types';

interface TestnetPreviewProps {
  data: TestnetDetailRecord;
  isSaving: boolean;
}

export function TestnetPreview({ data, isSaving }: TestnetPreviewProps) {
  return (
    <aside className="flex h-full flex-col overflow-hidden rounded-3xl border border-white/40 bg-white/80 shadow-glass">
      <header className="flex items-center justify-between border-b border-white/30 bg-white/70 px-5 py-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-[var(--ink-3)]">Live preview</p>
          <h2 className="text-sm font-semibold text-[var(--ink-1)]">Public presentation</h2>
        </div>
        {isSaving && (
          <span className="text-xs text-[var(--ink-3)]">Saving…</span>
        )}
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <TestnetDetail testnet={data} variant="drawer" />
      </div>
    </aside>
  );
}
