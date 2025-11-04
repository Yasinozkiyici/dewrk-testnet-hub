'use client';

import { useCallback, useMemo, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { X, Settings2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CustomizePopover } from './CustomizePopover';

const NETWORK_OPTIONS = ['Arbitrum', 'Base', 'Celestia', 'Optimism', 'Polygon', 'Scroll', 'zkSync'];

type FilterChip = {
  id: string;
  label: string;
  value: string;
  active: boolean;
};

export function FilterChipsBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [availableNetworks, setAvailableNetworks] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/testnets')
      .then((res) => res.json())
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : Array.isArray(data.data) ? data.data : [];
        const networks = new Set(
          items
            .map((item: any) => item.network)
            .filter((n: any) => n && typeof n === 'string')
        );
        setAvailableNetworks(Array.from(networks).slice(0, 5) as string[]);
      })
      .catch(() => {
        setAvailableNetworks(NETWORK_OPTIONS.slice(0, 5));
      });
  }, []);

  const chips = useMemo<FilterChip[]>(() => {
    const active: FilterChip[] = [];

    const status = searchParams.get('status');
    if (status) {
      active.push({ id: 'status', label: `Status: ${status}`, value: status, active: true });
    }

    const difficulty = searchParams.get('difficulty');
    if (difficulty) {
      active.push({ id: 'difficulty', label: `Difficulty: ${difficulty}`, value: difficulty, active: true });
    }

    const kyc = searchParams.get('kyc');
    if (kyc === 'true') {
      active.push({ id: 'kyc', label: 'KYC Required', value: 'kyc', active: true });
    }

    const wallet = searchParams.get('wallet');
    if (wallet === 'true') {
      active.push({ id: 'wallet', label: 'Requires Wallet', value: 'wallet', active: true });
    }

    const dashboard = searchParams.get('dashboard');
    if (dashboard === 'true') {
      active.push({ id: 'dashboard', label: 'Has Dashboard', value: 'dashboard', active: true });
    }

    const network = searchParams.get('network');
    if (network) {
      active.push({ id: 'network', label: `Network: ${network}`, value: network, active: true });
    }

    const tags = searchParams.get('tags');
    if (tags) {
      tags.split(',').forEach((tag, index) => {
        if (tag.trim()) {
          active.push({ id: `tag-${index}`, label: tag.trim(), value: tag.trim(), active: true });
        }
      });
    }

    return active;
  }, [searchParams]);

  const handleRemove = useCallback(
    (chip: FilterChip) => {
      const params = new URLSearchParams(searchParams);

      if (chip.id === 'status') {
        params.delete('status');
      } else if (chip.id === 'difficulty') {
        params.delete('difficulty');
      } else if (chip.id === 'network') {
        params.delete('network');
      } else if (chip.id === 'kyc') {
        params.delete('kyc');
      } else if (chip.id === 'wallet') {
        params.delete('wallet');
      } else if (chip.id === 'dashboard') {
        params.delete('dashboard');
      } else if (chip.id.startsWith('tag-')) {
        const currentTags = params.get('tags')?.split(',').filter(Boolean) || [];
        const newTags = currentTags.filter((t) => t.trim() !== chip.value);
        if (newTags.length > 0) {
          params.set('tags', newTags.join(','));
        } else {
          params.delete('tags');
        }
      }

      params.delete('page');
      router.push(`/testnets?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleClearAll = useCallback(() => {
    router.push('/testnets');
  }, [router]);

  const quickFilters: Array<{ id: string; label: string; param: string; value: string }> = [
    { id: 'all', label: 'All', param: '', value: '' },
    { id: 'kyc', label: 'KYC', param: 'kyc', value: 'true' },
    { id: 'wallet', label: 'Requires Wallet', param: 'wallet', value: 'true' },
    { id: 'dashboard', label: 'Has Dashboard', param: 'dashboard', value: 'true' },
    ...availableNetworks.map((network) => ({
      id: `ecosystem-${network.toLowerCase()}`,
      label: `Ecosystem: ${network}`,
      param: 'network',
      value: network
    }))
  ];

  return (
    <div className="sticky top-[72px] z-20 flex items-center gap-3 border-b border-white/40 bg-white/70 px-4 py-3 backdrop-blur-sm">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide">
        {quickFilters.map((filter) => {
          const isActive = searchParams.get(filter.param) === filter.value;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => {
                if (filter.id === 'all') {
                  router.push('/testnets');
                } else {
                  const params = new URLSearchParams(searchParams);
                  if (isActive) {
                    params.delete(filter.param);
                  } else {
                    params.set(filter.param, filter.value);
                  }
                  params.delete('page');
                  router.push(`/testnets?${params.toString()}`);
                }
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all duration-120 ease-out',
                'h-[30px] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]',
                isActive
                  ? 'border-[var(--mint)]/50 bg-[var(--mint)]/20 text-[var(--ink-1)] ring-1 ring-inset ring-[var(--mint)]/30'
                  : 'border-white/40 bg-white/70 text-[var(--ink-2)] hover:border-white/60 hover:bg-white/90 hover:translate-y-[0.5px]'
              )}
              style={{ paddingLeft: '12px', paddingRight: '12px' }}
              aria-pressed={isActive}
            >
              {filter.label}
            </button>
          );
        })}

        {chips.length > 0 && (
          <>
            <div className="h-4 w-px bg-white/40" aria-hidden="true" />
            {chips.map((chip) => (
              <button
                key={chip.id}
                type="button"
                onClick={() => handleRemove(chip)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/70 px-3 py-1 text-[11px] font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
                aria-label={`Remove filter: ${chip.label}`}
              >
                {chip.label}
                <X className="h-3 w-3" aria-hidden="true" />
              </button>
            ))}
            {chips.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-[11px] font-medium text-[var(--ink-3)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
              >
                Clear all
              </button>
            )}
          </>
        )}
      </div>

      <CustomizePopover />
    </div>
  );
}

