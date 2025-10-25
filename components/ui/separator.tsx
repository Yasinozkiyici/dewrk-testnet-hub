import * as SeparatorPrimitive from '@radix-ui/react-separator';
import { cn } from '@/lib/utils';

export const Separator = ({ className, ...props }: SeparatorPrimitive.SeparatorProps) => (
  <SeparatorPrimitive.Root
    className={cn('my-6 h-px w-full bg-white/40', className)}
    {...props}
  />
);
