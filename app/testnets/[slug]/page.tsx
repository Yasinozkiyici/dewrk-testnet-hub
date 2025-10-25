// @ts-nocheck
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Globe, Github, Twitter, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TESTNETS_TAG, testnetTag } from '@/lib/cache';
import { formatEstTime, formatUSD } from '@/lib/formatting';
import type { TestnetDetailResponse } from '@/types/api';

function getBaseUrl() {
  const headersList = headers();
  const protocol = headersList.get('x-forwarded-proto') ?? 'https';
  const host = headersList.get('host');
  if (host) {
    return `${protocol}://${host}`;
  }
  return process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:4000';
}

async function fetchTestnet(slug: string) {
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

  return (await response.json()) as TestnetDetailResponse;
}

export default async function TestnetDetailPage({ params }: { params: { slug: string } }) {
  const result = await fetchTestnet(params.slug);
  if (!result) {
    notFound();
  }

  const testnet = result.data;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-14">
      <Link
        href="/testnets"
        className="inline-flex w-fit items-center gap-2 text-xs font-semibold text-[var(--ink-2)] transition hover:text-[var(--ink-1)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--mint)]"
      >
        <ArrowLeft className="h-4 w-4" /> Back to listings
      </Link>

      <section className="flex flex-col gap-6 rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            {testnet.logoUrl && (
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-white/60 bg-white/70 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={testnet.logoUrl} alt="" className="h-full w-full object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-semibold text-[var(--ink-1)]">{testnet.name}</h1>
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-[var(--ink-3)]">
                <Badge>{testnet.network}</Badge>
                <Badge>{testnet.status}</Badge>
                <Badge>{testnet.difficulty}</Badge>
                <Badge>{testnet.kycRequired ? 'KYC required' : 'No KYC'}</Badge>
                {testnet.requiresWallet ? <Badge>Wallet needed</Badge> : <Badge>No wallet required</Badge>}
              </div>
            </div>
          </div>
          {testnet.hasDashboard && testnet.dashboardUrl && (
            <Link
              href={testnet.dashboardUrl}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--mint)] px-5 py-2 text-sm font-semibold text-[var(--ink-1)] shadow-glass transition hover:bg-[var(--aqua)]"
              target="_blank"
              rel="noreferrer"
            >
              Open dashboard <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>
        {testnet.shortDescription && (
          <p className="max-w-3xl text-sm text-[var(--ink-2)]">{testnet.shortDescription}</p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <Card className="border-white/40">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 text-sm text-[var(--ink-2)]">
            {testnet.highlights.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-1)]">Highlights</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {testnet.highlights.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            {testnet.prerequisites.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-[var(--ink-1)]">Prerequisites</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {testnet.prerequisites.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="grid gap-2 text-xs text-[var(--ink-3)] sm:grid-cols-2">
              <div>
                <span className="font-semibold text-[var(--ink-2)]">Estimated time</span>
                <div>{formatEstTime(testnet.estTimeMinutes)}</div>
              </div>
              <div>
                <span className="font-semibold text-[var(--ink-2)]">Reward</span>
                <div>{testnet.rewardType ?? '—'}</div>
                {testnet.rewardNote && <div className="text-[var(--ink-3)]">{testnet.rewardNote}</div>}
              </div>
            </div>
          </CardContent>
        </Card>

        {(testnet.totalRaisedUSD ||
          testnet.websiteUrl ||
          testnet.githubUrl ||
          testnet.twitterUrl ||
          testnet.discordUrl ||
          testnet.dashboardUrl) && (
          <Card className="border-white/40">
            <CardHeader>
              <CardTitle>Funding & Links</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-[var(--ink-2)]">
              {testnet.totalRaisedUSD && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--ink-3)]">Total Raised</p>
                  <p className="text-lg font-semibold text-[var(--ink-1)]">
                    {formatUSD(testnet.totalRaisedUSD)}
                  </p>
                </div>
              )}
              {(testnet.websiteUrl || testnet.githubUrl || testnet.twitterUrl || testnet.discordUrl) && (
                <div className="flex flex-col gap-3 text-sm">
                  {testnet.websiteUrl && (
                    <Link
                      className="inline-flex items-center gap-2 text-[var(--ink-2)]"
                      href={testnet.websiteUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Globe className="h-4 w-4" /> Website
                    </Link>
                  )}
                  {testnet.githubUrl && (
                    <Link
                      className="inline-flex items-center gap-2 text-[var(--ink-2)]"
                      href={testnet.githubUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Github className="h-4 w-4" /> GitHub
                    </Link>
                  )}
                  {testnet.twitterUrl && (
                    <Link
                      className="inline-flex items-center gap-2 text-[var(--ink-2)]"
                      href={testnet.twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Twitter className="h-4 w-4" /> Twitter
                    </Link>
                  )}
                  {testnet.discordUrl && (
                    <Link
                      className="inline-flex items-center gap-2 text-[var(--ink-2)]"
                      href={testnet.discordUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <MessageCircle className="h-4 w-4" /> Discord
                    </Link>
                  )}
                </div>
              )}
              {testnet.hasDashboard && testnet.dashboardUrl && (
                <Link
                  href={testnet.dashboardUrl}
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/70 px-4 py-2 text-xs font-semibold text-[var(--ink-2)]"
                >
                  Open dashboard <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </section>

      {testnet.discordRoles && testnet.discordRoles.length > 0 && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <h2 className="text-xl font-semibold text-[var(--ink-1)]">Discord Roles</h2>
          <div className="mt-4 overflow-hidden rounded-2xl border border-white/30">
            <table className="w-full text-sm text-[var(--ink-2)]">
              <thead className="bg-white/80 text-xs uppercase tracking-wide text-[var(--ink-3)]">
                <tr>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Requirement</th>
                  <th className="px-4 py-3 text-left">Perks</th>
                </tr>
              </thead>
              <tbody>
                {testnet.discordRoles.map((role) => (
                  <tr key={role.role} className="border-t border-white/30">
                    <td className="px-4 py-3 font-semibold text-[var(--ink-1)]">{role.role}</td>
                    <td className="px-4 py-3">{role.requirement ?? '—'}</td>
                    <td className="px-4 py-3">{role.perks ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {testnet.gettingStarted.length > 0 && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <h2 className="text-xl font-semibold text-[var(--ink-1)]">Getting Started</h2>
          <ol className="mt-4 space-y-3 text-sm text-[var(--ink-2)]">
            {testnet.gettingStarted.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--mint)]/70 text-xs font-semibold text-[var(--ink-1)]">
                  {index + 1}
                </span>
                <p>{step}</p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {testnet.tasks.length > 0 && (
        <section className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-glass">
          <h2 className="text-xl font-semibold text-[var(--ink-1)]">Tasks</h2>
          <Separator className="my-4" />
          <ul className="space-y-4 text-sm text-[var(--ink-2)]">
            {testnet.tasks.map((task) => (
              <li key={task.id ?? task.title} className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2 font-semibold text-[var(--ink-1)]">
                  {task.title}
                  {task.reward && <Badge className="bg-white/80 text-[var(--ink-3)]">{task.reward}</Badge>}
                </div>
                {task.description && <p className="text-[var(--ink-3)]">{task.description}</p>}
                {task.url && (
                  <Link href={task.url} className="inline-flex w-fit items-center gap-1 text-xs font-semibold text-[var(--ink-2)]" target="_blank" rel="noreferrer">
                    Open guide <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
