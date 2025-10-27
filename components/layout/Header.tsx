'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import type { Route } from 'next';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Search, X } from 'lucide-react';
import { formatTimeMinutes } from '@/lib/format';
import { cn } from '@/lib/utils';

type LinkNavItem = { label: string; href: Route; comingSoon?: false; requiresAdmin?: boolean };
type PlaceholderNavItem = { label: string; comingSoon: true };
type NavItem = LinkNavItem | PlaceholderNavItem;

type HeaderMetric = {
  label: string;
  value: string;
  srLabel?: string;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Testnets', href: '/testnets' },
  { label: 'Dashboards', comingSoon: true },
  { label: 'Learn', comingSoon: true }
];

const isLinkItem = (item: NavItem): item is LinkNavItem => Object.prototype.hasOwnProperty.call(item, 'href');

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const baseClasses =
    'relative inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]';

  if (!isLinkItem(item)) {
    return (
      <span
        className={cn(
          baseClasses,
          'cursor-not-allowed text-[var(--ink-3)] opacity-70 before:absolute before:bottom-1 before:left-1/2 before:h-0.5 before:w-6 before:-translate-x-1/2 before:bg-gradient-to-r before:from-[var(--mint)]/60 before:via-[var(--aqua)]/60 before:to-[var(--lilac)]/60'
        )}
        aria-disabled="true"
        title="Coming soon"
      >
        {item.label}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        baseClasses,
        isActive
          ? 'bg-[var(--mint)]/80 text-[var(--ink-1)] shadow-glass'
          : 'text-[var(--ink-2)] hover:bg-white/70 hover:text-[var(--ink-1)]'
      )}
      aria-current={isActive ? 'page' : undefined}
    >
      {item.label}
    </Link>
  );
}

