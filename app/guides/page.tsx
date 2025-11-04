import { Suspense } from 'react';
import { GuideSection } from '@/components/guides/GuideSection';
import NewsletterForm from '@/components/newsletter-form';
import type { Metadata } from 'next';

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-soft)]">
      <div className="mx-auto w-full max-w-[1400px] px-4 py-12 lg:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
          <div>
            <Suspense fallback={<div className="h-64 animate-pulse bg-white/60" />}>
              <GuideSection />
            </Suspense>
          </div>
          <aside className="space-y-6">
            <NewsletterForm
              title="Get Guides in Your Inbox"
              description="Actionable tutorials, mistakes to avoid, and weekly testnet intel."
            />
          </aside>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const title = 'Guides — Dewrk';
  const description = 'Learn testnet basics, how to join, earn rewards, and avoid common mistakes.';
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dewrk.com';
  const url = `${base.replace(/\/$/, '')}/guides`;
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: 'Dewrk Guides' }]
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] }
  };
}
