import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getGuideBySlug, getGuideMetadata, listGuideSummaries } from '@/lib/content/guides';

type GuidePageParams = { params: { slug: string } };

function getCanonical(slug: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? 'https://dewrk.com';
  return `${base.replace(/\/$/, '')}/guides/${slug}`;
}

export async function generateStaticParams() {
  const guides = await listGuideSummaries();
  return guides.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: GuidePageParams): Promise<Metadata> {
  const guide = await getGuideMetadata(params.slug);
  if (!guide) {
    return {
      title: 'Guide Not Found — Dewrk'
    };
  }

  const title = `${guide.title} — Dewrk Guides`;
  const description = guide.description ?? guide.excerpt ?? 'Detailed walkthrough from the Dewrk community.';
  const url = getCanonical(guide.slug);
  const ogImage = `${url}/opengraph-image`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'Dewrk',
      images: [{ url: ogImage, width: 1200, height: 630, alt: guide.title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function GuideDetailPage({ params }: GuidePageParams) {
  const guide = await getGuideBySlug(params.slug);
  if (!guide) {
    notFound();
  }

  const canonical = getCanonical(guide.frontmatter.slug);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.frontmatter.title,
    description: guide.frontmatter.description ?? guide.frontmatter.excerpt ?? undefined,
    author: guide.frontmatter.author
      ? {
          '@type': 'Person',
          name: guide.frontmatter.author
        }
      : undefined,
    datePublished: guide.frontmatter.publishedAt ?? undefined,
    url: canonical,
    keywords: guide.frontmatter.tags ?? [],
    inLanguage: 'en-US'
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16 lg:px-0">
      <article className="prose prose-slate max-w-none dark:prose-invert">
        <header className="mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--ink-3)]">Guide</p>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--ink-1)]">{guide.frontmatter.title}</h1>
          {guide.frontmatter.excerpt && (
            <p className="mt-3 text-base text-[var(--ink-2)]">{guide.frontmatter.excerpt}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--ink-3)]">
            {guide.frontmatter.author && <span>by {guide.frontmatter.author}</span>}
            {guide.frontmatter.publishedAt && (
              <span>
                • {new Date(guide.frontmatter.publishedAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </span>
            )}
            {guide.frontmatter.readingTime && <span>• {guide.frontmatter.readingTime} min read</span>}
          </div>
        </header>

        <ReactMarkdown remarkPlugins={[remarkGfm]}>{guide.body}</ReactMarkdown>

        <footer className="mt-12 border-t border-white/40 pt-6 text-xs text-[var(--ink-3)]">
          <p className="font-semibold uppercase tracking-[0.2em] text-[var(--ink-2)]">Sources</p>
          <ul className="mt-2 space-y-1">
            {(guide.frontmatter.sources ?? []).map((source) => (
              <li key={source}>
                <a
                  href={source}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--mint)] underline-offset-4 hover:underline"
                >
                  {source}
                </a>
              </li>
            ))}
          </ul>
        </footer>
      </article>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </main>
  );
}
