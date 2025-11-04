import { Skeleton } from '@/components/ui/skeleton';

interface TestnetTableSkeletonProps {
  rows?: number;
}

export function TestnetTableSkeleton({ rows = 8 }: TestnetTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-glass">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1280px] table-fixed border-collapse">
          <caption className="sr-only">Loading testnet programs…</caption>
          <colgroup>
            <col className="w-[24%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
            <col className="w-[18%]" />
            <col className="w-[8%]" />
            <col className="w-[10%]" />
            <col className="w-[10%]" />
          </colgroup>
          <thead className="bg-white/80 text-[11px] font-semibold uppercase tracking-wide text-[var(--ink-3)]">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-white/80 px-3 py-3 text-left shadow-[2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                Name & Network
              </th>
              <th scope="col" className="px-3 py-3 text-left">Status</th>
              <th scope="col" className="px-3 py-3 text-left">Difficulty</th>
              <th scope="col" className="px-3 py-3 text-left">Est. Time</th>
              <th scope="col" className="px-3 py-3 text-left">Reward</th>
              <th scope="col" className="px-3 py-3 text-center">Tasks</th>
              <th scope="col" className="px-3 py-3 text-left">Updated</th>
              <th scope="col" className="sticky right-0 z-10 bg-white/80 px-3 py-3 text-right shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.08)]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/40">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="h-[60px]">
                <td className="sticky left-0 z-10 bg-white/70 px-3 py-3 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-4 w-12" />
                </td>
                <td className="px-3 py-3">
                  <div className="flex flex-col gap-1">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </td>
                <td className="px-3 py-3 text-center">
                  <Skeleton className="mx-auto h-4 w-8" />
                </td>
                <td className="px-3 py-3">
                  <Skeleton className="h-3 w-16" />
                </td>
                <td className="sticky right-0 z-10 bg-white/70 px-3 py-3 text-right shadow-[-2px_0_4px_-2px_rgba(0,0,0,0.06)]">
                  <Skeleton className="ml-auto h-7 w-16 rounded-lg" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
