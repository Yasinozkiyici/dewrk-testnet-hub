import { Suspense } from 'react';
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import { LEADERBOARDS } from '@/prisma/leaderboard';
import { LeaderboardSection } from '@/components/leaderboards/LeaderboardSection';

export default async function LeaderboardsPage() {
  const leaderboards = await prisma.leaderboard.findMany({
    where: { isActive: true },
    include: {
      entries: {
        orderBy: { rank: 'asc' },
        take: 10
      }
    },
    orderBy: { displayOrder: 'asc' }
  });

  const data = leaderboards.length ? leaderboards : LEADERBOARDS;
  const itemListElements = data.flatMap((board) =>
    board.entries.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.entityName,
      url: `https://dewrk.com/leaderboards#${board.slug}-${entry.rank}`,
      additionalProperty: [
        { '@type': 'PropertyValue', name: 'metricValue', value: typeof entry.metricValue === 'number' ? entry.metricValue : Number(entry.metricValue ?? 0) },
        { '@type': 'PropertyValue', name: 'source', value: (entry.metadata as Record<string, unknown> | null)?.source ?? (entry.metadata as Record<string, unknown> | null)?.reference ?? board.category }
      ]
    }))
  );

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Dewrk Leaderboards',
    description: 'Live ranking of contributors and ecosystems across Dewrk.',
    numberOfItems: itemListElements.length,
    itemListElement: itemListElements
  };

  return (
    <main className="min-h-screen bg-[var(--bg-soft)]">
      <Suspense fallback={<div className="h-64 animate-pulse bg-white/60" />}>
        <LeaderboardSection />
      </Suspense>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Leaderboards — Dewrk';
  const description = 'Top contributors across Fuel, Optimism, Scroll, Starknet and more.';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dewrk.com';
  const url = `${base.replace(/\/$/, '')}/leaderboards`;
  const ogImage = `${url}/opengraph-image`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Dewrk',
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Dewrk Leaderboards' }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] }
  };
}
