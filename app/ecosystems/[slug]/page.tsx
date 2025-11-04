import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

type EcosystemParams = { params: { slug: string } };

function getCanonical(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dewrk.com';
  return `${base.replace(/\/$/, '')}/ecosystems/${slug}`;
}

export async function generateStaticParams() {
  const ecosystems = await prisma.ecosystem.findMany({ select: { slug: true } });
  return ecosystems.map((ecosystem) => ({ slug: ecosystem.slug }));
}

export async function generateMetadata({ params }: EcosystemParams): Promise<Metadata> {
  const ecosystem = await prisma.ecosystem.findUnique({ where: { slug: params.slug } });
  if (!ecosystem) {
    return { title: 'Ecosystem Not Found — Dewrk' };
  }

  const title = `${ecosystem.name} Ecosystem — Dewrk`;
  const description = ecosystem.shortDescription ?? ecosystem.description ?? 'Ecosystem overview from Dewrk.';
  const url = getCanonical(ecosystem.slug);
  const ogImage = `${url}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      siteName: 'Dewrk',
      images: [{ url: ogImage, width: 1200, height: 630, alt: `${ecosystem.name} ecosystem` }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function EcosystemDetailPage({ params }: EcosystemParams) {
  const ecosystem = await prisma.ecosystem.findUnique({ where: { slug: params.slug } });
  if (!ecosystem) {
    notFound();
  }

  const metadata = (ecosystem.metadata as Record<string, unknown> | null) ?? {};
  const topProjects = Array.isArray(metadata.topProjects)
    ? (metadata.topProjects as string[])
    : [];
  const resources = Array.isArray(metadata.resources)
    ? (metadata.resources as string[])
    : [];

  const canonical = getCanonical(ecosystem.slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: ecosystem.name,
    description: ecosystem.description ?? ecosystem.shortDescription ?? undefined,
    url: canonical,
    keywords: topProjects,
    creator: {
      '@type': 'Organization',
      name: 'Dewrk'
    },
    temporalCoverage: ecosystem.updatedAt?.toISOString() ?? undefined,
    variableMeasured: [
      { '@type': 'PropertyValue', name: 'totalTestnets', value: ecosystem.totalTestnets },
      { '@type': 'PropertyValue', name: 'activeTestnets', value: ecosystem.activeTestnets },
      { '@type': 'PropertyValue', name: 'totalFunding', value: ecosystem.totalFunding ?? 0 }
    ]
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-16 lg:px-0">
      <section className="rounded-3xl border border-white/40 bg-white/70 p-10 shadow-glass">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-3)]">Ecosystem</p>
        <h1 className="mt-2 text-3xl font-semibold text-[var(--ink-1)]">{ecosystem.name}</h1>
        {ecosystem.shortDescription && (
          <p className="mt-3 text-base text-[var(--ink-2)]">{ecosystem.shortDescription}</p>
        )}

        <dl className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/60 p-6">
            <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Total Funding</dt>
            <dd className="mt-2 text-2xl font-semibold text-[var(--ink-1)]">
              ${ecosystem.totalFunding?.toLocaleString('en-US', { maximumFractionDigits: 0 }) ?? '—'}
            </dd>
          </div>
          <div className="rounded-2xl bg-white/60 p-6">
            <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Total Testnets</dt>
            <dd className="mt-2 text-2xl font-semibold text-[var(--ink-1)]">{ecosystem.totalTestnets}</dd>
          </div>
          <div className="rounded-2xl bg-white/60 p-6">
            <dt className="text-xs uppercase tracking-[0.2em] text-[var(--ink-3)]">Active Testnets</dt>
            <dd className="mt-2 text-2xl font-semibold text-[var(--ink-1)]">{ecosystem.activeTestnets}</dd>
          </div>
        </dl>

        {ecosystem.description && (
          <p className="mt-8 text-sm leading-6 text-[var(--ink-2)]">{ecosystem.description}</p>
        )}

        {topProjects.length > 0 && (
          <div className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Top Projects</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {topProjects.map((project) => (
                <li
                  key={project}
                  className="rounded-full border border-white/50 bg-white/70 px-3 py-1 text-xs font-medium text-[var(--ink-2)]"
                >
                  {project}
                </li>
              ))}
            </ul>
          </div>
        )}

        {resources.length > 0 && (
          <div className="mt-8">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--ink-3)]">Resources</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--mint)]">
              {resources.map((resource) => (
                <li key={resource}>
                  <a href={resource} target="_blank" rel="noreferrer" className="underline-offset-4 hover:underline">
                    {resource}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
