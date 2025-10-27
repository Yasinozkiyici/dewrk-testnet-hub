'use client';

import { TestnetTableSkeleton } from '@/components/testnets/TestnetTableSkeleton';

export default function LoadingTestnets() {
  return (
    <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-6 px-4 py-16 lg:px-6">
      <div className="rounded-3xl border border-white/40 bg-white/80 p-6 shadow-glass">
        <div className="h-6 w-40 rounded-full bg-white/60" />
      </div>
      <div className="h-[160px] rounded-3xl border border-white/40 bg-white/80 shadow-glass" />
      <TestnetTableSkeleton rows={8} />
    </div>
  );
}