function MetricPill({ label, value, srLabel }: HeaderMetric) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-white/50 bg-white/80 px-3 py-1 text-[11px] font-semibold text-[var(--ink-2)] shadow-sm">
      <span aria-hidden="true">{value}</span>
      <span className="uppercase tracking-wide text-[var(--ink-3)]">{label}</span>
      {srLabel && <span className="sr-only">{srLabel}</span>}
    </span>
  );
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [isPending, startTransition] = useTransition();
  const [metrics, setMetrics] = useState<HeaderMetric[]>([]);
  const [metricsLoaded, setMetricsLoaded] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const isDev = process.env.NODE_ENV !== 'production';
  const [adminEnabled, setAdminEnabled] = useState(isDev);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hasToken = Boolean(window.localStorage.getItem('dewrk-admin-token'));
    setAdminEnabled(isDev || hasToken);
  }, [isDev]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleScroll = () => setIsScrolled(window.scrollY > 4);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function loadMetrics() {
      try {
        const response = await fetch('/api/testnets', {
          signal: controller.signal,
          headers: { Accept: 'application/json' }
        });
        if (!response.ok) {
          return;
        }

        const payload = await response.json();
        const items = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        if (!isMounted || !items.length) {
          if (isMounted) setMetricsLoaded(true);
          return;
        }

        const normaliseStatus = (value: unknown) =>
          typeof value === 'string' ? value.trim().toUpperCase() : '';

        const total = items.length;
        const live = items.filter((item: any) => normaliseStatus(item.status) === 'LIVE').length;
        const beta = items.filter((item: any) => normaliseStatus(item.status) === 'BETA').length;

        const durations = items
          .map((item: any): number | null => {
            const raw = item.estTimeMinutes ?? item.est_time_minutes;
            const numeric = typeof raw === 'number' ? raw : Number(raw);
            return Number.isFinite(numeric) && numeric > 0 ? numeric : null;
          })
          .filter((value: number | null): value is number => value !== null);

        const averageDuration =
          durations.length > 0
            ? Math.round(
                durations.reduce((acc: number, value: number) => acc + value, 0) / durations.length
              )
            : null;

        const nextMetrics: HeaderMetric[] = [];
        nextMetrics.push({
          label: 'Total Programs',
          value: total.toString(),
          srLabel: `Total programs ${total}`
        });
        if (live > 0) {
          nextMetrics.push({
            label: 'Live',
            value: live.toString(),
            srLabel: `Live programs ${live}`
          });
        }
        if (beta > 0) {
          nextMetrics.push({
            label: 'Beta',
            value: beta.toString(),
            srLabel: `Beta programs ${beta}`
          });
        }
        if (averageDuration && averageDuration > 0) {
          const formatted = formatTimeMinutes(averageDuration);
          if (formatted !== 'N/A') {
            nextMetrics.push({
              label: 'Avg Est. Time',
              value: formatted,
              srLabel: `Average estimated time ${formatted}`
            });
          }
        }

        if (isMounted) {
          setMetrics(nextMetrics);
          setMetricsLoaded(true);
        }
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Failed to load header metrics', error);
        }
        if (isMounted) {
          setMetricsLoaded(true);
        }
      }
    }

    loadMetrics();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, []);

  const activeHref = useMemo(() => {
    if (!pathname) return '';
    if (pathname === '/') return '/testnets';
    if (pathname.startsWith('/testnets')) return '/testnets';
    if (pathname.startsWith('/admin')) return '/admin';
    return pathname;
  }, [pathname]);

  const handleSearch = useCallback(
    (value: string) => {
      const params =
        pathname && pathname.startsWith('/testnets')
          ? new URLSearchParams(searchParams)
          : new URLSearchParams();

      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      params.delete('page');
      params.delete('slug');

      const next = params.toString();
      startTransition(() => {
        router.replace(next ? `/testnets?${next}` : '/testnets');
      });
    },
    [pathname, router, searchParams, startTransition]
  );

  const onSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      handleSearch(query.trim());
    },
    [handleSearch, query]
  );

  const onClear = useCallback(() => {
    setQuery('');
    handleSearch('');
  }, [handleSearch]);

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return;
      const target = event.target as HTMLElement | null;
      const tagName = target?.tagName?.toLowerCase();

      if (event.key === '/' && !event.metaKey && !event.ctrlKey && !event.altKey) {
        if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
          return;
        }
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }

      if (event.key === 'Escape' && document.activeElement === searchRef.current) {
        event.preventDefault();
        onClear();
      }
    };

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, [onClear]);

  const visibleNavItems = useMemo(
    () =>
      NAV_ITEMS.filter((item) => {
        if (!isLinkItem(item)) return true;
        if (!item.requiresAdmin) return true;
        return adminEnabled;
      }),
    [adminEnabled]
  );

  return (
    <header
      className={cn(
        'sticky top-0 z-[50] border-b border-white/30 bg-white/80 backdrop-blur transition-shadow',
        isScrolled ? 'shadow-[0_20px_30px_-24px_rgba(15,23,42,0.35)]' : 'shadow-none'
      )}
      data-scrolled={isScrolled ? 'true' : 'false'}
    >
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:h-14 sm:px-6 lg:h-16">
        <div className="flex flex-1 items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[var(--ink-1)] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
          >
            <svg className="h-7 w-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path
                d="M10 12h6a3 3 0 013 3v2a3 3 0 01-3 3h-6V12z"
                fill="white"
                fillOpacity="0.95"
              />
              <circle cx="21" cy="16" r="3" fill="white" fillOpacity="0.8" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32">
                  <stop offset="0%" stopColor="var(--aqua)" />
                  <stop offset="100%" stopColor="var(--mint)" />
                </linearGradient>
              </defs>
            </svg>
            <span className="text-sm font-bold">Dewrk</span>
          </Link>
          <nav aria-label="Primary" className="hidden items-center gap-1 sm:flex">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                isActive={isLinkItem(item) ? activeHref.startsWith(item.href) : false}
              />
            ))}
          </nav>
        </div>

        <div className="flex flex-1 items-center justify-end gap-3">
          <form
            role="search"
            aria-label="Search testnets"
            onSubmit={onSubmit}
            className="relative flex items-center"
          >
            <Search
              className="pointer-events-none absolute left-3 h-4 w-4 text-[var(--ink-3)]"
              aria-hidden="true"
            />
            <input
              ref={searchRef}
              type="search"
              inputMode="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search testnets…"
              className={cn(
                'h-10 w-[200px] rounded-full border border-white/50 bg-white/80 pl-9 pr-8 text-xs text-[var(--ink-1)] shadow-inner transition placeholder:text-[var(--ink-3)] focus:border-[var(--mint)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]/60 sm:w-[240px] lg:w-[300px]'
              )}
            />
            {query && (
              <button
                type="button"
                onClick={onClear}
                className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-3)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
            <span className="sr-only">Press Enter to submit search</span>
          </form>

          {metricsLoaded && metrics.length > 0 && (
            <div className="hidden items-center gap-2 lg:flex">
              {metrics.map((metric) => (
                <MetricPill key={metric.label} {...metric} />
              ))}
            </div>
          )}

          <nav aria-label="Primary" className="flex items-center gap-1 sm:hidden">
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.label}
                item={item}
                isActive={isLinkItem(item) ? activeHref.startsWith(item.href) : false}
              />
            ))}
          </nav>

          {isPending && <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-3)]" aria-hidden="true" />}
        </div>
      </div>
    </header>
  );
}
