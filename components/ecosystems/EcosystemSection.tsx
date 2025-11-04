'use client';

import React, { useEffect, useState } from 'react';
import { Globe, ExternalLink, TrendingUp, Code } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';
import { safeUrl } from '@/lib/format';

interface Ecosystem {
  id: string;
  slug: string;
  name: string;
  shortDescription?: string | null;
  networkType: string;
  logoUrl?: string | null;
  websiteUrl?: string | null;
  twitterUrl?: string | null;
  discordUrl?: string | null;
  totalTestnets: number;
  totalFunding?: number | null;
  activeTestnets: number;
  featured: boolean;
}

export function EcosystemSection() {
  const [ecosystems, setEcosystems] = useState<Ecosystem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadEcosystems() {
      try {
        const res = await fetch('/api/ecosystems', { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setEcosystems(data.items || []);
        }
      } catch (error) {
        console.warn('Failed to load ecosystems', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadEcosystems();
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (ecosystems.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-12 text-center shadow-glass">
          <Globe className="mx-auto h-12 w-12 text-[var(--ink-3)]" />
          <p className="mt-4 text-sm text-[var(--ink-3)]">No ecosystems available yet</p>
        </div>
      </section>
    );
  }

  const featuredEcosystems = ecosystems.filter((e) => e.featured);
  const otherEcosystems = ecosystems.filter((e) => !e.featured);

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink-1)]">Ecosystems</h2>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Explore blockchain networks and their testnet opportunities
        </p>
      </div>

      {featuredEcosystems.length > 0 && (
        <>
          <h3 className="mb-4 text-lg font-semibold text-[var(--ink-1)]">Featured Ecosystems</h3>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredEcosystems.map((ecosystem) => (
              <EcosystemCard key={ecosystem.id} ecosystem={ecosystem} featured />
            ))}
          </div>
        </>
      )}

      {otherEcosystems.length > 0 && (
        <>
          <h3 className="mb-4 text-lg font-semibold text-[var(--ink-1)]">All Ecosystems</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {otherEcosystems.map((ecosystem) => (
              <EcosystemCard key={ecosystem.id} ecosystem={ecosystem} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function EcosystemCard({ ecosystem, featured = false }: { ecosystem: Ecosystem; featured?: boolean }) {
  const formatFunding = (value: number | null | undefined) => {
    if (!value) return 'N/A';
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${Math.round(value)}`;
  };

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass transition-all duration-150 ease-out hover:border-white/60 hover:translate-y-[1px]',
        featured && 'ring-2 ring-[var(--mint)]/30'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {ecosystem.logoUrl ? (
            <img
              src={ecosystem.logoUrl}
              alt={ecosystem.name}
              className="h-12 w-12 rounded-xl object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--mint)]/20">
              <Globe className="h-6 w-6 text-[var(--mint)]" />
            </div>
          )}
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--ink-1)]">{ecosystem.name}</h3>
            <p className="mt-0.5 text-xs text-[var(--ink-3)]">{ecosystem.networkType}</p>
          </div>
        </div>
      </div>

      {ecosystem.shortDescription && (
        <p className="mt-3 text-xs text-[var(--ink-2)] line-clamp-2">
          {ecosystem.shortDescription}
        </p>
      )}

      <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-white/60 p-3">
        <div className="text-center">
          <p className="text-xs font-semibold text-[var(--ink-1)]">{ecosystem.totalTestnets}</p>
          <p className="text-[10px] text-[var(--ink-3)]">Testnets</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-[var(--ink-1)]">{ecosystem.activeTestnets}</p>
          <p className="text-[10px] text-[var(--ink-3)]">Active</p>
        </div>
        <div className="text-center">
          <p className="text-xs font-semibold text-[var(--ink-1)]">{formatFunding(ecosystem.totalFunding)}</p>
          <p className="text-[10px] text-[var(--ink-3)]">Funding</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2">
        <div className="flex gap-2">
          {ecosystem.websiteUrl && (
            <a
              href={safeUrl(ecosystem.websiteUrl) ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/70 px-2 py-1 text-[10px] font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            >
              <Globe className="h-3 w-3" />
              Site
            </a>
          )}
          {ecosystem.twitterUrl && (
            <a
              href={safeUrl(ecosystem.twitterUrl) ?? '#'}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-lg border border-white/40 bg-white/70 px-2 py-1 text-[10px] font-medium text-[var(--ink-2)] transition hover:border-white/60 hover:bg-white hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
            >
              <Code className="h-3 w-3" />
              Twitter
            </a>
          )}
        </div>
        <Link
          href={`/ecosystems/${ecosystem.slug}` as Route}
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--mint)] transition hover:text-[var(--aqua)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
        >
          View <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}

