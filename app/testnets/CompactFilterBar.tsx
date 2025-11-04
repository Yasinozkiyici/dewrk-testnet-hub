'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function CompactFilterBar() {
  const router = useRouter();
  const paramsIn = useSearchParams();
  const [query, setQuery] = React.useState(paramsIn.get('q') ?? '');
  const [status, setStatus] = React.useState(paramsIn.get('status') ?? '');
  const [network, setNetwork] = React.useState(paramsIn.get('network') ?? '');
  const [sort, setSort] = React.useState(paramsIn.get('sort') ?? '');

  const apply = React.useCallback(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (status) params.set('status', status);
    if (network) params.set('network', network);
    if (sort) params.set('sort', sort);
    router.replace(`/testnets?${params.toString()}`);
  }, [router, query, status, network, sort]);

  return (
    <div className="flex w-full items-center gap-2">
      <input
        type="search"
        placeholder="Search testnets..."
        className="h-8 w-[240px] rounded-md border border-white/40 bg-white/80 px-3 text-xs text-[var(--ink-1)] placeholder:text-[var(--ink-3)] focus:outline-none focus:ring-2 focus:ring-[var(--mint)]/50"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && apply()}
      />
      <select
        className="h-8 w-[120px] rounded-md border border-white/40 bg-white/80 px-2 text-xs text-[var(--ink-1)]"
        value={status}
        onChange={(e) => { setStatus(e.target.value); setTimeout(apply, 0); }}
      >
        <option value="">Status</option>
        <option value="LIVE">Live</option>
        <option value="UPCOMING">Upcoming</option>
        <option value="PAUSED">Paused</option>
        <option value="ENDED">Ended</option>
      </select>
      <select
        className="h-8 w-[140px] rounded-md border border-white/40 bg-white/80 px-2 text-xs text-[var(--ink-1)]"
        value={network}
        onChange={(e) => { setNetwork(e.target.value); setTimeout(apply, 0); }}
      >
        <option value="">Network</option>
        <option value="Ethereum">Ethereum</option>
        <option value="Solana">Solana</option>
        <option value="Base">Base</option>
        <option value="Polygon">Polygon</option>
      </select>
      <select
        className="h-8 w-[140px] rounded-md border border-white/40 bg-white/80 px-2 text-xs text-[var(--ink-1)]"
        value={sort}
        onChange={(e) => { setSort(e.target.value); setTimeout(apply, 0); }}
      >
        <option value="">Sort</option>
        <option value="updated">Recently Updated</option>
        <option value="reward">Reward Amount</option>
      </select>
    </div>
  );
}
