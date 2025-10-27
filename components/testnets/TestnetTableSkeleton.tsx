import { Skeleton } from '@/components/ui/skeleton';

interface TestnetTableSkeletonProps {
  rows?: number;
}

export function TestnetTableSkeleton({ rows = 6 }: TestnetTableSkeletonProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-white/30 bg-white/70 shadow-glass">
      <table className="w-full min-w-[1080px] table-fixed border-collapse">
        <caption className="sr-only">Loading testnet programs…</caption>
        <thead className="bg-white/80 text-xs uppercase tracking-wide text-[var(--ink-3)]">
          <tr>
            {Array.from({ length: 11 }).map((_, index) => (
              <th key={index} className="px-4 py-3 text-left">
                <Skeleton className="h-3 w-24" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/40">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <tr key={rowIndex} className="h-14">
              <td className="px-4 py-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </td>
              {Array.from({ length: 10 }).map((_, cellIndex) => (
                <td key={cellIndex} className="px-4 py-4">
                  <Skeleton className="h-4 w-20" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
