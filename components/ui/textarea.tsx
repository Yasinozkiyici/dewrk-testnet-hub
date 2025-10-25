import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'min-h-[120px] w-full rounded-lg border border-white/40 bg-white/70 px-3 py-2 text-sm text-[var(--ink-2)] shadow-sm transition placeholder:text-[var(--ink-3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mint)] disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      {...props}
    />
  )
);

Textarea.displayName = 'Textarea';
