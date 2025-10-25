import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={cn(
        'flex h-9 w-full rounded-lg border border-white/40 bg-white/70 px-3 text-sm text-[var(--ink-2)] shadow-sm transition placeholder:text-[var(--ink-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mint)] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = 'Input';
