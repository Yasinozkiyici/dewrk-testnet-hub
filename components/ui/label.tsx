import * as LabelPrimitive from '@radix-ui/react-label';
import { cn } from '@/lib/utils';

export const Label = ({ className, ...props }: LabelPrimitive.LabelProps) => (
  <LabelPrimitive.Root
    className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]', className)}
    {...props}
  />
);
