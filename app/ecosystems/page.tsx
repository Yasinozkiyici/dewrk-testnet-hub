import { Suspense } from 'react';
import { EcosystemSection } from '@/components/ecosystems/EcosystemSection';
import type { Metadata } from 'next';

export default function EcosystemsPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-soft)]">
      <Suspense fallback={<div className="h-64 animate-pulse bg-white/60" />}>
        <EcosystemSection />
      </Suspense>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Ecosystems — Dewrk';
  const description = 'Explore Ethereum L2s, ZK rollups, modular DA layers, and performant Alt L1s.';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dewrk.com';
  const url = `${base.replace(/\/$/, '')}/ecosystems`;
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Dewrk Ecosystems' }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] }
  };
}
