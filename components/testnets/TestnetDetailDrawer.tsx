'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TestnetDetail } from './TestnetDetail';
import { normalizeTestnetDetail } from './normalize';
import type { TestnetDetailRecord } from './types';

interface TestnetDetailDrawerProps {
  slug: string | null;
  open: boolean;
  onClose: () => void;
}

type DrawerState =
  | { status: 'idle'; detail: null; error: null }
  | { status: 'loading'; detail: TestnetDetailRecord | null; error: null }
  | { status: 'loaded'; detail: TestnetDetailRecord; error: null }
  | { status: 'error'; detail: TestnetDetailRecord | null; error: string };

const cache = new Map<string, TestnetDetailRecord>();

export function TestnetDetailDrawer({ slug, open, onClose }: TestnetDetailDrawerProps) {
  const [state, setState] = useState<DrawerState>({ status: 'idle', detail: null, error: null });
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocus = useRef<Element | null>(null);

  const load = useCallback(async () => {
    if (!slug) return;

    if (cache.has(slug)) {
      setState({ status: 'loaded', detail: cache.get(slug)!, error: null });
      return;
    }

    setState((prev) => ({ status: 'loading', detail: prev.detail, error: null }));
    try {
      const response = await fetch(`/api/testnets/${slug}`);
      if (!response.ok) {
        throw new Error('Failed to load testnet');
      }
      const json = await response.json();
      const detail = normalizeTestnetDetail(json);
      cache.set(slug, detail);
      setState({ status: 'loaded', detail, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      setState({ status: 'error', detail: null, error: message });
    }
  }, [slug]);

  useEffect(() => {
    if (open && slug) {
      load();
    } else if (!open) {
      setState({ status: 'idle', detail: null, error: null });
    }
  }, [open, slug, load]);

  useEffect(() => {
    if (open) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('drawer-open');
      setTimeout(() => {
        panelRef.current?.focus();
      }, 20);
    } else {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('drawer-open');
      if (previousFocus.current instanceof HTMLElement) {
        previousFocus.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.classList.remove('drawer-open');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const content = useMemo(() => {
    if (!slug) {
      return <div className="p-6 text-sm text-[var(--ink-3)]">Select a testnet to view details.</div>;
    }

    if (state.status === 'loading' && !state.detail) {
      return <DrawerSkeleton />;
    }

    if (state.status === 'error') {
      return (
        <div className="flex flex-col gap-4 p-6 text-sm text-[var(--ink-3)]">
          <p className="font-semibold text-[var(--ink-1)]">Unable to load details.</p>
          <p>{state.error}</p>
          <Button onClick={load} variant="outline" className="w-fit">
            Retry
          </Button>
        </div>
      );
    }

    const detail = state.detail ?? cache.get(slug);
    if (!detail) {
      return <DrawerSkeleton />;
    }

    return <TestnetDetail testnet={detail} variant="drawer" />;
  }, [slug, state, load]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex" role="dialog" aria-modal="true" style={{ zIndex: 'var(--z-drawer)' }}>
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
        style={{ zIndex: 'var(--z-backdrop)' }}
      />
      <div
        ref={panelRef}
        className="relative ml-auto flex h-full w-full max-w-[700px] flex-col overflow-y-auto bg-white shadow-2xl focus-visible:outline-none"
        tabIndex={-1}
        style={{ zIndex: 'calc(var(--z-drawer) + 1)' }}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <h2 className="text-lg font-semibold text-[var(--ink-1)]">Testnet Details</h2>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={onClose}
            aria-label="Close drawer"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{content}</div>
      </div>
    </div>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-2xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>
      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
        <Skeleton className="h-4 w-32" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
    </div>
  );
}
