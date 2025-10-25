import * as React from 'react';
import { cn } from '@/lib/utils';

const Table = ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
  <div className="overflow-hidden rounded-2xl border border-white/30 bg-white/60 shadow-glass">
    <table
      className={cn('w-full border-collapse text-sm text-[var(--ink-2)]', className)}
      {...props}
    />
  </div>
);
Table.displayName = 'Table';

const TableHeader = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <thead className={cn('bg-white/70 text-xs uppercase tracking-wide text-[var(--ink-3)]', className)} {...props} />
);
TableHeader.displayName = 'TableHeader';

const TableBody = ({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) => (
  <tbody className={cn('divide-y divide-white/40', className)} {...props} />
);
TableBody.displayName = 'TableBody';

const TableRow = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr
    className={cn(
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--mint)]',
      className
    )}
    {...props}
  />
);
TableRow.displayName = 'TableRow';

const TableHead = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn('px-4 py-3 text-left font-semibold text-[var(--ink-3)]', className)} {...props} />
);
TableHead.displayName = 'TableHead';

const TableCell = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn('px-4 py-4 align-top text-sm text-[var(--ink-2)]', className)} {...props} />
);
TableCell.displayName = 'TableCell';

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
