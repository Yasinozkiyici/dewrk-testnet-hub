'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const statusOptions = ['LIVE', 'PAUSED', 'ENDED', 'UPCOMING'] as const;
const difficultyOptions = ['EASY', 'MEDIUM', 'HARD'] as const;

export function Filters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState<string | undefined>(searchParams.get('status') ?? undefined);
  const [difficulty, setDifficulty] = useState<string | undefined>(
    searchParams.get('difficulty') ?? undefined
  );

  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
    setStatus(searchParams.get('status') ?? undefined);
    setDifficulty(searchParams.get('difficulty') ?? undefined);
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
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    if (status) {
      params.set('status', status);
    } else {
      params.delete('status');
    }
    if (difficulty) {
      params.set('difficulty', difficulty);
    } else {
      params.delete('difficulty');
    }
    params.delete('page');
    apply(params);
  };

  const handleReset = () => {
    setQ('');
    setStatus(undefined);
    setDifficulty(undefined);
    const params = new URLSearchParams();
    apply(params);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 rounded-2xl border border-white/40 bg-white/70 p-5 text-sm shadow-glass"
      aria-label="Filter testnets"
    >
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[var(--ink-3)]">
        <Filter className="h-4 w-4" /> Filters
      </div>
      <div className="flex min-w-[200px] flex-col">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          name="q"
          placeholder="Search by name, network, or tag"
          value={q}
          onChange={(event) => setQ(event.target.value)}
        />
      </div>
      <div className="flex min-w-[180px] flex-col">
        <Label>Status</Label>
        <Select value={status ?? 'all'} onValueChange={(value) => setStatus(value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex min-w-[180px] flex-col">
        <Label>Difficulty</Label>
        <Select value={difficulty ?? 'all'} onValueChange={(value) => setDifficulty(value === 'all' ? undefined : value)}>
          <SelectTrigger>
            <SelectValue placeholder="All difficulties" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All difficulties</SelectItem>
            {difficultyOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>
          Apply
        </Button>
        <Button type="button" variant="outline" onClick={handleReset} disabled={pending}>
          Reset
        </Button>
      </div>
    </form>
  );
}
