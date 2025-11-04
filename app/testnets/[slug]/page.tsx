import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { TESTNETS_TAG, testnetTag } from '@/lib/cache';
import { TestnetDetail } from '@/components/testnets/TestnetDetail';
import { normalizeTestnetDetail } from '@/components/testnets/normalize';
import type { TestnetDetailRecord } from '@/components/testnets/types';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

function getBaseUrl() {
  const headersList = headers();
  const protocol = headersList.get('x-forwarded-proto') ?? 'https';
  const host = headersList.get('host');
  if (host) {
    return `${protocol}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4000';
}

async function fetchTestnet(slug: string): Promise<TestnetDetailRecord | null> {
  const baseUrl = getBaseUrl();
  const response = await fetch(`${baseUrl}/api/testnets/${slug}`, {
    next: { tags: [TESTNETS_TAG, testnetTag(slug)] }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to load testnet');
  }

  const data = await response.json();
  return normalizeTestnetDetail(data);
}

export default async function TestnetDetailPage({ params }: { params: { slug: string } }) {
  const result = await fetchTestnet(params.slug);
  if (!result) {
    notFound();
  }
  const detail = result;
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: detail.name,
    description: detail.shortDescription ?? undefined,
    url: `${getBaseUrl()}/testnets/${detail.slug}`,
    creator: {
      '@type': 'Organization',
      name: 'Dewrk'
    },
    keywords: detail.tags,
    variableMeasured: [
      detail.totalRaisedUSD
        ? { '@type': 'PropertyValue', name: 'totalRaisedUSD', value: detail.totalRaisedUSD }
        : null,
      detail.rewardType
        ? { '@type': 'PropertyValue', name: 'rewardType', value: detail.rewardType }
        : null
    ].filter(Boolean)
  };

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-8 px-4 py-14 lg:px-6">
      <Link
        href="/testnets"
        className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-[var(--ink-2)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>
      <TestnetDetail testnet={detail} variant="page" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const t = await prisma.testnet.findUnique({ where: { slug: params.slug } });
    const titleBase = t?.name ? `${t.name} — ${t.network} Testnet | Dewrk` : 'Testnet Detail | Dewrk';
    const desc = t?.shortDescription || 'Explore verified Web3 testnets and developer rewards.';
    const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dewrk.com';
    const url = `${base.replace(/\/$/, '')}/testnets/${params.slug}`;
    const ogImage = `${url}/opengraph-image`;
    return {
      title: titleBase,
      description: desc,
      alternates: { canonical: url },
      openGraph: {
        title: t?.name ? `${t.name} Testnet — ${t.network}` : 'Dewrk Testnet',
        description: desc,
        url,
        siteName: 'Dewrk',
        images: [{ url: ogImage, width: 1200, height: 630, alt: t?.name ? `${t.name} Testnet Overview` : 'Dewrk' }],
        locale: 'en_US',
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: t?.name ? `${t.name} Testnet` : 'Dewrk Testnet',
        description: desc,
        images: [ogImage]
      }
    };
  } catch {
    return { title: 'Testnet | Dewrk' };
  }
}
