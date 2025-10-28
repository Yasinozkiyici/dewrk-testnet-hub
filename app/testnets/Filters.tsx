'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter, Search, Link2, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = ['LIVE', 'BETA', 'PAUSED', 'ENDED', 'UPCOMING'] as const;
const DIFFICULTY_OPTIONS = ['EASY', 'MEDIUM', 'HARD'] as const;
const NETWORK_OPTIONS = ['Arbitrum', 'Base', 'Celestia', 'Optimism', 'Polygon', 'Scroll', 'zkSync'] as const;
const POPULAR_TAGS = ['defi', 'nft', 'quests', 'zk-evm', 'rollups', 'ecosystem', 'education', 'research'] as const;
const SORT_OPTIONS = [
  { value: 'updatedAt:desc', label: 'Recently Updated' },
  { value: 'updatedAt:asc', label: 'Oldest Updated' },
  { value: 'name:asc', label: 'Name (A-Z)' },
  { value: 'name:desc', label: 'Name (Z-A)' }
] as const;

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState<string | undefined>(searchParams.get('status') ?? undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(searchParams.get('difficulty') ?? undefined);
  const [network, setNetwork] = useState<string | undefined>(searchParams.get('network') ?? undefined);
  const [tags, setTags] = useState<string[]>(() => {
    const raw = searchParams.get('tags');
    return raw ? raw.split(',').filter(Boolean) : [];
  });
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'updatedAt:desc');

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
    setStatus(searchParams.get('status') ?? undefined);
    setDifficulty(searchParams.get('difficulty') ?? undefined);
    setNetwork(searchParams.get('network') ?? undefined);
    setSort(searchParams.get('sort') ?? 'updatedAt:desc');
    const rawTags = searchParams.get('tags');
    setTags(rawTags ? rawTags.split(',').filter(Boolean) : []);
  }, [searchParams]);

  const apply = (nextParams: URLSearchParams) => {
    startTransition(() => {
      const queryString = nextParams.toString();
      router.replace(queryString ? `/testnets?${queryString}` : '/testnets');
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams);

    const syncParam = (key: string, value?: string | null) => {
      if (value && value.trim().length) {
        params.set(key, value.trim());
      } else {
        params.delete(key);
      }
    };

    syncParam('q', q);
    syncParam('status', status);
    syncParam('difficulty', difficulty);
    syncParam('network', network);
    syncParam('sort', sort && sort !== 'updatedAt:desc' ? sort : undefined);

    if (tags.length) {
      params.set('tags', Array.from(new Set(tags.map((tag) => tag.trim()))).filter(Boolean).join(','));
    } else {
      params.delete('tags');
    }

    params.delete('page');
    params.delete('slug');
    apply(params);
  };

  const handleReset = () => {
    setQ('');
    setStatus(undefined);
    setDifficulty(undefined);
    setNetwork(undefined);
    setTags([]);
    setSort('updatedAt:desc');
    apply(new URLSearchParams());
  };

  const toggleTag = (tag: string) => {
    setTags((prev) => {
      if (prev.includes(tag)) {
        return prev.filter((item) => item !== tag);
      }
      return [...prev, tag];
    });
  };

  const [copied, setCopied] = useState(false);

  const activeFilters = useMemo(() => {
    const items: string[] = [];
    if (status) items.push(`Status: ${status}`);
    if (difficulty) items.push(`Difficulty: ${difficulty}`);
    if (network) items.push(`Network: ${network}`);
    if (tags.length) items.push(`Tags: ${tags.join(', ')}`);
    if (q) items.push(`Search: "${q}"`);
    if (sort && sort !== 'updatedAt:desc') items.push(`Sort: ${SORT_OPTIONS.find((option) => option.value === sort)?.label ?? sort}`);
    return items;
  }, [difficulty, network, q, sort, status, tags]);

  const handleCopyUrl = async () => {
    if (typeof window === 'undefined') return;
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="sticky top-[72px] z-[40] rounded-3xl border border-white/40 bg-white/80 p-6 text-sm shadow-glass backdrop-blur"
      aria-label="Filter testnets"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
          <Filter className="h-4 w-4" aria-hidden="true" /> Filters
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyUrl}
            disabled={pending}
            className="gap-1.5 text-xs"
            title="Copy shareable URL"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                Copied!
              </>
            ) : (
              <>
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                Share
              </>
            )}
          </Button>
          <Button type="button" variant="ghost" size="sm" onClick={handleReset} disabled={pending}>
            Reset
          </Button>
          <Button type="submit" size="sm" disabled={pending}>
            Apply
          </Button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="filter-search">Search</Label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--ink-3)]"
              aria-hidden="true"
            />
            <Input
              id="filter-search"
              name="q"
              placeholder="Name, network, or tag"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              className="h-10 rounded-full border-white/50 bg-white/80 pl-9"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="status-select">Status</Label>
          <Select value={status ?? 'all'} onValueChange={(value) => setStatus(value === 'all' ? undefined : value)}>
            <SelectTrigger id="status-select" className="rounded-full border-white/50 bg-white/80">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="difficulty-select">Difficulty</Label>
          <Select
            value={difficulty ?? 'all'}
            onValueChange={(value) => setDifficulty(value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="difficulty-select" className="rounded-full border-white/50 bg-white/80">
              <SelectValue placeholder="All difficulties" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All difficulties</SelectItem>
              {DIFFICULTY_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="network-select">Network</Label>
          <Select
            value={network ?? 'all'}
            onValueChange={(value) => setNetwork(value === 'all' ? undefined : value)}
          >
            <SelectTrigger id="network-select" className="rounded-full border-white/50 bg-white/80">
              <SelectValue placeholder="All networks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All networks</SelectItem>
              {NETWORK_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-semibold uppercase tracking-wide text-[var(--ink-3)]">
            Popular tags
          </Label>
          <div className="flex flex-wrap gap-2">
            {POPULAR_TAGS.map((tag) => {
              const isActive = tags.includes(tag);
              return (
                <Button
                  key={tag}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'rounded-full border border-white/50 px-3 py-1 text-xs transition',
                    isActive
                      ? 'bg-[var(--mint)] text-[var(--ink-1)] hover:bg-[var(--aqua)]'
                      : 'bg-white/70 text-[var(--ink-3)] hover:border-white/70'
                  )}
                  onClick={() => toggleTag(tag)}
                >
                  #{tag}
                </Button>
              );
            })}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="sort-select">Sort by</Label>
          <Select value={sort} onValueChange={(value) => setSort(value)}>
            <SelectTrigger id="sort-select" className="rounded-full border-white/50 bg-white/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--ink-3)]">
        {activeFilters.length ? (
          activeFilters.map((item) => (
            <Badge key={item} variant="outline" className="rounded-full border-white/50 bg-white/80 px-3 py-1">
              {item}
            </Badge>
          ))
        ) : (
          <span className="rounded-full border border-dashed border-white/50 px-3 py-1">No active filters</span>
        )}
      </div>
    </form>
  );
}
