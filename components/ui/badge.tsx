import { cn } from '@/lib/utils';

export function Badge({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-white/50 bg-white/60 px-2.5 py-1 text-xs font-medium uppercase tracking-wide text-[var(--ink-2)]',
        className
      )}
    >
      {children}
    </span>
  );
}
