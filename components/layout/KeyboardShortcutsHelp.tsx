'use client';

import { useEffect, useState } from 'react';
import { X, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

const shortcuts = [
  { key: '/', description: 'Focus search bar' },
  { key: 'Esc', description: 'Clear search / Close modal' },
  { key: 'Enter', description: 'Open selected testnet (on row focus)' },
  { key: '?', description: 'Show this help' },
  { key: 'Tab', description: 'Navigate between elements' }
];

export function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      // Open help with ?
      if (event.key === '?' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
          return;
        }
        event.preventDefault();
        setIsOpen(true);
        return;
      }

      // Close with Escape
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={() => setIsOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="relative mx-4 w-full max-w-md rounded-3xl border border-white/40 bg-white/95 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--ink-3)] transition hover:bg-black/5 hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          aria-label="Close"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="flex items-center gap-3">
          <div className="rounded-full bg-[var(--mint)]/10 p-3">
            <Keyboard className="h-6 w-6 text-[var(--mint)]" aria-hidden="true" />
          </div>
          <h2 id="shortcuts-title" className="text-xl font-semibold text-[var(--ink-1)]">
            Keyboard Shortcuts
          </h2>
        </div>

        <dl className="mt-6 space-y-4">
          {shortcuts.map(({ key, description }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <dt className="text-sm text-[var(--ink-2)]">{description}</dt>
              <dd>
                <kbd
                  className={cn(
                    'inline-flex min-w-[2rem] items-center justify-center rounded-lg border border-white/60 bg-white/90 px-3 py-1.5 text-xs font-semibold text-[var(--ink-1)] shadow-sm'
                  )}
                >
                  {key}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-xs text-[var(--ink-3)]">
          Press <kbd className="rounded border border-white/60 bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold">?</kbd> to toggle this help.
        </p>
      </div>
    </div>
  );
}

