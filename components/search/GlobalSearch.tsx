'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X, Search as SearchIcon, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  name: string;
  network: string;
  status: string;
  difficulty: string;
  estTimeMinutes?: number;
  rewardType?: string;
  logoUrl?: string;
}

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tab = 'testnets' | 'ecosystems' | 'tags';

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('testnets');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Focus input when modal opens
  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [open]);

  // Fetch results
  useEffect(() => {
    if (!open) return;

    const fetchResults = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(`/api/testnets?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.items?.slice(0, 10) || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 200);
    return () => clearTimeout(debounce);
  }, [query, open]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (event.key === 'Enter' && results[selectedIndex]) {
        event.preventDefault();
        handleSelect(results[selectedIndex]);
      } else if (event.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, results, selectedIndex, onOpenChange]);

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false);
    router.push(`/testnets/${result.id}`);
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/20 pt-[10vh] backdrop-blur-sm"
      onClick={() => onOpenChange(false)}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-2xl rounded-xl border border-white/40 bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 border-b border-white/30 px-4 py-4">
          <SearchIcon className="h-5 w-5 text-[var(--text-3)]" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search testnets..."
            className="flex-1 text-base text-[var(--ink-1)] outline-none placeholder:text-[var(--text-3)]"
          />
          <button
            onClick={() => onOpenChange(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[var(--text-3)] transition hover:text-[var(--ink-1)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-white/30 px-4">
          {(['testnets', 'ecosystems', 'tags'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'border-b-2 border-transparent px-4 py-3 text-xs font-medium uppercase transition',
                activeTab === tab
                  ? 'border-[var(--mint)] text-[var(--ink-1)]'
                  : 'text-[var(--text-3)] hover:text-[var(--ink-1)]'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Results */}
        <div ref={resultsRef} className="max-h-96 overflow-y-auto py-2">
          {loading && (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-3)]">Loading...</div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-[var(--text-3)]">No results found</div>
          )}

          {!loading && query.length < 2 && (
            <div className="px-4 py-8">
              <div className="mb-4 text-xs font-semibold uppercase tracking-wide text-[var(--text-3)]">
                Recent
              </div>
              <div className="text-sm text-[var(--text-3)]">No recent searches</div>
            </div>
          )}

          {!loading &&
            results.length > 0 &&
            results.map((result, idx) => (
              <button
                key={result.id}
                onClick={() => handleSelect(result)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition',
                  idx === selectedIndex
                    ? 'bg-[var(--mint)]/10'
                    : 'hover:bg-white/80'
                )}
              >
                {result.logoUrl ? (
                  <img
                    src={result.logoUrl}
                    alt=""
                    className="h-8 w-8 rounded-lg border border-white/40"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/40 bg-[var(--mint)]/10 text-xs font-bold text-[var(--mint)]">
                    {result.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="font-semibold text-[var(--ink-1)]">{result.name}</div>
                  <div className="text-xs text-[var(--text-3)]">{result.network}</div>
                </div>
                {result.status && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                    {result.status}
                  </span>
                )}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}



