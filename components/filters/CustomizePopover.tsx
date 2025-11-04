'use client';

import { useState, useEffect } from 'react';
import { Settings2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import * as Popover from '@radix-ui/react-popover';

type ColumnId = 'status' | 'difficulty' | 'estTime' | 'reward' | 'kyc' | 'tags' | 'tasks' | 'updated' | 'funding' | 'dashboard';

type Column = {
  id: ColumnId;
  label: string;
  defaultVisible: boolean;
};

const AVAILABLE_COLUMNS: Column[] = [
  { id: 'status', label: 'Status', defaultVisible: true },
  { id: 'difficulty', label: 'Difficulty', defaultVisible: true },
  { id: 'estTime', label: 'Est. Time', defaultVisible: true },
  { id: 'reward', label: 'Reward', defaultVisible: true },
  { id: 'kyc', label: 'KYC', defaultVisible: true },
  { id: 'tags', label: 'Tags', defaultVisible: true },
  { id: 'tasks', label: 'Tasks', defaultVisible: true },
  { id: 'updated', label: 'Updated', defaultVisible: true },
  { id: 'funding', label: 'Funding (USD)', defaultVisible: true },
  { id: 'dashboard', label: 'Dashboard', defaultVisible: true }
];

type Density = 'normal' | 'compact';

const STORAGE_KEY = 'dewrk.table.prefs';

type TablePreferences = {
  visibleColumns: ColumnId[];
  density: Density;
};

const DEFAULT_PREFS: TablePreferences = {
  visibleColumns: AVAILABLE_COLUMNS.filter((col) => col.defaultVisible).map((col) => col.id),
  density: 'normal'
};

export function CustomizePopover() {
  const [isOpen, setIsOpen] = useState(false);
  const [prefs, setPrefs] = useState<TablePreferences>(DEFAULT_PREFS);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Partial<TablePreferences>;
        setPrefs({
          visibleColumns: parsed.visibleColumns || DEFAULT_PREFS.visibleColumns,
          density: parsed.density || DEFAULT_PREFS.density
        });
      } catch (e) {
        console.warn('Failed to parse table preferences', e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    window.dispatchEvent(new CustomEvent('dewrk:table-prefs-updated', { detail: prefs }));
  }, [prefs]);

  const toggleColumn = (columnId: ColumnId) => {
    setPrefs((prev) => {
      const newColumns = prev.visibleColumns.includes(columnId)
        ? prev.visibleColumns.filter((id) => id !== columnId)
        : [...prev.visibleColumns, columnId];
      return { ...prev, visibleColumns: newColumns };
    });
  };

  const setDensity = (density: Density) => {
    setPrefs((prev) => ({ ...prev, density }));
  };

  const reset = () => {
    setPrefs(DEFAULT_PREFS);
  };

  const visibleColumnsCount = prefs.visibleColumns.length;
  const totalColumnsCount = AVAILABLE_COLUMNS.length;

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger
        className={cn(
          'inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]'
        )}
        aria-label="Customize table"
      >
        <Settings2 className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="hidden sm:inline">Customize</span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className={cn(
            'z-50 w-80 rounded-2xl border border-white/30 bg-white/95 backdrop-blur-md p-4 shadow-2xl',
            'focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out',
            'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
            'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95'
          )}
          sideOffset={8}
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[var(--ink-1)]">Customize Table</h3>
            <Popover.Close
              className="rounded p-1 text-[var(--ink-3)] transition hover:bg-white/80 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </Popover.Close>
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-xs font-medium text-[var(--ink-2)]">Columns ({visibleColumnsCount}/{totalColumnsCount})</div>
              <div className="space-y-1.5">
                {AVAILABLE_COLUMNS.map((column) => {
                  const isVisible = prefs.visibleColumns.includes(column.id);
                  return (
                    <label
                      key={column.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition hover:bg-white/80',
                        isVisible && 'bg-white/60'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => toggleColumn(column.id)}
                        className="h-3.5 w-3.5 rounded border-white/40 text-[var(--mint)] focus:ring-2 focus:ring-[var(--mint)]/60"
                      />
                      <span className="flex-1 text-[var(--ink-1)]">{column.label}</span>
                      {isVisible && <Check className="h-3 w-3 text-[var(--mint)]" aria-hidden="true" />}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-[var(--ink-2)]">Row Density</div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDensity('normal')}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-[11px] font-medium transition',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]',
                    prefs.density === 'normal'
                      ? 'border-[var(--mint)]/50 bg-[var(--mint)]/20 text-[var(--ink-1)]'
                      : 'border-white/40 bg-white/70 text-[var(--ink-2)] hover:border-white/60 hover:bg-white/90'
                  )}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setDensity('compact')}
                  className={cn(
                    'flex-1 rounded-lg border px-3 py-2 text-[11px] font-medium transition',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]',
                    prefs.density === 'compact'
                      ? 'border-[var(--mint)]/50 bg-[var(--mint)]/20 text-[var(--ink-1)]'
                      : 'border-white/40 bg-white/70 text-[var(--ink-2)] hover:border-white/60 hover:bg-white/90'
                  )}
                >
                  Compact
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/20 pt-3">
              <button
                type="button"
                onClick={reset}
                className="text-[11px] font-medium text-[var(--ink-3)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Reset to default
              </button>
              <Popover.Close
                className="rounded-lg border border-white/40 bg-[var(--mint)]/80 px-3 py-1.5 text-[11px] font-medium text-[var(--ink-1)] transition hover:bg-[var(--mint)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Done
              </Popover.Close>
            </div>
          </div>

          <Popover.Arrow className="fill-white/95" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

