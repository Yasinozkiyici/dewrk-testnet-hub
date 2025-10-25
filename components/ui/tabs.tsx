'use client';

import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = ({ className, ...props }: TabsPrimitive.TabsListProps) => (
  <TabsPrimitive.List
    className={cn(
      'inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/60 p-1 text-xs text-[var(--ink-2)]',
      className
    )}
    {...props}
  />
);

const TabsTrigger = ({ className, ...props }: TabsPrimitive.TabsTriggerProps) => (
  <TabsPrimitive.Trigger
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition data-[state=active]:bg-[var(--mint)] data-[state=active]:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--mint)]',
      className
    )}
    {...props}
  />
);

const TabsContent = ({ className, ...props }: TabsPrimitive.TabsContentProps) => (
  <TabsPrimitive.Content
    className={cn('rounded-2xl border border-white/30 bg-white/70 p-4 text-sm', className)}
    {...props}
  />
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
