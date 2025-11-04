'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Clock, Eye, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import type { Route } from 'next';
import { cn } from '@/lib/utils';
import { trackReadGuide } from '@/lib/analytics';

interface Guide {
  id: string;
  slug: string;
  title: string;
  excerpt?: string | null;
  author?: string | null;
  category: string;
  tags?: string[] | null;
  featured: boolean;
  views: number;
  readingTime?: number | null;
  coverImageUrl?: string | null;
  publishedAt?: string | null;
}

export function GuideSection() {
  const [guides, setGuides] = useState<Guide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadGuides() {
      try {
        const res = await fetch('/api/guides', { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          setGuides(data.items || []);
        }
      } catch (error) {
        console.warn('Failed to load guides', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadGuides();
  }, []);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-2xl bg-white/60" />
          ))}
        </div>
      </section>
    );
  }

  if (guides.length === 0) {
    return (
      <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="rounded-3xl border border-white/40 bg-white/70 p-12 text-center shadow-glass">
          <BookOpen className="mx-auto h-12 w-12 text-[var(--ink-3)]" />
          <p className="mt-4 text-sm text-[var(--ink-3)]">No guides available yet</p>
        </div>
      </section>
    );
  }

  const featuredGuides = guides.filter((g) => g.featured);
  const guidesByCategory = guides.reduce((acc, guide) => {
    if (!acc[guide.category]) acc[guide.category] = [];
    acc[guide.category].push(guide);
    return acc;
  }, {} as Record<string, Guide[]>);

  return (
    <section className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold tracking-tight text-[var(--ink-1)]">Guides</h2>
        <p className="mt-2 text-sm text-[var(--ink-2)]">
          Learn how to contribute to testnets and maximize your rewards
        </p>
      </div>

      {featuredGuides.length > 0 && (
        <>
          <h3 className="mb-4 text-lg font-semibold text-[var(--ink-1)]">Featured Guides</h3>
          <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} featured />
            ))}
          </div>
        </>
      )}

      {Object.entries(guidesByCategory).map(([category, categoryGuides]) => (
        <div key={category} className="mb-12">
          <h3 className="mb-4 capitalize text-lg font-semibold text-[var(--ink-1)]">
            {category.replace('_', ' ')}
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categoryGuides.map((guide) => (
              <GuideCard key={guide.id} guide={guide} />
            ))}
          </div>
        </div>
      ))}
    </section>
  );
}

function GuideCard({ guide, featured = false }: { guide: Guide; featured?: boolean }) {
  const formatDate = (date: string | null | undefined) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <Link
      href={`/guides/${guide.slug}` as Route}
      className={cn(
        'group flex flex-col rounded-2xl border border-white/40 bg-white/70 p-6 shadow-glass transition-all duration-150 ease-out hover:border-white/60 hover:translate-y-[1px]',
        featured && 'md:flex-row md:items-center'
      )}
      onClick={() => trackReadGuide(guide.slug, guide.title)}
    >
      {guide.coverImageUrl ? (
        <div className="mb-4 aspect-video overflow-hidden rounded-xl bg-white/60 md:mb-0 md:w-48 md:flex-shrink-0">
          <img
            src={guide.coverImageUrl}
            alt={guide.title}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="mb-4 flex h-32 items-center justify-center rounded-xl bg-[var(--mint)]/10 md:mb-0 md:w-48 md:flex-shrink-0">
          <BookOpen className="h-8 w-8 text-[var(--mint)]" />
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-[var(--ink-1)] group-hover:text-[var(--mint)]">
              {guide.title}
            </h3>
            {guide.excerpt && (
              <p className="mt-1 line-clamp-2 text-xs text-[var(--ink-3)]">{guide.excerpt}</p>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[var(--ink-3)]">
          {guide.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{guide.readingTime}m read</span>
            </div>
          )}
          {guide.views > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{guide.views} views</span>
            </div>
          )}
          {guide.author && <span>by {guide.author}</span>}
          {guide.publishedAt && <span>• {formatDate(guide.publishedAt)}</span>}
        </div>

        {guide.tags && guide.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {guide.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/40 bg-white/70 px-2 py-0.5 text-[10px] font-medium text-[var(--ink-3)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
