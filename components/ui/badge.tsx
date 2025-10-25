import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
}

export function Badge({ className, children, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'border-white/50 bg-white/60 text-[var(--ink-2)]',
    secondary: 'border-gray-300 bg-gray-100 text-gray-800',
    outline: 'border-gray-300 bg-transparent text-gray-700',
    destructive: 'border-red-500 bg-red-100 text-red-800'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium uppercase tracking-wide',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
