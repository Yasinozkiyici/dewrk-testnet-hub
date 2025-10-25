// @ts-nocheck
'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { TestnetFilters } from '@/components/TestnetFilters';
import { TestnetTable } from '@/components/TestnetTable';
import { TestnetDetailDrawer } from '@/components/TestnetDetailDrawer';
import type { TestnetLite } from '@/types/api';

type Testnet = TestnetLite;

function LandingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedTestnet, setSelectedTestnet] = useState<Testnet | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const slug = searchParams.get('slug');
    if (slug) {
      setIsDrawerOpen(true);
      // URL'den gelen slug için selectedTestnet'i set et
      // Drawer kendi içinde veri çekecek
    } else {
      setIsDrawerOpen(false);
      setSelectedTestnet(null);
    }
  }, [searchParams]);

  const handleRowClick = (testnet: Testnet) => {
    setSelectedTestnet(testnet);
    setIsDrawerOpen(true);
    // Update URL with slug parameter
    const params = new URLSearchParams(searchParams);
    params.set('slug', testnet.slug);
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedTestnet(null);
    // Remove slug from URL
    const params = new URLSearchParams(searchParams);
    params.delete('slug');
    const newUrl = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newUrl, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-[var(--bg-soft)]">
      {/* Hero Section */}
      <div className="landing-bg relative flex flex-col items-center justify-center px-6 py-24">
        <div className="bg-noise absolute inset-0" aria-hidden />
        <div className="relative z-10 mx-auto max-w-3xl text-center text-sm text-[var(--ink-2)]">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 font-medium text-[var(--ink-1)] shadow-glass">
            Dewrk Testnet Directory
          </p>
          <h1 className="mb-6 text-3xl font-semibold text-[var(--ink-1)] sm:text-4xl">
            Discover live testnets, earn rewards, and ship faster.
          </h1>
          <p className="mb-10 text-sm text-[var(--ink-3)]">
            Curated listings with up-to-date funding intel, task breakdowns, and admin tooling
            tailored for high-signal web3 builders.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/60 px-5 py-2.5 text-sm font-semibold text-[var(--ink-2)] shadow-glass transition hover:border-white/60 focus-visible:outline focus-visible:outline-2"
            >
              Admin dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 text-center">
            <h2 className="mb-4 text-2xl font-semibold text-[var(--ink-1)]">
              Live Testnet Programs
            </h2>
            <p className="text-sm text-[var(--ink-3)]">
              Explore active testnet programs and start earning rewards today
            </p>
          </div>

          {/* Filters */}
          <TestnetFilters />

          {/* Table */}
          <TestnetTable onRowClick={handleRowClick} />
        </div>
      </div>

      {/* Detail Drawer */}
      <TestnetDetailDrawer
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
        testnetSlug={searchParams.get('slug')}
      />
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--bg-soft)] flex items-center justify-center">Loading...</div>}>
      <LandingPageContent />
    </Suspense>
  );
}
