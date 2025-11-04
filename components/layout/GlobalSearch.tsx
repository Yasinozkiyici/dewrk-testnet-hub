'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, TrendingUp, Tag, Clock, DollarSign, Network, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

type SearchResult = {
  id: string;
  type: 'testnet' | 'tag' | 'network';
  title: string;
  subtitle?: string;
  badges?: Array<{ label: string; color?: string }>;
  href: Route;
};

type SearchTab = 'all' | 'testnets' | 'tags' | 'networks';

export function GlobalSearch({ onResultSelect }: { onResultSelect?: () => void }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const fetchResults = useCallback(
    async (searchQuery: string, tab: SearchTab) => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setResults([]);
        return;
      }

      try {
        const url = new URL('/api/testnets', window.location.origin);
        url.searchParams.set('q', searchQuery);
        url.searchParams.set('limit', '20');

        const response = await fetch(url.toString(), {
          headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
          setResults([]);
          return;
        }

        const payload = await response.json();
        const items = Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.data)
            ? payload.data
            : [];

        const mapped: SearchResult[] = items.slice(0, 10).map((item: any) => ({
          id: String(item.id || item.slug || Math.random()),
          type: 'testnet' as const,
          title: String(item.name || 'Untitled'),
          subtitle: item.network ? `Network: ${item.network}` : undefined,
          badges: [
            item.status && { label: String(item.status), color: getStatusColor(item.status) },
            item.difficulty && { label: String(item.difficulty) },
            item.estTimeMinutes && { label: `${item.estTimeMinutes}m` },
            item.totalRaisedUSD && { label: `$${Math.round(Number(item.totalRaisedUSD) / 1000)}K` }
          ].filter(Boolean) as Array<{ label: string; color?: string }>,
          href: `/testnets/${item.slug || item.id}` as Route
        }));

        setResults(mapped);
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('Search error:', error);
        }
        setResults([]);
      }
    },
    []
  );

  const [recent, setRecent] = useState<SearchResult[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dewrk.search.recent');
      if (stored) {
        try {
          setRecent(JSON.parse(stored).slice(0, 5));
        } catch (e) {
          // ignore
        }
      }
    }
  }, []);

  const saveRecent = useCallback((result: SearchResult) => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('dewrk.search.recent');
    let recentList: SearchResult[] = stored ? JSON.parse(stored) : [];
    recentList = [result, ...recentList.filter((r) => r.id !== result.id)].slice(0, 5);
    localStorage.setItem('dewrk.search.recent', JSON.stringify(recentList));
    setRecent(recentList);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (!query.trim()) {
      setResults([]);
      return;
    }

    timeoutRef.current = setTimeout(() => {
      startTransition(() => {
        fetchResults(query, activeTab);
      });
    }, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [query, activeTab, fetchResults]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !event.metaKey && !event.ctrlKey)) {
        const target = event.target as HTMLElement;
        if (
          target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable
        ) {
          return;
        }
        event.preventDefault();
        setIsOpen(true);
        searchRef.current?.focus();
        return;
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setQuery('');
        setResults([]);
        searchRef.current?.blur();
        return;
      }

      if (!isOpen || results.length === 0) return;

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
      } else if (event.key === 'Enter' && selectedIndex >= 0 && results[selectedIndex]) {
        event.preventDefault();
        const selected = results[selectedIndex];
        handleSelect(selected);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  useEffect(() => {
    if (results.length > 0 && selectedIndex >= results.length) {
      setSelectedIndex(0);
    }
  }, [results.length, selectedIndex]);

  const handleSelect = useCallback(
    (result: SearchResult) => {
      saveRecent(result);
      setIsOpen(false);
      setQuery('');
      setResults([]);
      onResultSelect?.();
      router.push(result.href);
    },
    [router, onResultSelect, saveRecent]
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (query.trim()) {
        router.push(`/testnets?q=${encodeURIComponent(query.trim())}`);
        setIsOpen(false);
        setQuery('');
        setResults([]);
        onResultSelect?.();
      }
    },
    [query, router, onResultSelect]
  );

  const tabs: Array<{ id: SearchTab; label: string }> = [
    { id: 'all', label: 'All' },
    { id: 'testnets', label: 'Testnets' },
    { id: 'tags', label: 'Tags' },
    { id: 'networks', label: 'Ecosystems' }
  ];

  if (!isOpen) {
    return (
      <form
        onSubmit={handleSubmit}
        className="relative flex flex-1 items-center max-w-md"
        role="search"
        aria-label="Search testnets"
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
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search testnets, tags, networks…"
          className={cn(
            'h-9 w-full rounded-full border border-white/50 bg-white/80 pl-9 pr-8 text-xs text-[var(--ink-1)]',
            'shadow-inner transition placeholder:text-[var(--ink-3)]',
            'focus:border-[var(--mint)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]/60'
          )}
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
            }}
            className="absolute right-2 inline-flex h-6 w-6 items-center justify-center rounded-full text-[var(--ink-3)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
        <span className="sr-only">Press / to open search, Enter to submit</span>
      </form>
    );
  }

  return (
    <div className="relative z-50 flex-1 max-w-md">
      <div 
        className="fixed left-1/2 top-20 z-50 w-full max-w-md -translate-x-1/2 rounded-2xl border border-white/30 bg-white/95 backdrop-blur-md shadow-2xl lg:absolute lg:inset-x-0 lg:top-0 lg:left-auto lg:translate-x-0"
        role="dialog"
        aria-modal="true"
        aria-label="Global search"
      >
        <form onSubmit={handleSubmit} role="search">
          <div className="flex items-center border-b border-white/20 px-4 py-3">
            <Search className="h-4 w-4 text-[var(--ink-3)]" aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              inputMode="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search testnets, tags, networks…"
              className="ml-3 flex-1 border-none bg-transparent text-sm text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none"
              autoFocus
            />
            {isPending && <Loader2 className="h-4 w-4 animate-spin text-[var(--ink-3)]" />}
          </div>

          <div className="flex items-center gap-1 border-b border-white/20 px-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedIndex(0);
                }}
                className={cn(
                  'rounded px-3 py-1.5 text-[11px] font-medium transition',
                  activeTab === tab.id
                    ? 'bg-white/80 text-[var(--ink-1)]'
                    : 'text-[var(--ink-3)] hover:text-[var(--ink-1)]'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            ref={resultsRef}
            className="max-h-96 overflow-y-auto px-2 py-2"
            role="listbox"
            aria-label="Search results"
          >
            {results.length === 0 && !query.trim() && recent.length > 0 && (
              <div>
                <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
                  Recent
                </div>
                {recent.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]',
                      index === selectedIndex
                        ? 'bg-white/80 text-[var(--ink-1)]'
                        : 'text-[var(--ink-2)] hover:bg-white/50'
                    )}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {getResultIcon(item.type)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{item.title}</div>
                      {item.subtitle && (
                        <div className="mt-0.5 text-xs text-[var(--ink-3)]">{item.subtitle}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {results.length === 0 && query.trim().length >= 2 && !isPending && (
              <div className="py-8 text-center text-sm text-[var(--ink-3)]">
                No results found for &quot;{query}&quot;
              </div>
            )}
            {results.length === 0 && query.trim().length > 0 && query.trim().length < 2 && (
              <div className="py-8 text-center text-sm text-[var(--ink-3)]">
                Type at least 2 characters to search
              </div>
            )}
            {results.map((result, index) => (
              <button
                key={result.id}
                type="button"
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIndex(index)}
                className={cn(
                  'flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]',
                  index === selectedIndex
                    ? 'bg-white/80 text-[var(--ink-1)]'
                    : 'text-[var(--ink-2)] hover:bg-white/50'
                )}
                role="option"
                aria-selected={index === selectedIndex}
              >
                <div className="mt-0.5 flex-shrink-0">
                  {getResultIcon(result.type)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium">{result.title}</div>
                  {result.subtitle && (
                    <div className="mt-0.5 text-xs text-[var(--ink-3)]">{result.subtitle}</div>
                  )}
                  {result.badges && result.badges.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-1">
                      {result.badges.slice(0, 4).map((badge, i) => (
                        <span
                          key={i}
                          className={cn(
                            'inline-flex items-center rounded border border-white/30 bg-white/60 px-1.5 py-0.5 text-[9px] font-medium',
                            badge.color ? `text-${badge.color}-600` : 'text-[var(--ink-2)]'
                          )}
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="border-t border-white/20 px-4 py-2 text-[10px] text-[var(--ink-3)]">
            <kbd className="rounded border border-white/30 bg-white/50 px-1.5 py-0.5">⌘K</kbd> or <kbd className="rounded border border-white/30 bg-white/50 px-1.5 py-0.5">/</kbd> to open{' '}
            <kbd className="rounded border border-white/30 bg-white/50 px-1.5 py-0.5">↑↓</kbd> to navigate{' '}
            <kbd className="rounded border border-white/30 bg-white/50 px-1.5 py-0.5">Enter</kbd> to select{' '}
            <kbd className="rounded border border-white/30 bg-white/50 px-1.5 py-0.5">Esc</kbd> to close
          </div>
        </form>
      </div>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => {
            setIsOpen(false);
            setQuery('');
            setResults([]);
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}

function getResultIcon(type: SearchResult['type']) {
  switch (type) {
    case 'testnet':
      return <TrendingUp className="h-4 w-4 text-[var(--mint)]" />;
    case 'tag':
      return <Tag className="h-4 w-4 text-[var(--aqua)]" />;
    case 'network':
      return <Network className="h-4 w-4 text-[var(--lilac)]" />;
    default:
      return <Search className="h-4 w-4 text-[var(--ink-3)]" />;
  }
}

function getStatusColor(status: string): string {
  const upper = String(status).toUpperCase();
  if (upper === 'LIVE') return 'green';
  if (upper === 'UPCOMING') return 'blue';
  if (upper === 'ENDED') return 'gray';
  return 'gray';
}

